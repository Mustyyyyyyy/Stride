# Stride Fitness Tracker

A full-stack fitness tracking platform with GPS live tracking, goals, achievements, challenges, and social feed.

## Tech Stack

- **Backend**: NestJS + Prisma + PostgreSQL
- **Web**: React + Vite + Tailwind CSS + Zustand
- **Mobile**: React Native + Expo + Zustand + MMKV

## Prerequisites

- Node.js >= 18
- PostgreSQL (local or cloud like Neon/Supabase)
- npm or yarn

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/Mustyyyyyyy/Stride.git
cd Stride
npm install
cd backend && npm install && cd ..
cd web && npm install && cd ..
cd mobile && npm install && cd ..
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set your `DATABASE_URL`, `JWT_SECRET`, and `JWT_REFRESH_SECRET`.

### 3. Run database migrations

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 4. Start development servers

```bash
# Terminal 1 - Backend (NestJS)
cd backend
npm run start:dev

# Terminal 2 - Web (Vite)
cd web
npm run dev

# Terminal 3 - Mobile (Expo)
cd mobile
npx expo start
```

## Project Structure

```
FitTrack/
├── backend/           # NestJS API server
│   ├── prisma/        # Database schema & migrations
│   └── src/
│       ├── modules/   # Feature modules (auth, activities, goals, etc.)
│       └── api/       # Vercel serverless entrypoint
├── web/               # React web app (PWA)
├── mobile/            # React Native mobile app
└── package.json       # Monorepo root scripts
```

## Available Scripts

```bash
# Root
npm run build              # Build backend + web
npm run build:backend      # Prisma generate + TypeScript build
npm run build:web          # Vite production build
npm run start:backend      # Start NestJS dev server
npm run start:web          # Start Vite dev server
npm run test               # Run backend tests

# Backend
npm run start:dev          # NestJS watch mode
npm run prisma:studio      # Open Prisma Studio
npm run prisma:migrate     # Create + apply migration
npm run seed               # Seed database

# Web
npm run dev                # Vite dev server
npm run build              # Production build
npm run preview            # Preview production build
```

## Deployment

### Vercel (Backend + Web)

The `vercel.json` configures:
- Static web build from `web/dist`
- Serverless backend API from `backend/src/api/index.ts`

```bash
vercel --prod
```

### Docker

```bash
docker-compose up --build
```

## Environment Variables

See `backend/.env.example` for all required variables.

## License

MIT
