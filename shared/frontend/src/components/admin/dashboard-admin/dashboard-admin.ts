// dashboard-admin.ts - Version corrigée
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderAdminComponent } from '../header-admin/header-admin';
import {
  DemandeInscriptionService,
  DemandeInscription,
  StatutDemande  // ✅ Maintenant exporté
} from '../../../services/demande-inscreption.service';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderAdminComponent],
  templateUrl: './dashboard-admin.html',
  styleUrls: ['./dashboard-admin.css']
})
export class DashboardAdminComponent implements OnInit {

  // Données
  demandes: DemandeInscription[] = [];
  filteredDemandes: DemandeInscription[] = [];
  loading = true;
  erreurChargement = '';

  // Filtres
  filtreStatut: StatutDemande | 'TOUS' = 'TOUS';
  filtreRole: 'TOUS' | 'STAGIAIRE' | 'ENCADRANT' = 'TOUS';
  recherche = '';

  // Sélection multiple
  demandesSelectionnees: Set<number> = new Set();
  selectAllMode = false;

  // Modal rejet
  showRejetModal = false;
  demandeSelectionnee: DemandeInscription | null = null;
  noteRejet = '';
  traitementEnCours = false;

  // Modal suppression
  showDeleteModal = false;
  demandesASupprimer: DemandeInscription[] = [];

  // Toast
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  constructor(private demandeService: DemandeInscriptionService) {}

  ngOnInit(): void {
    this.chargerDonnees();
  }

  // Chargement
  chargerDonnees(): void {
    this.loading = true;
    this.erreurChargement = '';
    this.demandesSelectionnees.clear();
    this.selectAllMode = false;

    this.demandeService.listerDemandes().subscribe({
      next: (data: DemandeInscription[]) => {
        this.demandes = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        this.erreurChargement = err?.error?.message || 'Impossible de charger les demandes.';
        this.loading = false;
      }
    });
  }

