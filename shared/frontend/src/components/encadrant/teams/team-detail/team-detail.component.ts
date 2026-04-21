import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  TeamService,
  TeamResponse,
  StagiaireInfo,
  MembreResponse,
} from '../../../../services/team.service';
import { UserProfileService } from '../../../../services/user-profile.service';
import { forkJoin, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import {HeaderEncadrantComponent} from '../../header-encadrant/header-encadrant';

// Interface étendue pour les membres avec les infos du stagiaire
interface MembreComplet {
  id: string;
  stagiaireId: string;
  dateAjout: string;
  nom: string;
  prenom: string;
  email: string;
  avatar: string;
}

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HeaderEncadrantComponent],
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.css'],
})
export class TeamDetailComponent implements OnInit {
  teamId: string = '';
  team: TeamResponse | null = null;
  membresComplets: MembreComplet[] = []; // ← Nouvelle propriété
  tousLesStagiaires: StagiaireInfo[] = [];
  stagiairesDisponibles: StagiaireInfo[] = [];
  filteredStagiaires: StagiaireInfo[] = [];
  isLoading = true;
  isAddingMember = false;
  searchTerm = '';
  selectedStagiaireId: string = '';
  showAddMemberModal = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private userProfileService: UserProfileService,
  ) {}

  ngOnInit(): void {
    this.teamId = this.route.snapshot.paramMap.get('id') || '';
    if (this.teamId) {
      this.loadTeamDetails();
      this.loadStagiairesDisponibles();
    }
  }

  loadTeamDetails(): void {
    this.isLoading = true;
    this.teamService.getTeamById(this.teamId).subscribe({
      next: (team) => {
        this.team = team;
        // Enrichir les membres avec les infos des stagiaires
        this.enrichirMembres();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement équipe', err);
        this.errorMessage = "Impossible de charger les détails de l'équipe";
        this.isLoading = false;
      },
    });
  }

  enrichirMembres(): void {
    if (!this.team || !this.tousLesStagiaires.length) {
      this.membresComplets = [];
      return;
    }

    // Créer une Map pour un accès rapide aux stagiaires
    const stagiairesMap = new Map<string, StagiaireInfo>();
    this.tousLesStagiaires.forEach((s) => stagiairesMap.set(s.userId, s));

    // Enrichir chaque membre
    this.membresComplets = this.team.membres.map((membre) => {
      const stagiaire = stagiairesMap.get(membre.stagiaireId);
      return {
        id: membre.id,
        stagiaireId: membre.stagiaireId,
        dateAjout: membre.dateAjout,
        nom: stagiaire?.nom || 'Inconnu',
        prenom: stagiaire?.prenom || 'Inconnu',
        email: stagiaire?.email || '',
        avatar: stagiaire?.avatar || 'assets/default-avatar.png',
      };
    });
  }

  loadStagiairesDisponibles(): void {
    forkJoin({
      tousLesStagiaires: this.userProfileService.getAllStagiaires(),
      stagiairesAffectesIds: this.teamService.getStagiairesAffectesIds(),
    }).subscribe({
      next: (result) => {
        this.tousLesStagiaires = result.tousLesStagiaires;
        const affectesIds = result.stagiairesAffectesIds;

        // Filtrer : garder uniquement les stagiaires qui ne sont PAS affectés
        this.stagiairesDisponibles = this.tousLesStagiaires.filter(
          (stagiaire) => !affectesIds.has(stagiaire.userId),
        );
        this.filteredStagiaires = this.stagiairesDisponibles;

        // Re-enrichir les membres après chargement des stagiaires
        this.enrichirMembres();
      },
      error: (err) => console.error('Erreur chargement stagiaires', err),
    });
  }

  filterStagiaires(): void {
    if (!this.searchTerm) {
      this.filteredStagiaires = this.stagiairesDisponibles;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredStagiaires = this.stagiairesDisponibles.filter(
        (s) =>
          s.nom.toLowerCase().includes(term) ||
          s.prenom.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term),
      );
    }
  }

  getAvailableStagiaires(): StagiaireInfo[] {
    if (!this.team) return this.filteredStagiaires;
    const memberIds = new Set(this.team.membres.map((m) => m.stagiaireId));
    return this.filteredStagiaires.filter((s) => !memberIds.has(s.userId));
  }

  openAddMemberModal(): void {
    this.selectedStagiaireId = '';
    this.searchTerm = '';
    this.filteredStagiaires = this.stagiairesDisponibles;
    this.showAddMemberModal = true;
  }

  addMember(): void {
    if (this.selectedStagiaireId) {
      this.isAddingMember = true;
      this.teamService.addMember(this.teamId, this.selectedStagiaireId).subscribe({
        next: (newMember: MembreResponse) => {
          console.log('✅ Membre ajouté:', newMember);
          this.showAddMemberModal = false;
          this.isAddingMember = false;
          this.loadTeamDetails(); // Recharger l'équipe
          this.loadStagiairesDisponibles(); // Recharger la liste
        },
        error: (err) => {
          console.error('Erreur ajout membre', err);
          this.errorMessage = err.error?.message || "Erreur lors de l'ajout du membre";
          this.isAddingMember = false;
        },
      });
    }
  }

  removeMember(stagiaireId: string): void {
    if (confirm("Voulez-vous vraiment retirer ce membre de l'équipe ?")) {
      this.teamService.removeMember(this.teamId, stagiaireId).subscribe({
        next: () => {
          console.log('✅ Membre supprimé');
          this.loadTeamDetails(); // Recharger l'équipe
          this.loadStagiairesDisponibles(); // Recharger la liste
        },
        error: (err) => {
          console.error('Erreur suppression membre', err);
          this.errorMessage = err.error?.message || 'Erreur lors de la suppression du membre';
        },
      });
    }
  }

  editTeam(): void {
    this.router.navigate([`/encadrant/teams/edit/${this.teamId}`]);
  }

  deleteTeam(): void {
    if (
      confirm('Êtes-vous sûr de vouloir supprimer cette équipe ? Cette action est irréversible.')
    ) {
      this.teamService.deleteTeam(this.teamId).subscribe({
        next: () => {
          this.router.navigate(['/encadrant/teams']);
        },
        error: (err) => console.error('Erreur suppression', err),
      });
    }
  }

  getFormattedDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
