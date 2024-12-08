import { Injectable } from '@angular/core';
import { Bill } from '../models/bill.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPast } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private bills = new BehaviorSubject<Bill[]>([]);
  bills$ = this.bills.asObservable();

  constructor() {
    this.loadBills();
  }

  private async loadBills() {
    try {
      const storedBills = localStorage.getItem('bills');
      if (storedBills) {
        const parsedBills: Bill[] = JSON.parse(storedBills);
        
        // Limpar notificações antigas, mas preservar as configurações de notificação
        const cleanedBills = parsedBills.map(bill => {
          const dueDate = new Date(bill.dueDate);
          const today = new Date();
          
          // Se a conta está vencida e não paga, desabilitar notificação futura
          if (dueDate < today && !bill.paid) {
            return {
              ...bill,
              enableNotification: false
            };
          }
          return bill;
        });

        // Ordenar por data
        const sortedBills = cleanedBills.sort((a, b) => {
          const dateA = new Date(a.dueDate);
          const dateB = new Date(b.dueDate);
          return dateB.getTime() - dateA.getTime();
        });

        // Manter apenas os últimos 6 meses de contas
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const filteredBills = sortedBills.filter(bill => {
          const billDate = new Date(bill.dueDate);
          return billDate >= sixMonthsAgo || !bill.paid;
        });

        // Salvar as contas filtradas
        if (filteredBills.length !== parsedBills.length) {
          localStorage.setItem('bills', JSON.stringify(filteredBills));
        }

        this.bills.next(filteredBills);
      }
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
      throw new Error('Não foi possível carregar as contas');
    }
  }

  async addBill(bill: Bill): Promise<string> {
    try {
      const currentBills = this.bills.value;
      
      // Usar o ID existente ou gerar um novo
      const newBill = { ...bill };

      const updatedBills = [...currentBills, newBill];
      localStorage.setItem('bills', JSON.stringify(updatedBills));
      this.bills.next(updatedBills);
      
      return newBill.id;
    } catch (error) {
      console.error('Erro ao adicionar conta:', error);
      throw new Error('Não foi possível adicionar a conta');
    }
  }

  private generateUniqueId(): string {
    return `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async updateBill(updatedBill: Bill): Promise<void> {
    try {
      const currentBills = this.bills.value;
      const updatedBills = currentBills.map(bill => 
        bill.id === updatedBill.id ? updatedBill : bill
      );
      localStorage.setItem('bills', JSON.stringify(updatedBills));
      this.bills.next(updatedBills);
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      throw new Error('Não foi possível atualizar a conta');
    }
  }

  async deleteBill(id: string): Promise<void> {
    try {
      const currentBills = this.bills.value;
      const updatedBills = currentBills.filter(bill => bill.id !== id);
      
      // Atualiza o localStorage
      localStorage.setItem('bills', JSON.stringify(updatedBills));
      
      // Atualiza o BehaviorSubject
      this.bills.next(updatedBills);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      return Promise.reject(new Error('Não foi possível excluir a conta'));
    }
  }
}
