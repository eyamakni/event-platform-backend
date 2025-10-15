import { Injectable, NotFoundException } from "@nestjs/common"
import  { Repository } from "typeorm"
import  { User,UserRole } from "./entities/user.entity"
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(  @InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData)
    return this.usersRepository.save(user)
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ["id", "email", "firstName", "lastName", "role", "isActive", "createdAt"],
      order: { createdAt: "DESC" },
    })
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    return user
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } })
  }

  async getUserStats() {
    const totalUsers = await this.usersRepository.count()
    const activeUsers = await this.usersRepository.count({ where: { isActive: true } })
    const adminUsers = await this.usersRepository.count({ where: { role: UserRole.ADMIN  } })

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentUsers = await this.usersRepository.count({
      where: {
        createdAt: thirtyDaysAgo,
      },
    })

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      regularUsers: totalUsers - adminUsers,
      recentUsers,
      inactiveUsers: totalUsers - activeUsers,
    }
  }

  async getUserWithRegistrations(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ["registrations", "registrations.event"],
      select: ["id", "email", "firstName", "lastName", "role", "isActive", "createdAt"],
    })

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    return user
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, updateData)
    return this.findOne(id)
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id)
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
  }
}
