# Portfolio (front + api)

Структура:
- `front/` — React + Vite
- `api/` — NestJS + Prisma
- `uploads/` — загруженные файлы (volume для сервера)

## Запуск Postgres (локально)
```bash
docker compose up -d
```

## API (NestJS)
```bash
cd api
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

Админ:
- username: `admin`
- password: `123`

## Frontend (Vite)
```bash
cd front
npm install
npm run dev
```

Админка доступна по `/admin`.

## Загрузка файлов
Файлы сохраняются в `uploads/` и доступны по `/uploads/...`.

## Переменные окружения (api/.env)
- `DATABASE_URL`
- `JWT_SECRET`
- `UPLOAD_DIR`
