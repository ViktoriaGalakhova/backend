import { Header } from '@nestjs/common';

export function CacheControl(maxAgeSeconds: number): MethodDecorator {
  return Header('Cache-Control', `public, max-age=${maxAgeSeconds}`);
}
