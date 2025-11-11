import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organizer } from './organizer.entity';

@Injectable()
export class OrganizersService {
  constructor(
    @InjectRepository(Organizer)
    private readonly organizersRepository: Repository<Organizer>,
  ) {}

  findAll() {
    return this.organizersRepository.find();
  }

  async create(name: string, contactEmail: string, website: string) {
    const organizer = this.organizersRepository.create({ name, contactEmail, website });
    return this.organizersRepository.save(organizer);
  }
}
