import type { Request, Response } from 'express';
import { PaginationMetaDto } from './dto/pagination-meta.dto';

export type PaginatedResult<T> = {
  items: T[];
  meta: PaginationMetaDto;
};

export function paginate<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    items,
    meta: {
      page,
      limit,
      total,
      pageCount: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export function setLinkHeader(
  req: Request,
  res: Response,
  meta: PaginationMetaDto,
): void {
  const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
  const buildLink = (page: number, rel: string) =>
    `<${baseUrl}?page=${page}&limit=${meta.limit}>; rel="${rel}"`;

  const links = [buildLink(1, 'first')];

  if (meta.page > 1) {
    links.push(buildLink(meta.page - 1, 'prev'));
  }

  if (meta.page < meta.pageCount) {
    links.push(buildLink(meta.page + 1, 'next'));
  }

  links.push(buildLink(meta.pageCount, 'last'));

  res.setHeader('Link', links.join(', '));
}
