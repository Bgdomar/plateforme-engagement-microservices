// src/types/env.d.ts
export {};

declare global {
  interface Window {
    __env: {
      API_URL: string;
      FACIAL_AI_URL: string;
    };
  }
}
