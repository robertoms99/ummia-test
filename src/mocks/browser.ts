// src/mocks/browser.ts
// Configuración de MSW para el navegador
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Inicializar el service worker
export const worker = setupWorker(...handlers);
