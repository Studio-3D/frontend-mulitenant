"use client";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useProjet } from "../context/ProjetContext";
import { Bell, Moon, TestTube } from "lucide-react";
import DropdownMenuDemo from "./DropdownMenuDemo";
import SocieteDropDown from "./SocieteDropDown";
import ProjetsDropDown from "./ProjetsDropDown";
import NotificationDropdown from "./NotificationDropdown";
import { useNotifications } from "../context/NotificationContext";
import Pusher from "pusher-js";

export default function CombinedNavbar() {
  const { user } = useAuth();
  const { selectedProjet } = useProjet();
  const {
    notifications,
    newNotificationsCount,
    isLoadingNotifications,
    fetchNotifications,
    setNotifications,
    setNewNotificationsCount,
  } = useNotifications();

  useEffect(() => {
    if (selectedProjet?.id) {
      console.log("Project selected, fetching notifications for project:", selectedProjet.id);
      fetchNotifications();

      // Use the SAME key that matches PUSHER_APP_KEY_3
      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY_NOTIF;
      console.log("PUSHER NOTIF KEY:", pusherKey);
      
      if (pusherKey) {
        const pusher = new Pusher(pusherKey, {
          cluster: "eu",
          encrypted: true,
        });

        const channel = pusher.subscribe("Notifications");

        pusher.connection.bind("connected", () => {
          console.log("Pusher connected for Notifications channel");
        });

        pusher.connection.bind("error", (err) => {
          console.error("Pusher error", err);
        });

        // Bind to the event - remove duplicate bindings
        channel.bind("NotificationEvent", (data) => {
          console.log("Received notification event from pusher:", data);
          fetchNotifications();
        });

        return () => {
          channel.unbind_all();
          channel.unsubscribe();
          pusher.disconnect();
        };
      }
    } else {
      setNotifications([]);
      setNewNotificationsCount(0);
    }
  }, [selectedProjet]);

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-40 top-0 right-0 left-0">
      <div className="flex justify-between px-16 items-center p-3 shadow-md ml-[12%] md:ml-[8%] lg:ml-[18%] xl:ml-[14%]">
        <div className="flex items-center gap-2">
          {user?.role === 1 && <SocieteDropDown />}
          <ProjetsDropDown onProjectChange={fetchNotifications} />
        </div>

        <div className="flex items-center gap-4 justify-end">
          <NotificationDropdown
            notifications={notifications}
            newNotificationsCount={newNotificationsCount}
            onFetchNotifications={fetchNotifications}
            isLoadingNotifications={isLoadingNotifications}
          />
          <DropdownMenuDemo />
        </div>
      </div>
    </nav>
  );
}