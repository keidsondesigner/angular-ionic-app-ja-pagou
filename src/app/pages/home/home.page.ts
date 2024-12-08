import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Bill } from '../../models/bill.model';
import { BillService } from '../../services/bill.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary" class="header-toolbar">
        <ion-title>Minhas Contas</ion-title>
      </ion-toolbar>

      <ion-searchbar
        placeholder="Buscar conta..."
        [(ngModel)]="searchTerm"
        (ionInput)="filterBills()"
        class="custom-searchbar"
      >
      </ion-searchbar>

      <div class="month-navigation-container">
        <div class="month-navigation">
          <ion-button fill="clear" (click)="previousMonth()">
            <ion-icon name="chevron-back-outline"></ion-icon>
          </ion-button>
          <h2 class="month-title">{{ months[selectedMonth] }}</h2>
          <ion-button fill="clear" (click)="nextMonth()">
            <ion-icon name="chevron-forward-outline"></ion-icon>
          </ion-button>
        </div>

        <div class="filter-segment">
          <ion-segment [(ngModel)]="selectedFilter" (ionChange)="handleFilterChange($event)">
            <ion-segment-button value="all" class="custom-segment-button">
              <ion-label>Todas</ion-label>
            </ion-segment-button>
            <ion-segment-button value="paid" class="custom-segment-button">
              <ion-label>Pagas</ion-label>
            </ion-segment-button>
            <ion-segment-button value="pending" class="custom-segment-button">
              <ion-label>A Pagar</ion-label>
            </ion-segment-button>
          </ion-segment>
        </div>

        <div class="summary-container">
          <div class="summary-item">
            <span class="summary-label">Total</span>
            <span class="summary-value">{{ getTotalAmount() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Pagas</span>
            <span class="summary-value success">{{ getPaidAmount() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">A Pagar</span>
            <span class="summary-value danger">{{ getPendingAmount() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
          </div>
        </div>
      </div>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item-sliding *ngFor="let bill of filteredBills">
          <ion-item>
            <ion-label style="display: flex; flex-direction: column; gap: 6px; border-right: 1px solid #ccc;">
              <h2 style="font-weight: 500;">{{ bill.name }}</h2>
              <p>
                Vence em {{ bill.dueDate | date:'dd/MM/yyyy' }}
              </p>
            
                <span 
                  *ngIf="bill.notificationDate && bill.notificationTime" 
                  class="notification-info" 
                  [class.notification-disabled]="!bill.enableNotification"
                >
                  <ion-icon name="notifications-outline" class="notification-icon"></ion-icon>
                  {{ bill.notificationDate | date:'dd/MM' }} às {{ bill.notificationTime }}
                </span>
                <span 
                  class="status-badge" 
                  [class.paid]="bill.paid" 
                  [class.pending]="!bill.paid"
                >
                  <ion-icon 
                    [name]="bill.paid ? 'checkmark-circle-outline' : 'time-outline'" 
                    class="status-icon"
                  ></ion-icon>
                  {{ bill.paid ? 'Pago' : 'Pendente' }}
                </span>
            </ion-label>
            <ion-note slot="end" [color]="bill.paid ? 'primary' : 'danger'" style="padding-left: 14px; font-weight: 500;">
              {{ bill.amount | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
            </ion-note>
          </ion-item>
          
          <ion-item-options side="end">
            <ion-item-option color="primary" (click)="viewDetails(bill)">
              <ion-icon name="eye-outline"></ion-icon>
            </ion-item-option>
            <ion-item-option color="secondary" (click)="editBill(bill)">
              <ion-icon name="create-outline"></ion-icon>
            </ion-item-option>
            <ion-item-option color="danger" (click)="confirmDelete(bill)">
              <ion-icon name="trash-outline"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>

        <div *ngIf="filteredBills.length === 0" class="empty-state">
          <ion-icon name="document-text-outline" class="empty-icon"></ion-icon>
          <h3>Nenhuma conta encontrada</h3>
          <p>Adicione uma nova conta para começar</p>
        </div>
      </ion-list>
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button (click)="addBill()" color="primary">
        <ion-icon name="add-outline"></ion-icon>
      </ion-fab-button>
    </ion-fab>
  `,
  styles: [`
    .header-toolbar {
      --color: white;
    }

    .month-navigation-container {
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .month-navigation {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .month-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      color: var(--ion-color-dark);
    }

    ion-button[fill="clear"] {
      --color: var(--ion-color-dark);
      --padding-start: 8px;
      --padding-end: 8px;
    }

    .filter-segment {
      padding: 0 16px;
      margin-bottom: 16px;
      display: flex;

      ion-segment {
        --background: transparent;
        display: flex;
        justify-content: space-between;
        gap: 8px;

        ion-segment-button {
          min-height: 38px !important;
          height: 38px !important;
          
          ion-label {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
        }
      }
    }

    .custom-segment-button {
      --background: #f4f5f8;
      --background-checked: var(--ion-color-primary);
      --color: var(--ion-color-medium);
      --color-checked: white;
      --indicator-color: transparent;
      border-radius: 8px;
      text-transform: none;
      flex: 1;
    }

    .summary-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      padding: 16px;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;

      .summary-label {
        color: var(--ion-color-medium);
        font-size: 14px;
        margin-bottom: 4px;
      }
    }

    .summary-label {
      color: var(--ion-color-medium);
      font-size: 14px;
      margin-bottom: 4px;
    }

    .summary-value {
      font-size: 16px;
      font-weight: 500;
      color: var(--ion-color-dark);

      &.success {
        color: var(--ion-color-primary);
      }

      &.danger {
        color: var(--ion-color-danger);
      }
    }

    .custom-searchbar {
      --background: #f4f5f8;
      --box-shadow: none;
      --border-radius: 8px;
      --placeholder-color: #92949c;
      --placeholder-opacity: 0.8;
      --placeholder-font-weight: 400;
      --padding-top: 0;
      --padding-bottom: 0;
      --padding-start: 16px;
      padding: 16px;
      background: white;
      height: 48px;

      &::ng-deep {
        .searchbar-input-container {
          min-height: 48px !important;
          height: 48px !important;
          margin-top: 18px;
        }
        
        input.searchbar-input {
          min-height: 48px !important;
          height: 48px !important;
        }
      }
    }

    ion-list {
      background: transparent;
      padding: 0 16px;
      display: flex;
      gap: 18px;
      flex-direction: column;
      margin-top: 22px;
    }

    ion-item {
      display: flex;
      --background: white;
      // --padding-start: 16px;
      // --padding-end: 16px;
      // --padding-top: 12px;
      // --padding-bottom: 12px;
      border-radius: 8px;
      // border: 1px solid #ccc;
      --inner-border-width: 0px !important;

      ion-label {
        // flex: 1;
        
      }

      ion-note {
        // flex: 1;
        min-width: 120px;
      }
      
      &::ng-deep {
        .item-inner {
          --border-width: 0 !important;
          border-bottom: none !important;
        }

        .item-native {
          --inner-border-width: 0 !important;
        }
      }

      h2 {
        font-weight: 500;
        margin-bottom: 4px;
      }

      p {
        color: var(--ion-color-medium);
        font-size: 14px;
      }
    }

    ion-item-options {
      &::ng-deep {
        ion-item-option:last-child {
          border-top-right-radius: 8px;
          border-bottom-right-radius: 8px;
        }
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 20px;
      text-align: center;

      .empty-icon {
        font-size: 42px;
        color: var(--ion-color-medium);
        margin-bottom: 16px;
      }

      h3 {
        color: var(--ion-color-medium);
        font-size: 20px;
        margin-bottom: 8px;
      }

      p {
        color: var(--ion-color-medium);
        font-size: 16px;
      }
    }

    ion-fab-button {
      --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      font-weight: 500;
    }

    .status-icon {
      margin-right: 2px;
      font-size: 16px;
    }

    .status-badge.paid {
      color: var(--ion-color-primary);
    }

    .status-badge.pending {
      color: var(--ion-color-danger);
    }

    .notification-info {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--ion-color-medium);
      font-size: 14px;
    }
  `]
})
export class HomePage implements OnInit {
  selectedFilter = 'all';
  selectedMonth: number;
  searchTerm = '';
  months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  bills: Bill[] = [];
  filteredBills: Bill[] = [];

  constructor(
    private router: Router,
    private billService: BillService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.selectedMonth = new Date().getMonth();
  }

  ngOnInit() {
    this.billService.bills$.subscribe(bills => {
      this.bills = bills;
      this.filterBills();
      
      // Log detalhado das contas
      console.log('Contas carregadas:', bills.map(bill => ({
        name: bill.name,
        enableNotification: bill.enableNotification,
        notificationDate: bill.notificationDate,
        notificationTime: bill.notificationTime,
        dueDate: bill.dueDate
      })));
    });
  }

  previousMonth() {
    this.selectedMonth = this.selectedMonth === 0 ? 11 : this.selectedMonth - 1;
    this.handleMonthChange();
  }

  nextMonth() {
    this.selectedMonth = this.selectedMonth === 11 ? 0 : this.selectedMonth + 1;
    this.handleMonthChange();
  }

  handleMonthChange() {
    this.filterBills();
  }

  handleFilterChange(event: any) {
    this.filterBills();
  }

  getTotalAmount(): number {
    return this.filteredBills.reduce((sum, bill) => sum + bill.amount, 0);
  }

  getPaidAmount(): number {
    return this.filteredBills
      .filter(bill => bill.paid)
      .reduce((sum, bill) => sum + bill.amount, 0);
  }

  getPendingAmount(): number {
    return this.filteredBills
      .filter(bill => !bill.paid)
      .reduce((sum, bill) => sum + bill.amount, 0);
  }

  filterBills() {
    let filtered = this.bills.filter(bill => {
      const billDate = new Date(bill.dueDate);
      const billMonth = billDate.getMonth();
      return billMonth === this.selectedMonth;
    });

    if (this.searchTerm.trim()) {
      const searchTermLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(bill => 
        bill.name.toLowerCase().includes(searchTermLower)
      );
    }

    switch (this.selectedFilter) {
      case 'pending':
        filtered = filtered.filter(bill => !bill.paid);
        break;
      case 'paid':
        filtered = filtered.filter(bill => bill.paid);
        break;
    }

    this.filteredBills = filtered;
  }

  addBill() {
    this.router.navigate(['/add']);
  }

  editBill(bill: Bill) {
    this.router.navigate(['/edit', bill.id]);
  }

  viewDetails(bill: Bill) {
    this.router.navigate(['/details', bill.id]);
  }

  async confirmDelete(bill: Bill) {
    const alert = await this.alertController.create({
      header: 'Confirmar exclusão',
      message: 'Tem certeza que deseja excluir esta conta?',
      cssClass: 'light-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Excluir',
          role: 'confirm',
          cssClass: 'alert-button-confirm',
          handler: async () => {
            try {
              await this.billService.deleteBill(bill.id);
              const toast = await this.toastController.create({
                message: 'Conta excluída com sucesso',
                color: 'success',
                position: 'bottom',
                duration: 2000
              });
              await toast.present();
            } catch (error) {
              const errorAlert = await this.alertController.create({
                header: 'Erro',
                message: 'Não foi possível excluir a conta',
                cssClass: 'light-alert',
                buttons: ['OK']
              });
              await errorAlert.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }
}