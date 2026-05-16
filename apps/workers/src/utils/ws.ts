import { io, Socket } from 'socket.io-client';
import { config } from '../config';
import { Logger } from './logger';

const logger = new Logger('WebSocket');

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(config.websocket.url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      logger.info('Connected to WebSocket server');
    });

    socket.on('disconnect', () => {
      logger.warn('Disconnected from WebSocket server');
    });

    socket.on('connect_error', (error: Error) => {
      logger.error('WebSocket connection error', error.message);
    });
  }

  return socket;
}

export function emitProgress(
  conversionId: string,
  userId: string,
  data: { progress: number; stage: string; message: string; eta?: number },
) {
  try {
    const ws = getSocket();
    ws.emit('job:progress', { conversionId, userId, ...data });
  } catch (error: any) {
    logger.error('Failed to emit progress', error.message);
  }
}
