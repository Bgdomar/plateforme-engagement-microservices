import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EquipeService, EquipeResponse } from '../../../services/equipe.service';
import { UserProfileService, StagiaireInfo } from '../../../services/user-profile.service';
import { HeaderStagiaireComponent } from '../header-stagiaire/header-stagiaire';

@Component({
  selector: 'app-mon-equipe',
  standalone: true,
  imports: [CommonModule, HeaderStagiaireComponent],
  templateUrl: './mon-equipe.component.html',
  styleUrls: ['./mon-equipe.component.css']
})
export class MonEquipeComponent implements OnInit {
  equipe: EquipeResponse | null = null;
  isLoading = true;
  errorMessage = '';
  stagiaireId: number = Number(localStorage.getItem('userId'));

  // Cache des stagiaires
  stagiairesMap: Map<number, StagiaireInfo> = new Map();

  constructor(
    private equipeService: EquipeService,
    private userProfileService: UserProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEquipe();
  }

  getStagiaireNom(stagiaireId: number | undefined): string {
    if (!stagiaireId) return 'Inconnu';
    const stagiaire = this.stagiairesMap.get(stagiaireId);
    if (stagiaire) {
      return `${stagiaire.prenom} ${stagiaire.nom}`;
    }
    return `Stagiaire #${stagiaireId}`;
  }

  loadStagiairesInfos(userIds: number[]): void {
    const uniqueIds = [...new Set(userIds.filter(id => id && !this.stagiairesMap.has(id)))];
    uniqueIds.forEach(userId => {
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
    });
  }

  loadEquipe(): void {
    this.isLoading = true;
    this.equipeService.getEquipesByStagiaire(this.stagiaireId).subscribe({
      next: (equipes) => {
        if (equipes && equipes.length > 0) {
          this.equipe = equipes[0];

          // Charger les noms des membres
          const stagiaireIds = this.equipe.membres.map(m => m.stagiaireId);
          if (stagiaireIds.length > 0) {
            this.loadStagiairesInfos(stagiaireIds);
          }
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement équipe', err);
        this.errorMessage = 'Impossible de charger votre équipe';
        this.isLoading = false;
      }
    });
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'ACTIVE': return 'badge-success';
      case 'COMPLET': return 'badge-warning';
      default: return 'badge-info';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'ACTIVE': return 'Active';
      case 'COMPLET': return 'Complète';
      default: return statut;
    }
  }

  getFormattedDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  voirSujetsDisponibles(): void {
    this.router.navigate(['/stagiaire/sujets']);
  }
}
