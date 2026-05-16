export class Logger {
  constructor(private context: string) {}

  info(message: string, data?: any) {
    this.log('INFO', message, data);
  }

  warn(message: string, data?: any) {
    this.log('WARN', message, data);
  }

  error(message: string, error?: any) {
    this.log('ERROR', message, error);
    if (error?.stack) {
      console.error(error.stack);
    }
  }

  private log(level: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${level}] [${this.context}] ${message}`;

    if (data) {
      console.log(logLine, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    } else {
      console.log(logLine);
    }
  }
}
