'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

import {
  LayoutDashboard,
  Building,
  Folder,
  Landmark,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FileText,
  ClipboardEdit,
  BarChart3,
  Briefcase,
  CreditCard,
  Handshake,
  Timer,
  Calendar,
  Percent,
  Users,
  FileInput,
  Calculator,
  BarChart4,
  History,
  AlertCircle,
  Settings,
  UsersRound,
  Eye,
  Wrench,
  File,
  Building2,
  FolderCog,
  Receipt,
  LayoutDashboard as LayoutDashboardFilled, // Replacement for TbLayoutDashboardFilled
  DollarSign, // Replacement for FaFileInvoiceDollar
  Share2, // Added for social networks
  Coins,
  CheckCircle2,
  Clock,
  Bell,
  BeakerIcon,
  StepBackIcon,
  StepBack,
  Cuboid, // Replacement for FaFileInvoiceDollar
} from 'lucide-react';

import { User_roles } from '../configs/enum';
import { useSociete } from '@/context/SocieteContext';
import SocieteDialog from './SocieteDialog';
import { useProjet } from '@/context/ProjetContext';
import ProjetDialog from './ProjetDialog';
import { ro, tr } from 'date-fns/locale';
import { StepButton } from '@mui/material';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const pathname = usePathname();
  const { user } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const { societes } = useSociete();
  const { projets } = useProjet();
  const [targetHref, setTargetHref] = useState('');
  const router = useRouter();
  const [isProjetDialogVisible, setIsProjetDialogVisible] = useState(false);
  const [selectedProjetId, setSelectedProjetId] = useState('');
  const [requireProjetAfterSociete, setRequireProjetAfterSociete] =
    useState(false);

  const handleSocieteSelected = () => {
    const projet = localStorage.getItem('selectedProjet');

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
      const projet = localStorage.getItem('selectedProjet');

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
        label: 'Tableau de Bord',
        icon: <LayoutDashboard />,
        href: '/tableau-de-bord',
      },
    ];

    if (role === User_roles.ROLE_SUPER_ADMIN) {
      items.push({
        label: 'Societes',
        icon: <Building size={20} />,
        href: '/Societes',
      });
    }

    if (role <= User_roles.ROLE_ADMIN) {
      items.push(...getAdminItems());
    }

    items.push({
      label: 'Projets',
      icon: <Briefcase size={20} />,
      href: '/Projets',
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
      label: 'Utilisateurs',
      icon: <UsersRound size={20} />,
      href: '/Utilisateurs',
      needsSociete: user.role === 1,
    },
    {
      label: 'Configuration',
      icon: <Settings size={20} />,
      children: [
        {
          label: 'Types Projets',
          icon: <Folder size={20} />,
          href: '/administration/types-projets',
          needsSociete: user.role === 1,
        },
        {
          label: 'Types Biens',
          icon: <FolderOpen size={20} />,
          href: '/administration/types-biens',
          needsProjet: true,
          needsSociete: user.role === 1,
        },
        {
          label: 'Objectifs',
          icon: <FileText size={20} />,
          href: '/administration/objectifs',
          needsProjet: true,
          needsSociete: user.role === 1,
        },

         {
          label: "Etapes Projet",
          icon: <Cuboid size={20} />,
          href: "/etapes-projet",
          needsProjet: true, 
          needsSociete: user.role == 1,
        }, 
        {
          label: 'Freins',
          icon: <AlertCircle size={20} />,
          href: '/administration/freins',
          needsProjet: true,
          needsSociete: user.role === 1,
        },
        {
          label: 'Sources',
          icon: <ClipboardEdit size={20} />,
          href: '/administration/sources',
          needsSociete: user.role === 1,
        },
        {
          label: 'Partenaires',
          icon: <BarChart3 size={20} />,
          href: '/administration/partenaires',
          needsProjet: true,
          needsSociete: user.role === 1,
        },
        {
          label: 'Vues',
          icon: <Eye size={20} />,
          href: '/administration/vues',
          needsProjet: true,
          needsSociete: user.role === 1,
        },

        {
          label: 'Typologies',
          icon: <FolderOpen size={20} />,
          href: '/administration/typologies',
          needsProjet: true,
          needsSociete: user.role === 1,
        },
        {
          label: 'Banques',
          icon: <Building size={20} />,
          href: '/administration/banques',
          needsSociete: user.role === 1,
        },
        {
          label: 'Commision',
          icon: <BeakerIcon size={20} />,
          href: '/administration/commissions/configuration',
          needsProjet: true,
          needsSociete: user.role === 1,
        },
        {
          label: 'Réseaux Sociaux',
          icon: <Share2 size={20} />,
          href: '/administration/config-socials',
          needsSociete: user.role === 1,
        },
      ],
    },
  ];

  const getCommercialItems = () => [
    {
      label: 'CRM',
      icon: <CreditCard size={20} />,
      href: '/crm',
      needsProjet: true,
      needsSociete: user.role === 1,
    },
    {
      label: 'Ventes',
      icon: <Handshake />,
      href: '/ventes',

      needsSociete: user.role === 1,
      needsProjet: true,
    },

    {
      label: 'Actualités du Jour',
      icon: <Timer />,
      href: '/actualites-du-jour',
      needsSociete: user.role === 1,
      needsProjet: true,
    },
    {
      label: 'Calendrier',
      icon: <Calendar />,
      href: '/calendrier',
      needsSociete: user.role === 1,
      // needsProjet: true,
    },
    {
      label: 'Remise Des Clés',
      icon: <Percent size={20} />,
      href: '/remiseCles',
      needsSociete: user.role === 1,
      needsProjet: true,
    },
    {
      label: 'Sav',
      icon: <FolderCog />,
      children: [
        {
          label: 'Services prestataire',
          icon: <Wrench />,
          href: '/sav/services',
          needsSociete: user.role === 1,
          needsProjet: true,
        },
        {
          label: 'Prestataires',
          icon: <Users />,
          href: '/sav/prestataires',
          needsProjet: true,
          needsSociete: user.role === 1,
        },
        {
          label: 'Reclamations',
          icon: <FileText />,
          href: '/sav/reclamations',
          needsProjet: true,
          needsSociete: user.role === 1,
        },
      ],
    },
  ];

  const getAdditionalAdminItems = () => [
    {
      label: 'Commissions',
      icon: <Coins size={20} />,
      children: [
        {
          label: 'En Attente',
          icon: <Clock size={20} />,
          href: '/commissions/commissionMensuelleAtt',
          needsProjet: true,
          needsSociete: user.role === 1,
        },
        {
          label: 'Mensuelle Traité',
          icon: <CheckCircle2 size={20} />,
          href: '/commissions/commissionMensuelleTraite',
          needsProjet: true,
          needsSociete: user.role === 1,
        },
        {
          label: 'Cumul',
          icon: <BarChart3 size={20} />,
          href: '/commissions/commissionCumul',
          needsProjet: true,
          needsSociete: user.role === 1,
        },
      ],
    },

    {
      label: 'Reclamations',
      icon: <FileText />,
      href: '/reclamations',
      needsSociete: user.role === 1,
      needsProjet: true,
    },
    {
      label: 'Encaissments',
      icon: <Receipt />,
      href: '/encaissements',
      needsSociete: user.role === 1,
      needsProjet: true,
    },
    {
      label: 'Comptabilité',
      icon: <Calculator />,
      href: '/comptabilite',
      needsProjet: true,
      needsSociete: user.role === 1,
    },
    {
      label: 'Statistiques',
      icon: <BarChart4 size={20} />,
      href: '/Statistiques',
      needsProjet: true,
      needsSociete: user.role === 1,
    },
    {
      label: 'Historique Importation',
      icon: <History size={20} />,
      href: '/histo-importation',
      needsSociete: user.role === 1,
      needsProjet: true,
    },
  ];

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return (
    <div className="h-[calc(100vh-4rem)] mt-5 text-sm font-semibold !text-gray-200">
      {menuItems.map((item, index) => (
        <div key={index}>
          {/* Si l'item a des enfants, on affiche un menu déroulant */}
          {item.children ? (
            <div>
              <div
                onClick={() => toggleDropdown(index)}
                className={`flex items-center justify-between p-2 mt-1 mb-1 cursor-pointer ${
                  pathname.startsWith(item.href)
                    ? 'bg-active text-[#231651] rounded-md'
                    : 'hover:bg-[#fff] hover:text-[#231651] rounded-md'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-start lg:justify-center">
                    {item.icon}
                  </span>
                  <span className="hidden lg:block">{item.label}</span>
                </div>
                <span className="w-4 h-4 md:w-6 md:h-6 flex justify-start items-center">
                  {openDropdown === index ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
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

                        const societe = localStorage.getItem('selectedSociete');
                        const projet = localStorage.getItem('selectedProjet');
                        const role = user?.role;

                        const needsSociete =
                          typeof child.needsSociete === 'function'
                            ? child.needsSociete(role)
                            : child.needsSociete ?? false;

                        const needsProjet =
                          typeof child.needsProjet === 'function'
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
                          ? 'bg-active text-[#231651] rounded-md'
                          : 'hover:bg-[#fff] hover:text-[#231651] rounded-md'
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

                const societe = localStorage.getItem('selectedSociete');
                const projet = localStorage.getItem('selectedProjet');
                const role = user?.role;

                const needsSociete =
                  typeof item.needsSociete === 'function'
                    ? item.needsSociete(role)
                    : item.needsSociete ?? false;

                const needsProjet =
                  typeof item.needsProjet === 'function'
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
                  ? 'bg-active text-[#231651] rounded-md'
                  : 'hover:bg-[#fff] hover:text-[#231651] rounded-md'
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
            localStorage.setItem('selectedProjet', selectedProjetId);
            setIsProjetDialogVisible(false);
            router.push(targetHref); // Navigate after both are selected
          }}
        />
      )}
    </div>
  );
};

export default Menu;
