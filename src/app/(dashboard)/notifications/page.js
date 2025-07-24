"use client";

import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { fetchNotifications } from '@/utils/FetchNotifications';
import axios from 'axios';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [seenNotifications, setSeenNotifications] = useState(new Set());
  const [filter, setFilter] = useState('all'); // 'all', 'unseen', 'seen'

  // Load seen notifications from backend on mount
  useEffect(() => {
    const fetchSeenNotifications = async () => {
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
    };
    fetchSeenNotifications();
  }, []);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotificationsData();
  }, []);

  const fetchNotificationsData = async () => {
    if (localStorage.getItem('selectedProjet')) {
      await fetchNotifications({ 
        setNotifications, 
        setNewNotificationsCount, 
        setIsLoadingNotifications 
      });
    }
  };

  const markAsSeen = async (notificationId) => {
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
  };

  const markAllAsSeen = async () => {
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
  };

  const isNotificationSeen = (notificationId) => {
    return seenNotifications.has(notificationId);
  };

  const getColorClass = (color) => {
    const colorMap = {
      warning: 'text-yellow-600 bg-yellow-100',
      primary: 'text-blue-600 bg-blue-100',
      error: 'text-red-600 bg-red-100',
      success: 'text-green-600 bg-green-100',
      info: 'text-blue-600 bg-blue-100'
    };
    return colorMap[color] || 'text-gray-600 bg-gray-100';
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      'bell': Bell,
      'calendar': () => <div className="w-6 h-6 text-xs">📅</div>,
      'clock': () => <div className="w-6 h-6 text-xs">⏰</div>,
      'check-circle': () => <div className="w-6 h-6 text-xs">✅</div>,
      'alert-triangle': () => <div className="w-6 h-6 text-xs">⚠️</div>,
      'unlock': () => <div className="w-6 h-6 text-xs">🔓</div>,
      'arrow-clockwise': () => <div className="w-6 h-6 text-xs">🔄</div>,
      'heart': () => <div className="w-6 h-6 text-xs font-medium">❤️</div>
    };
    
    const IconComponent = iconMap[iconName] || Bell;
    return <IconComponent className="h-6 w-6" />;
  };

  // Filter notifications based on seen status
  const filteredNotifications = notifications.filter(notification => {
    const isSeen = isNotificationSeen(notification.id);
    switch (filter) {
      case 'unseen':
        return !isSeen;
      case 'seen':
        return isSeen;
      default:
        return true;
    }
  });

  const unseenCount = notifications.filter(notif => !isNotificationSeen(notif.id)).length;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500 mt-1">
                {notifications.length} notifications • {unseenCount} non lues
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsSeen}
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
              { key: 'seen', label: 'Lues' }
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
              <p className="text-sm text-gray-500 mt-4">Chargement des notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">
                {filter === 'unseen' ? 'Aucune notification non lue' : 
                 filter === 'seen' ? 'Aucune notification lue' : 
                 'Aucune notification'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const isSeen = isNotificationSeen(notification.id);
              return (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !isSeen ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getColorClass(notification.color)}`}>
                      {getIconComponent(notification.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-base font-medium ${
                            !isSeen ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {notification.subtitle}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {notification.date}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {!isSeen ? (
                            <>
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <button
                                onClick={() => markAsSeen(notification.id)}
                                className="p-2 text-gray-400 hover:text-blue-500 rounded-md hover:bg-gray-100"
                                title="Marquer comme lu"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 font-medium">Lu</span>
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

