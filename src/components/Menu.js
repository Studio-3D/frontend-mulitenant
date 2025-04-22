"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from '../context/AuthContext';

// import icons
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { FaBuilding } from "react-icons/fa";
import { FaFolderOpen } from "react-icons/fa";
import { FaRegFolderOpen } from "react-icons/fa6";
import { RiArrowRightSLine } from "react-icons/ri";
import { RiArrowDownSLine } from "react-icons/ri";
import { LuFileText } from "react-icons/lu";
import { LuClipboardPenLine } from "react-icons/lu";
import { TbReportAnalytics } from "react-icons/tb";
import { BiSolidBriefcase } from "react-icons/bi";
import { SiCivicrm } from "react-icons/si";
import { FaHandshake } from "react-icons/fa";
import { LuTimerReset } from "react-icons/lu";
import { BsCalendar3 } from "react-icons/bs";
import { RiDiscountPercentFill } from "react-icons/ri";
import { RiFolderUserFill } from "react-icons/ri";
import { MdFeed } from "react-icons/md";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { SiLibreofficecalc } from "react-icons/si";
import { ImStatsDots } from "react-icons/im";
import { FaHistory } from "react-icons/fa";
import { FaCircleExclamation } from "react-icons/fa6";
import { IoSettings } from "react-icons/io5";
import { PiUsersFourFill } from "react-icons/pi";
import { FaRegEye } from "react-icons/fa6";
import { User_roles } from "../configs/enum"  



const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const pathname = usePathname();
  const { user } = useAuth();
  

  useEffect(() => {
    if (user) {
      const items = getMenuItems(user.role);
      setMenuItems(items);
    }
  }, [user]);

  const getMenuItems = (role) => {
    const items = [
      { label: 'Tableau de Bord', icon: <TbLayoutDashboardFilled />, href: '/tableau-de-bord' },
    ];

    if (role === User_roles.ROLE_SUPER_ADMIN) {
      items.push({ label: 'Societes', icon: <FaBuilding />, href: '/Societes' });
    }

    if (role <= User_roles.ROLE_ADMIN) {
      items.push(...getAdminItems());
    }

    items.push({ label: 'Projets', icon: <BiSolidBriefcase />, href: '/Projets' });

    if (role <= User_roles.ROLE_COMMERCIAL) {
      items.push(...getCommercialItems());
    }

    if (role <= User_roles.ROLE_ADMIN) {
      items.push(...getAdditionalAdminItems());
    }

    return items;
  };

  const getAdminItems = () => [
    { label: 'Utilisateurs', icon: <PiUsersFourFill />, href: '/Utilisateurs' },
    {
      label: 'Administration',
      icon: <IoSettings />,
      children: [
        { label: 'Types Projets', icon: <FaFolderOpen />, href: '/Administration/Types-Projets' },
        { label: 'Types Biens', icon: <FaRegFolderOpen />, href: '/Administration/Types-Biens' },
        { label: 'Objectifs', icon: <LuFileText />, href: '/Administration/Objectifs' },
        { label: 'Commissions', icon: <FaFileInvoiceDollar />, href: '/Administration/Commissions' },
        { label: 'Freins', icon: <FaCircleExclamation />, href: '/Administration/Freins' },
        { label: 'Sources', icon: <LuClipboardPenLine />, href: '/Administration/Sources' },
        { label: 'Partenaires', icon: <TbReportAnalytics />, href: '/Administration/Partenaires' },
        { label: 'Vues', icon: <FaRegEye />, href: '/Administration/Vues' },
        { label: 'Typologies', icon: <FaRegFolderOpen />, href: '/Administration/Typologies' },
        { label: 'Banques', icon: <FaBuilding />, href: '/Administration/Banques' },
      ],
    },
  ];

  const getCommercialItems = () => [
    { label: 'CRM', icon: <SiCivicrm />, href: '/crm' },
    { label: 'Ventes', icon: <FaHandshake />, href: '/Ventes' },
    { label: 'Actualités du Jour', icon: <LuTimerReset />, href: '/actualites-du-jour' },
    { label: 'Calendrier', icon: <BsCalendar3 />, href: '/Calendrier' },
  ];

  const getAdditionalAdminItems = () => [
    { label: 'Remise Des Clés', icon: <RiDiscountPercentFill />, href: '/remise-des-cles' },
    { label: 'Sav', icon: <RiFolderUserFill />, href: '/Sav' },
    { label: 'Reclamations', icon: <MdFeed />, href: '/Reclamations' },
    { label: 'Encaissments', icon: <FaFileInvoiceDollar />, href: '/Encaissments' },
    { label: 'Comptabilité', icon: <SiLibreofficecalc />, href: '/comptabilite' },
    { label: 'Statistiques', icon: <ImStatsDots />, href: '/Statistiques' },
    { label: 'Historique Importation', icon: <FaHistory />, href: '/Historique-Importation' },
  ];

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return (
    <div className="h-[calc(100vh-4rem)] mt-5 text-sm font-semibold text-gray-200">
      {menuItems.map((item, index) => (
        <div key={index}>
          {item.children ? (
            <div
              className={`flex items-center justify-between p-2 mt-1 mb-1 cursor-pointer ${pathname.startsWith(item.href) ? 'bg-active  text-[#231651] rounded-md' : 'hover:bg-[#d6fff6] hover:text-[#231651] rounded-md'}`}
              onClick={() => toggleDropdown(index)}
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 flex items-center text-xl justify-start lg:justify-center">{item.icon}</span>
                <span className="hidden lg:block">{item.label}</span>
              </div>
              <span className="w-4 h-4 md:w-6 md:h-6 flex justify-start items-center text-xs md:text-xl">
                {openDropdown === index ? <RiArrowDownSLine /> : <RiArrowRightSLine />}
              </span>
            </div>
          ) : (
            <Link href={item.href || '#'}>
              <div className={`flex items-center gap-2 p-2 mt-1  cursor-pointer ${pathname.startsWith(item.href) ? 'bg-active  text-[#231651] rounded-md' : 'hover:bg-[#d6fff6] hover:text-[#231651] rounded-md'}`}>
                <span className="w-6 h-6 flex justify-start items-center text-xl">{item.icon}</span>
                <span className="hidden lg:block">{item.label}</span>
              </div>
            </Link>
          )}
          {item.children && openDropdown === index && (
            <div className="pl-1.5 lg:pl-6">
              {item.children.map((child, childIndex) => (
                <Link key={childIndex} href={child.href || '#'}>
                  <div className={`flex items-center gap-2 p-[7px] mt-1 cursor-pointer ${pathname === child.href ? 'bg-active text-[#231651] rounded-md' : 'hover:bg-[#d6fff6] hover:text-[#231651] rounded-md'}`}>
                    <span className="w-[18px] h-[18px] flex justify-center items-center text-xl">{child.icon}</span>
                    <span className="hidden lg:block">{child.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Menu;

