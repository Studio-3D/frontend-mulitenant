"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { fetchNotifications as fetchNotificationsUtil } from "../utils/FetchNotifications";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [seenNotifications, setSeenNotifications] = useState(new Set());

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

  // Fetch seen notifications
  const fetchSeenNotifications = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const selectedProject = JSON.parse(localStorage.getItem('selectedProjet'));
      if (!accessToken || !selectedProject) return;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/get_seen_notifications/${selectedProject.id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (response.data.seen_notifications) {
        setSeenNotifications(new Set(response.data.seen_notifications));
      }
    } catch (error) {
      console.error('Error fetching seen notifications:', error);
    }
  }, []);

  // Mark notification as seen
  const markAsSeen = useCallback(async (notificationId) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const selectedProject = JSON.parse(localStorage.getItem('selectedProjet'));
      setSeenNotifications(prev => new Set([...prev, notificationId]));
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/mark_notification_seen`,
        { notification_id: notificationId, projet_id: selectedProject.id },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (error) {
      console.error('Error marking notification as seen:', error);
    }
  }, []);

  // Mark all as seen
  const markAllAsSeen = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const selectedProject = JSON.parse(localStorage.getItem('selectedProjet'));
      const allNotificationIds = notifications.map(notif => notif.id);
      setSeenNotifications(prev => new Set([...prev, ...allNotificationIds]));
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/mark_all_notifications_seen`,
        { notification_ids: allNotificationIds, projet_id: selectedProject.id },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (error) {
      console.error('Error marking all notifications as seen:', error);
    }
  }, [notifications]);

  // Utility
  const isNotificationSeen = useCallback(
    (notificationId) => seenNotifications.has(notificationId),
    [seenNotifications]
  );

  // Initial fetch
  useEffect(() => {
    fetchSeenNotifications();
    fetchNotifications();
  }, [fetchSeenNotifications, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        newNotificationsCount,
        isLoadingNotifications,
        seenNotifications,
        fetchNotifications,
        fetchSeenNotifications,
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
