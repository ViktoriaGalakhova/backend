import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { access } from 'fs/promises';
import { join } from 'path';

@Controller('media')
export class MediaController {
  @Get(':filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    if (!/^[a-z0-9-]+\.png$/i.test(filename)) {
      throw new NotFoundException();
    }

    const filePath = join(process.cwd(), 'media', filename);

    try {
      await access(filePath);
    } catch {
      throw new NotFoundException();
    }

    return res.sendFile(filePath);
  }
}
