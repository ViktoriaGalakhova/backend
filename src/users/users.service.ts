import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { AuthService } from '../auth/auth.service';
import { paginate, PaginatedResult } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { SessionResponseDto } from './dto/session-response.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

type UserRecord = {
  id: number;
  displayName: string;
  email: string;
  createdAt: Date;
  _count: { reviews: number };
};

@Injectable()
export class UsersService {
  private readonly defaultSessionTtlDays = 30;

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async findAll(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<UserResponseDto>> {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        include: { _count: { select: { reviews: true } } },
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);

    return paginate(
      users.map((user) => this.toUser(user)),
      total,
      page,
      limit,
    );
  }

  async findOne(userId: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { _count: { select: { reviews: true } } },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден.');
    }

    return this.toUser(user);
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.create({
      data: {
        displayName: dto.displayName.trim(),
        email: dto.email.trim().toLowerCase(),
        passwordHash: await this.authService.hashPassword(dto.password),
      },
      include: { _count: { select: { reviews: true } } },
    });

    return this.toUser(user);
  }

  async update(userId: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    await this.findOne(userId);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: dto.displayName?.trim(),
        email: dto.email?.trim().toLowerCase(),
        passwordHash: dto.password
          ? await this.authService.hashPassword(dto.password)
          : undefined,
      },
      include: { _count: { select: { reviews: true } } },
    });

    return this.toUser(user);
  }

  async remove(userId: number): Promise<void> {
    await this.findOne(userId);
    await this.prisma.user.delete({ where: { id: userId } });
  }

  async findSessions(
    userId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<SessionResponseDto>> {
    await this.findOne(userId);

    const [sessions, total] = await Promise.all([
      this.prisma.session.findMany({
        where: { userId },
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.session.count({ where: { userId } }),
    ]);

    return paginate(sessions, total, page, limit);
  }

  async findSession(
    userId: number,
    sessionId: number,
  ): Promise<SessionResponseDto> {
    await this.findOne(userId);

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Сессия не найдена.');
    }

    return session;
  }

  async createSession(
    userId: number,
    dto: CreateSessionDto,
  ): Promise<SessionResponseDto> {
    await this.findOne(userId);

    return this.prisma.session.create({
      data: {
        token: randomBytes(32).toString('hex'),
        userId,
        expiresAt: this.buildExpiration(
          dto.ttlDays ?? this.defaultSessionTtlDays,
        ),
      },
    });
  }

  async updateSession(
    userId: number,
    sessionId: number,
    dto: UpdateSessionDto,
  ): Promise<SessionResponseDto> {
    await this.findSession(userId, sessionId);

    return this.prisma.session.update({
      where: { id: sessionId },
      data: { expiresAt: this.buildExpiration(dto.ttlDays) },
    });
  }

  async removeSession(userId: number, sessionId: number): Promise<void> {
    await this.findSession(userId, sessionId);
    await this.prisma.session.delete({ where: { id: sessionId } });
  }

  private buildExpiration(ttlDays: number): Date {
    return new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
  }

  private toUser(user: UserRecord): UserResponseDto {
    return {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      reviewsCount: user._count.reviews,
      createdAt: user.createdAt,
    };
  }
}
