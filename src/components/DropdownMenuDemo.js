import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from '../context/AuthContext';
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const DropdownMenuDemo = () => {
  const { forceLogout, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Use forceLogout to bypass LinkedIn protection and ensure logout works
      await forceLogout();
      // Don't show toast here - the logout function handles the redirect
      // The toast will be shown after successful redirect
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erreur lors de la déconnexion.");
      // Force redirect to login even if logout fails
      try {
        router.push('/login');
      } catch (error) {
        // Fallback to window.location if router.push fails
        console.warn("Router.push failed, using window.location:", error);
        window.location.href = '/login';
      }
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
          <DropdownMenuContent className="md:w-56 mt-3 mr-1 bg-white">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-bold">{user.name}</span>
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
              <DropdownMenuItem 
                className='p-2 mt-1 hover:bg-gray-100 hover:rounded-md cursor-pointer' 
                onClick={() => router.push("/settings")}
              >
                Paramètres
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