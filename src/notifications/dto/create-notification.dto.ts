import { IsString, IsNotEmpty, IsUUID, IsOptional } from "class-validator"

export class CreateNotificationDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string

  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  message: string

  @IsUUID()
  @IsOptional()
  eventId?: string
}
