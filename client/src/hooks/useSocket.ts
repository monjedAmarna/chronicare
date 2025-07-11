import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from './use-toast';

interface AlertData {
  id: number;
  userId: number;
  type: string;
  level: string;
  severity: string;
  value: string;
  message: string;
  timestamp: string;
}

export function useSocket(userId?: number) {
  const socketRef = useRef<Socket | null>(null);
  const { toast } = useToast();

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
    socketRef.current = io(backendUrl);

    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.IO server');
      
      // Authenticate the socket with user token
      const token = localStorage.getItem('token');
      if (token) {
        socketRef.current?.emit('authenticate', token);
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    socketRef.current.on('new-alert', (alertData: AlertData) => {
      console.log('Received new alert:', alertData);
      
      // Only show toast for current user's alerts
      if (userId && alertData.userId === userId) {
        const severityColors = {
          critical: 'destructive',
          high: 'destructive',
          medium: 'default',
          low: 'default'
        } as const;

        toast({
          title: `⚠️ ${alertData.type.toUpperCase()} Alert`,
          description: alertData.message,
          variant: severityColors[alertData.severity] || 'default',
          duration: 10000, // Show for 10 seconds
        });
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });
  }, [userId, toast]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (userId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    connect,
    disconnect
  };
} 