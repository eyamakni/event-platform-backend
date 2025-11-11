import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';

@Module({
  imports: [MailerModule], // 👈 pour pouvoir utiliser MailerService
  providers: [EmailService],
  exports: [EmailService], // 👈 indispensable pour que d’autres modules y accèdent
})
export class EmailModule {}
