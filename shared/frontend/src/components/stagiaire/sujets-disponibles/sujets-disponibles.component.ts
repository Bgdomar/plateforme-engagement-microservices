import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SubjectService, SubjectResponse } from '../../../services/subject.service';
import { InscriptionService } from '../../../services/inscriptionSujet.service';
import { EquipeService } from '../../../services/equipe.service';
import { HeaderStagiaireComponent } from '../header-stagiaire/header-stagiaire';

@Component({
  selector: 'app-sujets-disponibles',
  standalone: true,
  imports: [CommonModule, HeaderStagiaireComponent],
  templateUrl: './sujets-disponibles.component.html',
  styleUrls: ['./sujets-disponibles.component.css']
})
export class SujetsDisponiblesComponent implements OnInit {
  subjects: SubjectResponse[] = [];
  isLoading = true;
  isSubscribing = false;
  errorMessage = '';
  successMessage = '';
  stagiaireId: number = Number(localStorage.getItem('userId'));
  dejaInscrit = false;
  equipeId: number | null = null;

  constructor(
    private subjectService: SubjectService,
    private inscriptionService: InscriptionService,
    private equipeService: EquipeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verifierInscription();
    this.loadSubjects();
  }

  verifierInscription(): void {
    this.equipeService.getEquipesByStagiaire(this.stagiaireId).subscribe({
      next: (equipes) => {
        if (equipes && equipes.length > 0) {
          this.dejaInscrit = true;
          this.equipeId = equipes[0].id;
        }
      },
      error: (err) => {
        console.error('Erreur vérification inscription', err);
      }
    });
  }

  loadSubjects(): void {
    this.isLoading = true;
    this.subjectService.getAvailableSubjects().subscribe({
      next: (subjects) => {
        this.subjects = subjects;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement des sujets', err);
        this.errorMessage = 'Impossible de charger la liste des sujets';
        this.isLoading = false;
      }
    });
  }

  inscrire(sujetId: number, sujetTitre: string): void {
    if (this.dejaInscrit) {
      this.errorMessage = 'Vous êtes déjà inscrit à un sujet. Vous ne pouvez pas vous inscrire à plusieurs sujets.';
      return;
    }

    const confirmation = confirm(`Voulez-vous vous inscrire au sujet "${sujetTitre}" ?`);
    if (!confirmation) return;

    this.isSubscribing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.inscriptionService.inscrireStagiaire(sujetId, this.stagiaireId).subscribe({
      next: (equipe) => {
        this.isSubscribing = false;
        this.successMessage = `✅ Inscription réussie ! Vous avez été affecté à l'équipe "${equipe.nom}".`;

        setTimeout(() => {
          this.router.navigate(['/stagiaire/mon-equipe']);
        }, 2000);
      },
      error: (err) => {
        console.error('Erreur inscription', err);
        this.isSubscribing = false;

        if (err.status === 409) {
          this.errorMessage = err.error?.message || 'Vous êtes déjà inscrit à un sujet';
          this.dejaInscrit = true;
        } else {
          this.errorMessage = err.error?.message || 'Erreur lors de l\'inscription';
        }
      }
    });
  }

  voirMonEquipe(): void {
    if (this.equipeId) {
      this.router.navigate([`/stagiaire/equipe/${this.equipeId}`]);
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
