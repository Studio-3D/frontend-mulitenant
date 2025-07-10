"use client";
import { useState, Fragment } from 'react';
import { Bell } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const NotificationDropdown = ({ notifications, newNotificationsCount, onFetchNotifications }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notifId) => {
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
      })
      .catch(() => {
        console.log('Failed to mark notification as read');
      });
  };

  const handleViewAll = () => {
    setIsOpen(false);
    router.push('/notifications');
  };

  return (
    <div className="relative">
      <button 
        className="relative focus:outline-none" 
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <Bell className="h-7 w-7" />
        {newNotificationsCount > 0 && (
          <div className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-text rounded-full text-xs bg-red-500">
            {newNotificationsCount}
          </div>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 md:w-96 bg-white rounded-md shadow-lg overflow-hidden border border-gray-200">
          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-700">Notifications</h3>
            <span className="px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full">
              Non lues: {newNotificationsCount}
            </span>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <Link 
                  key={index} 
                  href={notification.url || '#'}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`block px-4 py-3 hover:bg-gray-50 transition duration-150 border-b ${
                    notification.deleted_at ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`mr-3 p-2 rounded-full bg-${notification.color}-100`}>
                      <span className={`text-${notification.color}-500`}>{notification.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                      <p className="text-xs text-gray-500 truncate">{notification.subtitle}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.date}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500">
                Aucune notification
              </div>
            )}
          </div>
          
          <div className="px-4 py-3 bg-gray-50 border-t">
            <button 
              onClick={handleViewAll}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Toutes les notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
