"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Bell, Moon } from "lucide-react";
import DropdownMenuDemo from "./DropdownMenuDemo";
import SocieteDropDown from "./SocieteDropDown";
import ProjetsDropDown from "./ProjetsDropDown";
import NotificationDropdown from "./NotificationDropdown";
import { fetchNotifications } from "../utils/FetchNotifications";
import Pusher from "pusher-js";

export default function CombinedNavbar() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const fetchNotificationsData = async () => {
    if (localStorage.getItem('selectedProjet')) {
      await fetchNotifications({ 
        setNotifications, 
        setNewNotificationsCount: setNewNotificationsCount, 
        setIsLoadingNotifications 
      });
    }
  };

  useEffect(() => {
    // Fetch notifications on component mount
    if (localStorage.getItem('selectedProjet')) {
      fetchNotificationsData();
      
      // Set up Pusher for real-time notifications
      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY_NOTIF;
      const pusher = new Pusher(pusherKey, {
        cluster: 'eu',
        encrypted: true
      });
      
      const channel = pusher.subscribe('Notifications');
      
      channel.bind('App\\Events\\NotificationEvent', () => {
        console.log('Received notification event');
        fetchNotificationsData();
      });
      
      return () => {
        channel.unbind_all();
        channel.unsubscribe();
        pusher.disconnect();
      };
    }
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-40 top-0 right-0 left-0">
      <div className="flex justify-between px-16 items-center p-3 shadow-md ml-[12%] md:ml-[8%] lg:ml-[18%] xl:ml-[14%]">
        {/* Left side - Societe & Projet selector */}
        <div className="flex items-center gap-2">
          {user?.role === 1 && <SocieteDropDown />}
          <ProjetsDropDown onProjectChange={fetchNotificationsData} />
        </div>

        {/* Right side - User menu & actions */}
        <div className="flex items-center gap-4 justify-end">
          <Moon className="h-7 w-7 cursor-pointer" />

          {/* Notifications */}
          <NotificationDropdown 
            notifications={notifications}
            newNotificationsCount={newNotificationsCount}
            onFetchNotifications={fetchNotificationsData}
          />

          {/* User Dropdown */}
          <DropdownMenuDemo />
        </div>
      </div>
    </nav>
  );
}