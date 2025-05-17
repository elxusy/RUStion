
## Структура проекта

```
rustion/
│
├── package.json                # Описание зависимостей и скриптов проекта
├── pnpm-lock.yaml              # Лок-файл менеджера пакетов
├── README.md                   # Документация проекта
├── next.config.js              # Конфигурация Next.js
├── tsconfig.json               # Конфигурация TypeScript
├── tailwind.config.ts          # Конфигурация Tailwind CSS
├── postcss.config.js           # Конфигурация PostCSS
├── prettier.config.js          # Конфигурация Prettier
├── .gitignore                  # Исключения для git
├── .npmrc                      # Настройки npm/pnpm
│
├── prisma/                     # Схема и миграции базы данных
│   ├── schema.prisma           # Основная схема данных (модели User, Document и др.)
│   ├── migrations/             # Папка с миграциями базы данных
│   └── docker-compose.yaml     # Конфиг для локального запуска БД (PostgreSQL)
│
├── public/                     # Публичные файлы (иконки, изображения и т.д.)
│
├── src/
│   ├── app/                    # Основная папка приложения (Next.js App Router)
│   │   ├── layout.tsx          # Главный layout приложения (общий для всех страниц)
│   │   ├── page.tsx            # Главная страница приложения
│   │   ├── api/                # API-роуты (например, авторизация, tRPC)
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/route.ts # Серверный обработчик авторизации (NextAuth)
│   │   │   └── trpc/
│   │   │       └── [trpc]/route.ts       # Обработчик tRPC-запросов
│   │   ├── doc/                # Страницы для работы с документами
│   │   │   └── [id]/page.tsx   # Страница просмотра/редактирования документа по id
│   │   ├── dashboard/          # Страница пользовательской панели (dashboard)
│   │   │   └── page.tsx
│   │   └── _components/        # Вспомогательные компоненты для страниц
│   │
│   ├── components/             # Переиспользуемые React-компоненты
│   │   ├── auth/               # Компоненты для авторизации (SignIn и др.)
│   │   ├── ui/                 # UI-компоненты (кнопки, формы и т.д.)
│   │   ├── DocumentEditor.tsx  # Визуальный редактор документов
│   │   ├── NotionTextBlock.tsx # Компонент для текстовых блоков
│   │   ├── TableComponent.tsx  # Компонент для таблиц
│   │   ├── DashboardComponent.tsx # Основной компонент дашборда
│   │   ├── CalendarComponent.tsx  # Календарь
│   │   ├── ChecklistComponent.tsx # Чек-листы
│   │   └── editorUtils.tsx     # Вспомогательные функции для редактора
│   │
│   ├── server/                 # Серверная логика и вспомогательные файлы
│   │   ├── db.ts               # Подключение к базе данных через Prisma
│   │   ├── auth.ts             # Основная логика авторизации (NextAuth)
│   │   └── api/                # Серверные роутеры и процедуры (tRPC)
│   │       ├── root.ts         # Корневой роутер tRPC
│   │       ├── trpc.ts         # Базовая настройка tRPC, контекст, middleware
│   │       └── routers/
│   │           └── document.ts # Серверная логика для работы с документами
│   │
│   ├── trpc/                   # Клиентские и серверные хелперы для tRPC
│   │   ├── query-client.ts     # Настройка query-клиента для tRPC
│   │   ├── react.tsx           # Хелперы для интеграции tRPC с React
│   │   ├── server.ts           # Интеграция tRPC с серверными компонентами
│   │   └── shared.ts           # Общие типы/утилиты для tRPC
│   │
│   ├── lib/                    # Вспомогательные функции и утилиты (если есть)
│   ├── mailers/                # Почтовые утилиты (например, для email-подтверждений)
│   ├── styles/                 # Глобальные стили (CSS/SCSS)
│
└── node_modules/               # Установленные зависимости (автоматически)