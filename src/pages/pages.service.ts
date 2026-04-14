import { Injectable } from '@nestjs/common';
import type { SessionUser } from '../auth/auth.service';

type NoticeType = 'success' | 'error' | 'info';

@Injectable()
export class PagesService {
  private readonly navItems = [
    { href: '/', label: 'Главная' },
    { href: '/menu', label: 'Меню' },
    { href: '/table', label: 'Цены' },
    { href: '/addresses', label: 'Адреса' },
    { href: '/coffee', label: 'Всё о кофе' },
    { href: '/feedback', label: 'Отзывы' },
  ];

  private readonly menuSections = [
    {
      id: 'hot',
      title: 'Горячие напитки',
      items: [
        {
          name: 'Капучино',
          price: '200 ₽',
          image: '/media/cappuccino.png',
          imageAlt: 'Капучино',
          imageHeight: 100,
        },
        {
          name: 'Латте',
          price: '220 ₽',
          image: '/media/latte.png',
          imageAlt: 'Латте',
          imageHeight: 110,
        },
        {
          name: 'Эспрессо',
          price: '150 ₽',
          image: '/media/espresso.png',
          imageAlt: 'Эспрессо',
          imageHeight: 80,
        },
      ],
    },
    {
      id: 'cold',
      title: 'Холодные напитки',
      items: [
        {
          name: 'Айс-латте',
          price: '230 ₽',
          image: '/media/iced-latte.png',
          imageAlt: 'Айс-латте',
          imageHeight: 120,
        },
        {
          name: 'Фраппе',
          price: '250 ₽',
          image: '/media/frappe.png',
          imageAlt: 'Фраппе',
          imageHeight: 120,
        },
        {
          name: 'Молочный коктейль',
          price: '210 ₽',
          image: '/media/milkshake.png',
          imageAlt: 'Молочный коктейль',
          imageHeight: 120,
        },
      ],
    },
    {
      id: 'desserts',
      title: 'Десерты',
      items: [
        {
          name: 'Чизкейк',
          price: '300 ₽',
          image: '/media/cheesecake.png',
          imageAlt: 'Чизкейк',
          imageWidth: 165,
        },
        {
          name: 'Тирамису',
          price: '280 ₽',
          image: '/media/tiramisu.png',
          imageAlt: 'Тирамису',
          imageWidth: 165,
        },
        {
          name: 'Штрудель',
          price: '200 ₽',
          image: '/media/strudel.png',
          imageAlt: 'Штрудель',
          imageWidth: 165,
        },
      ],
    },
  ];

  private readonly addresses = [
    {
      title: 'Невский проспект',
      address: 'Невский пр., 28, Санкт-Петербург',
      phone: '+7 (999) 111-22-33',
      schedule: '08:00-22:00',
      image: '/media/nevsky.png',
      imageAlt: 'Кофейня на Невском',
    },
    {
      title: 'Литейный',
      address: 'Литейный пр., 12, Санкт-Петербург',
      phone: '+7 (999) 222-33-44',
      schedule: '09:00-23:00',
      image: '/media/liteyny.png',
      imageAlt: 'Кофейня на Литейном',
    },
    {
      title: 'Петроградская',
      address: 'Кронверкский пр., 4, Санкт-Петербург',
      phone: '+7 (999) 333-44-55',
      schedule: '08:30-21:30',
      image: '/media/petrogradskaya.png',
      imageAlt: 'Кофейня на Петроградской',
    },
  ];

  private readonly recipes = [
    {
      title: 'Фильтр-кофе',
      subtitle: 'Мягкий вкус и чистый аромат без лишней горечи.',
      steps: [
        'Смочите фильтр горячей водой.',
        'Засыпьте кофе среднего помола.',
        'Вливайте воду круговыми движениями в 3-4 подхода.',
        'Дайте напитку полностью стечь и подавайте.',
      ],
    },
    {
      title: 'Cold brew',
      subtitle: 'Холодный кофе, который удобно приготовить заранее.',
      steps: [
        'Смешайте крупный помол с холодной водой.',
        'Уберите в холодильник на 8-12 часов.',
        'Процедите напиток и подавайте со льдом.',
      ],
    },
    {
      title: 'Домашний латте',
      subtitle: 'Классическое сочетание эспрессо и вспененного молока.',
      steps: [
        'Приготовьте порцию эспрессо.',
        'Подогрейте и вспеньте молоко.',
        'Аккуратно влейте молоко в чашку с кофе.',
      ],
    },
  ];

  private readonly priceRows = [
    { name: 'Капучино', prices: ['200', '230', '260'] },
    { name: 'Латте', prices: ['220', '250', '280'] },
    { name: 'Эспрессо', prices: ['150', '—', '—'] },
    { name: 'Айс-латте', prices: ['230', '260', '290'] },
  ];

  getMenuSections() {
    return this.menuSections;
  }

  getAddresses() {
    return this.addresses;
  }

  getRecipes() {
    return this.recipes;
  }

  getPriceRows() {
    return this.priceRows;
  }

  buildPageModel(
    currentPath: string,
    pageTitle: string,
    user: SessionUser | null,
    noticeText?: string,
    noticeType: NoticeType = 'info',
  ) {
    return {
      pageTitle,
      currentPath,
      navItems: this.navItems.map((item) => ({
        ...item,
        isActive: item.href === currentPath,
      })),
      session: {
        isAuthenticated: Boolean(user),
        userId: user?.id ?? null,
        userName: user?.displayName ?? '',
        loginUrl: `/auth/login?next=${encodeURIComponent(currentPath)}`,
        registerUrl: `/auth/register?next=${encodeURIComponent(currentPath)}`,
        logoutUrl: `/auth/logout?next=${encodeURIComponent(currentPath)}`,
      },
      notice: noticeText?.trim()
        ? { text: noticeText.trim(), type: noticeType }
        : null,
    };
  }
}
