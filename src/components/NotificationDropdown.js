"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Eye, RefreshCw, Calendar, Home, AlertTriangle, Clock, CheckCircle, ThumbsUp, MessageCircle, Share } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useNotifications } from '../context/NotificationContext';

const NotificationDropdown = ({ isLoadingNotifications: propLoading }) => {
  const {
    notifications,
    newNotificationsCount,
    isLoadingNotifications,
    seenNotifications,
    fetchNotifications,
    markAsSeen,
    markAllAsSeen,
    isNotificationSeen
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notifId, notification) => {
    const accessToken = localStorage.getItem('accessToken');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    // Mark as seen locally first for immediate UI feedback
    markAsSeen(notifId);
    
    axios({
      method: 'get',
      url: `${apiUrl}/DestroyNotif/${notifId}`,
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(() => {
        console.log('Notification marked as read');
        fetchNotifications();
        if (notification.url) {
          window.open(notification.url, '_blank');
        }
      })
      .catch(() => {
        console.log('Failed to mark notification as read');
      });
  };

  const handleViewAllNotifications = () => {
    setIsOpen(false);
    router.push('/notifications');
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
      'calendar': Calendar,
      'clock': Clock,
      'check-circle': CheckCircle,
      'alert-triangle': AlertTriangle,
      'home': Home,
      'refresh-cw': RefreshCw,
      'thumbs-up': ThumbsUp,
      'message-circle': MessageCircle,
      'share': Share
    };
    
    const IconComponent = iconMap[iconName] || Bell;
    return <IconComponent className="h-4 w-4" />;
  };

  // Calculate unseen count
  const unseenCount = notifications.filter(notif => !isNotificationSeen(notif.id)).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unseenCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unseenCount > 99 ? '99+' : unseenCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                {unseenCount > 0 && (
                  <p className="text-sm text-gray-500">{unseenCount} non lues</p>
                )}
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsSeen}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                  title="Marquer tout comme lu"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span>Tout marquer</span>
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoadingNotifications ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Chargement...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => {
                  const isSeen = isNotificationSeen(notification.id);
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer group relative ${
                        !isSeen ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification.id, notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getColorClass(notification.color)}`}>
                          {getIconComponent(notification.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            !isSeen ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {notification.subtitle}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.date}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {!isSeen && (
                            <>
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsSeen(notification.id);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Marquer comme lu"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleViewAllNotifications}
              className="w-full flex items-center justify-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
            >
              <Eye className="h-4 w-4" />
              <span>Voir toutes les notifications</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
