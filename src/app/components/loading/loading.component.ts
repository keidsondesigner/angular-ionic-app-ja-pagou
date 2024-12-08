import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [IonicModule, CommonModule],
  template: `
    <div class="loading-container">
      <img src="assets/splash1.png" class="splash-image" alt="Loading splash">
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex: 1;
      width: 100%;
      height: 100vh;
      background-color: var(--ion-color-primary);
    }
    
    .splash-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `]
})
export class LoadingComponent {}
