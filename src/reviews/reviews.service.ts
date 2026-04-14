import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { Subject } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

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

  async getAllForView(currentUserId: number | null): Promise<ReviewView[]> {
    const reviews = await this.prisma.review.findMany({
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((review) => this.toReviewView(review, currentUserId));
  }

  async getOneForView(
    reviewId: number,
    currentUserId: number | null,
  ): Promise<ReviewView> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { author: true },
    });

    if (!review) {
      throw new NotFoundException('Отзыв не найден.');
    }

    return this.toReviewView(review, currentUserId);
  }

  async create(authorId: number, comment: string): Promise<ReviewView> {
    const review = await this.prisma.review.create({
      data: {
        authorId,
        comment: this.normalizeComment(comment),
      },
      include: { author: true },
    });

    const view = this.toReviewView(review, authorId);
    this.emit('created', view);
    return view;
  }

  async update(
    reviewId: number,
    authorId: number,
    comment: string,
  ): Promise<ReviewView> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { author: true },
    });

    if (!review) {
      throw new NotFoundException('Отзыв не найден.');
    }

    if (review.authorId !== authorId) {
      throw new ForbiddenException('Можно редактировать только свои отзывы.');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: { comment: this.normalizeComment(comment) },
      include: { author: true },
    });

    const view = this.toReviewView(updatedReview, authorId);
    this.emit('updated', view);
    return view;
  }

  async remove(reviewId: number, authorId: number): Promise<void> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Отзыв не найден.');
    }

    if (review.authorId !== authorId) {
      throw new ForbiddenException('Можно удалять только свои отзывы.');
    }

    await this.prisma.review.delete({ where: { id: reviewId } });
    this.emit('deleted', {
      id: reviewId,
      authorId,
      authorName: '',
      authorEmail: '',
      comment: '',
      createdAtLabel: '',
      updatedAtLabel: '',
      wasEdited: false,
      canManage: true,
    });
  }

  stream() {
    return this.updates$.asObservable();
  }

  private normalizeComment(comment: string): string {
    const normalized = comment.trim().replace(/\r\n/g, '\n');

    if (normalized.length < 10) {
      throw new ForbiddenException('Отзыв должен содержать хотя бы 10 символов.');
    }

    if (normalized.length > 300) {
      throw new ForbiddenException('Отзыв не должен быть длиннее 300 символов.');
    }

    return normalized;
  }

  private toReviewView(
    review: {
      id: number;
      authorId: number;
      comment: string;
      createdAt: Date;
      updatedAt: Date;
      author: { displayName: string; email: string };
    },
    currentUserId: number | null,
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
      canManage: review.authorId === currentUserId,
    };
  }

  private emit(type: 'created' | 'updated' | 'deleted', review: ReviewView) {
    this.updates$.next({
      type: 'reviews',
      data: {
        type,
        review,
      },
    });
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }
}
