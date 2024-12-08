import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Bill } from '../../models/bill.model';
import { BillService } from '../../services/bill.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [IonicModule, CommonModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Detalhes da Conta</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="handleEdit()">
            <ion-icon name="create-outline"></ion-icon>
          </ion-button>
          <ion-button (click)="confirmDelete()" color="danger">
            <ion-icon name="trash-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" *ngIf="bill">
      <h1 class="bill-title">{{ bill.name }}</h1>

      <div class="card">
        <h2>Valor</h2>
        <p class="amount">{{ bill.amount | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</p>
      </div>

      <div class="card">
        <h2>Data de Vencimento</h2>
        <p>{{ formatDate(bill.dueDate) }}</p>
      </div>

      <ng-container *ngIf="bill.enableNotification">
        <div class="card">
          <h2>Notificação</h2>
          <div class="notification-info">
            <ion-icon name="notifications-outline"></ion-icon>
            <span>{{ formatNotificationDate(bill.notificationDate) }} às {{ bill.notificationTime }}</span>
          </div>
        </div>
      </ng-container>

      <div class="card">
        <h2>Status</h2>
        <div class="status-container">
          <ion-icon 
            [name]="bill.paid ? 'checkmark-circle-outline' : 'time-outline'" 
            [color]="bill.paid ? 'success' : 'danger'"
          ></ion-icon>
          <span [class]="bill.paid ? 'status-paid' : 'status-pending'">
            {{ bill.paid ? 'Pago' : 'Pendente' }}
          </span>
        </div>
      </div>

      <ng-container *ngIf="bill.description">
        <div class="card">
          <h2>Descrição</h2>
          <p>{{ bill.description }}</p>
        </div>
      </ng-container>

      <ion-button expand="block" (click)="handleTogglePaid()" [color]="bill.paid ? 'danger' : 'success'" class="action-button">
        <ion-icon [name]="bill.paid ? 'time-outline' : 'checkmark-circle-outline'" slot="start"></ion-icon>
        {{ bill.paid ? 'Marcar como Pendente' : 'Marcar como Pago' }}
      </ion-button>
    </ion-content>
  `,
  styles: [`
    ion-header {
      ion-toolbar {
        --color: white;
        ion-back-button, ion-button {
          --color: white;
        }
      }
    }

    .bill-title {
      font-size: 32px;
      font-weight: 500;
      margin: 20px 0;
      color: var(--ion-color-dark);
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);

      h2 {
        color: var(--ion-color-medium);
        font-size: 16px;
        margin: 0 0 8px 0;
        font-weight: normal;
      }

      p {
        margin: 0;
        color: var(--ion-color-dark);
        font-size: 16px;
      }
    }

    .amount {
      font-size: 32px !important;
      font-weight: 600;
      color: var(--ion-color-primary) !important;
    }

    .notification-info {
      display: flex;
      align-items: center;
      gap: 8px;
      
      ion-icon {
        font-size: 20px;
        color: var(--ion-color-medium);
      }
      
      span {
        color: var(--ion-color-dark);
      }
    }

    .status-container {
      display: flex;
      align-items: center;
      gap: 8px;

      ion-icon {
        font-size: 24px;
      }
    }

    .status-paid {
      color: var(--ion-color-success);
      font-weight: 500;
    }

    .status-pending {
      color: var(--ion-color-danger);
      font-weight: 500;
    }

    .action-button {
      margin-top: 24px;
      --border-radius: 12px;
      --padding-top: 16px;
      --padding-bottom: 16px;
    }
  `]
})
export class DetailsPage implements OnInit {
  bill: Bill | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private billService: BillService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.billService.bills$.subscribe(bills => {
        this.bill = bills.find(b => b.id === id);
        if (!this.bill) {
          this.router.navigate(['/home']);
        }
      });
    } else {
      this.router.navigate(['/home']);
    }
  }

  formatDate(date: string): string {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  }

  formatNotificationDate(date: string): string {
    return format(new Date(date), "dd 'de' MMMM", { locale: ptBR });
  }

  handleEdit() {
    if (this.bill) {
      this.router.navigate(['/edit', this.bill.id]);
    }
  }

  async confirmDelete() {
    const alert = document.createElement('ion-alert');
    alert.header = 'Confirmar exclusão';
    alert.message = 'Tem certeza que deseja excluir esta conta?';
    alert.buttons = [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Excluir',
        role: 'confirm',
        handler: () => {
          if (this.bill) {
            this.billService.deleteBill(this.bill.id);
            this.router.navigate(['/home']);
          }
        }
      }
    ];

    document.body.appendChild(alert);
    await alert.present();
  }

  handleTogglePaid() {
    if (this.bill) {
      const updatedBill = {
        ...this.bill,
        paid: !this.bill.paid
      };
      this.billService.updateBill(updatedBill);
    }
  }
}
