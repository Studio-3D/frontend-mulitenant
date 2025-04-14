import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from '../context/AuthContext';
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";



const DropdownMenuDemo = () => {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
      toast.success("Déconnexion réussie.");
    } catch (error) {
      toast.error("Erreur lors de la déconnexion. Veuillez réessayer.");
    }
  };

  return (
    <div>
      {user && ( 
        <DropdownMenu className="">
          <DropdownMenuTrigger asChild>
            <Avatar>
              <AvatarImage
                src={
                  user?.profilePicture ||
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                }
              />
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="md:w-56 mt-3 mr-1 bg-white ">
            {/* Show User Info */}
            <DropdownMenuLabel>
              <div className="flex flex-col">
              <span className="font-bold">{user.name}</span>
              <span className="text-sm text-gray-500">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="">
              <DropdownMenuItem className='p-2 mt-1 hover:bg-gray-100 hover:rounded-md cursor-pointer' onClick={() => router.push("/profile")}>
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem className='p-2 mt-1 hover:bg-gray-100 hover:rounded-md cursor-pointer' onClick={() => router.push("/settings")}>
                Paramètres
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className=" p-2 mt-1 hover:bg-gray-100 hover:rounded-md cursor-pointer text-red-500" onClick={handleLogout}>
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default DropdownMenuDemo;

