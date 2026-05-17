import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/ws',
})
export class ConversionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ConversionGateway.name);
  private userSockets: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);
      client.join(`user:${userId}`);
      this.logger.log(`Client connected: ${client.id} (user: ${userId})`);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:conversion')
  handleSubscribeConversion(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversionId: string },
  ) {
    client.join(`conversion:${data.conversionId}`);
    return { event: 'subscribed', data: { conversionId: data.conversionId } };
  }

  @SubscribeMessage('job:progress')
  handleJobProgress(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversionId: string; userId: string; progress: number; stage: string; message: string; eta?: number },
  ) {
    this.logger.log(`Received job:progress for ${data.conversionId}: ${data.progress}%`);
    this.sendJobProgress(data.conversionId, data.userId, data);
  }

  sendJobProgress(conversionId: string, userId: string, data: {
    progress: number;
    stage: string;
    message: string;
    eta?: number;
  }) {
    this.server.to(`conversion:${conversionId}`).emit('job:progress', {
      conversionId,
      ...data,
      timestamp: new Date().toISOString(),
    });

    this.server.to(`user:${userId}`).emit('conversion:status', {
      conversionId,
      status: 'PROCESSING',
      progress: data.progress,
      timestamp: new Date().toISOString(),
    });
  }

  sendJobCompleted(conversionId: string, userId: string, data: {
    outputFileId: string;
    outputSize: number;
    downloadUrl: string;
    thumbnailUrl?: string;
  }) {
    this.server.to(`conversion:${conversionId}`).emit('job:completed', {
      conversionId,
      ...data,
      timestamp: new Date().toISOString(),
    });

    this.server.to(`user:${userId}`).emit('conversion:status', {
      conversionId,
      status: 'COMPLETED',
      timestamp: new Date().toISOString(),
    });
  }

  sendJobFailed(conversionId: string, userId: string, error: string) {
    this.server.to(`conversion:${conversionId}`).emit('job:failed', {
      conversionId,
      error,
      retryAllowed: true,
      timestamp: new Date().toISOString(),
    });

    this.server.to(`user:${userId}`).emit('conversion:status', {
      conversionId,
      status: 'FAILED',
      error,
      timestamp: new Date().toISOString(),
    });
  }

  sendUploadProgress(userId: string, data: {
    fileId: string;
    fileName: string;
    progress: number;
    speed: number;
    eta: number;
  }) {
    this.server.to(`user:${userId}`).emit('upload:progress', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  sendQueueStatus(userId: string, data: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }) {
    this.server.to(`user:${userId}`).emit('queue:status', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
}
