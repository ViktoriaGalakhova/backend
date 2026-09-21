import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import supertokens from 'supertokens-node';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import RecipeUserId from 'supertokens-node/lib/build/recipeUserId';
import { AppRole } from '../auth/auth.types';
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
  role: string;
  createdAt: Date;
  _count: { reviews: number };
};

const TENANT_ID = 'public';

@Injectable()
export class UsersService {
  private readonly defaultSessionTtlDays = 30;

  constructor(private readonly prisma: PrismaService) {}

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
    const result = await EmailPassword.signUp(
      TENANT_ID,
      dto.email.trim().toLowerCase(),
      dto.password,
      undefined,
      { displayName: dto.displayName.trim() },
    );

    if (result.status !== 'OK') {
      throw new ConflictException('Аккаунт с таким email уже существует.');
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { supertokensId: result.user.id },
      include: { _count: { select: { reviews: true } } },
    });

    return this.toUser(user);
  }

  async update(userId: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    const existing = await this.findRecordOrFail(userId);

    if (dto.email || dto.password) {
      const result = await EmailPassword.updateEmailOrPassword({
        recipeUserId: new RecipeUserId(existing.supertokensId),
        email: dto.email?.trim().toLowerCase(),
        password: dto.password,
      });

      if (result.status !== 'OK') {
        throw new ConflictException(
          'Не удалось обновить учётные данные в сервисе аутентификации.',
        );
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: dto.displayName?.trim(),
        email: dto.email?.trim().toLowerCase(),
      },
      include: { _count: { select: { reviews: true } } },
    });

    return this.toUser(user);
  }

  async changeRole(userId: number, role: AppRole): Promise<UserResponseDto> {
    await this.findRecordOrFail(userId);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      include: { _count: { select: { reviews: true } } },
    });

    return this.toUser(user);
  }

  async remove(userId: number): Promise<void> {
    const existing = await this.findRecordOrFail(userId);
    await supertokens.deleteUser(existing.supertokensId);
    await this.prisma.user.delete({ where: { id: userId } });
  }

  private async findRecordOrFail(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Пользователь не найден.');
    }

    return user;
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
      role: user.role as AppRole,
      reviewsCount: user._count.reviews,
      createdAt: user.createdAt,
    };
  }
}
