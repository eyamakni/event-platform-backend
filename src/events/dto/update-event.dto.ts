import { PartialType } from "@nestjs/mapped-types"
import { CreateEventDto } from "./create-event.dto"
import { IsBoolean, IsOptional } from "class-validator"

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
  registeredCount?: number;
}
