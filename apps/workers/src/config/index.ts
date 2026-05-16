export const config = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
  },

  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/convertforge',
  },

  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    localPath: process.env.LOCAL_STORAGE_PATH || './uploads',
    s3: {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      bucket: process.env.AWS_S3_BUCKET || 'convertforge',
    },
  },

  websocket: {
    url: process.env.WEBSOCKET_URL || 'http://localhost:4000',
  },

  backend: {
    url: process.env.BACKEND_URL || 'http://localhost:4000',
  },

  conversions: {
    tempDir: process.env.CONVERSION_TEMP_DIR || './tmp',
    cleanupAfterMs: parseInt(process.env.CLEANUP_AFTER_MS || '3600000'),
  },

  worker: {
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '2'),
    name: process.env.WORKER_NAME || `worker-${Math.random().toString(36).slice(2, 8)}`,
  },
};
