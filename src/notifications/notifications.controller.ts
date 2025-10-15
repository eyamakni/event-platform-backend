import { Controller,Body, Get, Post, Param, Delete, UseGuards, Patch, Req } from "@nestjs/common"
import  { NotificationsService } from "./notifications.service"
import  { CreateNotificationDto } from "./dto/create-notification.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/entities/user.entity"

@Controller("notifications")
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto)
  }

  @Post("broadcast")
  @Roles(UserRole.ADMIN)
  broadcast(body: { title: string; message: string; eventId?: string }) {
    return this.notificationsService.createForAllUsers(body.title, body.message, body.eventId)
  }

  @Get()
  findMyNotifications(@Req() req) {
    return this.notificationsService.findByUser(req.user.userId)
  }

  @Get("unread")
  findUnread(@Req() req) {
    return this.notificationsService.findUnreadByUser(req.user.userId)
  }

  @Get("unread/count")
  getUnreadCount(@Req() req) {
    return this.notificationsService.getUnreadCount(req.user.userId)
  }

  @Get("all")
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.notificationsService.findAll()
  }

  @Patch(":id/read")
  markAsRead(@Req() req, @Param("id") id: string) {
    return this.notificationsService.markAsRead(id, req.user.userId)
  }

  @Patch("read-all")
  markAllAsRead(@Req() req) {
    return this.notificationsService.markAllAsRead(req.user.userId)
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.notificationsService.remove(id)
  }
}
