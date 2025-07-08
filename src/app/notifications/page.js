"use client";
import { useEffect, useState } from "react";
import { fetchNotifications } from "../../utils/FetchNotifications";
import Pusher from "pusher-js";
import Link from "next/link";
import axios from "axios";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  
  const fetchNotificationsData = async () => {
    if (localStorage.getItem('selectedProjet')) {
      await fetchNotifications({
        setNotifications,
        setNewNotificationsCount: setNewNotificationsCount,
        setIsLoadingNotifications
      });
    } else {
      setIsLoadingNotifications(false);
    }
  };

  const markAsRead = async (notifId) => {
    const accessToken = localStorage.getItem('accessToken');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    try {
      await axios({
        method: 'get',
        url: `${apiUrl}/DestroyNotif/${notifId}`,
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      fetchNotificationsData();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  useEffect(() => {
    fetchNotificationsData();
    
    // Set up Pusher for real-time notifications
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY_NOTIF;
    const pusher = new Pusher(pusherKey, {
      cluster: 'eu',
      encrypted: true
    });
    
    const channel = pusher.subscribe('Notifications');
    
    channel.bind('App\\Events\\NotificationEvent', () => {
      fetchNotificationsData();
    });
    
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  if (isLoadingNotifications) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!localStorage.getItem('selectedProjet')) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>
        <p className="text-gray-500">
          Veuillez sélectionner un projet pour voir les notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Toutes les notifications</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {newNotificationsCount} non lues
            </span>
          </div>
        </div>
        
        {notifications.length > 0 ? (
          <div className="divide-y">
            {notifications.map((notification, index) => (
              <div 
                key={index} 
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  notification.deleted_at ? 'bg-gray-50' : ''
                }`}
              >
                <Link 
                  href={notification.url || '#'} 
                  className="flex items-start"
                  onClick={() => !notification.deleted_at && markAsRead(notification.id)}
                >
                  <div className={`mr-4 mt-1 p-2 rounded-full bg-${notification.color}-100 text-${notification.color}-500`}>
                    {notification.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-gray-900">{notification.title}</h3>
                      <span className="text-sm text-gray-500">{notification.date}</span>
                    </div>
                    <p className="text-gray-600">{notification.subtitle}</p>
                    {!notification.deleted_at && (
                      <div className="mt-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Marquer comme lu
                        </button>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Aucune notification
          </div>
        )}
      </div>
    </div>
  );
}
