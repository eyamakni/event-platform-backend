import { Controller, Get, Post, Param, Delete, UseGuards,Body, Patch, Req } from "@nestjs/common"
import  { RegistrationsService } from "./registrations.service"
import  { CreateRegistrationDto } from "./dto/create-registration.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/entities/user.entity"

@Controller("registrations")
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  create(@Body() createRegistrationDto: CreateRegistrationDto, @Req() req) {
    return this.registrationsService.create(req.user.userId, createRegistrationDto)
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.registrationsService.findAll()
  }

  @Get("my-events")
  findMyEvents(@Req() req) {
    return this.registrationsService.findByUser(req.user.userId)
  }

  @Get("event/:eventId")
  findByEvent(@Param("eventId") eventId: string) {
    return this.registrationsService.findByEvent(eventId)
  }

  @Get("stats")
  @Roles(UserRole.ADMIN)
  getStats() {
    return this.registrationsService.getRegistrationStats()
  }

  @Patch(":id/cancel")
  cancel(@Req() req, @Param("id") id: string) {
    return this.registrationsService.cancelRegistration(req.user.userId, id)
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN)
  remove(@Param("id") id: string) {
    return this.registrationsService.remove(id)
  }
  @Get('event/:eventId/participants')
findParticipantsByEvent(@Param('eventId') eventId: string) {
  return this.registrationsService.findParticipantsByEvent(eventId);
}

}
