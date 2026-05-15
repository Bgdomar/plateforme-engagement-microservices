import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BacklogService, BacklogTacheResponse } from '../../../../services/backlog.service';
import { EquipeService } from '../../../../services/equipe.service';
import { UserProfileService, StagiaireInfo } from '../../../../services/user-profile.service';
import { HeaderStagiaireComponent } from '../../header-stagiaire/header-stagiaire';

@Component({
  selector: 'app-backlog-detail',
  standalone: true,
  imports: [CommonModule, HeaderStagiaireComponent],
  templateUrl: './backlog-detail.component.html',
  styleUrls: ['./backlog-detail.component.css']
})
export class BacklogDetailComponent implements OnInit {
  tacheId: number = 0;
  equipe: any = null;
  tache: BacklogTacheResponse | null = null;
  isLoading = true;
  errorMessage = '';
  stagiaireId: number = Number(localStorage.getItem('userId'));

  // Cache des stagiaires
  stagiairesMap: Map<number, StagiaireInfo> = new Map();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private backlogService: BacklogService,
    private equipeService: EquipeService,
    private userProfileService: UserProfileService
  ) {}

  ngOnInit(): void {
    this.tacheId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.tacheId) {
      this.loadEquipe();
    }
  }

  getStagiaireNom(stagiaireId: number | undefined): string {
    if (!stagiaireId) return 'Inconnu';
    const stagiaire = this.stagiairesMap.get(stagiaireId);
    if (stagiaire) {
      return `${stagiaire.prenom} ${stagiaire.nom}`;
    }
    return `Stagiaire #${stagiaireId}`;
  }

  loadStagiaireInfo(userId: number): void {
    if (this.stagiairesMap.has(userId)) return;

    this.userProfileService.getStagiaireInfo(userId.toString()).subscribe({
      next: (stagiaireInfo) => {
        this.stagiairesMap.set(userId, stagiaireInfo);
      },
      error: () => {
        this.stagiairesMap.set(userId, {
          userId: userId.toString(),
          nom: `Stagiaire #${userId}`,
          prenom: '',
          email: '',
          avatar: '',
          niveauEtudes: '',
          filiere: '',
          etablissement: ''
        } as StagiaireInfo);
      }
    });
  }

  loadEquipe(): void {
    this.equipeService.getEquipesByStagiaire(this.stagiaireId).subscribe({
      next: (equipes) => {
        if (equipes && equipes.length > 0) {
          this.equipe = equipes[0];
          this.loadTache();
        } else {
          this.errorMessage = "Vous n'êtes pas encore membre d'une équipe";
          this.isLoading = false;
        }
      },
      error: () => {
        this.errorMessage = 'Impossible de charger votre équipe';
        this.isLoading = false;
      }
    });
  }

  loadTache(): void {
    this.isLoading = true;
    this.backlogService.getTacheById(this.equipe.id, this.tacheId).subscribe({
      next: (tache) => {
        this.tache = tache;
        this.isLoading = false;

        // Charger les informations du créateur
        if (tache.creeParId) {
          this.loadStagiaireInfo(tache.creeParId);
        }
      },
      error: () => {
        this.errorMessage = 'Impossible de charger la tâche';
        this.isLoading = false;
      }
    });
  }

  // ✅ Bouton modifier visible uniquement si EN_ATTENTE
  get isEditable(): boolean {
    return this.tache?.statut === 'EN_ATTENTE';
  }

  editTache(): void {
    this.router.navigate([`/stagiaire/backlog/edit/${this.tacheId}`]);
  }

  goBack(): void {
    this.router.navigate(['/stagiaire/backlog']);
  }

  // ─── Helpers UI ───────────────────────────────────────────────────────────────

  getPrioriteClass(priorite: string): string {
    switch (priorite) {
      case 'HAUTE':   return 'priority-high';
      case 'MOYENNE': return 'priority-medium';
      case 'BASSE':   return 'priority-low';
      default:        return '';
    }
  }

  getPrioriteLabel(priorite: string): string {
    switch (priorite) {
      case 'HAUTE':   return 'Haute';
      case 'MOYENNE': return 'Moyenne';
      case 'BASSE':   return 'Basse';
      default:        return priorite;
    }
  }

  getNiveauClass(niveau: string): string {
    switch (niveau) {
      case 'AVANCÉ':        return 'level-advanced';
      case 'INTERMEDIAIRE': return 'level-intermediate';
      case 'DEBUTANT':      return 'level-beginner';
      default:              return '';
    }
  }

  getNiveauLabel(niveau: string): string {
    switch (niveau) {
      case 'DEBUTANT':      return 'Débutant';
      case 'INTERMEDIAIRE': return 'Intermédiaire';
      case 'AVANCÉ':        return 'Avancé';
      default:              return niveau;
    }
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'statut-attente';
      case 'A_FAIRE':    return 'statut-afaire';
      case 'ASSIGNEE':   return 'statut-assignee';
      case 'DEMARREE':   return 'statut-demarree';
      case 'COMPLETEE':  return 'statut-completee';
      case 'VALIDEE':    return 'statut-validee';
      case 'REFAIRE':    return 'statut-refaire';
      default:           return '';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'A_FAIRE':    return 'À faire';
      case 'ASSIGNEE':   return 'Assignée';
      case 'DEMARREE':   return 'Démarrée';
      case 'COMPLETEE':  return 'Complétée';
      case 'VALIDEE':    return 'Validée';
      case 'REFAIRE':    return 'À refaire';
      default:           return statut;
    }
  }

  getFormattedDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
