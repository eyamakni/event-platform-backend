import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Event } from "./event.entity"

@Entity("sponsors")
export class Sponsor {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column({ nullable: true })
  logoUrl: string

  @Column({ nullable: true })
  website: string

  @Column("text", { nullable: true })
  description: string

  @ManyToOne(
    () => Event,
    (event) => event.sponsors,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "eventId" })
  event: Event

  @Column()
  eventId: string
}
