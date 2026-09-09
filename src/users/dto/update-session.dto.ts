import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class UpdateSessionDto {
  @ApiProperty({
    description: 'Новый срок жизни сессии в днях, считая от текущего момента',
    example: 7,
    minimum: 1,
    maximum: 365,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  ttlDays: number;
}
