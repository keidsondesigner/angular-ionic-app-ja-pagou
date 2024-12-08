import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { BillService } from '../../services/bill.service';
import { Bill } from '../../models/bill.model';
import { format } from 'date-fns';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Editar Conta</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form (ngSubmit)="handleSave()" *ngIf="bill">
        <div class="form-group">
          <ion-label>Nome da Conta</ion-label>
          <ion-input
            [(ngModel)]="bill.name"
            name="name"
            placeholder="Digite o nome da conta"
            required
            class="custom-input"
          ></ion-input>
        </div>

        <div class="form-group">
          <ion-label>Valor (R$)</ion-label>
          <ion-input
            [(ngModel)]="bill.amount"
            name="amount"
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
                [(ngModel)]="bill.dueDate"
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
          <ion-toggle [(ngModel)]="bill.paid" name="paid"></ion-toggle>
        </div>

        <div class="form-group toggle-group">
          <ion-label>Ativar Notificação</ion-label>
          <ion-toggle [(ngModel)]="bill.enableNotification" name="enableNotification"></ion-toggle>
        </div>

        <ng-container *ngIf="bill.enableNotification">
          <div class="form-group">
            <ion-label>Data da Notificação</ion-label>
            <ion-datetime-button datetime="notification-date" class="custom-datetime-button"></ion-datetime-button>
            <ion-modal [keepContentsMounted]="true">
              <ng-template>
                <ion-datetime
                  id="notification-date"
                  [(ngModel)]="bill.notificationDate"
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
                  [(ngModel)]="bill.notificationTime"
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
            [(ngModel)]="bill.description"
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
export class EditPage implements OnInit {
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
        const foundBill = bills.find(b => b.id === id);
        if (foundBill) {
          this.bill = { ...foundBill };
          
          // Safely convert dates
          try {
            if (this.bill.dueDate) {
              const dueDate = new Date(this.bill.dueDate);
              if (!isNaN(dueDate.getTime())) {
                this.bill.dueDate = dueDate.toISOString();
              }
            }
            
            if (this.bill.notificationDate) {
              const notificationDate = new Date(this.bill.notificationDate);
              if (!isNaN(notificationDate.getTime())) {
                this.bill.notificationDate = notificationDate.toISOString();
              }
            }
            
            if (this.bill.notificationTime) {
              const [hours, minutes] = this.bill.notificationTime.split(':');
              const today = new Date();
              today.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
              if (!isNaN(today.getTime())) {
                this.bill.notificationTime = today.toISOString();
              }
            }
          } catch (error) {
            console.error('Erro ao processar datas:', error);
          }
        } else {
          this.router.navigate(['/home']);
        }
      });
    } else {
      this.router.navigate(['/home']);
    }
  }

  handleAmountChange(event: any) {
    if (!this.bill) return;
    
    const value = event.detail.value.replace(/\D/g, '');
    const amount = parseFloat(value) / 100;
    
    this.bill.amount = amount;
  }

  async handleSave() {
    if (!this.bill) return;

    if (!this.bill.name.trim() || !this.bill.amount) {
      const alert = document.createElement('ion-alert');
      alert.header = 'Atenção';
      alert.message = 'Por favor, preencha o nome e o valor da conta';
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
      return;
    }

    try {
      // Formatar hora corretamente
      if (this.bill.enableNotification && this.bill.notificationTime) {
        try {
          const date = new Date(this.bill.notificationTime);
          if (!isNaN(date.getTime())) {
            this.bill.notificationTime = format(date, 'HH:mm');
          }
        } catch (error) {
          console.error('Erro ao processar hora da notificação:', error);
          this.bill.notificationTime = '00:00'; // Valor padrão em caso de erro
        }
      }

      await this.billService.updateBill(this.bill);
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
