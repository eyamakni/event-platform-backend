import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}
async sendWelcomeEmail(userEmail: string, userName: string) {
  try {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: ' Welcome to Eventora!',
      template: 'welcome', // ton fichier .hbs à créer
      context: {
        name: userName,
      },
    });

    console.log(`✅ Email de bienvenue envoyé à ${userEmail}`);
  } catch (error) {
    console.error('❌ Erreur lors de l’envoi de l’email de bienvenue :', error);
  }
}

  async sendRegistrationConfirmation(
    userEmail: string,
    userName: string,
    eventTitle: string,
    eventDate?: string,
    location?: string
  ) {
    try {
      // ✅ Formatage lisible de la date
      let formattedDate = 'To be announced';
      if (eventDate) {
        const date = new Date(eventDate);
        formattedDate = date.toLocaleString('en-GB', {
          weekday: 'long',  // Thursday
          year: 'numeric',  // 2025
          month: 'long',    // October
          day: 'numeric',   // 23
          hour: '2-digit',  // 09
          minute: '2-digit',// 00
        });
      }

      await this.mailerService.sendMail({
        to: userEmail,
        subject: ` Confirmation for ${eventTitle}`,
        template: 'registration-confirmation', // fichier .hbs
        context: {
          name: userName,
          eventTitle,
          eventDate: formattedDate,
          location: location || 'To be announced',
        },
      });

      console.log(`✅ Email sent successfully to ${userEmail}`);
    } catch (error) {
      console.error('❌ Error while sending email:', error);
      throw error;
    }
  }
}
