import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Event } from '../events/entities/event.entity';

@Entity('organizers')
export class Organizer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // ex: "IEEE CS", "IEEE RAS", etc.

  @Column({ nullable: true })
  contactEmail?: string;

  @Column({ nullable: true })
  website?: string;

  @OneToMany(() => Event, (event) => event.organizer)
  events: Event[];
}
