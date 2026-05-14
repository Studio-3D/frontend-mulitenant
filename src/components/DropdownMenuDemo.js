import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from '../context/AuthContext';
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { RESOURCE_URL } from "@/configs/api";
import { useState, useEffect } from "react";

const DropdownMenuDemo = () => {
  const { forceLogout, user } = useAuth();
  const router = useRouter();
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    if (user?.photo) {
      // Construire l'URL de la photo de manière sécurisée
      const societeName = user?.societe?.raison_sociale_concatene || user?.raison_sociale_concatene;
      const societeId = user?.societe?.id || user?.societe_id;
      
      if (societeName && societeId) {
        const url = `${RESOURCE_URL.DOCS}/${societeName}_${societeId}/users/${user.photo}`;
        setPhotoUrl(url);
      } else {
        setPhotoUrl(null);
      }
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await forceLogout();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erreur lors de la déconnexion.");
      try {
        router.push('/login');
      } catch (error) {
        window.location.href = '/login';
      }
    }
  };

  // Fonction pour obtenir le nom de la société
  const getSocieteName = () => {
    return user?.societe?.raison_sociale_concatene || user?.raison_sociale_concatene || '';
  };

  // Fonction pour obtenir l'ID de la société
  const getSocieteId = () => {
    return user?.societe?.id || user?.societe_id || '';
  };

  return (
    <div>
      {user && ( 
        <DropdownMenu className="">
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage
                src={
                  user?.photo && getSocieteName() && getSocieteId()
                    ? `${RESOURCE_URL.DOCS}/${getSocieteName()}_${getSocieteId()}/users/${user.photo}`
                    : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                }
                onError={(e) => {
                  // Si l'image ne charge pas, afficher l'image par défaut
                  e.target.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
                }}
              />
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="md:w-56 mt-3 mr-1 bg-white">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-bold">{user.name} {user.prenom}</span>
                <span className="text-sm !text-gray-500">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="">
              <DropdownMenuItem 
                className='p-2 mt-1 hover:bg-gray-100 hover:rounded-md cursor-pointer' 
                onClick={() => router.push("/profile")}
              >
                Profil
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="p-2 mt-1 hover:bg-gray-100 hover:rounded-md cursor-pointer !text-red-500" 
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