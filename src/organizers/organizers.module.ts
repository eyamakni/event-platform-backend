import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organizer } from './organizer.entity';
import { OrganizersService } from './organizers.service';
import { OrganizersController } from './organizers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Organizer])],
  controllers: [OrganizersController],
  providers: [OrganizersService],
  exports: [OrganizersService],
})
export class OrganizersModule {}
