import { Controller, Get, Query, Render, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { CatalogService } from '../catalog/catalog.service';
import { LocationsService } from '../locations/locations.service';
import { ReviewsService } from '../reviews/reviews.service';
import { PagesService } from './pages.service';

@Controller()
export class PagesController {
  constructor(
    private readonly pagesService: PagesService,
    private readonly authService: AuthService,
    private readonly reviewsService: ReviewsService,
    private readonly catalogService: CatalogService,
    private readonly locationsService: LocationsService,
  ) {}

  @Get()
  @Render('index')
  async getIndexPage(
    @Req() req: Request,
    @Query('notice') notice?: string,
    @Query('error') error?: string,
  ) {
    const user = await this.authService.getSessionUser(req);

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
    @Req() req: Request,
    @Query('notice') notice?: string,
    @Query('error') error?: string,
  ) {
    const user = await this.authService.getSessionUser(req);

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
  async getTablePage(@Req() req: Request) {
    const user = await this.authService.getSessionUser(req);

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
  async getAddressesPage(@Req() req: Request) {
    const user = await this.authService.getSessionUser(req);

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
  async getCoffeePage(@Req() req: Request) {
    const user = await this.authService.getSessionUser(req);

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
    @Req() req: Request,
    @Query('notice') notice?: string,
    @Query('error') error?: string,
  ) {
    const user = await this.authService.getSessionUser(req);
    const reviews = await this.reviewsService.getAllForView(user?.id ?? null);

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
}
