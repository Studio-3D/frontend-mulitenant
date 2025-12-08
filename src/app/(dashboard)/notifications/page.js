'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  RefreshCw,
  Calendar,
  Home,
  AlertTriangle,
  Clock,
  CheckCircle,
  Share,
  MessageCircle,
  ThumbsUp,
  Phone,
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Helper function to get color classes based on notification color
const getColorClass = (color) => {
  const colorMap = {
    primary: 'bg-blue-100 text-blue-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    error: 'bg-red-100 text-red-600',
    info: 'bg-cyan-100 text-cyan-600',
  };
  return colorMap[color] || 'bg-gray-100 text-gray-600';
};

// Helper function to get icon component based on notification icon
const getIconComponent = (iconName) => {
  const iconMap = {
    'refresh-cw': <RefreshCw className="h-6 w-6" />,
    calendar: <Calendar className="h-6 w-6" />,
    home: <Home className="h-6 w-6" />,
    'alert-triangle': <AlertTriangle className="h-6 w-6" />,
    clock: <Clock className="h-6 w-6" />,
    'check-circle': <CheckCircle className="h-6 w-6" />,
    share: <Share className="h-6 w-6" />,
    'message-circle': <MessageCircle className="h-6 w-6" />,
    'thumbs-up': <ThumbsUp className="h-6 w-6" />,
    phone: <Phone className="h-6 w-6" />,
  };
  return iconMap[iconName] || <Bell className="h-6 w-6" />;
};

// Helper function to get current user ID
const getCurrentUserId = () => {
  try {
    // Try to get from authUser first (from AuthContext)
    const authUser = JSON.parse(localStorage.getItem('authUser'));
    if (authUser && authUser.id) {
      return authUser.id;
    }
    console.log('user==>'+authUser.id)
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

// Helper function to safely parse seen array
const getSeenArray = (seenData) => {
  if (seenData === null || seenData === undefined) return [];
  if (Array.isArray(seenData)) return seenData;
  if (typeof seenData === 'string') {
    try {
      const parsed = JSON.parse(seenData);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error parsing seen data:', e, 'Data:', seenData);
      return [];
    }
  }
  return [];
};

export default function NotificationsPage() {
  const {
    notifications,
    isLoadingNotifications,
    fetchNotifications,
    markAsSeen,
    markAllAsSeen,
    isNotificationSeen,
  } = useNotifications();
  const [filter, setFilter] = useState('all'); // 'all', 'unseen', 'seen'
  const router = useRouter();

  // Helper function to check if current user has seen a notification
  const checkIfSeenByCurrentUser = (notification) => {
    if (!notification) return false;
    
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return false;
    
    const seenArray = getSeenArray(notification.seen);
    return seenArray.includes(currentUserId);
  };

  // Filter notifications based on seen status for current user
  const filteredNotifications = notifications.filter((notification) => {
    const isSeen = checkIfSeenByCurrentUser(notification);
    switch (filter) {
      case 'unseen':
        return !isSeen;
      case 'seen':
        return isSeen;
      default:
        return true;
    }
  });

  // Count unseen notifications for current user
  const unseenCount = notifications.filter(
    (notif) => !checkIfSeenByCurrentUser(notif)
  ).length;

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark as seen for current user when clicked
    if (!checkIfSeenByCurrentUser(notification)) {
      markAsSeen(notification.id);
      
      // Also call the backend to destroy notification (your existing logic)
      try {
        const accessToken = localStorage.getItem('accessToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        
        await axios({
          method: 'get',
          url: `${apiUrl}/DestroyNotif/${notification.id}`,
          headers: {
            'content-type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        console.log('Notification destroyed');
        fetchNotifications();
      } catch (error) {
        console.log('Failed to destroy notification');
      }
    }

    // Navigate to the link if it exists
    if (notification.url) {
      window.open(notification.url, '_blank');
    }
  };

  // Handle individual mark as seen (with stop propagation)
  const handleMarkAsSeen = async (e, notificationId) => {
    e.stopPropagation();
    markAsSeen(notificationId);
  };

  // Handle mark all as seen
  const handleMarkAllAsSeen = async () => {
    await markAllAsSeen();
    // Refresh notifications after marking all as seen
    fetchNotifications();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Notifications
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {notifications.length} notifications • {unseenCount} non lues
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {notifications.length > 0 && unseenCount > 0 && (
                <button
                  onClick={handleMarkAllAsSeen}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span>Marquer tout comme lu</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex space-x-1 mt-4">
            {[
              { key: 'all', label: 'Toutes' },
              { key: 'unseen', label: 'Non lues' },
              { key: 'seen', label: 'Lues' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-2 text-sm rounded-md ${
                  filter === key
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {label}
                {key === 'unseen' && unseenCount > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {unseenCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="divide-y divide-gray-200">
          {isLoadingNotifications ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-4">
                Chargement des notifications...
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">
                {filter === 'unseen'
                  ? 'Aucune notification non lue'
                  : filter === 'seen'
                  ? 'Aucune notification lue'
                  : 'Aucune notification'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const isSeen = checkIfSeenByCurrentUser(notification);
              return (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !isSeen ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getColorClass(
                        notification.color
                      )}`}
                    >
                      {getIconComponent(notification.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p
                            className={`text-base font-medium ${
                              !isSeen ? 'text-gray-900' : 'text-gray-600'
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {notification.subtitle}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {notification.date}
                          </p>
                          {notification.url && (
                            <p className="text-xs text-blue-500 mt-1">
                              Cliquez pour voir plus →
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {!isSeen ? (
                            <>
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <button
                                onClick={(e) => handleMarkAsSeen(e, notification.id)}
                                className="p-2 text-gray-400 hover:text-blue-500 rounded-md hover:bg-gray-100"
                                title="Marquer comme lu"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 font-medium">
                              Lu
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}