import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import {HeaderStagiaireComponent} from '../../stagiaire/header-stagiaire/header-stagiaire';
import {HeaderEncadrantComponent} from '../header-encadrant/header-encadrant';

@Component({
  selector: 'app-dashboard-encadrant',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderStagiaireComponent, HeaderEncadrantComponent],
  templateUrl: './dashboard-encadrant.html',
  styleUrls: ['./dashboard-encadrant.css'],
})
export class DashboardEncadrantComponent {
  encadrantInfo = {
    nom: 'Lambert',
    prenom: 'Marie',
    email: 'marie.lambert@dxc.com',
    departement: 'Développement',
    stagiairesEncadres: 5,
  };

  stagiaires = [
    { id: 1, nom: 'Jean Dupont', promotion: '2024', missionsEnCours: 2, progressionMoyenne: 75 },
    { id: 2, nom: 'Sophie Martin', promotion: '2024', missionsEnCours: 3, progressionMoyenne: 45 },
    { id: 3, nom: 'Lucas Bernard', promotion: '2024', missionsEnCours: 1, progressionMoyenne: 90 },
    { id: 4, nom: 'Emma Petit', promotion: '2024', missionsEnCours: 2, progressionMoyenne: 60 },
  ];

  livrablesAttente = [
    { id: 1, titre: "Rapport d'activité", stagiaire: 'Jean Dupont', dateLimite: '2024-12-20' },
    { id: 2, titre: 'Présentation finale', stagiaire: 'Sophie Martin', dateLimite: '2024-12-22' },
    {
      id: 3,
      titre: 'Documentation technique',
      stagiaire: 'Lucas Bernard',
      dateLimite: '2024-12-18',
    },
  ];

  constructor(public authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
