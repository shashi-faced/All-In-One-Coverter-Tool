import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';

export function initSentry(configService: ConfigService) {
  const dsn = configService.get<string>('sentry.dsn');

  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: configService.get<string>('sentry.environment', 'development'),
    tracesSampleRate: 0.2,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
    ],
    beforeSend(event) {
      if (event.request?.url?.includes('/health')) {
        return null;
      }
      return event;
    },
  });

}

export { Sentry };
