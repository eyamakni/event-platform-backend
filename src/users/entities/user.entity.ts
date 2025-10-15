import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Exclude } from "class-transformer"
import { Registration } from "../../registrations/entities/registration.entity"
import { Notification } from "../../notifications/entities/notification.entity"

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  email: string

  @Column()
  @Exclude()
  password: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole

  @Column({ default: true })
  isActive: boolean

  @OneToMany(
    () => Registration,
    (registration) => registration.user,
  )
  registrations: Registration[]

  @OneToMany(
    () => Notification,
    (notification) => notification.user,
  )
  notifications: Notification[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
