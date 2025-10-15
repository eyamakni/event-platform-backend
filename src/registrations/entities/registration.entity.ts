import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Event } from "../../events/entities/event.entity"

export enum RegistrationStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
}

@Entity("registrations")
export class Registration {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(
    () => User,
    (user) => user.registrations,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "userId" })
  user: User

  @Column()
  userId: string

  @ManyToOne(
    () => Event,
    (event) => event.registrations,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "eventId" })
  event: Event

  @Column()
  eventId: string

  @Column({
    type: "enum",
    enum: RegistrationStatus,
    default: RegistrationStatus.CONFIRMED,
  })
  status: RegistrationStatus

  @CreateDateColumn()
  registeredAt: Date
}
