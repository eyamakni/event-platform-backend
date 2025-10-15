import { Controller,Body, Get, Post, Patch, Param, Delete, UseGuards } from "@nestjs/common"
import  { EventsService } from "./events.service"
import  { CreateEventDto } from "./dto/create-event.dto"
import  { UpdateEventDto } from "./dto/update-event.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/entities/user.entity"
import { Public } from "../auth/decorators/public.decorator"

@Controller("events")
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body()createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto)
  }

  @Public()
  @Get()
  findAll() {
    return this.eventsService.findActive()
  }

  @Get("all")
  @Roles(UserRole.ADMIN)
  findAllAdmin() {
    return this.eventsService.findAll()
  }

  @Public()
  @Get("upcoming")
  findUpcoming() {
    return this.eventsService.getUpcomingEvents()
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.eventsService.findOne(id)
  }

  @Get(":id/stats")
  @Roles(UserRole.ADMIN)
  getStats(@Param("id") id: string) {
    return this.eventsService.getEventStats(id)
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN)
  update(@Param("id") id: string, updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto)
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN)
  remove(@Param("id") id: string) {
    return this.eventsService.remove(id)
  }
}
