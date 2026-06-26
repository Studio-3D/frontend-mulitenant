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
  LayoutDashboard as LayoutDashboardFilled,
  DollarSign,
  Share2,
  Coins,
  CheckCircle2,
  Clock,
  Bell,
  BeakerIcon,
  StepBackIcon,
  StepBack,
  Cuboid,
  Euro,
  UsbIcon,
  UserCog,
  FolderArchive,
  FolderCog2,
  User,
  TimerIcon,
  Send,
  Workflow,
  Split,
  FileBarChart,
  Menu as MenuIcon,
  X,
} from 'lucide-react';

import { User_roles } from '../configs/enum';
import { useSociete } from '@/context/SocieteContext';
import SocieteDialog from './SocieteDialog';
import { useProjet } from '@/context/ProjetContext';
import ProjetDialog from './ProjetDialog';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  const [requireProjetAfterSociete, setRequireProjetAfterSociete] = useState(false);

  const handleSocieteSelected = () => {
    const projet = localStorage.getItem('selectedProjet');

    setIsModalVisible(false);

    if (!projet && requireProjetAfterSociete) {
      setIsProjetDialogVisible(true);
    } else {
      router.push(targetHref);
    }

    setRequireProjetAfterSociete(false);
  };

  useEffect(() => {
    if (!isModalVisible && requireProjetAfterSociete) {
      const projet = localStorage.getItem('selectedProjet');

      if (!projet) {
        setIsProjetDialogVisible(true);
      } else {
        router.push(targetHref);
      }

      setRequireProjetAfterSociete(false);
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
        href: '/societes',
      });
    }

     // Check for both ROLE_ADMIN (1) and ROLE_AGENT_ADMINISTRATIF (10)
    if (role <= User_roles.ROLE_ADMIN || role === User_roles.ROLE_AGENT_ADMINISTRATIF) {
      items.push(...getAdminItems());
    }
    
    if (role <= User_roles.ROLE_COMMERCIAL || role === User_roles.ROLE_AGENT_ADMINISTRATIF) {
      items.push({
        label: 'Projets',
        icon: <Briefcase size={20} />,
        href: '/projets',
        needsSociete: true && user.role == 1,
      });
    }

   // ⚠️ IMPORTANT: Séparez les items selon le rôle
  if (role <= User_roles.ROLE_COMMERCIAL || role === User_roles.ROLE_AGENT_ADMINISTRATIF) {
    items.push(...getCommercialItems());
  }
  
  // Items UNIQUEMENT pour le rôle commercial (pas pour admin ou super admin)
  if (role === User_roles.ROLE_COMMERCIAL) {
    items.push(...getCommercialOnlyItems());
  }


    // Check for both ROLE_ADMIN and ROLE_AGENT_ADMINISTRATIF
    if (role <= User_roles.ROLE_ADMIN || role === User_roles.ROLE_AGENT_ADMINISTRATIF) {
      items.push(...getAdditionalAdminItems());
    }
    if (role == User_roles.ROLE_SAV) {
      items.push(...getSavItems());
    }
    if (role == User_roles.ROLE_RESPO_LIVRAISON) {
      items.push(...getRespoLivraisonItems());
    }
    if (role == User_roles.ROLE_NOTAIRE) {
      items.push(...getNotaireItems());
    }
    if (role == User_roles.ROLE_COMPTABLE) {
      items.push(...getComptableItems());
    }
    if (role == User_roles.ROLE_AGENT_ADMINISTRATIF) {
      items.push(...getAgentAdminItems());
    }
    if (role == User_roles.ROLE_RESPO_COMMERCIAL) {
      items.push(...getRespoCommercialItems());
    }

    return items;
  };

  const getCommercialOnlyItems = () => [
  {
    label: 'Echéances Paiement',
    icon: <Split size={20} />,
    href: '/administration/echeance-tranches',
    needsProjet: true,
    needsSociete: user.role === 1,
  },
  {
    label: 'Etapes Projet',
    icon: <Cuboid size={20} />,
    href: '/etapes-projet',
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
  const getAdminItems = () => [
    {
      label: 'Utilisateurs',
      icon: <UsersRound size={20} />,
      href: '/utilisateurs',
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
          label: 'Etapes Projet',
          icon: <Cuboid size={20} />,
          href: '/etapes-projet',
          needsProjet: true,
          needsSociete: user.role == 1,
        },
        {
          label: 'Freins',
          icon: <AlertCircle size={20} />,
          href: '/administration/freins',
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
          label: 'Echéances Paiement',
          icon: <Split  size={20} />,
          href: '/administration/echeance-tranches',
          needsProjet: true,
          needsSociete: user.role == 1,
        },
        {
          label: 'Réseaux Sociaux',
          icon: <Share2 size={20} />,
          href: '/administration/config-socials',
          needsSociete: user.role === 1,
        },
        {
          label: 'Gestion Rôles',
          icon: <UserCog size={20} />,
          href: '/administration/gestion-roles',
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
      needsProjet: true,
    },
   
  ];

  const getRespoLivraisonItems = () => [
    {
      label: 'Projets',
      icon: <Briefcase size={20} />,
      href: '/projets',
      needsSociete: true && user.role == 1,
    },
    {
      label: 'Affectations',
      icon: <Send size={20} />,
      href: '/respoLivraison/affectation',
      needsSociete: user.role === 1,
      needsProjet: true,
    },
    {
      label: 'Suivi Notaire',
      icon: <Users />,
      children: [
        {
          label: 'Nouveaux Dossiers',
          icon: <Wrench />,
          href: '/notaire/nouveau-dossier',
          needsSociete: user.role === 1,
          needsProjet: true,
        },
        {
          label: 'Rendez Vous',
          icon: <Users />,
          href: '/notaire/Rendez-vous/rdv',
          needsProjet: true,
          needsSociete: user.role === 1,
        },
        {
          label: 'Attestation de Vente',
          icon: <FolderArchive />,
          href: '/notaire/attestations-vente',
          needsSociete: user.role === 1,
          needsProjet: true,
        },
        {
          label: 'Contrat de Vente',
          icon: <FolderCog2 />,
          href: '/notaire/contrats-vente',
          needsSociete: user.role === 1,
          needsProjet: true,
        },
        {
          label: 'Agenda',
          icon: <TimerIcon />,
          href: '/notaire/agenda',
          needsSociete: user.role === 1,
          needsProjet: false,
        },
      ],
    },
    {
      label: 'Etat Dossier',
      icon: <Workflow />,
      href: '/etat-dossiers',
      needsSociete: user.role === 1,
      needsProjet: true,
    },
    {
      label: 'Remise Des Clés',
      icon: <Percent size={20} />,
      href: '/remiseCles',
      needsSociete: user.role === 1,
      needsProjet: true,
    },
    {
      label: 'Historique Importation',
      icon: <History size={20} />,
      href: '/histo-importation',
      needsSociete: user.role === 1,
      needsProjet: true,
    },
     
    {
          label: 'Etapes Projet',
          icon: <Cuboid size={20} />,
          href: '/etapes-projet',
          needsProjet: true,
          needsSociete: user.role == 1,
    },
    
  ];

  const getSavItems = () => [
    {
      label: 'Services prestataire',
      icon: <Wrench />,
      href: '/sav/services',
      needsSociete: user.role === 1,
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
      {
          label: 'Etapes Projet',
          icon: <Cuboid size={20} />,
          href: '/etapes-projet',
          needsProjet: true,
          needsSociete: user.role == 1,
        },
   
  ];

  const getNotaireItems = () => [
    {
      label: 'Nouveaux Dossiers',
      icon: <Wrench />,
      href: '/notaire/nouveau-dossier',
      needsSociete: user.role === 1,
      needsProjet: true,
    },
    {
      label: 'Rendez Vous',
      icon: <Users />,
      href: '/notaire/Rendez-vous/rdv',
      needsProjet: true,
      needsSociete: user.role === 1,
    },
    {
      label: 'Attestation de Vente',
      icon: <FolderArchive />,
      href: '/notaire/attestations-vente',
      needsSociete: user.role === 1,
      needsProjet: true,
    },
    {
      label: 'Contrat Vente',
      icon: <FolderCog2 />,
      href: '/notaire/contrats-vente',
      needsSociete: user.role === 1,
      needsProjet: true,
    },
    {
      label: 'Agenda',
      icon: <TimerIcon />,
      href: '/notaire/agenda',
      needsSociete: user.role === 1,
      needsProjet: false,
    },
      {
          label: 'Etapes Projet',
          icon: <Cuboid size={20} />,
          href: '/etapes-projet',
          needsProjet: true,
          needsSociete: user.role == 1,
        },

  ];

  const getAgentAdminItems = () => [
    // Items à définir
  ];

  const getRespoCommercialItems = () => [
    {
      label: 'Projets',
      icon: <Briefcase size={20} />,
      href: '/projets',
      needsSociete: true && user.role == 1,
    },
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
      label: 'Echéances Paiement',
      icon: <Split  size={20} />,
      href: '/administration/echeance-tranches',
      needsProjet: true,
      needsSociete: user.role == 1,
    },
      {
          label: 'Etapes Projet',
          icon: <Cuboid size={20} />,
          href: '/etapes-projet',
          needsProjet: true,
          needsSociete: user.role == 1,
        },
         {
      label: 'Historique Importation',
      icon: <History size={20} />,
      href: '/histo-importation',
      needsSociete: user.role === 1,
      needsProjet: true,
    },
  ];

  const getComptableItems = () => [
    {
      label: 'Ventes',
      icon: <Handshake />,
      href: '/ventes',
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
      label: 'Echéances Paiement',
      icon: <Split  size={20} />,
      href: '/administration/echeance-tranches',
      needsProjet: true,
      needsSociete: user.role == 1,
    },
    {
      label: 'Etat Dossier',
      icon: <Workflow />,
      href: '/etat-dossiers',
      needsSociete: user.role === 1,
      needsProjet: true,
    },
    {
          label: 'Etapes Projet',
          icon: <Cuboid size={20} />,
          href: '/etapes-projet',
          needsProjet: true,
          needsSociete: user.role == 1,
    },
    {
          label: 'Rapport',
          icon: <FileBarChart size={20} />,
          href: '/comptabilite/rapports',
          needsProjet: true,
          needsSociete: user.role == 1,
    },
    {
      label: 'Statistiques',
      icon: <BarChart4 size={20} />,
      href: '/statistiques',
      needsProjet: true,
      needsSociete: user.role === 1,
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
    {
      label: 'Remise Des Clés',
      icon: <Percent size={20} />,
      href: '/remiseCles',
      needsSociete: user.role === 1,
      needsProjet: true,
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
      href: '/statistiques',
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
    {
      label: 'Messaegerie Whatsapp',
      icon: <UsersRound size={20} />,
      href: '/whatsapp-messenger',
      needsSociete: user.role === 1,
    },
  ];

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const handleLinkClick = (e, item) => {
    const societe = localStorage.getItem('selectedSociete');
    const projet = localStorage.getItem('selectedProjet');
    const role = user?.role;

    const needsSociete = typeof item.needsSociete === 'function' 
      ? item.needsSociete(role) 
      : item.needsSociete ?? false;

    const needsProjet = typeof item.needsProjet === 'function' 
      ? item.needsProjet(role) 
      : item.needsProjet ?? false;

    if (needsSociete && !societe) {
      e.preventDefault();
      setTargetHref(item.href);
      setIsModalVisible(true);
      if (needsProjet && !projet) {
        setRequireProjetAfterSociete(true);
      }
      return;
    }

    if (needsProjet && !projet) {
      e.preventDefault();
      setTargetHref(item.href);
      setIsProjetDialogVisible(true);
      return;
    }

    // Si toutes les conditions sont remplies, la navigation se fait via le Link
  };

  const handleChildLinkClick = (e, child) => {
    const societe = localStorage.getItem('selectedSociete');
    const projet = localStorage.getItem('selectedProjet');
    const role = user?.role;

    const needsSociete = typeof child.needsSociete === 'function' 
      ? child.needsSociete(role) 
      : child.needsSociete ?? false;

    const needsProjet = typeof child.needsProjet === 'function' 
      ? child.needsProjet(role) 
      : child.needsProjet ?? false;

    if (needsSociete && !societe) {
      e.preventDefault();
      setTargetHref(child.href);
      setIsModalVisible(true);
      if (needsProjet && !projet) {
        setRequireProjetAfterSociete(true);
      }
      return;
    }

    if (needsProjet && !projet) {
      e.preventDefault();
      setTargetHref(child.href);
      setIsProjetDialogVisible(true);
      return;
    }

    // Si toutes les conditions sont remplies, la navigation se fait via le Link
  };

  return (
    <>
      {/* Desktop Menu - Unchanged */}
      <div className="hidden sm:block">
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
                        <Link
                          key={childIndex}
                          href={child.href}
                          onClick={(e) => handleChildLinkClick(e, child)}
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
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Item sans enfants
                <Link
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item)}
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
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Toggle Button - Floating Action Button (FAB) */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="sm:hidden fixed bottom-6 right-6 z-50 p-4 bg-[#231651] rounded-full shadow-lg hover:bg-[#1a1040] transition-all duration-300 transform hover:scale-105"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <MenuIcon size={24} className="text-white" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu - Slide in from bottom */}
      <div
        className={`sm:hidden fixed left-0 right-0 bottom-0 bg-[#1a1040] rounded-t-2xl shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '70vh' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
        </div>
        <div className="overflow-y-auto p-4 pb-6" style={{ maxHeight: '70vh' }}>
          <div className="text-sm font-semibold !text-gray-200">
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.children ? (
                  <div>
                    <div
                      onClick={() => toggleDropdown(index)}
                      className={`flex items-center justify-between p-3 mt-1 mb-1 cursor-pointer rounded-lg ${
                        pathname.startsWith(item.href)
                          ? 'bg-active text-[#231651]'
                          : 'hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 flex items-center justify-center ${pathname.startsWith(item.href) ? 'text-[#231651]' : 'text-white'}`}>
                          {item.icon}
                        </span>
                        <span className={pathname.startsWith(item.href) ? 'text-[#231651]' : 'text-white'}>
                          {item.label}
                        </span>
                      </div>
                      <span className="w-4 h-4 flex justify-start items-center">
                        {openDropdown === index ? (
                          <ChevronDown size={18} className={pathname.startsWith(item.href) ? 'text-[#231651]' : 'text-white'} />
                        ) : (
                          <ChevronRight size={18} className={pathname.startsWith(item.href) ? 'text-[#231651]' : 'text-white'} />
                        )}
                      </span>
                    </div>

                    {openDropdown === index && (
                      <div className="pl-4">
                        {item.children.map((child, childIndex) => (
                          <Link
                            key={childIndex}
                            href={child.href}
                            onClick={(e) => {
                              handleChildLinkClick(e, child);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`flex items-center gap-3 p-2.5 mt-1 cursor-pointer rounded-lg ${
                              pathname === child.href
                                ? 'bg-active text-[#231651]'
                                : 'hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <span className={`w-[18px] h-[18px] flex justify-center items-center text-xl ${pathname === child.href ? 'text-[#231651]' : 'text-white'}`}>
                              {child.icon}
                            </span>
                            <span className={pathname === child.href ? 'text-[#231651]' : 'text-white'}>
                              {child.label}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      handleLinkClick(e, item);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 p-3 mt-1 cursor-pointer rounded-lg ${
                      pathname.startsWith(item.href)
                        ? 'bg-active text-[#231651]'
                        : 'hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className={`w-6 h-6 flex justify-start items-center text-xl ${pathname.startsWith(item.href) ? 'text-[#231651]' : 'text-white'}`}>
                      {item.icon}
                    </span>
                    <span className={pathname.startsWith(item.href) ? 'text-[#231651]' : 'text-white'}>
                      {item.label}
                    </span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

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
            router.push(targetHref);
          }}
        />
      )}
    </>
  );
};



export default Menu;
