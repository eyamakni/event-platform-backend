import { Controller, Get, UseGuards, Param } from "@nestjs/common"
import  { UsersService } from "./users.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "./entities/user.entity"

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll()
  }

  @Get("stats")
  @Roles(UserRole.ADMIN)
  getStats() {
    return this.usersService.getUserStats()
  }

  @Get(":id")
  getUserDetails(@Param("id") id: string) {
    return this.usersService.getUserWithRegistrations(id)
  }
}
