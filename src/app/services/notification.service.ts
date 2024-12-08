import { Injectable } from '@angular/core';
import { LocalNotifications, PermissionStatus, ScheduleOptions, SettingsPermissionStatus } from '@capacitor/local-notifications';
import { Platform } from '@ionic/angular';

interface NotificationData {
  id: string;
  title: string;
  body: string;
  date: string;
  time: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private platform: Platform) {
    this.initializeNotifications();
    
    // Adicionar chamada de debug após um curto delay
    setTimeout(() => {
      this.debugNotificationSystem();
    }, 3000);
  }

  private async initializeNotifications() {
    try {
      if (this.platform.is('capacitor')) {
        // Inicialização para Android
        await this.createNotificationChannel();
        const permissionStatus = await LocalNotifications.checkPermissions();
        console.log('Status de permissão inicial (Android):', permissionStatus);

        if (permissionStatus.display !== 'granted') {
          console.log('Solicitando permissão de notificação (Android)');
          const requestResult = await LocalNotifications.requestPermissions();
          console.log('Resultado da solicitação de permissão:', requestResult);
        }

        if (this.platform.is('android')) {
          const exactAlarmStatus = await this.checkExactAlarmSetting();
          console.log('Status de alarme exato:', exactAlarmStatus);
        }
      } else {
        // Inicialização para Web
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          console.log('Status de permissão inicial (Web):', permission);
        } else {
          console.warn('Notificações Web não são suportadas neste navegador');
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar notificações:', error);
    }
  }

  private async checkExactAlarmSetting(): Promise<SettingsPermissionStatus> {
    try {
      const exactAlarmStatus = await LocalNotifications.checkExactNotificationSetting();
      
      if (exactAlarmStatus.exact_alarm !== 'granted') {
        console.warn('Configuração de alarme exato não concedida');
        // Opcional: Redirecionar para configurações
        // await LocalNotifications.changeExactNotificationSetting();
      }

      return exactAlarmStatus;
    } catch (error) {
      console.error('Erro ao verificar configuração de alarme exato:', error);
      return { exact_alarm: 'denied' };
    }
  }

  private async createNotificationChannel() {
    try {
      await LocalNotifications.createChannel({
        id: 'bill_reminders',
        name: 'Lembretes de Contas',
        description: 'Notificações de vencimento de contas',
        importance: 4, // IMPORTANCE_HIGH
        visibility: 1, // VISIBILITY_PUBLIC
        sound: 'default',
        lights: true,
        lightColor: '#FF0000',
        vibration: true
      });
      console.log('Canal de notificação criado com sucesso');
    } catch (error) {
      console.error('Erro ao criar canal de notificação:', error);
    }
  }

  async scheduleNotification(data: NotificationData) {
    try {
      console.log('🔔 Iniciando agendamento de notificação:', data);

      if (this.platform.is('capacitor')) {
        // Verificar permissão de notificação
        const permissionStatus = await LocalNotifications.checkPermissions();
        console.log('🔍 Status de permissão:', permissionStatus);
        
        if (permissionStatus.display !== 'granted') {
          console.warn('❌ Permissão de notificação não concedida');
          const requestResult = await LocalNotifications.requestPermissions();
          console.log('📋 Resultado da solicitação de permissão:', requestResult);
        }

        // Criar data de notificação
        const notificationDateTime = new Date(data.date);
        const [hours, minutes] = data.time.split(':');
        notificationDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        console.log('📅 Data e hora da notificação:', notificationDateTime);

        // Verificar se a data é futura
        if (notificationDateTime <= new Date()) {
          console.warn('❗ Data de notificação no passado:', notificationDateTime);
          return;
        }

        // Configurações específicas para Android
        let notificationId = parseInt(data.id);
        let allowWhileIdle = false;

        // Verificações específicas para Android
        if (this.platform.is('android')) {
          try {
            const exactAlarmStatus = await this.checkExactAlarmSetting();
            console.log('⏰ Status de alarme exato:', exactAlarmStatus);
            
            if (exactAlarmStatus.exact_alarm !== 'granted') {
              console.warn('⚠️ Configuração de alarme exato não concedida');
            }
          } catch (error) {
            console.warn('⚠️ Erro ao verificar alarme exato:', error);
          }

          // Gerar ID seguro apenas para Android
          notificationId = this.generateSafeNotificationId(data.id.split('_')[1]);
          allowWhileIdle = true; // Habilita apenas para Android
        }

        // Configurações de agendamento
        const scheduleOptions: ScheduleOptions = {
          notifications: [
            {
              id: notificationId,
              title: data.title,
              body: data.body,
              schedule: { 
                at: notificationDateTime,
                allowWhileIdle, // Usa a configuração baseada na plataforma
                repeats: false
              },
              channelId: 'bill_reminders',
              sound: 'default',
              attachments: [],
              actionTypeId: '',
              extra: {
                billId: data.id
              }
            }
          ]
        };

        console.log('🚀 Opções de agendamento:', scheduleOptions);

        // Agendar notificação
        const result = await LocalNotifications.schedule(scheduleOptions);
        console.log('✅ Notificação agendada:', result);

      } else {
        // Lógica para Web Notifications
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          
          if (permission === 'granted') {
            const notificationDateTime = new Date(data.date);
            const [hours, minutes] = data.time.split(':');
            notificationDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const now = new Date();
            const timeUntilNotification = notificationDateTime.getTime() - now.getTime();

            if (timeUntilNotification > 0) {
              setTimeout(() => {
                const notification = new Notification(data.title, {
                  body: data.body,
                  icon: '/assets/icon/favicon.png',
                  badge: '/assets/icon/favicon.png',
                  tag: data.id
                });

                notification.onclick = () => {
                  window.focus();
                  notification.close();
                };
              }, timeUntilNotification);

              console.log('✅ Notificação web agendada para:', notificationDateTime);
            } else {
              console.warn('❗ Data de notificação web no passado:', notificationDateTime);
            }
          } else {
            console.warn('❌ Permissão de notificação web não concedida');
          }
        } else {
          console.warn('❌ Notificações Web não são suportadas neste navegador');
        }
      }
    } catch (error) {
      console.error('❌ Erro detalhado ao agendar notificação:', error);
      throw new Error('Não foi possível agendar a notificação');
    }
  }

  // Método auxiliar para gerar ID seguro para notificação no Android
  private generateSafeNotificationId(inputId: string): number {
    const MAX_INT = 2147483647;
    let numericId = parseInt(inputId);
    if (isNaN(numericId)) {
      numericId = Date.now();
    }
    return Math.abs(numericId % MAX_INT);
  }

  async cancelNotification(id: string) {
    try {
      await LocalNotifications.cancel({
        notifications: [{ id: parseInt(id) }]
      });
      console.log(`Notificação ${id} cancelada`);
    } catch (error) {
      console.error('Erro ao cancelar notificação:', error);
      throw new Error('Não foi possível cancelar a notificação');
    }
  }

  async cancelAllNotifications() {
    try {
      // Primeiro, buscar todas as notificações pendentes
      const pendingNotifications = await LocalNotifications.getPending();
      
      if (pendingNotifications.notifications.length > 0) {
        // Cancelar todas as notificações pendentes
        await LocalNotifications.cancel({
          notifications: pendingNotifications.notifications
        });
        console.log(`Todas as ${pendingNotifications.notifications.length} notificações canceladas`);
      } else {
        console.log('Não há notificações pendentes para cancelar');
      }
    } catch (error) {
      console.error('Erro ao cancelar todas as notificações:', error);
    }
  }

  async getPendingNotifications() {
    try {
      const pendingNotifications = await LocalNotifications.getPending();
      console.log('Notificações pendentes:', pendingNotifications);
      return pendingNotifications;
    } catch (error) {
      console.error('Erro ao buscar notificações pendentes:', error);
      return { notifications: [] };
    }
  }

  async debugNotificationSystem() {
    try {
      // Verificar permissões detalhadamente
      const permissionStatus = await LocalNotifications.checkPermissions();
      console.log('🔍 Status de Permissões de Notificação:', permissionStatus);

      // Verificar configurações de alarme exato
      const exactAlarmStatus = await this.checkExactAlarmSetting();
      console.log('🕰️ Status de Alarme Exato:', exactAlarmStatus);

      // Verificar notificações pendentes
      const pendingNotifications = await this.getPendingNotifications();
      console.log('📅 Notificações Pendentes:', pendingNotifications);

      // Testar agendamento de uma notificação de teste
      const testNotification: NotificationData = {
        id: '9999',
        title: 'Teste de Notificação',
        body: 'Esta é uma notificação de teste para verificar o sistema',
        date: new Date(Date.now() + 60000).toISOString(), // 1 minuto no futuro
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      console.log('🧪 Tentando agendar notificação de teste:', testNotification);
      await this.scheduleNotification(testNotification);

    } catch (error) {
      console.error('❌ Erro no diagnóstico do sistema de notificações:', error);
    }
  }
}
