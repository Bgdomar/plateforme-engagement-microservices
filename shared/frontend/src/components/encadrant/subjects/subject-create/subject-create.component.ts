import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SubjectService, SubjectRequest } from '../../../../services/subject.service';
import { HeaderEncadrantComponent } from '../../header-encadrant/header-encadrant';

@Component({
  selector: 'app-subject-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderEncadrantComponent],
  templateUrl: './subject-create.component.html',
  styleUrls: ['./subject-create.component.css']
})
export class SubjectCreateComponent {
  subjectRequest: SubjectRequest = {
    titre: '',
    description: '',
    encadrantId: Number(localStorage.getItem('userId')) || 0
  };
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private subjectService: SubjectService,
    private router: Router
  ) {}

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

    this.subjectService.createSubject(this.subjectRequest).subscribe({
      next: (subject) => {
        this.isSubmitting = false;
        this.router.navigate(['/encadrant/subjects', subject.id]);
      },
      error: (err) => {
        console.error('Erreur création sujet', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la publication du sujet';
        this.isSubmitting = false;
      }
    });
  }
}
