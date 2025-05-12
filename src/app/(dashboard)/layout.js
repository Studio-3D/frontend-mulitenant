"use client";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSociete } from '../../context/SocieteContext';
import { useAuth } from '../../context/AuthContext';
import SocieteModal from '../../components/SocieteModal';
import Navbar from '../../components/Navbar';
import Menu from '../../components/Menu';
import Link from 'next/link';
import { Home } from 'lucide-react';
import LoadingSpin from '../../components/LoadingSpin'; // Import your loading spinner component

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { user, loading: userLoading } = useAuth();
  const { selectedSociete, loading: societeLoading } = useSociete();
  const [showSocieteModal, setShowSocieteModal] = useState(false);
  
  // Define paths that require societe selection for admin users
  const pathsRequiringSociete = [
    '/typeProjets',
    '/projets',
    '/tranches',
    '/blocs',
    '/immeubles',
    '/biens'
  ];
  
  useEffect(() => {
    // Only show modal when:
    // 1. User is loaded (not loading)
    // 2. User is a super admin (role 1)
    // 3. No société is selected
    // 4. Current path requires a société
    if (!userLoading && !societeLoading && user?.role === 1) {
      const needsSociete = pathsRequiringSociete.some(path => 
        pathname.toLowerCase().includes(path.toLowerCase())
      );
      
      if (!selectedSociete && needsSociete) {
        setShowSocieteModal(true);
      } else {
        setShowSocieteModal(false);
      }
    }
  }, [pathname, selectedSociete, user, userLoading, societeLoading]);
  
  // Show loading spinner while data is being loaded
  if (userLoading || societeLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpin /> {/* Use your loading spinner here */}
      </div>
    );
  }
  
  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Fixed position with higher z-index */}
      <div className=" fixed top-0 left-0 w-[12%] md:w-[8%] lg:w-[18%] xl:w-[14%] h-full bg-[#231651] p-2 overflow-auto scrollbar-none z-50">
        <Link href={"/tableau-de-bord"} className="flex items-center gap-2 text-text p-2">
          <Home className="w-[20px] h-[20px] text-white inline-block" />
          <span className="hidden lg:block text-white font-semibold">Immo Gestion</span>
        </Link>
        <Menu />
      </div>

      {/* Right Content - Pushed to the right with proper width */}
      <div className="w-full pl-[12%] md:pl-[8%] lg:pl-[18%] xl:pl-[14%] bg-background overflow-auto scrollbar-none ">
        {/* Use column layout to stack navbar and content */}
          <div className="flex flex-col">
            {/* Fixed height navbar */}
            <div className="h-16">
              <Navbar />
            </div>

            {/* Main content below navbar, no padding needed */}
            <div className=" flex-1 p-4">
              {children}
            </div>
          </div>
      </div>
      
      {/* Société Modal - Only shown when needed by the useEffect logic */}
      {showSocieteModal && (
        <SocieteModal 
          isOpen={true}
          onClose={() => setShowSocieteModal(false)}
          returnPath={pathname}
        />
      )}
    </div>
  );
}
