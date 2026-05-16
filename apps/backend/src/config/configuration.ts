export default () => ({
  port: parseInt(process.env.PORT ?? '0', 10) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-prod',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/v1/auth/google/callback',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '0', 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB ?? '0', 10) || 0,
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
      endpoint: process.env.AWS_S3_ENDPOINT,
      useAccelerateEndpoint: process.env.AWS_S3_ACCELERATE === 'true',
    },
    signedUrlExpiry: parseInt(process.env.SIGNED_URL_EXPIRY ?? '0', 10) || 3600,
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    plans: {
      pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
    },
  },

  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE ?? '0', 10) || 5 * 1024 * 1024 * 1024,
    chunkSize: parseInt(process.env.CHUNK_SIZE ?? '0', 10) || 5 * 1024 * 1024,
    allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || [],
    tempDir: process.env.TEMP_UPLOAD_DIR || './tmp',
    virusScanEnabled: process.env.VIRUS_SCAN_ENABLED === 'true',
  },

  limits: {
    freeDailyConversions: parseInt(process.env.FREE_DAILY_CONVERSIONS ?? '0', 10) || 10,
    freeMaxFileSize: parseInt(process.env.FREE_MAX_FILE_SIZE ?? '0', 10) || 100 * 1024 * 1024,
    proMaxFileSize: parseInt(process.env.PRO_MAX_FILE_SIZE ?? '0', 10) || 5 * 1024 * 1024 * 1024,
  },

  queue: {
    defaultJobAttempts: parseInt(process.env.QUEUE_DEFAULT_ATTEMPTS ?? '0', 10) || 3,
    defaultBackoffDelay: parseInt(process.env.QUEUE_BACKOFF_DELAY ?? '0', 10) || 5000,
    cleanupInterval: parseInt(process.env.QUEUE_CLEANUP_INTERVAL ?? '0', 10) || 3600000,
  },
});
