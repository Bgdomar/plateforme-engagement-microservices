import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SubjectService, SubjectResponse } from '../../../../services/subject.service';
import { HeaderEncadrantComponent } from '../../header-encadrant/header-encadrant';

@Component({
  selector: 'app-subject-list',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderEncadrantComponent],
  templateUrl: './subject-list.component.html',
  styleUrls: ['./subject-list.component.css']
})
export class SubjectListComponent implements OnInit {
  subjects: SubjectResponse[] = [];
  isLoading = true;
  showDeleteModal = false;
  subjectToDelete: SubjectResponse | null = null;
  encadrantId: number = Number(localStorage.getItem('userId'));

  constructor(
    private subjectService: SubjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.isLoading = true;
    this.subjectService.getMySubjects(this.encadrantId).subscribe({
      next: (subjects) => {
        this.subjects = subjects;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement des sujets', err);
        this.isLoading = false;
      }
    });
  }

  viewSubject(id: number): void {
    this.router.navigate([`/encadrant/subjects/${id}`]);
  }

  editSubject(id: number): void {
    this.router.navigate([`/encadrant/subjects/edit/${id}`]);
  }

  confirmDelete(subject: SubjectResponse): void {
    this.subjectToDelete = subject;
    this.showDeleteModal = true;
  }

  deleteSubject(): void {
    if (this.subjectToDelete) {
      this.subjectService.deleteSubject(this.subjectToDelete.id, this.encadrantId).subscribe({
        next: () => {
          this.showDeleteModal = false;
          this.subjectToDelete = null;
          this.loadSubjects();
        },
        error: (err) => {
          console.error('Erreur suppression', err);
          this.showDeleteModal = false;
        }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.subjectToDelete = null;
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
      year: 'numeric'
    });
  }
}
