import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ReviewsService } from '../../reviews/reviews.service';
import { UsersService } from '../../users/users.service';
import { pageComplexity } from '../complexity';
import {
  DEFAULT_PAGINATION,
  PaginationInput,
} from '../inputs/pagination.input';
import { PublishReviewInput } from '../inputs/review.input';
import { Review, ReviewPage } from '../models/review.model';
import { User } from '../models/user.model';

@Resolver(() => Review)
export class ReviewsResolver {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly usersService: UsersService,
  ) {}

  @Query(() => ReviewPage, {
    description: 'Список отзывов постранично',
    complexity: pageComplexity,
  })
  reviews(
    @Args('pagination', { defaultValue: DEFAULT_PAGINATION })
    pagination: PaginationInput,
    @Args('authorId', { type: () => Int, nullable: true }) authorId?: number,
  ): Promise<ReviewPage> {
    return this.reviewsService.findAll(
      pagination.page,
      pagination.limit,
      authorId,
    );
  }

  @Query(() => Review, { description: 'Отзыв по идентификатору' })
  review(
    @Args('reviewId', { type: () => Int }) reviewId: number,
  ): Promise<Review> {
    return this.reviewsService.findOne(reviewId);
  }

  @ResolveField(() => User, { description: 'Автор отзыва' })
  author(@Parent() review: Review): Promise<User> {
    return this.usersService.findOne(review.authorId);
  }

  @Mutation(() => Review, { description: 'Опубликовать новый отзыв' })
  publishReview(@Args('input') input: PublishReviewInput): Promise<Review> {
    return this.reviewsService.createForApi(input);
  }

  @Mutation(() => Review, { description: 'Изменить текст отзыва' })
  editReview(
    @Args('reviewId', { type: () => Int }) reviewId: number,
    @Args('comment') comment: string,
  ): Promise<Review> {
    return this.reviewsService.updateForApi(reviewId, { comment });
  }

  @Mutation(() => Boolean, { description: 'Удалить отзыв' })
  async deleteReview(
    @Args('reviewId', { type: () => Int }) reviewId: number,
  ): Promise<boolean> {
    await this.reviewsService.removeForApi(reviewId);
    return true;
  }
}
