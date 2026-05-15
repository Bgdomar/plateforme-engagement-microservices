import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BacklogService, BacklogTacheResponse } from '../../../../services/backlog.service';
import { HeaderEncadrantComponent } from '../../header-encadrant/header-encadrant';

@Component({
  selector: 'app-taches-evaluation-list',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderEncadrantComponent],
  templateUrl: './taches-evaluation-list.component.html',
  styleUrls: ['./taches-evaluation-list.component.css']
})
export class TachesEvaluationListComponent implements OnInit {
  taches: BacklogTacheResponse[] = [];
  isLoading = true;
  errorMessage = '';
  encadrantId: number = Number(localStorage.getItem('userId'));

  constructor(
    private backlogService: BacklogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTachesAEvaluer();
  }

  loadTachesAEvaluer(): void {
    this.isLoading = true;
    this.backlogService.getTachesAEvaluer(this.encadrantId).subscribe({
      next: (taches) => {
        console.log('✅ Tâches à évaluer:', taches);
        this.taches = taches;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.errorMessage = 'Impossible de charger les tâches à évaluer';
        this.isLoading = false;
      }
    });
  }

  evaluerTache(tacheId: number): void {
    this.router.navigate([`/encadrant/evaluation/tache/${tacheId}`]);
  }

  getFormattedDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getPrioriteClass(priorite: string): string {
    switch (priorite) {
      case 'HAUTE': return 'priority-high';
      case 'MOYENNE': return 'priority-medium';
      case 'BASSE': return 'priority-low';
      default: return '';
    }
  }

  getPrioriteLabel(priorite: string): string {
    switch (priorite) {
      case 'HAUTE': return 'Haute';
      case 'MOYENNE': return 'Moyenne';
      case 'BASSE': return 'Basse';
      default: return priorite;
    }
  }

  getNiveauLabel(niveau: string): string {
    switch (niveau) {
      case 'DEBUTANT': return 'Débutant';
      case 'INTERMEDIAIRE': return 'Intermédiaire';
      case 'AVANCÉ': return 'Avancé';
      default: return niveau;
    }
  }
}
