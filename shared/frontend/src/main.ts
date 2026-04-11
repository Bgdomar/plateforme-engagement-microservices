// src/main.ts
import 'zone.js';   // ← AJOUTER EN PREMIER
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .then(() => console.log('✅ Application démarrée'))
  .catch(err => console.error('❌ Erreur bootstrap:', err));
