import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.seedCatalog();
    await this.seedLocations();
  }

  private async seedCatalog(): Promise<void> {
    if ((await this.prisma.category.count()) > 0) {
      return;
    }

    const categories = [
      {
        slug: 'hot',
        title: 'Горячие напитки',
        description: 'Напитки, которые подаются горячими.',
        products: [
          { name: 'Капучино', price: 200, imageUrl: '/media/cappuccino.png' },
          { name: 'Латте', price: 220, imageUrl: '/media/latte.png' },
          { name: 'Эспрессо', price: 150, imageUrl: '/media/espresso.png' },
        ],
      },
      {
        slug: 'cold',
        title: 'Холодные напитки',
        description: 'Освежающие напитки со льдом.',
        products: [
          { name: 'Айс-латте', price: 230, imageUrl: '/media/iced-latte.png' },
          { name: 'Фраппе', price: 250, imageUrl: '/media/frappe.png' },
          {
            name: 'Молочный коктейль',
            price: 210,
            imageUrl: '/media/milkshake.png',
          },
        ],
      },
      {
        slug: 'desserts',
        title: 'Десерты',
        description: 'Домашняя выпечка и десерты.',
        products: [
          { name: 'Чизкейк', price: 300, imageUrl: '/media/cheesecake.png' },
          { name: 'Тирамису', price: 280, imageUrl: '/media/tiramisu.png' },
          { name: 'Штрудель', price: 200, imageUrl: '/media/strudel.png' },
        ],
      },
    ];

    for (const category of categories) {
      await this.prisma.category.create({
        data: {
          slug: category.slug,
          title: category.title,
          description: category.description,
          products: { create: category.products },
        },
      });
    }
  }

  private async seedLocations(): Promise<void> {
    if ((await this.prisma.cafeLocation.count()) > 0) {
      return;
    }

    await this.prisma.cafeLocation.createMany({
      data: [
        {
          name: 'Невский проспект',
          address: 'Невский пр., 28, Санкт-Петербург',
          phone: '+7 (999) 111-22-33',
          openingHours: '08:00-22:00',
          imageUrl: '/media/nevsky.png',
        },
        {
          name: 'Литейный',
          address: 'Литейный пр., 12, Санкт-Петербург',
          phone: '+7 (999) 222-33-44',
          openingHours: '09:00-23:00',
          imageUrl: '/media/liteyny.png',
        },
        {
          name: 'Петроградская',
          address: 'Кронверкский пр., 4, Санкт-Петербург',
          phone: '+7 (999) 333-44-55',
          openingHours: '08:30-21:30',
          imageUrl: '/media/petrogradskaya.png',
        },
      ],
    });
  }
}
