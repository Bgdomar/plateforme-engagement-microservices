import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SubjectService, SubjectRequest, SubjectResponse } from '../../../../services/subject.service';
import { HeaderEncadrantComponent } from '../../header-encadrant/header-encadrant';

@Component({
  selector: 'app-subject-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderEncadrantComponent],
  templateUrl: './subject-edit.component.html',
  styleUrls: ['./subject-edit.component.css']
})
export class SubjectEditComponent implements OnInit {
  subjectId: number = 0;
  subject: SubjectResponse | null = null;
  subjectRequest: SubjectRequest = {
    titre: '',
    description: '',
    encadrantId: 0
  };
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';

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
        this.subjectRequest = {
          titre: subject.titre,
          description: subject.description,
          encadrantId: subject.encadrantId
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement sujet', err);
        this.errorMessage = 'Impossible de charger le sujet';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.subjectRequest.titre.trim()) {
      this.errorMessage = 'Le titre du sujet est requis';
      return;
    }

    if (!this.subjectRequest.description.trim()) {
      this.errorMessage = 'La description du sujet est requise';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.subjectService.updateSubject(this.subjectId, this.subjectRequest).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/encadrant/subjects', this.subjectId]);
      },
      error: (err) => {
        console.error('Erreur mise à jour', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour';
        this.isSubmitting = false;
      }
    });
  }
}
