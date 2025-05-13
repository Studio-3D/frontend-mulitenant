"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

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
import { User_roles } from "../configs/enum";
import { useSociete } from "@/context/SocieteContext";
import SocieteDialog from "./SocieteDialog";
import { useProjet } from "@/context/ProjetContext";
import ProjetDialog from "./ProjetDialog";
import { FaTools } from "react-icons/fa";
import { HiOutlineUserGroup } from "react-icons/hi";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { FaUniversity, FaRegCreditCard } from "react-icons/fa";

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const pathname = usePathname();
  const { user } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const { societes } = useSociete();
  const { projets } = useProjet();
  const [targetHref, setTargetHref] = useState("");
  const router = useRouter();
  const [isProjetDialogVisible, setIsProjetDialogVisible] = useState(false);
  const [selectedProjetId, setSelectedProjetId] = useState("");
  const [requireProjetAfterSociete, setRequireProjetAfterSociete] =useState(false);

  const handleSocieteSelected = () => {
    const projet = localStorage.getItem("selectedProjet");

    // Ferme la fenêtre de la société
    setIsModalVisible(false);

    // Si le projet n'est pas encore sélectionné, on montre le popup projet
    if (!projet && requireProjetAfterSociete) {
      setIsProjetDialogVisible(true);
    } else {
      router.push(targetHref); // Si le projet est déjà sélectionné, redirige directement
    }

    setRequireProjetAfterSociete(false); // Réinitialise l'état
  };

  useEffect(() => {
    if (!isModalVisible && requireProjetAfterSociete) {
      const projet = localStorage.getItem("selectedProjet");

      if (!projet) {
        setIsProjetDialogVisible(true); // Affiche le projet si non sélectionné
      } else {
        router.push(targetHref); // Redirige si le projet est déjà sélectionné
      }

      setRequireProjetAfterSociete(false); // Réinitialise la nécessité de projet
    }
  }, [isModalVisible, requireProjetAfterSociete]);

  useEffect(() => {
    if (user) {
      const items = getMenuItems(user.role);
      setMenuItems(items);
    }
  }, [user]);

  const getMenuItems = (role) => {
    const items = [
      {
        label: "Tableau de Bord",
        icon: <TbLayoutDashboardFilled />,
        href: "/Tableau-de-Bord",
      },

    ];

    if (role === User_roles.ROLE_SUPER_ADMIN) {
      items.push({
        label: "Societes",
        icon: <FaBuilding />,
        href: "/Societes",
      });
    }

    if (role <= User_roles.ROLE_ADMIN) {
      items.push(...getAdminItems());
    }

    items.push({
      label: "Projets",
      icon: <BiSolidBriefcase />,
      href: "/Projets",
      needsSociete: true && user.role == 1,
    });

    if (role <= User_roles.ROLE_COMMERCIAL) {
      items.push(...getCommercialItems());
    }

    if (role <= User_roles.ROLE_ADMIN) {
      items.push(...getAdditionalAdminItems());
    }

    return items;
  };

  const getAdminItems = () => [
    {
      label: "Utilisateurs",
      icon: <PiUsersFourFill />,
      href: "/Utilisateurs",
      needsSociete: user.role === 1,
    },
    {
      label: "Administration",
      icon: <IoSettings />,
      children: [
        {
          label: "Types Projets",
          icon: <FaFolderOpen />,
          href: "/administration/typesProjets",
          needsSociete: user.role === 1,
        },
        {
          label: "Types Biens",
          icon: <FaRegFolderOpen />,
          href: "/administration/typesBiens",
          needsProjet: true, 
          needsSociete: user.role === 1,
        },
        {
          label: "Objectifs",
          icon: <LuFileText />,
          href: "/administration/objectifs",
          needsProjet: true, 
          needsSociete: user.role === 1,
        },
        {
          label: "Commissions",
          icon: <FaFileInvoiceDollar />,
          href: "/administration/commissions",
          needsProjet: true, 
          needsSociete: user.role === 1,
        },
        {
          label: "Freins",
          icon: <FaCircleExclamation />,
          href: "/administration/freins",
          needsProjet: true, 
          needsSociete: user.role === 1,
        },
        {
          label: "Sources",
          icon: <LuClipboardPenLine />,
          href: "/administration/sources",
          needsSociete: user.role === 1,
        },
        {
          label: "Partenaires",
          icon: <TbReportAnalytics />,
          href: "/administration/partenaires",
          needsProjet: true, 
          needsSociete: user.role === 1,
        },
        {
          label: "Vues",
          icon: <FaRegEye />,
          href: "/administration/vues",
          needsProjet: true, 
          needsSociete: user.role === 1,
        },
        {
          label: "Typologies",
          icon: <FaRegFolderOpen />,
          href: "/administration/typologies",
          needsProjet: true, 
          needsSociete: user.role === 1,
        },
        {
          label: "Banques",
          icon: <FaUniversity />,          
          href: "/administration/banques",
          needsSociete: user.role === 1,
        },
      ],
    },
  ];

  const getCommercialItems = () => [
    {
      label: "CRM",
      icon: <SiCivicrm />,
      href: "/crm",
      needsProjet: true, 
      needsSociete: user.role === 1,
    },
    {
      label: "Ventes",
      icon: <FaHandshake />,
      href: "/ventes",
      needsSociete: user.role === 1,
      needsProjet: true,
    },
    {
      label: "Actualités du Jour",
      icon: <LuTimerReset />,
      href: "/actualites-du-jour",
      needsSociete: user.role === 1,
      needsProjet: true,
    },
    {
      label: "Calendrier",
      icon: <BsCalendar3 />,
      href: "/calendrier",
      needsSociete: user.role === 1,
      needsProjet: true,
    },
  ];

  const getAdditionalAdminItems = () => [
    {
      label: "Remise Des Clés",
      icon: <RiDiscountPercentFill />,
      href: "/remise-des-cles",
    },
    {
      label: "Sav",
      icon: <RiFolderUserFill />,
      children: [
        {
          label: "Services prestataire",
          icon: <FaTools />, // outil = services
          href: "/sav/services",
          needsSociete: user.role === 1,
          
        },
        {
          label: "Prestataires",
          icon: <HiOutlineUserGroup />, // groupe de personnes = prestataires
          href: "/sav/prestataires",
          //needsProjet: true,
          needsSociete: user.role === 1,
        },
        {
          label: "Reclamations",
          icon: <HiOutlineDocumentReport />, // document = réclamation
          href: "/sav/reclamations",
          needsProjet: true,
          needsSociete: user.role === 1,
        },
      ],
    },
    
    
    { label: "Reclamations", icon: <MdFeed />, href: "/Reclamations" },
    {
      label: "Encaissments",
      icon: <FaFileInvoiceDollar />,
      href: "/encaissments",
    },
    {
      label: "Comptabilité",
      icon: <SiLibreofficecalc />,
      href: "/comptabilite",
    },
    { label: "Statistiques", icon: <ImStatsDots />, href: "/Statistiques" },
    {
      label: "Historique Importation",
      icon: <FaHistory />,
      href: "/historique-importation",
    },
  ];

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return (
    <div className="h-[calc(100vh-4rem)] mt-5 text-sm font-semibold text-gray-200">
      {menuItems.map((item, index) => (
        <div key={index}>
          {/* Si l'item a des enfants, on affiche un menu déroulant */}
          {item.children ? (
            <div>
              <div
                onClick={() => toggleDropdown(index)}
                className={`flex items-center justify-between p-2 mt-1 mb-1 cursor-pointer ${
                  pathname.startsWith(item.href)
                    ? "bg-active text-[#231651] rounded-md"
                    : "hover:bg-[#d6fff6] hover:text-[#231651] rounded-md"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center text-xl justify-start lg:justify-center">
                    {item.icon}
                  </span>
                  <span className="hidden lg:block">{item.label}</span>
                </div>
                <span className="w-4 h-4 md:w-6 md:h-6 flex justify-start items-center text-xs md:text-xl">
                  {openDropdown === index ? (
                    <RiArrowDownSLine />
                  ) : (
                    <RiArrowRightSLine />
                  )}
                </span>
              </div>

              {/* Sous-menus */}
              {openDropdown === index && (
                <div className="pl-1.5 lg:pl-6">
                  {item.children.map((child, childIndex) => (
                    <div
                      key={childIndex}
                      onClick={(e) => {
                        e.preventDefault();
                        setTargetHref(child.href);

                        const societe = localStorage.getItem("selectedSociete");
                        const projet = localStorage.getItem("selectedProjet");
                        const role = user?.role;

                        const needsSociete =
                          typeof child.needsSociete === "function"
                            ? child.needsSociete(role)
                            : child.needsSociete ?? false;

                        const needsProjet =
                          typeof child.needsProjet === "function"
                            ? child.needsProjet(role)
                            : child.needsProjet ?? false;

                        if (needsSociete && !societe) {
                          setIsModalVisible(true);
                          if (needsProjet && !projet) {
                            setRequireProjetAfterSociete(true);
                          }
                          return;
                        }

                        if (needsProjet && !projet) {
                          setIsProjetDialogVisible(true);
                          return;
                        }

                        router.push(child.href);
                      }}
                      className={`flex items-center gap-2 p-[7px] mt-1 cursor-pointer ${
                        pathname === child.href
                          ? "bg-active text-[#231651] rounded-md"
                          : "hover:bg-[#d6fff6] hover:text-[#231651] rounded-md"
                      }`}
                    >
                      <span className="w-[18px] h-[18px] flex justify-center items-center text-xl">
                        {child.icon}
                      </span>
                      <span className="hidden lg:block">{child.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Item sans enfants
            <div
              onClick={(e) => {
                e.preventDefault();
                setTargetHref(item.href);

                const societe = localStorage.getItem("selectedSociete");
                const projet = localStorage.getItem("selectedProjet");
                const role = user?.role;

                const needsSociete =
                  typeof item.needsSociete === "function"
                    ? item.needsSociete(role)
                    : item.needsSociete ?? false;

                const needsProjet =
                  typeof item.needsProjet === "function"
                    ? item.needsProjet(role)
                    : item.needsProjet ?? false;

                if (needsSociete && !societe) {
                  setIsModalVisible(true);
                  if (needsProjet && !projet) {
                    setRequireProjetAfterSociete(true);
                  }
                  return;
                }

                if (needsProjet && !projet) {
                  setIsProjetDialogVisible(true);
                  return;
                }

                router.push(item.href);
              }}
              className={`flex items-center gap-2 p-2 mt-1 cursor-pointer ${
                pathname.startsWith(item.href)
                  ? "bg-active text-[#231651] rounded-md"
                  : "hover:bg-[#d6fff6] hover:text-[#231651] rounded-md"
              }`}
            >
              <span className="w-6 h-6 flex justify-start items-center text-xl">
                {item.icon}
              </span>
              <span className="hidden lg:block">{item.label}</span>
            </div>
          )}
        </div>
      ))}

      {/* Modal Société */}
      {isModalVisible && (
        <SocieteDialog
          open={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          societes={societes}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          returnPath={targetHref}
          onConfirm={handleSocieteSelected}
        />
      )}

      {/* Show Projet Dialog if the Societe is selected but Projet is needed */}
      {isProjetDialogVisible && (
        <ProjetDialog
          open={isProjetDialogVisible}
          onClose={() => setIsProjetDialogVisible(false)}
          returnPath={targetHref}
          projets={projets}
          selectedProjetId={selectedProjetId}
          setSelectedProjetId={setSelectedProjetId}
          onConfirm={() => {
            localStorage.setItem("selectedProjet", selectedProjetId);
            setIsProjetDialogVisible(false);
            router.push(targetHref); // Navigate after both are selected
          }}
        />
      )}
    </div>
  );
};

export default Menu;
