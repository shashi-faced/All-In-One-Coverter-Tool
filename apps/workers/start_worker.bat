@echo off
set NODE_PATH=E:\converter-tool\node_modules;E:\converter-tool\node_modules\.pnpm\node_modules
set DATABASE_URL=postgresql://postgres:root@localhost:5432/convertforge
set REDIS_HOST=localhost
set REDIS_PORT=6380
set WORKER_CONCURRENCY=1
cd /d E:\converter-tool\apps\workers
node dist\main.js
