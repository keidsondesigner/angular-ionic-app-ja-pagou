import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [IonicModule, CommonModule],
  template: `
    <ion-button 
      [color]="color"
      [expand]="expand"
      [fill]="fill"
      [disabled]="disabled"
      (click)="handleClick.emit($event)"
      class="custom-button"
    >
      {{ title }}
    </ion-button>
  `,
  styles: [`
    .custom-button {
      --background: var(--ion-color-primary);
      --color: var(--ion-color-light);
      --border-radius: 6px;
      --padding-top: 12px;
      --padding-bottom: 12px;
      font-family: 'Roboto', sans-serif;
      font-weight: 700;
      font-size: 16px;
      width: 100%;
    }
  `]
})
export class ButtonComponent {
  @Input() title: string = '';
  @Input() color: string = 'primary';
  @Input() expand: 'block' | 'full' = 'block';
  @Input() fill: 'clear' | 'outline' | 'solid' = 'solid';
  @Input() disabled: boolean = false;
  @Output() handleClick = new EventEmitter<any>();
}