  // Filtrage
  applyFilters(): void {
    this.filteredDemandes = this.demandes.filter(d => {
      const matchStatut = this.filtreStatut === 'TOUS' || d.statut === this.filtreStatut;
      const matchRole = this.filtreRole === 'TOUS' || d.role === this.filtreRole;
      const q = this.recherche.toLowerCase();
      const matchSearch = !q ||
          `${d.nom} ${d.prenom} ${d.email}`.toLowerCase().includes(q);
      return matchStatut && matchRole && matchSearch;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
    this.demandesSelectionnees.clear();
    this.selectAllMode = false;
  }

  // Gestion de la sélection
  isDemandeSelectable(demande: DemandeInscription): boolean {
    return demande.statut !== 'EN_ATTENTE';
  }

  toggleSelection(demandeId: number): void {
    if (this.demandesSelectionnees.has(demandeId)) {
      this.demandesSelectionnees.delete(demandeId);
    } else {
      this.demandesSelectionnees.add(demandeId);
    }
    this.updateSelectAllMode();
  }

  toggleSelectAll(): void {
    const selectableDemandes = this.filteredDemandes.filter(d => this.isDemandeSelectable(d));

    if (this.selectAllMode) {
      this.demandesSelectionnees.clear();
      this.selectAllMode = false;
    } else {
      selectableDemandes.forEach(d => {
        this.demandesSelectionnees.add(d.id);
      });
      this.selectAllMode = true;
    }
  }

  updateSelectAllMode(): void {
    const selectableDemandes = this.filteredDemandes.filter(d => this.isDemandeSelectable(d));
    const allSelected = selectableDemandes.length > 0 &&
        selectableDemandes.every(d => this.demandesSelectionnees.has(d.id));
    this.selectAllMode = allSelected;
  }

  getNombreSelectionnees(): number {
    return this.demandesSelectionnees.size;
  }

  getDemandesSelectionnees(): DemandeInscription[] {
    return this.filteredDemandes.filter(d => this.demandesSelectionnees.has(d.id));
  }

  // Suppression multiple
  ouvrirModalSuppression(): void {
    this.demandesASupprimer = this.getDemandesSelectionnees();
    this.showDeleteModal = true;
  }

  fermerModalSuppression(): void {
    this.showDeleteModal = false;
    this.demandesASupprimer = [];
  }

  confirmerSuppression(): void {
    if (this.demandesSelectionnees.size === 0) {
      this.fermerModalSuppression();
      return;
    }

    this.traitementEnCours = true;
    const demandeIds = Array.from(this.demandesSelectionnees);

    this.demandeService.supprimerDemandes(demandeIds).subscribe({
      next: (response) => {
        if (response.totalSupprimees > 0) {
          this.chargerDonnees();
          this.toast(`✅ ${response.totalSupprimees} demande(s) supprimée(s) avec succès`, 'success');
        }
        if (response.totalNonSupprimees > 0 && response.erreurs.length > 0) {
          this.toast(`⚠️ ${response.totalNonSupprimees} demande(s) non supprimée(s)`, 'error');
          console.error('Erreurs:', response.erreurs);
        }
        this.fermerModalSuppression();
        this.traitementEnCours = false;
      },
      error: (err: any) => {
        this.toast(err?.error?.message || 'Erreur lors de la suppression', 'error');
        this.traitementEnCours = false;
      }
    });
  }

  // Approuver
  approuver(demande: DemandeInscription): void {
    this.traitementEnCours = true;

    this.demandeService.traiterDemande(demande.id, { decision: 'VALIDEE' }).subscribe({
      next: (updated: DemandeInscription) => {
        this.mettreAJourDemande(updated);
        this.toast(`✅ Demande de ${demande.prenom} ${demande.nom} approuvée`, 'success');
        this.traitementEnCours = false;
      },
      error: (err: any) => {
        this.toast(err?.error?.message || 'Erreur lors de l\'approbation', 'error');
        this.traitementEnCours = false;
      }
    });
  }

  // Rejet
  ouvrirModalRejet(demande: DemandeInscription): void {
    this.demandeSelectionnee = demande;
    this.noteRejet = '';
    this.showRejetModal = true;
  }

  fermerModalRejet(): void {
    this.showRejetModal = false;
    this.demandeSelectionnee = null;
    this.noteRejet = '';
  }

  confirmerRejet(): void {
    if (!this.demandeSelectionnee) return;

    if (!this.noteRejet.trim()) {
      this.toast('⚠️ Le motif de rejet est obligatoire', 'error');
      return;
    }

    this.traitementEnCours = true;

    this.demandeService.traiterDemande(this.demandeSelectionnee.id, {
      decision: 'REFUSEE',
      commentaire: this.noteRejet.trim()
    }).subscribe({
      next: (updated: DemandeInscription) => {
        this.mettreAJourDemande(updated);
        this.toast(`❌ Demande de ${this.demandeSelectionnee!.prenom} ${this.demandeSelectionnee!.nom} rejetée`, 'error');
        this.fermerModalRejet();
        this.traitementEnCours = false;
      },
      error: (err: any) => {
        this.toast(err?.error?.message || 'Erreur lors du rejet', 'error');
        this.traitementEnCours = false;
      }
    });
  }

  // Helpers
  private mettreAJourDemande(updated: DemandeInscription): void {
    const idx = this.demandes.findIndex(d => d.id === updated.id);
    if (idx !== -1) {
      this.demandes[idx] = updated;
      this.applyFilters();
      this.demandesSelectionnees.delete(updated.id);
      this.updateSelectAllMode();
    }
  }

  private toast(msg: string, type: 'success' | 'error'): void {
    this.toastMessage = msg;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 4000);
  }

  initiales(prenom: string, nom: string): string {
    return `${(prenom || '?').charAt(0)}${(nom || '?').charAt(0)}`.toUpperCase();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  // Stats
  get stats() {
    return {
      total: this.demandes.length,
      attente: this.demandes.filter(d => d.statut === 'EN_ATTENTE').length,
      approuves: this.demandes.filter(d => d.statut === 'VALIDEE').length,
      rejetes: this.demandes.filter(d => d.statut === 'REFUSEE').length,
    };
  }

  get statsUsers() {
    const demandesApprouvees = this.demandes.filter(d => d.statut === 'VALIDEE');
    return {
      total: demandesApprouvees.length,
      stagiaires: demandesApprouvees.filter(d => d.role === 'STAGIAIRE').length,
      encadrants: demandesApprouvees.filter(d => d.role === 'ENCADRANT').length,
      admins: 0,
    };
  }

  // Ajoutez cette méthode dans la classe DashboardAdminComponent
  hasSelectableDemandes(): boolean {
    return this.filteredDemandes.some(d => d.statut !== 'EN_ATTENTE');
  }
}
