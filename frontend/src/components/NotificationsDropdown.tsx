import { useEffect, useRef, useState } from 'react';
import { notificationsApi } from '../api/notifications';
import type { Notification } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const loadUnread = async () => {
    try {
      const data = await notificationsApi.countUnread();
      setUnread(data.count);
    } catch {
      // silencieux
    }
  };

  const loadAll = async () => {
    try {
      const data = await notificationsApi.list();
      setNotifications(data);
      setUnread(data.filter((n) => !n.lu).length);
    } catch {
      // silencieux
    }
  };

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const onOpen = () => {
    setOpen((v) => !v);
    if (!open) loadAll();
  };

  const markAllRead = async () => {
    await notificationsApi.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
    setUnread(0);
  };

  const markOneRead = async (id: number) => {
    await notificationsApi.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)));
    setUnread((c) => Math.max(0, c - 1));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onOpen}
        className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
        title="Notifications"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-brand-600 hover:underline dark:text-brand-400">
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">Aucune notification</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.lu && markOneRead(n.id)}
                  className={
                    'cursor-pointer border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700 ' +
                    (n.lu ? 'opacity-60' : 'bg-brand-50 dark:bg-slate-700')
                  }
                >
                  <p className="text-sm text-slate-800 dark:text-slate-200">{n.message}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDistanceToNow(new Date(n.creeLe), { addSuffix: true, locale: fr })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
