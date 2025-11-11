import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { Sponsor } from './entities/sponsor.entity';
import { Program } from './entities/program.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Organizer } from '../organizers/organizer.entity'; // ✅ Import ajouté

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,

    @InjectRepository(Sponsor)
    private readonly sponsorsRepository: Repository<Sponsor>,
 @InjectRepository(Organizer) // ✅ Injection du repository Organizer
    private readonly organizersRepository: Repository<Organizer>,
    @InjectRepository(Program)
    private readonly programsRepository: Repository<Program>,

    private readonly notificationsService: NotificationsService,
  ) {}

 async create(createEventDto: CreateEventDto): Promise<Event> {
  const { sponsors, programs, organizerId, ...eventData } = createEventDto;

  // 🟦 Crée d’abord l’événement de base
  const event = this.eventsRepository.create(eventData);

  // 🟩 Si un organizerId est fourni, lie l’événement à l’organisateur correspondant
  if (organizerId) {
    const organizer = await this.organizersRepository.findOne({ where: { id: organizerId } });
    if (!organizer) {
      throw new NotFoundException(`Organizer with ID ${organizerId} not found`);
    }
    event.organizer = organizer;
  }

  // Sauvegarde initiale de l’événement
  const savedEvent = await this.eventsRepository.save(event);

  // 🟨 Enregistre les sponsors liés à cet événement
  if (sponsors && sponsors.length > 0) {
    const sponsorEntities = sponsors.map((sponsor) =>
      this.sponsorsRepository.create({
        ...sponsor,
        eventId: savedEvent.id,
      }),
    );
    await this.sponsorsRepository.save(sponsorEntities);
  }

  // 🟧 Enregistre les programmes liés à cet événement
  if (programs && programs.length > 0) {
    const programEntities = programs.map((program) =>
      this.programsRepository.create({
        ...program,
        eventId: savedEvent.id,
      }),
    );
    await this.programsRepository.save(programEntities);
  }

  // 🟦 Envoi d’une notification automatique
  await this.notificationsService.notifyEventCreated(savedEvent.id, savedEvent.title);

  // 🟩 Retourne l’événement complet avec ses relations (organizer, sponsors, programs)
  return this.findOne(savedEvent.id);
}


  async findAll(): Promise<Event[]> {
    return this.eventsRepository.find({
      relations: ['sponsors', 'programs', 'registrations'],
      order: { startDate: 'DESC' },
    });
  }

  async findActive(): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { isActive: true },
      relations: ['sponsors', 'programs'],
      order: { startDate: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['sponsors', 'programs', 'registrations', 'registrations.user'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    await this.findOne(id); // Vérifie que l’événement existe

    const { sponsors, programs, ...eventData } = updateEventDto;

    await this.eventsRepository.update(id, eventData);

    if (sponsors !== undefined) {
      await this.sponsorsRepository.delete({ eventId: id });
      if (sponsors.length > 0) {
        const sponsorEntities = sponsors.map((sponsor) =>
          this.sponsorsRepository.create({
            ...sponsor,
            eventId: id,
          }),
        );
        await this.sponsorsRepository.save(sponsorEntities);
      }
    }

    if (programs !== undefined) {
      await this.programsRepository.delete({ eventId: id });
      if (programs.length > 0) {
        const programEntities = programs.map((program) =>
          this.programsRepository.create({
            ...program,
            eventId: id,
          }),
        );
        await this.programsRepository.save(programEntities);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.eventsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
  }

  async getEventStats(eventId: string) {
    const event = await this.findOne(eventId);

    return {
      eventId: event.id,
      title: event.title,
      totalRegistrations: event.registrations?.length || 0,
      maxParticipants: event.maxParticipants,
      availableSpots: event.maxParticipants
        ? event.maxParticipants - (event.registrations?.length || 0)
        : null,
      isFull: event.maxParticipants
        ? event.registrations?.length >= event.maxParticipants
        : false,
      sponsorsCount: event.sponsors?.length || 0,
      programsCount: event.programs?.length || 0,
    };
  }

  async getUpcomingEvents(): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { isActive: true },
      relations: ['sponsors', 'programs'],
      order: { startDate: 'ASC' },
    });
  }
}
