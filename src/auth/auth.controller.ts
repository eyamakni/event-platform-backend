import { Controller,Body, Post, Get, UseGuards, Request } from "@nestjs/common"
import { AuthService } from "./auth.service"
import  { RegisterDto } from "./dto/register.dto"
import  { LoginDto } from "./dto/login.dto"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { Public } from "./decorators/public.decorator"

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto)
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
}
