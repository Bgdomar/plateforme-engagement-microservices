import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EquipeService, EquipeResponse } from '../../../../services/equipe.service';
import { UserProfileService, StagiaireInfo } from '../../../../services/user-profile.service';
import { HeaderEncadrantComponent } from '../../header-encadrant/header-encadrant';
import { HeaderStagiaireComponent } from '../../../stagiaire/header-stagiaire/header-stagiaire';

@Component({
  selector: 'app-equipe-detail',
  standalone: true,
  imports: [CommonModule, HeaderEncadrantComponent, HeaderStagiaireComponent],
  templateUrl: './equipe-detail.component.html',
  styleUrls: ['./equipe-detail.component.css']
})
export class EquipeDetailComponent implements OnInit {
  equipeId: number = 0;
  equipe: EquipeResponse | null = null;
  isLoading = true;
  errorMessage = '';
  isEncadrant: boolean = false;

  // Cache des stagiaires
  stagiairesMap: Map<number, StagiaireInfo> = new Map();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private equipeService: EquipeService,
    private userProfileService: UserProfileService
  ) {}

  ngOnInit(): void {
    this.equipeId = Number(this.route.snapshot.paramMap.get('id'));
    const userRole = localStorage.getItem('role');
    this.isEncadrant = userRole === 'ENCADRANT';

    if (this.equipeId) {
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
    this.equipeService.getEquipeById(this.equipeId).subscribe({
      next: (equipe) => {
        this.equipe = equipe;
        this.isLoading = false;

        // Charger les noms des membres
        const stagiaireIds = equipe.membres.map((m: any) => m.stagiaireId);
        if (stagiaireIds.length > 0) {
          this.loadStagiairesInfos(stagiaireIds);
        }
      },
      error: (err) => {
        console.error('Erreur chargement équipe', err);
        this.errorMessage = 'Impossible de charger les détails de l\'équipe';
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

  goBack(): void {
    if (this.isEncadrant) {
      this.router.navigate(['/encadrant/equipes']);
    } else {
      this.router.navigate(['/stagiaire/mon-equipe']);
    }
  }
}
