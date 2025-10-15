import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { User } from "../../users/entities/user.entity"

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(
    () => User,
    (user) => user.notifications,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "userId" })
  user: User

  @Column()
  userId: string

  @Column()
  title: string

  @Column("text")
  message: string

  @Column({ default: false })
  isRead: boolean

  @Column({ nullable: true })
  eventId: string

  @CreateDateColumn()
  createdAt: Date
}
