import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Registration } from "../../registrations/entities/registration.entity"
import { Sponsor } from "./sponsor.entity"
import { Program } from "./program.entity"

export enum EventType {
  HACKATHON = "hackathon",
  CONFERENCE = "conference",
  MEETUP = "meetup",
  WORKSHOP = "workshop",
}

@Entity("events")
export class Event {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  title: string

  @Column("text")
  description: string

  @Column({
    type: "enum",
    enum: EventType,
    default: EventType.MEETUP,
  })
  type: EventType

  @Column()
  location: string

  @Column({ type: "datetime" })
  startDate: Date

  @Column({ type: "datetime" })
  endDate: Date

  @Column({ default: true })
  isFree: boolean

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  price: number

  @Column({ nullable: true })
  maxParticipants: number

  @Column({ default: true })
  isActive: boolean

  @Column({ nullable: true })
  imageUrl: string

  @OneToMany(
    () => Registration,
    (registration) => registration.event,
  )
  registrations: Registration[]

  @OneToMany(
    () => Sponsor,
    (sponsor) => sponsor.event,
    { cascade: true },
  )
  sponsors: Sponsor[]

  @OneToMany(
    () => Program,
    (program) => program.event,
    { cascade: true },
  )
  programs: Program[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
