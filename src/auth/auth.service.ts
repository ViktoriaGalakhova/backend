import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
import Session from 'supertokens-node/recipe/session';
import { PrismaService } from '../prisma/prisma.service';
import type { SessionUser } from './auth.types';
import { AppRole } from './auth.types';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async requireSessionUser(
    req: Request,
    res: Response,
  ): Promise<SessionUser | null> {
    const session = await Session.getSession(req, res);
    return this.findBySupertokensId(session.getUserId());
  }

  async resolveSessionUser(
    req: Request,
    res: Response,
  ): Promise<SessionUser | null> {
    try {
      const session = await Session.getSession(req, res, {
        sessionRequired: false,
      });

      if (!session) {
        return null;
      }

      return await this.findBySupertokensId(session.getUserId());
    } catch {
      return null;
    }
  }

  async revokeSession(req: Request, res: Response): Promise<void> {
    try {
      const session = await Session.getSession(req, res, {
        sessionRequired: false,
      });
      await session?.revokeSession();
    } catch {
      return;
    }
  }

  async findBySupertokensId(
    supertokensId: string,
  ): Promise<SessionUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { supertokensId },
    });

    if (!user) {
      return null;
    }

    const role = user.role as AppRole;

    return {
      id: user.id,
      supertokensId: user.supertokensId,
      displayName: user.displayName,
      email: user.email,
      role,
      isAdmin: role === AppRole.Admin,
    };
  }

  sanitizeNextPath(next?: string): string {
    if (!next?.startsWith('/') || next.startsWith('//')) {
      return '/';
    }

    return next;
  }
}
