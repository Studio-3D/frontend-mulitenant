'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import axios from 'axios';
import { fetchNotifications as fetchNotificationsUtil } from '../utils/FetchNotifications';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Helper function to get current user ID
  const getCurrentUserId = () => {
    try {
      // Try to get from authUser first (from AuthContext)
      const authUser = JSON.parse(localStorage.getItem('authUser'));
      if (authUser && authUser.id) {
        return authUser.id;
      }
      
      // Fallback to user key
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) {
        return user.id;
      }
      
      console.warn('No user ID found in localStorage');
      return null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  };

  // Helper function to safely get seen array
  const getSeenArray = (seenData) => {
    if (seenData === null || seenData === undefined) return [];
    if (Array.isArray(seenData)) return seenData;
    if (typeof seenData === 'string') {
      try {
        // Handle cases like "[59]" or "[]"
        const parsed = JSON.parse(seenData);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Error parsing seen data:', e, 'Data:', seenData);
        return [];
      }
    }
    console.warn('Unexpected seen data type:', typeof seenData, 'Data:', seenData);
    return [];
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (localStorage.getItem('selectedProjet')) {
      await fetchNotificationsUtil({
        setNotifications,
        setNewNotificationsCount,
        setIsLoadingNotifications,
      });
    }
  }, []);

  // Mark notification as seen for current user
  const markAsSeen = useCallback(async (notificationId) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const selectedProject = JSON.parse(
        localStorage.getItem('selectedProjet')
      );

      // Get current user ID
      const currentUserId = getCurrentUserId();
      
      if (!currentUserId) {
        console.error('Cannot mark as seen: No user ID found');
        return;
      }

      console.log('Marking as seen - User ID:', currentUserId, 'Notification ID:', notificationId);

      // Optimistically update the UI first
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.id === notificationId) {
            const seenArray = getSeenArray(n.seen);
            console.log('Current seen array:', seenArray);
            if (!seenArray.includes(currentUserId)) {
              const newSeenArray = [...seenArray, currentUserId];
              console.log('New seen array:', newSeenArray);
              return { ...n, seen: newSeenArray };
            }
          }
          return n;
        })
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
      const currentUserId = getCurrentUserId();
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.id === notificationId) {
            const seenArray = getSeenArray(n.seen);
            return { ...n, seen: seenArray.filter(id => id !== currentUserId) };
          }
          return n;
        })
      );
    }
  }, []);

  // Mark all as seen for current user
  const markAllAsSeen = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const selectedProject = JSON.parse(
        localStorage.getItem('selectedProjet')
      );
      const currentUserId = getCurrentUserId();
      
      if (!currentUserId) {
        console.error('Cannot mark all as seen: No user ID found');
        return;
      }
      
      const allNotificationIds = notifications.map((notif) => notif.id);

      console.log('Mark all as seen - User ID:', currentUserId);

      // Optimistically update the UI first
      setNotifications((prev) =>
        prev.map((n) => {
          const seenArray = getSeenArray(n.seen);
          if (!seenArray.includes(currentUserId)) {
            return { ...n, seen: [...seenArray, currentUserId] };
          }
          return n;
        })
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
      const currentUserId = getCurrentUserId();
      setNotifications((prev) =>
        prev.map((n) => {
          const seenArray = getSeenArray(n.seen);
          return { ...n, seen: seenArray.filter(id => id !== currentUserId) };
        })
      );
    }
  }, [notifications]);

  // Check if notification is seen by current user
  const isNotificationSeen = useCallback((notificationId) => {
    const notif = notifications.find((n) => n.id === notificationId);
    if (!notif) {
      console.log('Notification not found:', notificationId);
      return false;
    }
    
    // Get current user ID
    const currentUserId = getCurrentUserId();
    
    if (!currentUserId) {
      console.log('No user ID found in localStorage');
      return false;
    }
    
    const seenArray = getSeenArray(notif.seen);
    const isSeen = seenArray.includes(currentUserId);
    
    //console.log(`isNotificationSeen: Notification ${notificationId}, User ${currentUserId}, Seen array:`, seenArray, 'Result:', isSeen);
    
    return isSeen;
  }, [notifications]);

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
        setIsLoadingNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
}