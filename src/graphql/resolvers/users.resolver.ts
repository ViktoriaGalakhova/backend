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
import { RegisterUserInput } from '../inputs/user.input';
import { ReviewPage } from '../models/review.model';
import { Session, SessionPage } from '../models/session.model';
import { User, UserPage } from '../models/user.model';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Query(() => UserPage, {
    description: 'Список пользователей постранично',
    complexity: pageComplexity,
  })
  users(
    @Args('pagination', { defaultValue: DEFAULT_PAGINATION })
    pagination: PaginationInput,
  ): Promise<UserPage> {
    return this.usersService.findAll(pagination.page, pagination.limit);
  }

  @Query(() => User, { description: 'Пользователь по идентификатору' })
  user(@Args('userId', { type: () => Int }) userId: number): Promise<User> {
    return this.usersService.findOne(userId);
  }

  @ResolveField(() => ReviewPage, {
    description: 'Отзывы пользователя постранично',
    complexity: pageComplexity,
  })
  reviews(
    @Parent() user: User,
    @Args('pagination', { defaultValue: DEFAULT_PAGINATION })
    pagination: PaginationInput,
  ): Promise<ReviewPage> {
    return this.reviewsService.findAll(
      pagination.page,
      pagination.limit,
      user.id,
    );
  }

  @ResolveField(() => SessionPage, {
    description: 'Сессии пользователя постранично',
    complexity: pageComplexity,
  })
  sessions(
    @Parent() user: User,
    @Args('pagination', { defaultValue: DEFAULT_PAGINATION })
    pagination: PaginationInput,
  ): Promise<SessionPage> {
    return this.usersService.findSessions(
      user.id,
      pagination.page,
      pagination.limit,
    );
  }

  @Mutation(() => User, { description: 'Зарегистрировать нового пользователя' })
  registerUser(@Args('input') input: RegisterUserInput): Promise<User> {
    return this.usersService.create(input);
  }

  @Mutation(() => User, {
    description: 'Изменить отображаемое имя пользователя',
  })
  renameUser(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('displayName') displayName: string,
  ): Promise<User> {
    return this.usersService.update(userId, { displayName });
  }

  @Mutation(() => User, { description: 'Изменить почту пользователя' })
  changeUserEmail(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('email') email: string,
  ): Promise<User> {
    return this.usersService.update(userId, { email });
  }

  @Mutation(() => User, { description: 'Изменить пароль пользователя' })
  changeUserPassword(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('password') password: string,
  ): Promise<User> {
    return this.usersService.update(userId, { password });
  }

  @Mutation(() => Boolean, { description: 'Удалить пользователя' })
  async deleteUser(
    @Args('userId', { type: () => Int }) userId: number,
  ): Promise<boolean> {
    await this.usersService.remove(userId);
    return true;
  }

  @Mutation(() => Session, { description: 'Открыть новую сессию пользователя' })
  openSession(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('ttlDays', { type: () => Int, defaultValue: 30 }) ttlDays: number,
  ): Promise<Session> {
    return this.usersService.createSession(userId, { ttlDays });
  }

  @Mutation(() => Session, { description: 'Продлить срок жизни сессии' })
  prolongSession(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('sessionId', { type: () => Int }) sessionId: number,
    @Args('ttlDays', { type: () => Int }) ttlDays: number,
  ): Promise<Session> {
    return this.usersService.updateSession(userId, sessionId, { ttlDays });
  }

  @Mutation(() => Boolean, { description: 'Закрыть сессию пользователя' })
  async closeSession(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('sessionId', { type: () => Int }) sessionId: number,
  ): Promise<boolean> {
    await this.usersService.removeSession(userId, sessionId);
    return true;
  }
}
