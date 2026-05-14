"use client";

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from '../context/AuthContext';
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { RESOURCE_URL } from "@/configs/api";
import { User } from "lucide-react";

const DropdownMenuDemo = () => {
  const { forceLogout, user } = useAuth();
  const router = useRouter();

  // Fonction pour obtenir l'URL de la photo
  const getPhotoUrl = () => {
    if (!user?.photo) return null;
    
    const societeName = user?.societe?.raison_sociale_concatene || user?.raison_sociale_concatene;
    const societeId = user?.societe?.id || user?.societe_id;
    
    if (!societeName || !societeId) return null;
    
    return `${RESOURCE_URL.DOCS}/${societeName}_${societeId}/users/${user.photo}`;
  };

  // Fonction pour obtenir les initiales
  const getInitials = () => {
    const firstName = user?.name?.charAt(0) || '';
    const lastName = user?.prenom?.charAt(0) || '';
    return `${firstName}${lastName}`.toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await forceLogout();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erreur lors de la déconnexion.");
      router.push('/login');
    }
  };

  return (
    <div>
      {user && ( 
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 focus:outline-none">
              <Avatar className="h-8 w-8 cursor-pointer border border-gray-300">
                <AvatarImage 
                  src={getPhotoUrl()} 
                  alt="Profile"
                  onError={(e) => {
                    console.log("Image failed to load, using fallback");
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <AvatarFallback className="bg-blue-500 text-white text-sm">
                  {getInitials() || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mt-2 mr-1 bg-white shadow-lg rounded-md border">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900">{user.name} {user.prenom}</span>
                <span className="text-sm text-gray-500">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuGroup>
              <DropdownMenuItem 
                className="p-2 mt-1 hover:bg-gray-100 hover:rounded-md cursor-pointer" 
                onClick={() => router.push("/profile")}
              >
                Profil
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem 
              className="p-2 mt-1 hover:bg-gray-100 hover:rounded-md cursor-pointer text-red-500" 
              onClick={handleLogout}
            >
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default DropdownMenuDemo;