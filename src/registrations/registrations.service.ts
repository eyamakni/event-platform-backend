import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Registration, RegistrationStatus } from './entities/registration.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { EventsService } from '../events/events.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { Event } from '../events/entities/event.entity';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,

    private readonly emailService: EmailService,
    private readonly eventsService: EventsService,
    private readonly usersService: UsersService,
  ) {}

  // ✅ CREATE REGISTRATION + update event count
  async create(userId: string, createRegistrationDto: CreateRegistrationDto): Promise<Registration> {
    const { eventId } = createRegistrationDto;

    // 1️⃣ Get Event
    const event = await this.eventsService.findOne(eventId);
    if (!event.isActive) throw new BadRequestException('This event is not active');

    // 2️⃣ Get User
    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');

    // 3️⃣ Prevent duplicate registration
    const existingRegistration = await this.registrationsRepository.findOne({
      where: { userId, eventId, status: RegistrationStatus.CONFIRMED },
    });
    if (existingRegistration) {
      throw new ConflictException('You are already registered for this event');
    }

    // 4️⃣ Check capacity
    if (event.maxParticipants) {
      const current = await this.registrationsRepository.count({
        where: { eventId, status: RegistrationStatus.CONFIRMED },
      });
      if (current >= event.maxParticipants) {
        throw new BadRequestException('This event is full');
      }
    }

    // 5️⃣ Save registration
    const registration = this.registrationsRepository.create({
      userId,
      eventId,
      status: RegistrationStatus.CONFIRMED,
    });

    const saved = await this.registrationsRepository.save(registration);

    // 6️⃣ Increment registeredCount (✅ persistent)
    event.registeredCount = (event.registeredCount || 0) + 1;
    await this.eventsService.update(event.id, { registeredCount: event.registeredCount });

    // 7️⃣ Send confirmation email
    try {
      const fullName = `${user.firstName} ${user.lastName}`.trim();
      await this.emailService.sendRegistrationConfirmation(
        user.email,
        fullName || 'Participant',
        event.title,
        event.startDate.toISOString(),
        event.location,
      );
      console.log(`📨 Confirmation email sent to ${user.email}`);
    } catch (error) {
      console.error('❌ Email sending error:', error);
    }

    return saved;
  }

  // ✅ CANCEL REGISTRATION + decrement count
  async cancelRegistration(userId: string, registrationId: string): Promise<Registration> {
    const registration = await this.registrationsRepository.findOne({
      where: { id: registrationId, userId },
      relations: ['event'],
    });

    if (!registration) throw new NotFoundException('Registration not found');
    if (registration.status === RegistrationStatus.CANCELLED)
      throw new BadRequestException('Registration already cancelled');

    registration.status = RegistrationStatus.CANCELLED;
    await this.registrationsRepository.save(registration);

    // ✅ decrement event count safely
    const event = registration.event as Event;
    if (event && event.registeredCount > 0) {
      event.registeredCount -= 1;
      await this.eventsService.update(event.id, { registeredCount: event.registeredCount });
    }

    return registration;
  }

  // 🔎 OTHER METHODS (unchanged)
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
    if (!registration) throw new NotFoundException(`Registration with ID ${id} not found`);
    return registration;
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

  async findParticipantsByEvent(eventId: string) {
    const registrations = await this.registrationsRepository.find({
      where: { eventId, status: RegistrationStatus.CONFIRMED },
      relations: ['user'],
      order: { registeredAt: 'DESC' },
    });

    return registrations.map((r) => r.user);
  }
}
