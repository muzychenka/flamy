# Flamy
Flamy - бот для знакомств в Telegram

# Как запустить?
Настройте Ваш .env.production (либо .env.development) в соответствии с .env.example

Установите зависимости:

```
pnpm install
```

Сгенерируйте схему Prisma:

```
npx prisma generate
```

Примените миграции базы данных:

```
npx prisma migrate deploy
```

Запустите тестовый сервер:

```
pnpm run dev
```

Для запуска в режиме production сделайте сборку и запустите сервер:

```
pnpm run build
pnpm run production
```

# Локальный запуск через Docker
Сделайте сборку контейнеров:

```
docker compose --env-file .env.development build
```

Поднимите контейнеры:
```
docker compose up
```
