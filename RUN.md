# ConvertForge - Run Guide

## Quick Start

Open **three separate terminals**:

### Terminal 1: Backend
```bash
cd apps\backend
set DATABASE_URL=postgresql://postgres:root@localhost:5432/convertforge
set REDIS_PORT=6380
node dist\main.js
```

### Terminal 2: Frontend  
```bash
cd apps\frontend
set NEXT_PUBLIC_API_URL=http://localhost:4000/api
set NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws
npx next dev --port 3000
```

### Terminal 3: Conversion Worker
```bash
cd apps\workers
set NODE_PATH=..\..\node_modules;..\..\node_modules\.pnpm\node_modules
set DATABASE_URL=postgresql://postgres:root@localhost:5432/convertforge
set REDIS_HOST=localhost
set REDIS_PORT=6380
node dist\main.js
```

## First Time Setup
```bash
cd apps\backend
pnpm install
npx prisma db push
npx prisma db seed
```

## Access
- **Web App:** http://localhost:3000
- **API Docs:** http://localhost:4000/api/docs
- **API Health:** http://localhost:4000/api/v1/health

## Test Accounts (seeded)
- `admin@convertforge.app` / `admin123456`
- `demo@convertforge.app` / `demo123456`
