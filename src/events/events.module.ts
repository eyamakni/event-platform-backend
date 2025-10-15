import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EventsService } from "./events.service"
import { EventsController } from "./events.controller"
import { Event } from "./entities/event.entity"
import { Sponsor } from "./entities/sponsor.entity"
import { Program } from "./entities/program.entity"
import { NotificationsModule } from "../notifications/notifications.module"

@Module({
  imports: [TypeOrmModule.forFeature([Event, Sponsor, Program]), NotificationsModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
