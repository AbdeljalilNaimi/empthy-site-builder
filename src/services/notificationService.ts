// Notification service for booking confirmations and other emails
// In production, this would call a Firebase Cloud Function or edge function

export interface BookingNotification {
  type: 'booking_confirmation' | 'booking_reminder' | 'booking_cancelled';
  patientEmail: string;
  patientName: string;
  providerName: string;
  appointmentDate: string;
  appointmentTime: string;
}

export interface VerificationNotification {
  type: 'verification_submitted' | 'verification_approved' | 'verification_rejected';
  providerEmail: string;
  providerName: string;
  reason?: string;
}

class NotificationService {
  private readonly apiEndpoint = '/api/notifications'; // Would be Firebase function URL

  async sendBookingConfirmation(data: BookingNotification): Promise<boolean> {
    
    // Store notification in localStorage for demo
    this.storeNotification({
      id: Date.now().toString(),
      type: data.type,
      recipient: data.patientEmail,
      subject: this.getBookingSubject(data.type),
      content: this.generateBookingContent(data),
      sentAt: new Date().toISOString(),
      status: 'sent'
    });

    // In production, would call Firebase function:
    // const response = await fetch(this.apiEndpoint, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ type: 'booking', data })
    // });
    // return response.ok;

    return true;
  }

  async sendVerificationNotification(data: VerificationNotification): Promise<boolean> {
    
    this.storeNotification({
      id: Date.now().toString(),
      type: data.type,
      recipient: data.providerEmail,
      subject: this.getVerificationSubject(data.type),
      content: this.generateVerificationContent(data),
      sentAt: new Date().toISOString(),
      status: 'sent'
    });

    return true;
  }

  private getBookingSubject(type: BookingNotification['type']): string {
    switch (type) {
      case 'booking_confirmation':
        return 'Confirmation de votre rendez-vous - CityHealth';
      case 'booking_reminder':
        return 'Rappel: Votre rendez-vous demain - CityHealth';
      case 'booking_cancelled':
        return 'Annulation de votre rendez-vous - CityHealth';
    }
  }

  private getVerificationSubject(type: VerificationNotification['type']): string {
    switch (type) {
      case 'verification_submitted':
        return 'Demande de vérification reçue - CityHealth';
      case 'verification_approved':
        return '✅ Votre profil est vérifié - CityHealth';
      case 'verification_rejected':
        return 'Demande de vérification - Action requise - CityHealth';
    }
  }

  private generateBookingContent(data: BookingNotification): string {
    switch (data.type) {
      case 'booking_confirmation':
        return `
          Bonjour ${data.patientName},

          Votre rendez-vous a été confirmé !

          📅 Date: ${data.appointmentDate}
          🕐 Heure: ${data.appointmentTime}
          👨‍⚕️ Professionnel: ${data.providerName}

          Pensez à arriver 10 minutes avant l'heure de votre rendez-vous.

          Cordialement,
          L'équipe CityHealth
        `;
      case 'booking_reminder':
        return `
          Bonjour ${data.patientName},

          Rappel: Vous avez un rendez-vous demain.

          📅 Date: ${data.appointmentDate}
          🕐 Heure: ${data.appointmentTime}
          👨‍⚕️ Professionnel: ${data.providerName}

          Cordialement,
          L'équipe CityHealth
        `;
      case 'booking_cancelled':
        return `
          Bonjour ${data.patientName},

          Votre rendez-vous a été annulé.

          📅 Date initiale: ${data.appointmentDate}
          👨‍⚕️ Professionnel: ${data.providerName}

          N'hésitez pas à prendre un nouveau rendez-vous sur CityHealth.

          Cordialement,
          L'équipe CityHealth
        `;
    }
  }

  private generateVerificationContent(data: VerificationNotification): string {
    switch (data.type) {
      case 'verification_submitted':
        return `
          Bonjour ${data.providerName},

          Nous avons bien reçu votre demande de vérification.

          Notre équipe va examiner vos documents sous 24-48h.
          Vous recevrez un email dès que la vérification sera terminée.

          Cordialement,
          L'équipe CityHealth
        `;
      case 'verification_approved':
        return `
          Bonjour ${data.providerName},

          ✅ Félicitations ! Votre profil a été vérifié.

          Le badge de vérification est maintenant visible sur votre profil public.
          Vous pouvez également créer des annonces médicales.

          Cordialement,
          L'équipe CityHealth
        `;
      case 'verification_rejected':
        return `
          Bonjour ${data.providerName},

          Nous n'avons pas pu valider votre demande de vérification.

          Raison: ${data.reason || 'Documents non conformes'}

          Vous pouvez soumettre une nouvelle demande avec les documents corrigés.

          Cordialement,
          L'équipe CityHealth
        `;
    }
  }

  private storeNotification(notification: {
    id: string;
    type: string;
    recipient: string;
    subject: string;
    content: string;
    sentAt: string;
    status: string;
  }) {
    const notifications = JSON.parse(localStorage.getItem('ch_sent_notifications') || '[]');
    notifications.push(notification);
    localStorage.setItem('ch_sent_notifications', JSON.stringify(notifications));
  }

  getSentNotifications() {
    return JSON.parse(localStorage.getItem('ch_sent_notifications') || '[]');
  }
}

export const notificationService = new NotificationService();
