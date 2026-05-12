// users-list/users-list.ts - Version corrigée
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  UserManagementService,
  UserInfo,
  UpdateStatutRequest,
  UpdateStageDatesRequest
} from '../../../services/user-management.service';
import {HeaderAdminComponent} from '../header-admin/header-admin';

type StatutAction = 'ACTIF' | 'SUSPENDU' | 'DESACTIVE';

interface ActionButton {
  label: string;
  action: StatutAction;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderAdminComponent],
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.css'],
})
export class UsersListComponent implements OnInit {
  users: UserInfo[] = [];
  filteredUsers: UserInfo[] = [];
  loading = true;
  errorMessage = '';

  filterRole: 'TOUS' | 'STAGIAIRE' | 'ENCADRANT' = 'TOUS';
  filterStatut: 'TOUS' | 'ACTIF' | 'SUSPENDU' | 'DESACTIVE' | 'EN_ATTENTE' = 'TOUS';
  filterArchived: 'TOUS' | 'ACTIF_SEULEMENT' | 'ARCHIVES' = 'TOUS';
  searchTerm = '';

  showStatutModal = false;
  selectedUser: UserInfo | null = null;
  newStatut: StatutAction = 'ACTIF';
  motif = '';
  actionInProgress = false;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  showStageDatesModal = false;
  stageDatesUser: UserInfo | null = null;
  newDateDebutStage = '';
  newDateFinStage = '';
  stageDatesActionInProgress = false;

