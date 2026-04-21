// missions-stagiaire.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MissionService, MissionResponse, MissionRequest } from '../../../services/mission.service';
import { TeamService, TeamResponse } from '../../../services/team.service';
import { HeaderStagiaireComponent } from '../header-stagiaire/header-stagiaire';

@Component({
  selector: 'app-missions-stagiaire',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderStagiaireComponent],
  templateUrl: './missions-stagiaire.component.html',
  styleUrls: ['./missions-stagiaire.component.css'],
})
export class MissionsStagiaireComponent implements OnInit {
  missions: MissionResponse[] = [];
  filteredMissions: MissionResponse[] = [];
  isLoading = true;
  errorMessage = '';

  currentFilter: string = 'TOUS';
  filters = [
    { value: 'TOUS', label: 'Toutes' },
    { value: 'A_FAIRE', label: 'À faire' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'TERMINEE', label: 'Terminées' },
    { value: 'ANNULEE', label: 'Annulées' },
  ];

  showModal = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedMission: MissionResponse | null = null;

  missionForm: MissionRequest = {
    titre: '',
    description: '',
    deadline: '',
    niveau: 'MOYEN',
    membreEquipeId: 0,
  };

  stagiaireId: number = 0;
  membreEquipeId: number = 0;
  mesEquipes: TeamResponse[] = [];

  isSubmitting = false;
  showDeleteConfirm = false;
  missionToDelete: MissionResponse | null = null;

