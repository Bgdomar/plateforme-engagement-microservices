import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import {HeaderStagiaireComponent} from '../header-stagiaire/header-stagiaire';

@Component({
  selector: 'app-dashboard-stagiaire',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderStagiaireComponent],
  templateUrl: './dashboard-stagiaire.html',
  styleUrls: ['./dashboard-stagiaire.css']
})
export class DashboardStagiaireComponent {
  // Mock data
  stagiaireInfo = {
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@dxc.com',
    promotion: '2024',
    tuteur: 'Marie Lambert'
  };

  missions = [
    { id: 1, titre: 'Développement Frontend', statut: 'En cours', progression: 65, deadline: '2024-12-15' },
    { id: 2, titre: 'Intégration API Backend', statut: 'À faire', progression: 0, deadline: '2024-12-20' },
    { id: 3, titre: 'Tests Unitaires', statut: 'Terminé', progression: 100, deadline: '2024-12-10' },
    { id: 4, titre: 'Documentation Technique', statut: 'En révision', progression: 80, deadline: '2024-12-18' }
  ];

  points = {
    total: 1250,
    badges: 4,
    classement: 3
  };

  constructor(public authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
