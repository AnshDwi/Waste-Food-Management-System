import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { pushToast } from '../../components/ui/ToastViewport';

declare const process: {
  env?: {
    VITE_API_BASE_URL?: string;
    VITE_SOCKET_URL?: string;
  };
};

const socketUrl = (
  process.env?.VITE_SOCKET_URL ||
  (typeof window !== 'undefined' && (window as Window & { __APP_CONFIG__?: { apiBaseUrl?: string } }).__APP_CONFIG__?.apiBaseUrl) ||
  process.env?.VITE_API_BASE_URL ||
  'http://localhost:8080/api/v1'
).replace('/api/v1', '');

export const useRealtimeTracking = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io(socketUrl, { transports: ['websocket'] });

    socket.on('delivery:assigned', () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    });
    socket.on('delivery:status', () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    });
    socket.on('driver:location', () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
    });
    socket.on('delivery:delay', () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      pushToast('Delay alert raised for an active delivery.', 'error');
    });
    socket.on('delivery:completed', () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      pushToast('Delivery completed successfully.', 'success');
    });
    socket.on('notification:ngo', (payload: { message?: string }) => {
      pushToast(payload.message ?? 'New NGO logistics notification.', 'success');
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);
};
