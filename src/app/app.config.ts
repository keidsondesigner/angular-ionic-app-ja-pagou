import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { addIcons } from 'ionicons';
import { 
  checkmarkOutline, 
  addOutline, 
  calendarOutline,
  notificationsOutline,
  alertCircleOutline,
  closeCircleOutline,
  createOutline,
  trashOutline,
  filterOutline,
  chevronDownOutline,
  chevronUpOutline,
  eyeOutline,
  checkmarkCircleOutline,
  timeOutline,
  notificationsCircleOutline,
  closeOutline,
  chevronBackOutline,
  chevronForwardOutline,
  documentTextOutline
} from 'ionicons/icons';

registerLocaleData(localePt, 'pt-BR');

// Registra os ícones que serão usados no app
addIcons({
  checkmarkOutline, 
  addOutline, 
  calendarOutline,
  notificationsOutline,
  alertCircleOutline,
  closeCircleOutline,
  createOutline,
  trashOutline,
  filterOutline,
  chevronDownOutline,
  chevronUpOutline,
  eyeOutline,
  checkmarkCircleOutline,
  timeOutline,
  notificationsCircleOutline,
  closeOutline,
  chevronBackOutline,
  chevronForwardOutline,
  documentTextOutline
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideIonicAngular({
      mode: 'ios',
      backButtonText: 'Voltar'
    }),
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
};
