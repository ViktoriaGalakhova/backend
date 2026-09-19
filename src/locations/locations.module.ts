import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { LocationsApiController } from './locations-api.controller';
import { LocationsService } from './locations.service';

@Module({
  imports: [StorageModule],
  controllers: [LocationsApiController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
