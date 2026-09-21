import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { Subject } from 'rxjs';
import type { SessionUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { paginate, PaginatedResult } from '../common/pagination';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

type ReviewWithAuthor = {
  id: number;
  authorId: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  author: { displayName: string; email: string };
};

type ReviewView = {
  id: number;
  authorId: number;
  authorName: string;
  authorEmail: string;
  comment: string;
  createdAtLabel: string;
  updatedAtLabel: string;
  wasEdited: boolean;
  canManage: boolean;
};

@Injectable()
export class ReviewsService {
  private readonly updates$ = new Subject<MessageEvent>();

  constructor(private readonly prisma: PrismaService) {}

  async getAllForView(user: SessionUser | null): Promise<ReviewView[]> {
    const reviews = await this.prisma.review.findMany({
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((review) => this.toReviewView(review, user));
  }

  async getOneForView(
    reviewId: number,
    user: SessionUser | null,
  ): Promise<ReviewView> {
    const review = await this.findReviewOrFail(reviewId);
    return this.toReviewView(review, user);
  }

  async create(user: SessionUser, comment: string): Promise<ReviewView> {
    const review = await this.prisma.review.create({
      data: {
        authorId: user.id,
        comment: this.normalizeComment(comment),
      },
      include: { author: true },
    });

    const view = this.toReviewView(review, user);
    this.emit('created', view);
    return view;
  }

  async update(
    reviewId: number,
    user: SessionUser,
    comment: string,
  ): Promise<ReviewView> {
    const review = await this.findReviewOrFail(reviewId);

    if (review.authorId !== user.id && !user.isAdmin) {
      throw new ForbiddenException('Можно редактировать только свои отзывы.');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: { comment: this.normalizeComment(comment) },
      include: { author: true },
    });

    const view = this.toReviewView(updatedReview, user);
    this.emit('updated', view);
    return view;
  }

  async remove(reviewId: number, user: SessionUser): Promise<void> {
    const review = await this.findReviewOrFail(reviewId);

    if (review.authorId !== user.id && !user.isAdmin) {
      throw new ForbiddenException('Можно удалять только свои отзывы.');
    }

    await this.prisma.review.delete({ where: { id: reviewId } });
    this.emitDeleted(this.toReviewView(review, user));
  }

  async findAll(
    page: number,
    limit: number,
    authorId?: number,
  ): Promise<PaginatedResult<ReviewResponseDto>> {
    const where = authorId ? { authorId } : {};

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: { author: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return paginate(
      reviews.map((review) => this.toReviewResponse(review)),
      total,
      page,
      limit,
    );
  }

  async findOne(reviewId: number): Promise<ReviewResponseDto> {
    const review = await this.findReviewOrFail(reviewId);
    return this.toReviewResponse(review);
  }

  async findOneByAuthor(
    authorId: number,
    reviewId: number,
  ): Promise<ReviewResponseDto> {
    const review = await this.findReviewOrFail(reviewId);

    if (review.authorId !== authorId) {
      throw new NotFoundException('Отзыв не принадлежит этому пользователю.');
    }

    return this.toReviewResponse(review);
  }

  async createForApi(dto: CreateReviewDto): Promise<ReviewResponseDto> {
    const author = await this.prisma.user.findUnique({
      where: { id: dto.authorId },
      select: { id: true },
    });

    if (!author) {
      throw new NotFoundException('Пользователь не найден.');
    }

    const review = await this.prisma.review.create({
      data: { authorId: dto.authorId, comment: dto.comment.trim() },
      include: { author: true },
    });

    this.emit('created', this.toReviewView(review, null));
    return this.toReviewResponse(review);
  }

  async updateForApi(
    reviewId: number,
    dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    await this.findReviewOrFail(reviewId);

    const review = await this.prisma.review.update({
      where: { id: reviewId },
      data: { comment: dto.comment.trim() },
      include: { author: true },
    });

    this.emit('updated', this.toReviewView(review, null));
    return this.toReviewResponse(review);
  }

  async removeForApi(reviewId: number): Promise<void> {
    const review = await this.findReviewOrFail(reviewId);
    await this.prisma.review.delete({ where: { id: reviewId } });
    this.emitDeleted(this.toReviewView(review, null));
  }

  stream() {
    return this.updates$.asObservable();
  }

  private async findReviewOrFail(reviewId: number): Promise<ReviewWithAuthor> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { author: true },
    });

    if (!review) {
      throw new NotFoundException('Отзыв не найден.');
    }

    return review;
  }

  private normalizeComment(comment: string): string {
    const normalized = comment.trim().replace(/\r\n/g, '\n');

    if (normalized.length < 10) {
      throw new ForbiddenException(
        'Отзыв должен содержать хотя бы 10 символов.',
      );
    }

    if (normalized.length > 300) {
      throw new ForbiddenException(
        'Отзыв не должен быть длиннее 300 символов.',
      );
    }

    return normalized;
  }

  private toReviewResponse(review: ReviewWithAuthor): ReviewResponseDto {
    return {
      id: review.id,
      authorId: review.authorId,
      authorName: review.author.displayName,
      authorEmail: review.author.email,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  private toReviewView(
    review: ReviewWithAuthor,
    user: SessionUser | null,
  ): ReviewView {
    return {
      id: review.id,
      authorId: review.authorId,
      authorName: review.author.displayName,
      authorEmail: review.author.email,
      comment: review.comment,
      createdAtLabel: this.formatDate(review.createdAt),
      updatedAtLabel: this.formatDate(review.updatedAt),
      wasEdited: review.updatedAt.getTime() !== review.createdAt.getTime(),
      canManage: Boolean(user && (user.isAdmin || review.authorId === user.id)),
    };
  }

  private emit(type: 'created' | 'updated', review: ReviewView) {
    this.updates$.next({
      type: 'reviews',
      data: { type, review },
    });
  }

  private emitDeleted(review: ReviewView) {
    this.updates$.next({
      type: 'reviews',
      data: { type: 'deleted', review },
    });
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }
}
