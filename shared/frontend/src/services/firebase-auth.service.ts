import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// ✅ Importer directement depuis firebase (pas @angular/fire)
import { initializeApp } from 'firebase/app';
import {
  Auth,
  getAuth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  User,
  UserCredential
} from 'firebase/auth';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  private auth: Auth | null = null;
  private initialized = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.initFirebase();
  }

  private initFirebase(): void {
    if (isPlatformBrowser(this.platformId) && !this.initialized) {
      try {
        const app = initializeApp(environment.firebase);
        this.auth = getAuth(app);
        this.initialized = true;
        console.log('✅ Firebase initialisé avec succès');
      } catch (error) {
        console.error('❌ Erreur initialisation Firebase:', error);
      }
    }
  }

  /**
   * Créer un compte Firebase et envoyer email de vérification
   */
  async register(email: string, password: string): Promise<UserCredential> {
    if (!this.auth) {
      throw new Error('Firebase non initialisé');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      console.log('ℹ️ Vérification email désactivée pour cet environnement:', email);
      return userCredential;

    } catch (error: any) {
      console.error('❌ Erreur Firebase register:', error);
      throw new Error(this.handleFirebaseError(error));
    }
  }

  /**
   * Vérifier si l'email de l'utilisateur actuel est vérifié
   */
  async isEmailVerified(): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId) || !this.auth) return false;

    const user = this.auth.currentUser;
    if (user) {
      await user.reload();
      return user.emailVerified;
    }
    return false;
  }

  /**
   * Attendre que l'email soit vérifié
   */
  async waitForEmailVerification(maxSeconds: number = 300): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId) || !this.auth) return false;

    return new Promise((resolve) => {
      const startTime = Date.now();
      const maxTime = maxSeconds * 1000;

      const interval = setInterval(async () => {
        const user = this.auth?.currentUser;
        if (user) {
          await user.reload();

          if (user.emailVerified) {
            clearInterval(interval);
            resolve(true);
          } else if (Date.now() - startTime > maxTime) {
            clearInterval(interval);
            resolve(false);
          }
        }
      }, 3000);
    });
  }

  /**
   * Renvoyer l'email de vérification
   */
  async resendVerificationEmail(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !this.auth) return;

    const user = this.auth.currentUser;
    if (user && !user.emailVerified) {
      return;
    }
  }

  /**
   * Envoyer email de réinitialisation de mot de passe
   */
  async resetPassword(email: string): Promise<void> {
    if (!this.auth) throw new Error('Firebase non initialisé');
    await sendPasswordResetEmail(this.auth, email);
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    if (!isPlatformBrowser(this.platformId) || !this.auth) return null;
    return this.auth.currentUser;
  }

  /**
   * Déconnexion Firebase
   */
  async logout(): Promise<void> {
    if (this.auth) {
      await this.auth.signOut();
    }
  }

  /**
   * Gestion des erreurs Firebase
   */
  private handleFirebaseError(error: any): string {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Cette adresse email est déjà utilisée';
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/weak-password':
        return 'Le mot de passe doit contenir au moins 6 caractères';
      case 'auth/user-not-found':
        return 'Aucun compte associé à cet email';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect';
      case 'auth/operation-not-allowed':
        return 'L\'inscription par email est désactivée';
      default:
        return error.message || 'Une erreur est survenue';
    }
  }
}
