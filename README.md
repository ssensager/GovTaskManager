# GovTaskManager - Корпоративная система управления поручениями и сроками

Веб-приложение для автоматизации контроля исполнительской дисциплины, распределения задач и мониторинга сроков выполнения поручений в государственных ведомствах и корпоративных организациях.

## Технологии

| Компонент | Технология |
|-----------|-----------|
| Backend   | ASP.NET 8.0 (C#), Entity Framework Core 8 |
| Frontend  | React 18, Vite, Tailwind CSS, Recharts |
| База данных | PostgreSQL 16 |
| Auth      | JWT Bearer токены |
| Контейнеризация | Docker, Docker Compose |

## Быстрый старт (Docker Compose)

**Требования:** Docker Desktop

```bash
# 1. Клонировать / распаковать проект
cd taskmanager

# 2. Запустить все сервисы
docker compose up --build

# 3. Открыть браузер
# Frontend:  http://localhost:3000
# Swagger:   http://localhost:5000/swagger
```

База данных создаётся, мигрируется и заполняется тестовыми данными **автоматически** при первом запуске.

---

## Локальный запуск без Docker

### Требования
- .NET 8 SDK
- Node.js 20+
- PostgreSQL 14+

### Шаг 1 — База данных
```bash
# Создать базу данных
psql -U postgres -c "CREATE DATABASE taskmanager;"
```

### Шаг 2 — Backend
```bash
cd backend/TaskManager.API

# Установить dotnet-ef (если не установлен)
dotnet tool install --global dotnet-ef

# Применить миграции и запустить
dotnet run

# API будет доступен на: http://localhost:5000
# Swagger UI:            http://localhost:5000/swagger
```

> Приложение автоматически применит миграции и заполнит БД при старте.

### Шаг 3 — Frontend
```bash
cd frontend
npm install
npm run dev

# UI будет доступен на: http://localhost:5173
```

---

## Тестовые учётные записи

| Логин    | Пароль        | Роль           | Описание                        |
|----------|---------------|----------------|---------------------------------|
| `admin`  | `Admin123!`   | Администратор  | Полный доступ, управление пользователями, аудит |
| `ivanov` | `Manager123!` | Руководитель   | Создание задач, назначение исполнителей |
| `kozlova`| `Manager123!` | Руководитель   | Руководитель финансового отдела |
| `petrova`| `Executor123!`| Исполнитель    | Исполнитель ИТ-отдела |
| `sidorov`| `Executor123!`| Исполнитель    | Системный инженер |
| `novikova`| `Executor123!`| Исполнитель   | Бухгалтер |

---

## Структура проекта

```
taskmanager/
├── docker-compose.yml
├── backend/
│   └── TaskManager.API/
│       ├── Controllers/        # REST API контроллеры
│       ├── Models/             # Модели данных (EF Core)
│       ├── Data/               # DbContext, DbSeeder
│       ├── DTOs/               # Data Transfer Objects
│       ├── Services/           # Бизнес-логика
│       ├── Extensions/         # Маппинг моделей
│       ├── Migrations/         # EF Core миграции
│       ├── Program.cs          # Точка входа, конфигурация
│       └── appsettings.json    # Настройки
└── frontend/
    └── src/
        ├── components/         # Переиспользуемые компоненты
        ├── context/            # React Context (Auth)
        ├── pages/              # Страницы приложения
        └── services/           # API клиент (axios)
```

## Схема базы данных

```
roles          → users (role_id)
departments    → users (department_id)
               → departments (parent_department_id)  [иерархия]
statuses       → tasks (status_id)
               → task_history (old_status, new_status)
users          → tasks (creator_id, executor_id)
               → comments (author_id)
               → events (user_id)
               → reports (generated_by)
               → audit_log (user_id)
               → task_history (changed_by)
tasks          → comments (task_id)
               → task_history (task_id)
```

## API Endpoints

### Auth
| Метод | URL              | Описание            | Доступ |
|-------|------------------|---------------------|--------|
| POST  | /api/auth/login  | Вход в систему      | Все    |
| GET   | /api/auth/me     | Текущий пользователь| Auth   |

### Tasks
| Метод  | URL                        | Описание                | Доступ             |
|--------|----------------------------|-------------------------|--------------------|
| GET    | /api/tasks                 | Список задач            | Auth               |
| GET    | /api/tasks/{id}            | Детали задачи           | Auth               |
| POST   | /api/tasks                 | Создать задачу          | Admin, Manager     |
| PUT    | /api/tasks/{id}            | Обновить задачу         | Auth               |
| DELETE | /api/tasks/{id}            | Удалить задачу          | Admin, Manager     |
| POST   | /api/tasks/{id}/comments   | Добавить комментарий    | Auth               |
| GET    | /api/tasks/statuses        | Список статусов         | Auth               |

### Users
| Метод  | URL                      | Описание                | Доступ    |
|--------|--------------------------|-------------------------|-----------|
| GET    | /api/users               | Список пользователей    | Auth      |
| GET    | /api/users/{id}          | Данные пользователя     | Auth      |
| POST   | /api/users               | Создать пользователя    | Admin     |
| PUT    | /api/users/{id}          | Обновить пользователя   | Admin     |
| DELETE | /api/users/{id}          | Деактивировать          | Admin     |
| GET    | /api/users/roles         | Список ролей            | Auth      |
| GET    | /api/users/departments   | Список отделов          | Auth      |

### Reports
| Метод | URL                   | Описание            | Доступ        |
|-------|-----------------------|---------------------|---------------|
| GET   | /api/reports          | Данные отчёта       | Auth          |
| POST  | /api/reports/save     | Сохранить отчёт     | Admin, Manager|
| GET   | /api/reports/audit    | Журнал аудита       | Admin         |

### Events
| Метод  | URL               | Описание          | Доступ |
|--------|-------------------|-------------------|--------|
| GET    | /api/events       | Мои события       | Auth   |
| POST   | /api/events       | Создать событие   | Auth   |
| DELETE | /api/events/{id}  | Удалить событие   | Auth   |

## Роли и права доступа

| Функция                        | Administrator | Manager | Executor |
|-------------------------------|:---:|:---:|:---:|
| Просмотр всех задач            | ✅  | ✅  | ❌  |
| Просмотр своих задач           | ✅  | ✅  | ✅  |
| Создание задач                 | ✅  | ✅  | ❌  |
| Назначение исполнителей        | ✅  | ✅  | ❌  |
| Изменение статуса задачи       | ✅  | ✅  | ✅  |
| Добавление комментариев        | ✅  | ✅  | ✅  |
| Удаление задач                 | ✅  | ✅  | ❌  |
| Управление пользователями      | ✅  | ❌  | ❌  |
| Просмотр отчётов (все)         | ✅  | ✅  | Своих |
| Сохранение отчётов             | ✅  | ✅  | ❌  |
| Журнал аудита                  | ✅  | ❌  | ❌  |

## Конфигурация

Все настройки в `backend/TaskManager.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=taskmanager;Username=postgres;Password=postgres123"
  },
  "Jwt": {
    "Key": "TaskManager_SuperSecret_Key_MinLength32_2025!",
    "Issuer": "TaskManagerAPI",
    "Audience": "TaskManagerClient"
  }
}
```

Для Docker используются переменные окружения в `docker-compose.yml`.
