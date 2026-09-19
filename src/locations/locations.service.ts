import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginate, PaginatedResult } from '../common/pagination';
import { StorageService } from '../storage/storage.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationResponseDto } from './dto/location-response.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async findAll(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<LocationResponseDto>> {
    const [locations, total] = await Promise.all([
      this.prisma.cafeLocation.findMany({
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.cafeLocation.count(),
    ]);

    return paginate(locations, total, page, limit);
  }

  async findOne(locationId: number): Promise<LocationResponseDto> {
    const location = await this.prisma.cafeLocation.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new NotFoundException('Кофейня не найдена.');
    }

    return location;
  }

  create(dto: CreateLocationDto): Promise<LocationResponseDto> {
    return this.prisma.cafeLocation.create({
      data: { ...dto, imageUrl: dto.imageUrl ?? '' },
    });
  }

  async update(
    locationId: number,
    dto: UpdateLocationDto,
  ): Promise<LocationResponseDto> {
    await this.findOne(locationId);

    return this.prisma.cafeLocation.update({
      where: { id: locationId },
      data: dto,
    });
  }

  async setImage(
    locationId: number,
    file: Express.Multer.File,
  ): Promise<LocationResponseDto> {
    const current = await this.findOne(locationId);
    const imageUrl = await this.storage.upload(file, 'locations');

    const location = await this.prisma.cafeLocation.update({
      where: { id: locationId },
      data: { imageUrl },
    });

    if (current.imageUrl) {
      await this.storage.remove(current.imageUrl);
    }

    return location;
  }

  async remove(locationId: number): Promise<void> {
    const location = await this.findOne(locationId);
    await this.prisma.cafeLocation.delete({ where: { id: locationId } });

    if (location.imageUrl) {
      await this.storage.remove(location.imageUrl);
    }
  }

  async getAddresses() {
    const locations = await this.prisma.cafeLocation.findMany({
      orderBy: { id: 'asc' },
    });

    return locations.map((location) => ({
      title: location.name,
      address: location.address,
      phone: location.phone,
      schedule: location.openingHours,
      image: location.imageUrl,
      imageAlt: location.name,
    }));
  }
}