  constructor(
    private missionService: MissionService,
    private teamService: TeamService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.stagiaireId = +userId;
      this.loadMembreEquipeId();
    } else {
      this.isLoading = false;
      this.errorMessage = 'Utilisateur non identifié';
    }
  }

  loadMembreEquipeId(): void {
    // ✅ FIX 1 : Utiliser le service Angular (Observable) au lieu d'un fetch() manuel.
    // L'ancien code utilisait this.teamService['apiUrl'] qui pointe vers
    // ".../api/equipes" — donc l'URL finale était ".../api/equipes/api/equipes/stagiaire/..."
    // ce qui donnait une 404 silencieuse catchée comme "pas d'équipe".
    this.teamService.getEquipesByStagiaire(this.stagiaireId).subscribe({
      next: (equipes: TeamResponse[]) => {
        console.log('📦 Équipes reçues:', equipes);
        this.mesEquipes = equipes;

        if (equipes && equipes.length > 0) {
          let membreTrouve: any = null;

          // ✅ FIX 2 : Chercher dans TOUTES les équipes, pas seulement equipes[0]
          for (const equipe of equipes) {
            const membre = equipe.membres?.find(
              // ✅ FIX 3 : MembreResponse.stagiaireId est un string dans TeamService
              // → comparer en string des deux côtés
                (m) => Number(m.stagiaireId) === this.stagiaireId
            );
            if (membre) {
              membreTrouve = membre;
              break;
            }
          }

          if (membreTrouve && membreTrouve.id) {
            this.membreEquipeId = Number(membreTrouve.id);
            this.missionForm.membreEquipeId = this.membreEquipeId;
            this.loadMissions();
          } else {
            console.warn('⚠️ Membre non trouvé. stagiaireId cherché:', String(this.stagiaireId));
            console.warn('⚠️ stagiaireIds présents dans les équipes:',
              equipes.flatMap(eq => eq.membres?.map(m => m.stagiaireId) ?? [])
            );
            this.isLoading = false;
            this.errorMessage = 'Vous n\'êtes pas membre d\'une équipe';
            this.cdr.detectChanges();
          }
        } else {
          this.isLoading = false;
          this.errorMessage = 'Vous n\'êtes pas membre d\'une équipe';
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('❌ Erreur chargement équipe:', err);
        this.isLoading = false;
        this.errorMessage = 'Impossible de charger vos informations d\'équipe';
        this.cdr.detectChanges();
      }
    });
  }

  loadMissions(): void {
    this.isLoading = true;
    this.missionService.getMesMissions(this.stagiaireId).subscribe({
      next: (missions) => {
        this.missions = missions;
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement missions', err);
        this.errorMessage = 'Impossible de charger vos missions';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilter(): void {
    if (this.currentFilter === 'TOUS') {
      this.filteredMissions = this.missions;
    } else {
      this.filteredMissions = this.missions.filter(
        (m) => m.statut === this.currentFilter
      );
    }
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.applyFilter();
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedMission = null;
    this.missionForm = {
      titre: '',
      description: '',
      deadline: '',
      niveau: 'MOYEN',
      membreEquipeId: this.membreEquipeId,
    };
    this.showModal = true;
  }

  openEditModal(mission: MissionResponse): void {
    this.modalMode = 'edit';
    this.selectedMission = mission;
    this.missionForm = {
      titre: mission.titre,
      description: mission.description || '',
      deadline: mission.deadline,
      niveau: mission.niveau,
      membreEquipeId: +mission.membreEquipeId,
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedMission = null;
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (!this.missionForm.titre.trim()) {
      this.errorMessage = 'Le titre est requis';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    if (this.modalMode === 'create') {
      this.missionService.createMission(this.missionForm).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeModal();
          this.loadMissions();
        },
        error: (err) => {
          console.error('Erreur création', err);
          this.errorMessage = err.error?.message || 'Erreur lors de la création';
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
      });
    } else if (this.selectedMission) {
      this.missionService.updateMission(+this.selectedMission.id, this.missionForm).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeModal();
          this.loadMissions();
        },
        error: (err) => {
          console.error('Erreur modification', err);
          this.errorMessage = err.error?.message || 'Erreur lors de la modification';
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  demarrerMission(mission: MissionResponse): void {
    if (confirm(`Voulez-vous démarrer la mission "${mission.titre}" ?`)) {
      this.missionService.demarrerMission(+mission.id, this.stagiaireId).subscribe({
        next: () => this.loadMissions(),
        error: (err) => alert(err.error?.message || 'Impossible de démarrer la mission'),
      });
    }
  }

  terminerMission(mission: MissionResponse): void {
    if (confirm(`Voulez-vous terminer la mission "${mission.titre}" ?`)) {
      this.missionService.terminerMission(+mission.id, this.stagiaireId).subscribe({
        next: () => this.loadMissions(),
        error: (err) => alert(err.error?.message || 'Impossible de terminer la mission'),
      });
    }
  }

  annulerMission(mission: MissionResponse): void {
    if (confirm(`Voulez-vous annuler la mission "${mission.titre}" ?`)) {
      this.missionService.annulerMission(+mission.id, this.stagiaireId).subscribe({
        next: () => this.loadMissions(),
        error: (err) => alert(err.error?.message || 'Impossible d\'annuler la mission'),
      });
    }
  }

  confirmDelete(mission: MissionResponse): void {
    this.missionToDelete = mission;
    this.showDeleteConfirm = true;
  }

  deleteMission(): void {
    if (this.missionToDelete) {
      this.missionService.deleteMission(+this.missionToDelete.id).subscribe({
        next: () => {
          this.showDeleteConfirm = false;
          this.missionToDelete = null;
          this.loadMissions();
        },
        error: (err) => {
          alert(err.error?.message || 'Impossible de supprimer la mission');
          this.showDeleteConfirm = false;
        },
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.missionToDelete = null;
  }

  getStatusLabel(statut: string): string {
    const labels: Record<string, string> = {
      A_FAIRE: 'À faire', EN_COURS: 'En cours', TERMINEE: 'Terminée', ANNULEE: 'Annulée',
    };
    return labels[statut] || statut;
  }

  getNiveauLabel(niveau: string): string {
    const labels: Record<string, string> = {
      FACILE: 'Facile', MOYEN: 'Moyen', DIFFICILE: 'Difficile',
    };
    return labels[niveau] || niveau;
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
