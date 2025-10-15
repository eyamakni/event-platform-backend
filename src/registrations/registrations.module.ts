import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { RegistrationsService } from "./registrations.service"
import { RegistrationsController } from "./registrations.controller"
import { Registration } from "./entities/registration.entity"
import { EventsModule } from "../events/events.module"
import { UsersModule } from "../users/users.module"

@Module({
  imports: [TypeOrmModule.forFeature([Registration]), EventsModule, UsersModule],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
