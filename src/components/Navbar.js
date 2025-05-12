"use client";
import { useAuth } from "../context/AuthContext";
import { Bell, Moon } from "lucide-react";
import DropdownMenuDemo from "./DropdownMenuDemo";
import SocieteDropDown from "./SocieteDropDown";
import ProjetsDropDown from "./ProjetsDropDown";

export default function CombinedNavbar() {
  const { user } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-40 top-0 right-0 left-0">
      <div className="flex justify-between px-16 items-center p-3 shadow-md ml-[12%] md:ml-[8%] lg:ml-[18%] xl:ml-[14%]">
        {/* Left side - Societe & Projet selector */}
        <div className="flex items-center gap-2">
          {user?.role === 1 && <SocieteDropDown />}
          <ProjetsDropDown />
        </div>

        {/* Right side - User menu & actions */}
        <div className="flex items-center gap-4 justify-end">
          <Moon className="h-7 w-7 cursor-pointer" />

          {/* Notifications */}
          <div className="relative cursor-pointer">
            <Bell className="h-7 w-7" />
            <div className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-text rounded-full text-xs bg-red-500">
              1
            </div>
          </div>

          {/* User Dropdown */}
          <DropdownMenuDemo />
        </div>
      </div>
    </nav>
  );
}