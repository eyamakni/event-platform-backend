import { Controller, Get, UseGuards, Param,Query,Delete } from "@nestjs/common"
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
@Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteUser(@Param('id') id: string) {
    return this.usersService.remove(id)
  }
  @Get("stats")
  @Roles(UserRole.ADMIN)
  getStats() {
    return this.usersService.getUserStats()
  }
    @Get("search")
  @Roles(UserRole.ADMIN)
  searchUsers(
    @Query("q") query: string,
    @Query("page") page = 1,
    @Query("limit") limit = 10
  ) {
    return this.usersService.searchUsers(query, Number(page), Number(limit));
  }

  @Get(":id")
  getUserDetails(@Param("id") id: string) {
    return this.usersService.getUserWithRegistrations(id)
  }
}
