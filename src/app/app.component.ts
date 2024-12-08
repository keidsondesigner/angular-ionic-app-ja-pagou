import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonicModule, CommonModule],
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `
})
export class AppComponent {
  constructor() {
    // Força o tema light
    document.body.classList.remove('dark');
    document.body.classList.add('light');
    document.documentElement.style.setProperty('color-scheme', 'light');
  }
}
