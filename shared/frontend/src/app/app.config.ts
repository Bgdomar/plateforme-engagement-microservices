// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { FormsModule } from '@angular/forms';

import { routes } from './app.routes';
import { jwtInterceptor } from "../interceptors/jwt.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      //withFetch(),
      withInterceptors([jwtInterceptor])
    ),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(
      FormsModule
    ),
  ]
};
