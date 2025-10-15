import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Registration, RegistrationStatus } from './entities/registration.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { EventsService } from '../events/events.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>, // ✅ injection explicite

    private readonly eventsService: EventsService,
    private readonly usersService: UsersService,
  ) {}

  async create(userId: string, createRegistrationDto: CreateRegistrationDto): Promise<Registration> {
    const { eventId } = createRegistrationDto;

    const event = await this.eventsService.findOne(eventId);
    if (!event.isActive) {
      throw new BadRequestException('This event is not active');
    }

    const existingRegistration = await this.registrationsRepository.findOne({
      where: {
        userId,
        eventId,
        status: RegistrationStatus.CONFIRMED,
      },
    });

    if (existingRegistration) {
      throw new ConflictException('You are already registered for this event');
    }

    if (event.maxParticipants) {
      const currentRegistrations = await this.registrationsRepository.count({
        where: { eventId, status: RegistrationStatus.CONFIRMED },
      });

      if (currentRegistrations >= event.maxParticipants) {
        throw new BadRequestException('This event is full');
      }
    }

    const registration = this.registrationsRepository.create({
      userId,
      eventId,
      status: RegistrationStatus.CONFIRMED,
    });

    return this.registrationsRepository.save(registration);
  }

  async findAll(): Promise<Registration[]> {
    return this.registrationsRepository.find({
      relations: ['user', 'event'],
      order: { registeredAt: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<Registration[]> {
    return this.registrationsRepository.find({
      where: { userId },
      relations: ['event', 'event.sponsors', 'event.programs'],
      order: { registeredAt: 'DESC' },
    });
  }

  async findByEvent(eventId: string): Promise<Registration[]> {
    return this.registrationsRepository.find({
      where: { eventId },
      relations: ['user'],
      order: { registeredAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Registration> {
    const registration = await this.registrationsRepository.findOne({
      where: { id },
      relations: ['user', 'event'],
    });

    if (!registration) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }

    return registration;
  }

  async cancelRegistration(userId: string, registrationId: string): Promise<Registration> {
    const registration = await this.registrationsRepository.findOne({
      where: { id: registrationId, userId },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new BadRequestException('Registration is already cancelled');
    }

    registration.status = RegistrationStatus.CANCELLED;
    return this.registrationsRepository.save(registration);
  }

  async remove(id: string): Promise<void> {
    const result = await this.registrationsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }
  }

  async getRegistrationStats() {
    const totalRegistrations = await this.registrationsRepository.count();
    const confirmedRegistrations = await this.registrationsRepository.count({
      where: { status: RegistrationStatus.CONFIRMED },
    });
    const cancelledRegistrations = await this.registrationsRepository.count({
      where: { status: RegistrationStatus.CANCELLED },
    });

    return {
      totalRegistrations,
      confirmedRegistrations,
      cancelledRegistrations,
      pendingRegistrations:
        totalRegistrations - confirmedRegistrations - cancelledRegistrations,
    };
  }
}
