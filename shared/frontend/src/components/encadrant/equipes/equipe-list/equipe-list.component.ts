import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';  // ✅ Ajouter RouterLink ici
import { EquipeService, EquipeResponse } from '../../../../services/equipe.service';
import { HeaderEncadrantComponent } from '../../header-encadrant/header-encadrant';

@Component({
  selector: 'app-equipe-list',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderEncadrantComponent],  // ✅ Ajouter RouterLink
  templateUrl: './equipe-list.component.html',
  styleUrls: ['./equipe-list.component.css']
})
export class EquipeListComponent implements OnInit {
  equipes: EquipeResponse[] = [];
  isLoading = true;
  errorMessage = '';
  encadrantId: number = Number(localStorage.getItem('userId'));

  constructor(
    private equipeService: EquipeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEquipes();
  }

  loadEquipes(): void {
    this.isLoading = true;
    this.equipeService.getEquipesByEncadrant(this.encadrantId).subscribe({
      next: (equipes) => {
        this.equipes = equipes;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement des équipes', err);
        this.errorMessage = 'Impossible de charger la liste des équipes';
        this.isLoading = false;
      }
    });
  }

  viewEquipe(id: number): void {
    this.router.navigate([`/encadrant/equipes/${id}`]);
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
      year: 'numeric'
    });
  }
}
