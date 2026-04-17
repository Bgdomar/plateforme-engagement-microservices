import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderAdminComponent } from '../header-admin/header-admin';
import {
  DemandeInscriptionService,
  DemandeInscription,
  StatutDemande
} from '../../../services/demande-inscreption.service';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderAdminComponent],
  templateUrl: './dashboard-admin.html',
  styleUrls: ['./dashboard-admin.css']
})
export class DashboardAdminComponent implements OnInit {

  // ── Données ──────────────────────────────────────────────────────────────
  demandes: DemandeInscription[] = [];
  loading = true;
  erreurChargement = '';

  // ── Filtres locaux (tout vient du backend, on filtre en mémoire) ──────────
  filtreStatut: StatutDemande | 'TOUS' = 'TOUS';
  filtreRole: 'TOUS' | 'STAGIAIRE' | 'ENCADRANT' = 'TOUS';
  recherche = '';

  // ── Modal rejet ──────────────────────────────────────────────────────────
  showRejetModal = false;
  demandeSelectionnee: DemandeInscription | null = null;
  noteRejet = '';
  traitementEnCours = false;

  // ── Toast ─────────────────────────────────────────────────────────────────
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  constructor(private demandeService: DemandeInscriptionService) {}

  ngOnInit(): void {
    this.chargerDonnees();
  }

  // ── Chargement ────────────────────────────────────────────────────────────
  chargerDonnees(): void {
    this.loading = true;
    this.erreurChargement = '';

    // Charger TOUTES les demandes
    this.demandeService.listerDemandes().subscribe({
      next: (data: DemandeInscription[]) => {
        this.demandes = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.erreurChargement = err?.error?.message || 'Impossible de charger les demandes.';
        this.loading = false;
      }
    });
  }

  // ── Stats Utilisateurs ───────────────────────────────────────────────────
  // Calcul basé sur les demandes VALIDEE (approuvées) pour avoir des stats cohérentes
  get statsUsers() {
    const demandesApprouvees = this.demandes.filter(d => d.statut === 'VALIDEE');
    return {
      total: demandesApprouvees.length,
      stagiaires: demandesApprouvees.filter(d => d.role === 'STAGIAIRE').length,
      encadrants: demandesApprouvees.filter(d => d.role === 'ENCADRANT').length,
      admins: 0, // Les admins ne passent pas par les demandes d'inscription
    };
  }

  // ── Filtrage local ────────────────────────────────────────────────────────
  get demandesFiltrees(): DemandeInscription[] {
    return this.demandes.filter(d => {
      const matchStatut = this.filtreStatut === 'TOUS' || d.statut === this.filtreStatut;
      const matchRole   = this.filtreRole === 'TOUS' || d.role === this.filtreRole;
      const q = this.recherche.toLowerCase();
      const matchSearch = !q ||
          `${d.nom} ${d.prenom} ${d.email}`.toLowerCase().includes(q);
      return matchStatut && matchRole && matchSearch;
    });
  }

  get stats() {
    return {
      total:     this.demandes.length,
      attente:   this.demandes.filter(d => d.statut === 'EN_ATTENTE').length,
      approuves: this.demandes.filter(d => d.statut === 'VALIDEE').length,
      rejetes:   this.demandes.filter(d => d.statut === 'REFUSEE').length,
    };
  }

  // ── Approuver ─────────────────────────────────────────────────────────────
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

  // ── Rejet ─────────────────────────────────────────────────────────────────
  ouvrirModalRejet(demande: DemandeInscription): void {
    this.demandeSelectionnee = demande;
    this.noteRejet = '';
    this.showRejetModal = true;
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

  fermerModalRejet(): void {
    this.showRejetModal = false;
    this.demandeSelectionnee = null;
    this.noteRejet = '';
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private mettreAJourDemande(updated: DemandeInscription): void {
    const idx = this.demandes.findIndex(d => d.id === updated.id);
    if (idx !== -1) this.demandes[idx] = updated;
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
}
