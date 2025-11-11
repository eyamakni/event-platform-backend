import { Injectable, UnauthorizedException, ConflictException , NotFoundException, BadRequestException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { EmailService } from '../email/email.service'; // ✅ Ajoute ceci

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
        private readonly emailService: EmailService, 
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
  // ✅ Mettre à jour profil
  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (dto.email && dto.email !== user.email) {
      const exists = await this.usersService.findByEmail(dto.email);
      if (exists) throw new ConflictException('Email already in use');
    }

    const updated = await this.usersService.update(userId, {
      firstName: dto.firstName ?? user.firstName,
      lastName: dto.lastName ?? user.lastName,
      email: dto.email ?? user.email,
    });

    // on ne renvoie pas le hash
    const { password, ...safe } = updated as any;
    return { message: 'Profile updated successfully', user: safe };
  }

  // ✅ Changer mot de passe
  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const ok = await bcrypt.compare(dto.currentPassword, user.password);
    if (!ok) throw new UnauthorizedException('Current password is incorrect');

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different');
    }

    const hash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.update(userId, { password: hash });

    return { message: 'Password updated successfully' };
  }

async register(registerDto: RegisterDto) {
  const existingUser = await this.usersService.findByEmail(registerDto.email);
  if (existingUser) {
    throw new ConflictException('Email already exists');
  }

  const hashedPassword = await bcrypt.hash(registerDto.password, 10);

  const user = await this.usersService.create({
    ...registerDto,
    password: hashedPassword,
    role: UserRole.USER,
  });

  await this.emailService.sendWelcomeEmail(user.email, user.firstName);

  const { password, ...result } = user;
  return result;
}
async resetPassword(email: string, newPassword: string) {
  const user = await this.usersService.findByEmail(email)
  if (!user) {
    throw new NotFoundException('No account found with this email')
  }

  if (!newPassword || newPassword.length < 6) {
    throw new BadRequestException('Password must be at least 6 characters')
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)
  await this.usersService.update(user.id, { password: hashedPassword })


  return { message: 'Password has been reset successfully' }
}



  async createDefaultAdmin() {
    const adminEmail = 'admin@example.com';
    const existingAdmin = await this.usersService.findByEmail(adminEmail);

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      await this.usersService.create({
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
      });
      console.log('✅ Default admin created: admin@example.com / Admin123!');
    }
  }
}
