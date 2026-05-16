const { WinstonModule, utilities } = require('nest-winston');
import * as winston from 'winston';

export function createLoggerConfig() {
  const isProduction = process.env.NODE_ENV === 'production';

  return WinstonModule.createLogger({
    level: isProduction ? 'info' : 'debug',
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          isProduction
            ? winston.format.json()
            : utilities.format.nestLike('ConvertForge', {
                colors: true,
                prettyPrint: true,
              }),
        ),
      }),
      ...(isProduction
        ? [
            new winston.transports.File({
              filename: 'logs/error.log',
              level: 'error',
              maxsize: 10485760,
              maxFiles: 10,
            }),
            new winston.transports.File({
              filename: 'logs/combined.log',
              maxsize: 10485760,
              maxFiles: 10,
            }),
          ]
        : []),
    ],
  });
}
