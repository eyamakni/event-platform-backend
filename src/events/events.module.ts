import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EventsService } from "./events.service"
import { EventsController } from "./events.controller"
import { Event } from "./entities/event.entity"
import { Sponsor } from "./entities/sponsor.entity"
import { Program } from "./entities/program.entity"
import { NotificationsModule } from "../notifications/notifications.module"
import { Organizer } from '../organizers/organizer.entity'; // ✅ ajoute ceci

@Module({
  imports: [TypeOrmModule.forFeature([Event, Sponsor, Program,Organizer]), NotificationsModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
