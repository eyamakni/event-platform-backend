import { Controller, Get, Post, Body } from '@nestjs/common';
import { OrganizersService } from './organizers.service';

@Controller('organizers')
export class OrganizersController {
  constructor(private readonly organizersService: OrganizersService) {}

  @Get()
  findAll() {
    return this.organizersService.findAll();
  }

  @Post()
  create(
    @Body() body: { name: string; contactEmail: string; website: string },
  ) {
    return this.organizersService.create(body.name, body.contactEmail, body.website);
  }
}
