import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { PrismaService } from '../prisma/prisma.service';

const scrypt = promisify(scryptCallback);

export type SessionUser = {
  id: number;
  displayName: string;
  email: string;
};

@Injectable()
export class AuthService {
  private readonly sessionCookieName = 'bcs_session';
  private readonly sessionDurationMs = 1000 * 60 * 60 * 24 * 30;

  constructor(private readonly prisma: PrismaService) {}

  async getSessionUser(req: Request): Promise<SessionUser | null> {
    const token = this.readSessionToken(req);

    if (!token) {
      return null;
    }

    const session = await this.prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) {
      return null;
    }

    if (session.expiresAt <= new Date()) {
      await this.prisma.session.delete({ where: { token } });
      return null;
    }

    return {
      id: session.user.id,
      displayName: session.user.displayName,
      email: session.user.email,
    };
  }

  async register(
    displayName: string,
    email: string,
    password: string,
    res: Response,
  ): Promise<void> {
    const normalizedName = displayName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (normalizedName.length < 2) {
      throw new ConflictException('Имя должно содержать хотя бы 2 символа.');
    }

    if (!this.isValidEmail(normalizedEmail)) {
      throw new ConflictException('Укажите корректный email.');
    }

    if (normalizedPassword.length < 6) {
      throw new ConflictException(
        'Пароль должен содержать хотя бы 6 символов.',
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Аккаунт с таким email уже существует.');
    }

    const user = await this.prisma.user.create({
      data: {
        displayName: normalizedName,
        email: normalizedEmail,
        passwordHash: await this.hashPassword(normalizedPassword),
      },
    });

    await this.createSession(user.id, res);
  }

  async login(email: string, password: string, res: Response): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль.');
    }

    const isPasswordCorrect = await this.verifyPassword(
      normalizedPassword,
      user.passwordHash,
    );

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Неверный email или пароль.');
    }

    await this.createSession(user.id, res);
  }

  async logout(req: Request, res: Response): Promise<void> {
    const token = this.readSessionToken(req);

    if (token) {
      await this.prisma.session.deleteMany({ where: { token } });
    }

    res.cookie(this.sessionCookieName, '', {
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(0),
      path: '/',
    });
  }

  sanitizeNextPath(next?: string): string {
    if (!next?.startsWith('/') || next.startsWith('//')) {
      return '/';
    }

    return next;
  }

  private readSessionToken(req: Request): string | null {
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
      return null;
    }

    const cookies = cookieHeader
      .split(';')
      .reduce<Record<string, string>>((accumulator, chunk) => {
        const [rawKey, ...rawValueParts] = chunk.trim().split('=');

        if (!rawKey) {
          return accumulator;
        }

        accumulator[rawKey] = decodeURIComponent(rawValueParts.join('='));
        return accumulator;
      }, {});

    return cookies[this.sessionCookieName] ?? null;
  }

  private async createSession(userId: number, res: Response): Promise<void> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.sessionDurationMs);

    await this.prisma.session.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    res.cookie(this.sessionCookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

    return `${salt}:${derivedKey.toString('hex')}`;
  }

  private async verifyPassword(
    password: string,
    storedHash: string,
  ): Promise<boolean> {
    const [salt, hash] = storedHash.split(':');

    if (!salt || !hash) {
      return false;
    }

    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    const storedBuffer = Buffer.from(hash, 'hex');

    if (storedBuffer.length !== derivedKey.length) {
      return false;
    }

    return timingSafeEqual(storedBuffer, derivedKey);
  }
}
