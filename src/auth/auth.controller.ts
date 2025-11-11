import { Controller,Body, Post, Get, UseGuards, Request,Put } from "@nestjs/common"
import { AuthService } from "./auth.service"
import  { RegisterDto } from "./dto/register.dto"
import  { LoginDto } from "./dto/login.dto"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { Public } from "./decorators/public.decorator"
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto)
  }
  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @Body('newPassword') newPassword: string
  ) {
    return this.authService.resetPassword(email, newPassword)
  }

  @Public()
  @Post("login")
  async login(@Body()loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Request() req) {
    return req.user
  }
  // ✅ 🔄 Mise à jour du profil (nom, prénom, email)
  @UseGuards(JwtAuthGuard)
  @Put("update-profile")
  async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put("change-password")
  async changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.userId, dto);
  }
}
