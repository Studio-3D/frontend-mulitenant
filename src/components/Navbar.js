"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useProjet } from "../context/ProjetContext";
import { Bell, Moon, TestTube } from "lucide-react";
import DropdownMenuDemo from "./DropdownMenuDemo";
import SocieteDropDown from "./SocieteDropDown";
import ProjetsDropDown from "./ProjetsDropDown";
import NotificationDropdown from "./NotificationDropdown";
import { fetchNotifications } from "../utils/FetchNotifications";
import Pusher from "pusher-js";
import axios from "axios";
import { APIURL } from "../configs/api";
import toast from "react-hot-toast";

export default function CombinedNavbar() {
  const { user } = useAuth();
  const { selectedProjet } = useProjet();
  const [notifications, setNotifications] = useState([]);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const fetchNotificationsData = async () => {
    const selectedProject = localStorage.getItem('selectedProjet');
    if (selectedProject) {
      await fetchNotifications({ 
        setNotifications, 
        setNewNotificationsCount: setNewNotificationsCount, 
        setIsLoadingNotifications 
      });
    }
  };

  // Watch for selectedProjet changes and fetch notifications
  useEffect(() => {
    if (selectedProjet?.id) {
      console.log('Project selected, fetching notifications for project:', selectedProjet.id);
      fetchNotificationsData();
      
      // Set up Pusher for real-time notifications
      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY_NOTIF;
      if (pusherKey) {
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
    } else {
      // Clear notifications when no project is selected
      setNotifications([]);
      setNewNotificationsCount(0);
    }
  }, [selectedProjet]);

  // Also watch for localStorage changes (backup mechanism)
  useEffect(() => {
    const handleStorageChange = () => {
      const selectedProject = localStorage.getItem('selectedProjet');
      if (selectedProject && !selectedProjet) {
        // If localStorage has a project but context doesn't, fetch notifications
        fetchNotificationsData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Initial check on component mount
    const selectedProject = localStorage.getItem('selectedProjet');
    if (selectedProject && !selectedProjet) {
      fetchNotificationsData();
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [selectedProjet]);

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