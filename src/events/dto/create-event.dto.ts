import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from "class-validator"
import { Type } from "class-transformer"
import { EventType } from "../entities/event.entity"

class CreateSponsorDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  logoUrl?: string

  @IsString()
  @IsOptional()
  website?: string

  @IsString()
  @IsOptional()
  description?: string
}

class CreateProgramDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsDateString()
  startTime: Date

  @IsDateString()
  endTime: Date

  @IsString()
  @IsOptional()
  speaker?: string

  @IsString()
  @IsOptional()
  location?: string
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsEnum(EventType)
  type: EventType

  @IsString()
  @IsNotEmpty()
  location: string

  @IsDateString()
  startDate: Date

  @IsDateString()
  endDate: Date

  @IsBoolean()
  @IsOptional()
  isFree?: boolean

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxParticipants?: number

  @IsString()
  @IsOptional()
  imageUrl?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSponsorDto)
  @IsOptional()
  sponsors?: CreateSponsorDto[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProgramDto)
  @IsOptional()
  programs?: CreateProgramDto[]
}
