'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '@/store/appStore';
import type {
  WsJobProgress,
  WsJobCompleted,
  WsJobFailed,
} from '@convertforge/shared-types';
import { WsEvent } from '@convertforge/shared-types';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

interface UseSocketReturn {
  isConnected: boolean;
  socket: Socket | null;
}

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const updateConversion = useAppStore((s) => s.updateConversion);
  const setQueueStatus = useAppStore((s) => s.setQueueStatus);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const token = localStorage.getItem('auth_token');
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setIsConnected(false);
    });

    socket.on(WsEvent.JOB_PROGRESS, (data: WsJobProgress) => {
      updateConversion(data.conversionId, {
        progress: data.progress,
        status: 'PROCESSING' as never,
      });
    });

    socket.on(WsEvent.JOB_COMPLETED, (data: WsJobCompleted) => {
      updateConversion(data.conversionId, {
        status: 'COMPLETED' as never,
        progress: 100,
        outputSize: data.outputSize,
      });
    });

    socket.on(WsEvent.JOB_FAILED, (data: WsJobFailed) => {
      updateConversion(data.conversionId, {
        status: 'FAILED' as never,
        error: data.error,
      });
    });

    socket.on(WsEvent.CONVERSION_STATUS, (data: { conversionId: string; status: string; progress: number }) => {
      updateConversion(data.conversionId, {
        status: data.status as never,
        progress: data.progress,
      });
    });

    socket.on(WsEvent.QUEUE_STATUS, (data: { active: number; queued: number; completed: number; failed: number }) => {
      setQueueStatus(data);
    });

    socketRef.current = socket;
  }, [updateConversion, setQueueStatus]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      connect();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connect]);

  return {
    isConnected,
    socket: socketRef.current,
  };
}
