import { Controller, Get, Query, Render } from '@nestjs/common';

type AuthQuery = string | undefined;

type NavItem = {
  href: string;
  label: string;
};

type SessionViewModel = {
  isAuthenticated: boolean;
  userName: string;
  loginUrl: string;
  logoutUrl: string;
};

@Controller()
export class AppController {
  private readonly navItems: NavItem[] = [
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
          price: '200₽',
          image: '/images/капучино.png',
          imageAlt: 'Капучино',
          imageHeight: 100,
        },
        {
          name: 'Латте',
          price: '220₽',
          image: '/images/лате.png',
          imageAlt: 'Латте',
          imageHeight: 110,
        },
        {
          name: 'Эспрессо',
          price: '150₽',
          image: '/images/эспрессо.png',
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
          name: 'Айс-Латте',
          price: '230₽',
          image: '/images/латте.png',
          imageAlt: 'Айс-латте',
          imageHeight: 120,
        },
        {
          name: 'Фраппе',
          price: '250₽',
          image: '/images/фраппе.png',
          imageAlt: 'Фраппе',
          imageHeight: 120,
        },
        {
          name: 'Молочный коктейль',
          price: '210₽',
          image: '/images/molochny_kokteyl.png',
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
          price: '300₽',
          image: '/images/cheesecake.png',
          imageAlt: 'Чизкейк',
          imageWidth: 165,
        },
        {
          name: 'Тирамису',
          price: '280₽',
          image: '/images/тирамису.png',
          imageAlt: 'Тирамису',
          imageWidth: 165,
        },
        {
          name: 'Штрудель',
          price: '200₽',
          image: '/images/штрудель.png',
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
      schedule: '08:00–22:00',
      image: '/images/nev.png',
      imageAlt: 'Кофейня на Невском (фото)',
    },
    {
      title: 'Литейный',
      address: 'Литейный пр., 12, Санкт-Петербург',
      phone: '+7 (999) 222-33-44',
      schedule: '09:00–23:00',
      image: '/images/lit.png',
      imageAlt: 'Кофейня на Литейном (фото)',
    },
    {
      title: 'Петроградская',
      address: 'Кронверкский пр., 4, Санкт-Петербург',
      phone: '+7 (999) 333-44-55',
      schedule: '08:30–21:30',
      image: '/images/petr.png',
      imageAlt: 'Кофейня на Петроградской (фото)',
    },
  ];

  private readonly recipes = [
    {
      title: 'Фильтр (воронка)',
      subtitle: 'Мягкий вкус, хорошо раскрывает аромат.',
      steps: [
        'Смочи фильтр горячей водой.',
        'Добавь кофе среднего помола.',
        'Залей воду круговыми движениями.',
        'Дай стечь — готово.',
      ],
    },
    {
      title: 'Холодный кофе (cold brew)',
      subtitle: 'Минимум горечи, удобно на 1–2 дня.',
      steps: [
        'Смешай крупный помол и холодную воду.',
        'Оставь в холодильнике на 8–12 часов.',
        'Процеди и подавай со льдом.',
      ],
    },
    {
      title: 'Латте дома',
      subtitle: 'Классика: эспрессо + вспененное молоко.',
      steps: [
        'Приготовь эспрессо.',
        'Вспень тёплое молоко.',
        'Смешай: сначала эспрессо, затем молоко.',
      ],
    },
  ];

  @Get()
  @Render('index')
  getIndexPage(@Query('auth') auth?: AuthQuery, @Query('name') name?: string) {
    return this.buildBaseModel('/', 'British Coffee Shop', auth, name);
  }

  @Get('/menu')
  @Render('menu')
  getMenuPage(@Query('auth') auth?: AuthQuery, @Query('name') name?: string) {
    return {
      ...this.buildBaseModel('/menu', 'Меню | British Coffee Shop', auth, name),
      menuSections: this.menuSections,
    };
  }

  @Get('/table')
  @Render('table')
  getTablePage(@Query('auth') auth?: AuthQuery, @Query('name') name?: string) {
    return this.buildBaseModel(
      '/table',
      'Цены | British Coffee Shop',
      auth,
      name,
    );
  }

  @Get('/addresses')
  @Render('addresses')
  getAddressesPage(
    @Query('auth') auth?: AuthQuery,
    @Query('name') name?: string,
  ) {
    return {
      ...this.buildBaseModel(
        '/addresses',
        'Адреса | British Coffee Shop',
        auth,
        name,
      ),
      addresses: this.addresses,
    };
  }

  @Get('/coffee')
  @Render('coffee')
  getCoffeePage(@Query('auth') auth?: AuthQuery, @Query('name') name?: string) {
    return {
      ...this.buildBaseModel(
        '/coffee',
        'Всё о кофе | British Coffee Shop',
        auth,
        name,
      ),
      recipes: this.recipes,
    };
  }

  @Get('/feedback')
  @Render('feedback')
  getFeedbackPage(
    @Query('auth') auth?: AuthQuery,
    @Query('name') name?: string,
  ) {
    return this.buildBaseModel(
      '/feedback',
      'Отзывы | British Coffee Shop',
      auth,
      name,
    );
  }

  private buildBaseModel(
    currentPath: string,
    pageTitle: string,
    auth?: AuthQuery,
    name?: string,
  ) {
    return {
      pageTitle,
      navItems: this.navItems.map((item) => ({
        ...item,
        isActive: item.href === currentPath,
      })),
      session: this.buildSession(currentPath, auth, name),
    };
  }

  private buildSession(
    currentPath: string,
    auth?: AuthQuery,
    name?: string,
  ): SessionViewModel {
    const isAuthenticated = auth === '1';
    const userName = isAuthenticated ? name?.trim() || 'Viktoria' : '';
    const encodedName = encodeURIComponent(userName || 'Viktoria');

    return {
      isAuthenticated,
      userName,
      loginUrl: `${currentPath}?auth=1&name=${encodedName}`,
      logoutUrl: currentPath,
    };
  }
}
