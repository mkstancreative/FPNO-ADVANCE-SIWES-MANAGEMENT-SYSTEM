import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Notification } from "../api/types/notifications";
import { notificationWS } from "../api/services/websocket";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../api/services/notifications";
import {
  NotificationsContext,
  type NotificationsContextType,
} from "./NotificationsContextValue";
import { useAuth } from "./useAuth";

interface NotificationsProviderProps {
  children: React.ReactNode;
}

const NOTIFICATION_POPUP_DURATION = 5000;

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [popupNotifications, setPopupNotifications] = useState<Notification[]>(
    [],
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isConnected, setIsConnected] = useState(false);

  // ── Fetch notifications from REST API ──────────────────────────────────────
  const fetchNotifications = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getNotifications(page, 10);
      setNotifications(response.data);
      setUnreadCount(response.unreadCount);
      setCurrentPage(response.page);
      setTotalPages(response.pages);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch notifications";
      setError(msg);
      console.error("[Notifications] Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Mark one as read ────────────────────────────────────────────────────────
  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("[Notifications] Mark-as-read error:", err);
    }
  }, []);

  // ── Mark all as read ────────────────────────────────────────────────────────
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("[Notifications] Mark-all-read error:", err);
    }
  }, []);

  // ── Delete notification ─────────────────────────────────────────────────────
  const handleDeleteNotification = useCallback(async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("[Notifications] Delete error:", err);
    }
  }, []);

  // ── Dismiss popup ───────────────────────────────────────────────────────────
  const dismissPopup = useCallback((id: string) => {
    setPopupNotifications((prev) => prev.filter((n) => n._id !== id));
  }, []);

  // ── Handle incoming WS notification ────────────────────────────────────────
  const handleNewNotification = useCallback(
    (notification: Notification) => {
      setPopupNotifications((prev) => {
        const updated = [notification, ...prev];
        return updated.slice(0, 5); // at most 5 popups
      });
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      setTimeout(
        () => dismissPopup(notification._id),
        NOTIFICATION_POPUP_DURATION,
      );
    },
    [dismissPopup],
  );

  // ── WebSocket lifecycle — (re)connect whenever auth state flips to signed-in,
  // disconnect cleanly on sign-out so a fresh login doesn't require a page reload ─
  useEffect(() => {
    if (!isAuthenticated) {
      notificationWS.disconnect();
      return;
    }

    // Subscribe before connecting so we don't miss the first message
    const unsubscribeMsg = notificationWS.subscribe(handleNewNotification);
    const unsubscribeConn = notificationWS.subscribeToConnectionChanges(
      (connected) => setIsConnected(connected),
    );

    notificationWS
      .connect()
      .catch((err) => console.error("[WS] Initial connect failed:", err));

    return () => {
      unsubscribeMsg();
      unsubscribeConn();
    };
  }, [isAuthenticated, handleNewNotification]);

  // ── REST fetch — runs once per sign-in ───────────────────────────────────────
  const hasFetchedForSessionRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      hasFetchedForSessionRef.current = false;
      return;
    }
    if (!hasFetchedForSessionRef.current) {
      hasFetchedForSessionRef.current = true;
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    currentPage,
    totalPages,
    isConnected,
    popupNotifications,
    fetchNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    dismissPopup,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
