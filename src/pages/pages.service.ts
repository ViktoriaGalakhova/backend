import { Injectable } from '@nestjs/common';
import type { SessionUser } from '../auth/auth.types';

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
    const navItems = user?.isAdmin
      ? [...this.navItems, { href: '/admin', label: 'Админ-панель' }]
      : this.navItems;

    return {
      pageTitle,
      currentPath,
      navItems: navItems.map((item) => ({
        ...item,
        isActive: item.href === currentPath,
      })),
      session: {
        isAuthenticated: Boolean(user),
        userId: user?.id ?? null,
        userName: user?.displayName ?? '',
        userEmail: user?.email ?? '',
        isAdmin: user?.isAdmin ?? false,
        roleLabel: user?.isAdmin ? 'администратор' : 'пользователь',
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
