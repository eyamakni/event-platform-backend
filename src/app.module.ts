import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { OrganizersModule } from './organizers/organizers.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { EmailModule } from './email/email.module';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [
    // 🌍 Environment
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 🧱 Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'event_management'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // ✉️ Mailer
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          service: 'gmail',
          auth: {
            user: configService.get('EMAIL_USER'),
            pass: configService.get('EMAIL_PASS'),
          },
        },
        defaults: {
          from: `"Eventora Platform" <${configService.get('EMAIL_USER')}>`,
        },
        template: {
      dir: join(process.cwd(), 'src', 'email', 'templates'), // ✅ clé ici
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
      inject: [ConfigService],
    }),

    // 📦 Functional Modules
    AuthModule,
    UsersModule,
    EventsModule,
    RegistrationsModule,
    NotificationsModule,
    DashboardModule,
    OrganizersModule,
    EmailModule,
  ],

  // ❌ Ne déclare plus AuthService ici
  // providers: [AuthService], ❌

})
export class AppModule implements OnModuleInit {
  constructor(private readonly authService: AuthService) {}

  async onModuleInit() {
    await this.authService.createDefaultAdmin();
  }
}