  constructor(private userService: UserManagementService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getAllUsers().subscribe({
      next: (data: UserInfo[]) => {
        this.users = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Impossible de charger les utilisateurs.';
        this.loading = false;
        this.showToastMessage(this.errorMessage, 'error');
      },
    });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter((user) => {
      const matchRole = this.filterRole === 'TOUS' || user.typeCompte === this.filterRole;
      const matchStatut = this.filterStatut === 'TOUS' || user.statut === this.filterStatut;
      const matchArchived =
        this.filterArchived === 'TOUS' ||
        (this.filterArchived === 'ARCHIVES' && user.archived === true) ||
        (this.filterArchived === 'ACTIF_SEULEMENT' && !user.archived);
      const searchLower = this.searchTerm.toLowerCase();
      const matchSearch =
        !searchLower ||
        `${user.nom} ${user.prenom} ${user.email}`.toLowerCase().includes(searchLower);
      return matchRole && matchStatut && matchArchived && matchSearch;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  getAvailableActions(user: UserInfo): ActionButton[] {
    const actions: ActionButton[] = [];

    switch (user.statut) {
      case 'ACTIF':
        actions.push(
          { label: 'Suspendre', action: 'SUSPENDU', icon: 'pause', color: 'orange' },
          { label: 'Désactiver', action: 'DESACTIVE', icon: 'lock', color: 'red' },
        );
        break;
      case 'SUSPENDU':
        actions.push(
          { label: 'Activer', action: 'ACTIF', icon: 'check', color: 'green' },
          { label: 'Désactiver', action: 'DESACTIVE', icon: 'lock', color: 'red' },
        );
        break;
      case 'DESACTIVE':
        actions.push({ label: 'Activer', action: 'ACTIF', icon: 'check', color: 'green' });
        break;
      case 'EN_ATTENTE':
        actions.push(
          { label: 'Activer', action: 'ACTIF', icon: 'check', color: 'green' },
          { label: 'Désactiver', action: 'DESACTIVE', icon: 'lock', color: 'red' },
        );
        break;
    }

    return actions;
  }

  openStatutModal(user: UserInfo, targetStatut: StatutAction): void {
    this.selectedUser = user;
    this.newStatut = targetStatut;
    this.motif = '';
    this.showStatutModal = true;
  }

  confirmStatutChange(): void {
    if (!this.selectedUser) return;

    if ((this.newStatut === 'SUSPENDU' || this.newStatut === 'DESACTIVE') && !this.motif.trim()) {
      if (!confirm('Aucun motif fourni. Voulez-vous continuer quand même ?')) {
        return;
      }
    }

    this.actionInProgress = true;

    const request: UpdateStatutRequest = {
      statut: this.newStatut,
      motif: this.motif.trim() || undefined,
    };

    this.userService.updateUserStatut(this.selectedUser.id, request).subscribe({
      next: (updatedUser: UserInfo) => {
        const index = this.users.findIndex((u) => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.applyFilters();

        const actionText = this.getActionText(this.newStatut);
        this.showToastMessage(
          `Compte ${actionText} avec succès pour ${this.selectedUser!.prenom} ${this.selectedUser!.nom}`,
          'success',
        );

        this.closeModal();
        this.actionInProgress = false;
      },
      error: (err: any) => {
        this.showToastMessage(
          err?.error?.message || 'Erreur lors de la modification du statut',
          'error',
        );
        this.actionInProgress = false;
      },
    });
  }

  private getActionText(statut: StatutAction): string {
    switch (statut) {
      case 'ACTIF':
        return 'activé';
      case 'SUSPENDU':
        return 'suspendu';
      case 'DESACTIVE':
        return 'désactivé';
      default:
        return 'modifié';
    }
  }

  closeModal(): void {
    this.showStatutModal = false;
    this.selectedUser = null;
    this.motif = '';
  }

  get stats() {
    return {
      total: this.users.length,
      actifs: this.users.filter((u) => u.statut === 'ACTIF').length,
      suspendus: this.users.filter((u) => u.statut === 'SUSPENDU').length,
      desactives: this.users.filter((u) => u.statut === 'DESACTIVE').length,
      enAttente: this.users.filter((u) => u.statut === 'EN_ATTENTE').length,
      stagiaires: this.users.filter((u) => u.typeCompte === 'STAGIAIRE').length,
      encadrants: this.users.filter((u) => u.typeCompte === 'ENCADRANT').length,
      archives: this.users.filter((u) => u.archived === true).length,
    };
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'ACTIF':
        return 'status-active';
      case 'SUSPENDU':
        return 'status-suspended';
      case 'DESACTIVE':
        return 'status-inactive';
      case 'EN_ATTENTE':
        return 'status-pending';
      default:
        return '';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'ACTIF':
        return 'Actif';
      case 'SUSPENDU':
        return 'Suspendu';
      case 'DESACTIVE':
        return 'Désactivé';
      case 'EN_ATTENTE':
        return 'En attente';
      default:
        return statut;
    }
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'STAGIAIRE':
        return 'role-stagiaire';
      case 'ENCADRANT':
        return 'role-encadrant';
      case 'ADMINISTRATEUR':
        return 'role-admin';
      default:
        return '';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'STAGIAIRE':
        return 'Stagiaire';
      case 'ENCADRANT':
        return 'Encadrant';
      case 'ADMINISTRATEUR':
        return 'Administrateur';
      default:
        return role;
    }
  }

  initiales(prenom: string, nom: string): string {
    return `${(prenom || '?').charAt(0)}${(nom || '?').charAt(0)}`.toUpperCase();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'Jamais';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatDateOpt(dateStr: string | undefined): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  openStageDatesModal(user: UserInfo): void {
    this.stageDatesUser = user;
    this.newDateDebutStage = user.dateDebutStage ? user.dateDebutStage.substring(0, 10) : '';
    this.newDateFinStage = user.dateFinStage ? user.dateFinStage.substring(0, 10) : '';
    this.showStageDatesModal = true;
  }

  closeStageDatesModal(): void {
    this.showStageDatesModal = false;
    this.stageDatesUser = null;
    this.newDateDebutStage = '';
    this.newDateFinStage = '';
  }

  confirmStageDates(): void {
    if (!this.stageDatesUser) return;
    if (!this.newDateDebutStage || !this.newDateFinStage) {
      this.showToastMessage('Veuillez remplir les deux dates', 'error');
      return;
    }
    if (new Date(this.newDateDebutStage) >= new Date(this.newDateFinStage)) {
      this.showToastMessage('La date de fin doit être postérieure à la date de début', 'error');
      return;
    }

    this.stageDatesActionInProgress = true;
    const request: UpdateStageDatesRequest = {
      dateDebutStage: this.newDateDebutStage,
      dateFinStage: this.newDateFinStage
    };

    this.userService.updateStageDates(this.stageDatesUser.id, request).subscribe({
      next: (updatedUser: UserInfo) => {
        const index = this.users.findIndex((u) => u.id === updatedUser.id);
        if (index !== -1) this.users[index] = updatedUser;
        this.applyFilters();
        this.showToastMessage(
          `Dates de stage mises à jour pour ${this.stageDatesUser!.prenom} ${this.stageDatesUser!.nom}`,
          'success'
        );
        this.closeStageDatesModal();
        this.stageDatesActionInProgress = false;
      },
      error: (err: any) => {
        this.showToastMessage(
          err?.error?.message || 'Erreur lors de la mise à jour des dates',
          'error'
        );
        this.stageDatesActionInProgress = false;
      }
    });
  }

  private showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 4000);
  }
}
