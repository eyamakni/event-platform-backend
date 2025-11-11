import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { RegistrationsService } from "./registrations.service"
import { RegistrationsController } from "./registrations.controller"
import { Registration } from "./entities/registration.entity"
import { EventsModule } from "../events/events.module"
import { UsersModule } from "../users/users.module"
import { EmailModule } from '../email/email.module'; // ✅ ajoute ceci

@Module({
  imports: [TypeOrmModule.forFeature([Registration]), EventsModule, UsersModule,EmailModule,],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
