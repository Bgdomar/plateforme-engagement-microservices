import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SubjectService, SubjectResponse } from '../../../../services/subject.service';
import { HeaderEncadrantComponent } from '../../header-encadrant/header-encadrant';

@Component({
  selector: 'app-subject-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderEncadrantComponent],
  templateUrl: './subject-detail.component.html',
  styleUrls: ['./subject-detail.component.css']
})
export class SubjectDetailComponent implements OnInit {
  subjectId: number = 0;
  subject: SubjectResponse | null = null;
  isLoading = true;
  errorMessage = '';
  encadrantId: number = Number(localStorage.getItem('userId'));

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subjectService: SubjectService
  ) {}

  ngOnInit(): void {
    this.subjectId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.subjectId) {
      this.loadSubject();
    }
  }

  loadSubject(): void {
    this.isLoading = true;
    this.subjectService.getSubjectById(this.subjectId).subscribe({
      next: (subject) => {
        this.subject = subject;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement sujet', err);
        this.errorMessage = 'Impossible de charger les détails du sujet';
        this.isLoading = false;
      }
    });
  }

  editSubject(): void {
    this.router.navigate([`/encadrant/subjects/edit/${this.subjectId}`]);
  }

  deleteSubject(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce sujet ? Cette action est irréversible.')) {
      this.subjectService.deleteSubject(this.subjectId, this.encadrantId).subscribe({
        next: () => {
          this.router.navigate(['/encadrant/subjects']);
        },
        error: (err) => {
          console.error('Erreur suppression', err);
          this.errorMessage = err.error?.message || 'Erreur lors de la suppression';
        }
      });
    }
  }

  toggleStatut(): void {
    if (!this.subject) return;

    const nouveauStatut = this.subject.statut === 'OUVERT' ? 'FERMÉ' : 'OUVERT';
    const action = nouveauStatut === 'OUVERT' ? 'ouvrir' : 'fermer';

    if (confirm(`Êtes-vous sûr de vouloir ${action} ce sujet ?`)) {
      this.subjectService.changerStatut(this.subjectId, nouveauStatut, this.encadrantId).subscribe({
        next: (subject) => {
          this.subject = subject;
        },
        error: (err) => {
          console.error('Erreur changement statut', err);
          this.errorMessage = err.error?.message || 'Erreur lors du changement de statut';
        }
      });
    }
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'OUVERT': return 'badge-success';
      case 'FERMÉ': return 'badge-secondary';
      default: return 'badge-info';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'OUVERT': return 'Ouvert';
      case 'FERMÉ': return 'Fermé';
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
}
