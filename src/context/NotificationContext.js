"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { fetchNotifications as fetchNotificationsUtil } from "../utils/FetchNotifications";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (localStorage.getItem('selectedProjet')) {
      await fetchNotificationsUtil({
        setNotifications,
        setNewNotificationsCount,
        setIsLoadingNotifications
      });
    }
  }, []);

  // Mark notification as seen
  const markAsSeen = useCallback(async (notificationId) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const selectedProject = JSON.parse(localStorage.getItem('selectedProjet'));

      // Optimistically update the UI first
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, seen: true } : n)
      );

      // Then make the API call
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/mark_notification_seen`,
        { notification_id: notificationId, projet_id: selectedProject.id },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (error) {
      console.error('Error marking notification as seen:', error);
      // Revert the optimistic update on error
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, seen: false } : n)
      );
    }
  }, []);

  // Mark all as seen
  const markAllAsSeen = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const selectedProject = JSON.parse(localStorage.getItem('selectedProjet'));
      const allNotificationIds = notifications.map(notif => notif.id);

      // Optimistically update the UI first
      setNotifications(prev =>
        prev.map(n => ({ ...n, seen: true }))
      );

      // Then make the API call
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/mark_all_notifications_seen`,
        { notification_ids: allNotificationIds, projet_id: selectedProject.id },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (error) {
      console.error('Error marking all notifications as seen:', error);
      // Revert the optimistic update on error
      setNotifications(prev =>
        prev.map(n => ({ ...n, seen: false }))
      );
    }
  }, [notifications]);

  // Utility
  const isNotificationSeen = useCallback(
    (notificationId) => {
      const notif = notifications.find(n => n.id === notificationId);
      return notif ? notif.seen : false;
    },
    [notifications]
  );

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        newNotificationsCount,
        isLoadingNotifications,
        fetchNotifications,
        markAsSeen,
        markAllAsSeen,
        isNotificationSeen,
        setNotifications,
        setNewNotificationsCount,
        setIsLoadingNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
