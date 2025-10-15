import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Event } from "./event.entity"

@Entity("programs")
export class Program {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  title: string

  @Column("text")
  description: string

  @Column({ type: "datetime" })
  startTime: Date

  @Column({ type: "datetime" })
  endTime: Date

  @Column({ nullable: true })
  speaker: string

  @Column({ nullable: true })
  location: string

  @ManyToOne(
    () => Event,
    (event) => event.programs,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "eventId" })
  event: Event

  @Column()
  eventId: string
}
