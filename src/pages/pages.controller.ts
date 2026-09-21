import { Controller, Get, Query, Render } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { SessionUser } from '../auth/auth.types';
import { AppRole } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PublicAccess } from '../auth/decorators/public-access.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CatalogService } from '../catalog/catalog.service';
import { LocationsService } from '../locations/locations.service';
import { ReviewsService } from '../reviews/reviews.service';
import { UsersService } from '../users/users.service';
import { PagesService } from './pages.service';

@PublicAccess()
@ApiExcludeController()
@Controller()
export class PagesController {
  constructor(
    private readonly pagesService: PagesService,
    private readonly reviewsService: ReviewsService,
    private readonly catalogService: CatalogService,
    private readonly locationsService: LocationsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @Render('index')
  getIndexPage(
    @CurrentUser() user: SessionUser | null,
    @Query('notice') notice?: string,
    @Query('error') error?: string,
  ) {
    return this.pagesService.buildPageModel(
      '/',
      'British Coffee Shop',
      user,
      notice ?? error,
      error ? 'error' : 'success',
    );
  }

  @Get('/menu')
  @Render('menu')
  async getMenuPage(
    @CurrentUser() user: SessionUser | null,
    @Query('notice') notice?: string,
    @Query('error') error?: string,
  ) {
    return {
      ...this.pagesService.buildPageModel(
        '/menu',
        'Меню | British Coffee Shop',
        user,
        notice ?? error,
        error ? 'error' : 'success',
      ),
      menuSections: await this.catalogService.getMenuSections(),
    };
  }

  @Get('/table')
  @Render('table')
  getTablePage(@CurrentUser() user: SessionUser | null) {
    return {
      ...this.pagesService.buildPageModel(
        '/table',
        'Цены | British Coffee Shop',
        user,
      ),
      priceRows: this.pagesService.getPriceRows(),
    };
  }

  @Get('/addresses')
  @Render('addresses')
  async getAddressesPage(@CurrentUser() user: SessionUser | null) {
    return {
      ...this.pagesService.buildPageModel(
        '/addresses',
        'Адреса | British Coffee Shop',
        user,
      ),
      addresses: await this.locationsService.getAddresses(),
    };
  }

  @Get('/coffee')
  @Render('coffee')
  getCoffeePage(@CurrentUser() user: SessionUser | null) {
    return {
      ...this.pagesService.buildPageModel(
        '/coffee',
        'Всё о кофе | British Coffee Shop',
        user,
      ),
      recipes: this.pagesService.getRecipes(),
    };
  }

  @Get('/feedback')
  @Render('feedback')
  async getFeedbackPage(
    @CurrentUser() user: SessionUser | null,
    @Query('notice') notice?: string,
    @Query('error') error?: string,
  ) {
    const reviews = await this.reviewsService.getAllForView(user);

    return {
      ...this.pagesService.buildPageModel(
        '/feedback',
        'Отзывы | British Coffee Shop',
        user,
        notice ?? error,
        error ? 'error' : 'success',
      ),
      reviews,
      canLeaveReview: Boolean(user),
    };
  }

  @Get('/profile')
  @Render('profile')
  async getProfilePage(@CurrentUser() user: SessionUser | null) {
    const reviews = await this.reviewsService.getAllForView(user);

    return {
      ...this.pagesService.buildPageModel(
        '/profile',
        'Профиль | British Coffee Shop',
        user,
      ),
      myReviews: reviews.filter((review) => review.authorId === user?.id),
    };
  }

  @Get('/admin')
  @Roles(AppRole.Admin)
  @Render('admin')
  async getAdminPage(@CurrentUser() user: SessionUser | null) {
    const users = await this.usersService.findAll(1, 100);

    return {
      ...this.pagesService.buildPageModel(
        '/admin',
        'Админ-панель | British Coffee Shop',
        user,
      ),
      users: users.items,
    };
  }
}
