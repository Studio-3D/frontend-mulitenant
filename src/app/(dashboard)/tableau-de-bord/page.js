'use client'
import { Dashboard } from '@/components/TableauDeBord/Dashboard';
import { Dashboard_Menu } from '@/components/Dashboard_Menu';
import { useAuth } from '@/context/AuthContext';

const DashboardPage = () => {
  const { user} = useAuth();
  const userRole = user?.role;
  {/* n'est pas admin commercial sup admin*/}
  return (
     (userRole>3)? (
     <Dashboard_Menu userRole={userRole} name={user?.name+' '+user?.prenom}/>
     ):(
     <Dashboard/>
     )
  
  )
}

export default DashboardPage