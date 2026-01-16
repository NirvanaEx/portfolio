# Portfolio (front + api)

Структура:
- `front/` — React + Vite
- `api/` — NestJS + Prisma
- `uploads/` — загруженные файлы (volume для сервера)

## Запуск через Docker (локально/сервер)
```bash
docker compose up -d --build
```

Если порты заняты, создайте `.env` рядом с `docker-compose.yml`:
```bash
FRONT_PORT=8085
API_PORT=3005
DB_PORT=5435
```
Шаблон есть в `.env.example`.

## API (NestJS) без Docker
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

## Frontend (Vite) без Docker
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

## Деплой на сервер (git hook + автосборка)
Идея: `main` остается для GitHub, а на сервер пушим в ветку `deploy`.

### 1) Сервер: bare‑репозиторий и каталог приложения
```bash
mkdir -p /srv/git/portfolio.git /srv/apps/portfolio
git init --bare /srv/git/portfolio.git
```

### 2) Сервер: post-receive (автосборка + рестарт)
Скопируйте хук с локальной машины:
```bash
scp deploy/post-receive.sample root@198.51.100.42:/srv/git/portfolio.git/hooks/post-receive
ssh root@198.51.100.42 "chmod +x /srv/git/portfolio.git/hooks/post-receive"
```

### 3) Локально: добавить remote
```bash
git remote add production root@198.51.100.42:/srv/git/portfolio.git
```

### 4) Пуш в деплой‑ветку
```bash
git push production main:deploy
```

При пуше в `deploy` выполнится:
- `docker compose build --pull`
- `docker compose up -d`
