import { Module } from '@nestjs/common';
import { LocationsApiController } from './locations-api.controller';
import { LocationsService } from './locations.service';

@Module({
  controllers: [LocationsApiController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
