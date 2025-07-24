"use client";

import { useState, useEffect, useRef, Fragment } from 'react';
import { Bell, Trash2, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchNotifications } from '@/utils/FetchNotifications';
import Pusher from 'pusher-js';

const NotificationDropdown = ({ notifications, newNotificationsCount, onFetchNotifications }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
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
        onFetchNotifications();
        if (notification.url) {
          window.open(notification.url, '_blank');
        }
      })
      .catch(() => {
        console.log('Failed to mark notification as read');
      });
  };

  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    // Implement delete functionality
    console.log('Delete notification:', notificationId);
  };

  const handleViewAll = () => {
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
      'calendar': () => <div className="w-4 h-4">📅</div>,
      'clock': () => <div className="w-4 h-4">⏰</div>,
      'check-circle': () => <div className="w-4 h-4">✅</div>,
      'alert-triangle': () => <div className="w-4 h-4">⚠️</div>,
      'unlock': () => <div className="w-4 h-4">🔓</div>,
      'arrow-clockwise': () => <div className="w-4 h-4">🔄</div>
    };
    
    const IconComponent = iconMap[iconName] || Bell;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {newNotificationsCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {newNotificationsCount > 99 ? '99+' : newNotificationsCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            {newNotificationsCount > 0 && (
              <p className="text-sm text-gray-500">{newNotificationsCount} nouvelles notifications</p>
            )}
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
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer group"
                    onClick={() => handleNotificationClick(notification.id, notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getColorClass(notification.color)}`}>
                        {getIconComponent(notification.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {notification.subtitle}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.date).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {notification.url && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(notification.url, '_blank');
                            }}
                            className="p-1 text-gray-400 hover:text-blue-500"
                            title="Ouvrir le lien"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDeleteNotification(notification.id, e)}
                          className="p-1 text-gray-400 hover:text-red-500"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={onFetchNotifications}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800"
              >
                Actualiser les notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
