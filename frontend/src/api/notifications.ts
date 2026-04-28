import { api } from './client';
import type { Notification } from '../types';

export const notificationsApi = {
  list() {
    return api<Notification[]>('/notifications');
  },
  countUnread() {
    return api<{ count: number }>('/notifications/unread-count');
  },
  markAsRead(id: number) {
    return api<Notification>('/notifications/' + id + '/read', { method: 'PATCH' });
  },
  markAllAsRead() {
    return api('/notifications/read-all', { method: 'PATCH' });
  },
};
