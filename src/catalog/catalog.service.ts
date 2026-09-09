import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginate, PaginatedResult } from '../common/pagination';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateProductDto } from './dto/update-product.dto';

type CategoryRecord = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  createdAt: Date;
  _count: { products: number };
};

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async findCategories(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<CategoryResponseDto>> {
    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.category.count(),
    ]);

    return paginate(
      categories.map((category) => this.toCategory(category)),
      total,
      page,
      limit,
    );
  }

  async findCategory(categoryId: number): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      throw new NotFoundException('Раздел меню не найден.');
    }

    return this.toCategory(category);
  }

  async createCategory(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.create({
      data: {
        slug: dto.slug,
        title: dto.title,
        description: dto.description ?? null,
      },
      include: { _count: { select: { products: true } } },
    });

    return this.toCategory(category);
  }

  async updateCategory(
    categoryId: number,
    dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    await this.findCategory(categoryId);

    const category = await this.prisma.category.update({
      where: { id: categoryId },
      data: {
        slug: dto.slug,
        title: dto.title,
        description: dto.description,
      },
      include: { _count: { select: { products: true } } },
    });

    return this.toCategory(category);
  }

  async removeCategory(categoryId: number): Promise<void> {
    await this.findCategory(categoryId);
    await this.prisma.category.delete({ where: { id: categoryId } });
  }

  async findProducts(
    page: number,
    limit: number,
    categoryId?: number,
  ): Promise<PaginatedResult<ProductResponseDto>> {
    const where = categoryId ? { categoryId } : {};

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return paginate(products, total, page, limit);
  }

  async findCategoryProducts(
    categoryId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<ProductResponseDto>> {
    await this.findCategory(categoryId);
    return this.findProducts(page, limit, categoryId);
  }

  async findProduct(productId: number): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Позиция меню не найдена.');
    }

    return product;
  }

  async findCategoryProduct(
    categoryId: number,
    productId: number,
  ): Promise<ProductResponseDto> {
    await this.findCategory(categoryId);
    const product = await this.findProduct(productId);

    if (product.categoryId !== categoryId) {
      throw new NotFoundException('Позиция не относится к этому разделу меню.');
    }

    return product;
  }

  async createProduct(dto: CreateProductDto): Promise<ProductResponseDto> {
    await this.findCategory(dto.categoryId);

    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        price: dto.price,
        imageUrl: dto.imageUrl,
        isAvailable: dto.isAvailable ?? true,
        categoryId: dto.categoryId,
      },
    });
  }

  async updateProduct(
    productId: number,
    dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    await this.findProduct(productId);

    if (dto.categoryId) {
      await this.findCategory(dto.categoryId);
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        imageUrl: dto.imageUrl,
        isAvailable: dto.isAvailable,
        categoryId: dto.categoryId,
      },
    });
  }

  async removeProduct(productId: number): Promise<void> {
    await this.findProduct(productId);
    await this.prisma.product.delete({ where: { id: productId } });
  }

  async getMenuSections() {
    const categories = await this.prisma.category.findMany({
      include: { products: { orderBy: { id: 'asc' } } },
      orderBy: { id: 'asc' },
    });

    return categories.map((category) => ({
      id: category.slug,
      title: category.title,
      items: category.products.map((product) => ({
        name: product.name,
        price: `${product.price} ₽`,
        image: product.imageUrl,
        imageAlt: product.name,
      })),
    }));
  }

  private toCategory(category: CategoryRecord): CategoryResponseDto {
    return {
      id: category.id,
      slug: category.slug,
      title: category.title,
      description: category.description,
      productsCount: category._count.products,
      createdAt: category.createdAt,
    };
  }
}
