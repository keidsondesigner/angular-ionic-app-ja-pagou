import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { format } from 'date-fns';
import { Bill } from '../../models/bill.model';
import { BillService } from '../../services/bill.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Nova Conta</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form (ngSubmit)="handleSave()">
        <div class="form-group">
          <ion-label>Nome da Conta</ion-label>
          <ion-input
            [(ngModel)]="name"
            name="name"
            inputmode="text"
            placeholder="Digite o nome da conta"
            required
            class="custom-input"
          ></ion-input>
        </div>

        <div class="form-group">
          <ion-label>Valor (R$)</ion-label>
          <ion-input
            [(ngModel)]="amount"
            name="amount"
            inputmode="numeric"
            placeholder="0"
            (ionInput)="handleAmountChange($event)"
            required
            class="custom-input"
          ></ion-input>
        </div>

        <div class="form-group">
          <ion-label>Data de Vencimento</ion-label>
          <ion-datetime-button datetime="due-date" class="custom-datetime-button"></ion-datetime-button>
          <ion-modal [keepContentsMounted]="true">
            <ng-template>
              <ion-datetime
                id="due-date"
                [(ngModel)]="dueDate"
                name="dueDate"
                presentation="date"
                locale="pt-BR"
                firstDayOfWeek={0}
              ></ion-datetime>
            </ng-template>
          </ion-modal>
        </div>

        <div class="form-group toggle-group">
          <ion-label>Conta Paga</ion-label>
          <ion-toggle [(ngModel)]="paid" name="paid"></ion-toggle>
        </div>

        <div class="form-group toggle-group">
          <ion-label>Ativar Notificação</ion-label>
          <ion-toggle [(ngModel)]="enableNotification" name="enableNotification"></ion-toggle>
        </div>

        <ng-container *ngIf="enableNotification">
          <div class="form-group">
            <ion-label>Data da Notificação</ion-label>
            <ion-datetime-button datetime="notification-date" class="custom-datetime-button"></ion-datetime-button>
            <ion-modal [keepContentsMounted]="true">
              <ng-template>
                <ion-datetime
                  id="notification-date"
                  [(ngModel)]="notificationDate"
                  name="notificationDate"
                  presentation="date"
                  locale="pt-BR"
                  firstDayOfWeek={0}
                ></ion-datetime>
              </ng-template>
            </ion-modal>
          </div>

          <div class="form-group">
            <ion-label>Horário da Notificação</ion-label>
            <ion-datetime-button datetime="notification-time" class="custom-datetime-button"></ion-datetime-button>
            <ion-modal [keepContentsMounted]="true">
              <ng-template>
                <ion-datetime
                  id="notification-time"
                  [(ngModel)]="notificationTime"
                  name="notificationTime"
                  presentation="time"
                  locale="pt-BR"
                ></ion-datetime>
              </ng-template>
            </ion-modal>
          </div>
        </ng-container>

        <div class="form-group">
          <ion-label>Descrição (opcional)</ion-label>
          <ion-textarea
            [(ngModel)]="description"
            name="description"
            placeholder="Adicione uma descrição..."
            [rows]="4"
            class="custom-textarea"
          ></ion-textarea>
        </div>

        <ion-button type="submit" expand="block" color="primary" class="save-button">
          Salvar
        </ion-button>
      </form>
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

    ion-content {
      --background: #f4f4f4;
    }

    .form-group {
      background: white;
      padding: 16px;
      margin-bottom: 8px;
      border-radius: 8px;

      ion-label {
        display: block;
        color: var(--ion-color-medium);
        font-size: 16px;
        margin-bottom: 8px;
      }
    }

    .custom-input {
      --background: transparent;
      --padding-start: 0;
      --padding-end: 0;
      --padding-top: 8px;
      --padding-bottom: 8px;
      --placeholder-color: var(--ion-color-medium);
      font-size: 16px;
      --color: var(--ion-color-dark);
    }

    .custom-textarea {
      --background: transparent;
      --padding-start: 0;
      --padding-end: 0;
      --placeholder-color: var(--ion-color-medium);
      font-size: 16px;
      --color: var(--ion-color-dark);
    }

    .custom-datetime-button {
      --background: transparent;
      --color: var(--ion-color-dark);
      margin: 0;
      padding: 0;
      height: 40px;
      width: 100%;
      justify-content: flex-start;
    }

    .toggle-group {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      ion-label {
        margin: 0;
      }
    }

    .save-button {
      margin: 24px 0px;
      --border-radius: 4px;
      --padding-top: 16px;
      --padding-bottom: 16px;
    }

    ion-datetime {
      --background: white;
    }
  `]
})
export class AddPage {
  name = '';
  amount = '';
  dueDate = new Date().toISOString();
  notificationDate = new Date().toISOString();
  notificationTime = new Date().toISOString();
  description = '';
  paid = false;
  enableNotification = true;

  constructor(
    private billService: BillService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  handleAmountChange(event: any) {
    const value = event.detail.value.replace(/\D/g, '');
    const amount = parseFloat(value) / 100;
    this.amount = amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  async handleSave() {
    if (!this.name.trim() || !this.amount.trim()) {
      const alert = document.createElement('ion-alert');
      alert.header = 'Atenção';
      alert.message = 'Por favor, preencha o nome e o valor da conta';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
      return;
    }

    try {
      const numericAmount = parseFloat(this.amount.replace(/\./g, '').replace(',', '.'));

      // Formatar hora corretamente
      const formattedTime = this.enableNotification 
        ? format(new Date(this.notificationTime), 'HH:mm') 
        : '';

      const newBill: Bill = {
        id: `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Gerar ID único
        name: this.name,
        amount: numericAmount,
        dueDate: this.dueDate,
        paid: this.paid,
        description: this.description || '',
        enableNotification: this.enableNotification,
        notificationDate: this.enableNotification ? this.notificationDate : '',
        notificationTime: formattedTime
      };

      const billId = await this.billService.addBill(newBill);
      
      // Adicionar notificação se estiver habilitada
      if (this.enableNotification) {
        await this.notificationService.scheduleNotification({
          id: billId,
          title: 'Lembrete de Conta',
          body: `A conta ${newBill.name} vence em ${new Date(this.dueDate).toLocaleDateString('pt-BR')}. Valor: R$ ${numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          date: this.notificationDate,
          time: formattedTime
        });
      }

      // Navegar de volta para a página inicial
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Erro ao salvar conta', error);
      const alert = document.createElement('ion-alert');
      alert.header = 'Erro';
      alert.message = 'Não foi possível salvar a conta';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
    }
  }
}
