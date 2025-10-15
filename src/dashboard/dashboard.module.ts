import { Module } from "@nestjs/common"
import { DashboardController } from "./dashboard.controller"
import { DashboardService } from "./dashboard.service"
import { UsersModule } from "../users/users.module"
import { EventsModule } from "../events/events.module"
import { RegistrationsModule } from "../registrations/registrations.module"
import { NotificationsModule } from "../notifications/notifications.module"

@Module({
  imports: [UsersModule, EventsModule, RegistrationsModule, NotificationsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
