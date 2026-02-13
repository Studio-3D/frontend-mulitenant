import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  LayoutDashboard,
  FolderPlus,
  Calendar,
  FileText,
  Users,
  FileSignature,
  ScrollText,
  CalendarDays,
  ArrowRight,
  Key,
  Projector,
  TrendingUp,
  CreditCard,
  Building,
  AlertTriangle,
  Briefcase,
  Send,
  Clock,
} from 'lucide-react'
import ProjetDialog from './ProjetDialog'
import { useProjet } from '@/context/ProjetContext'
import { useRouter } from "next/navigation"

const serif = {
  fontFamily: 'Georgia, serif',
}

// Menus par rôle avec URLs
const MENU_BY_ROLE = {
  5: [
    {
      title: 'Nouveau dossier',
      description: 'Ouvrir un dossier pour la préparation d\'un acte notarié.',
      icon: FolderPlus,
      bgColor: 'bg-blue-600',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      url: '/notaire/nouveau-dossier',
      needsProjet: true,
    },
    {
      title: 'Rendez-vous',
      description: "Gérer les rendez-vous clients et les signatures d'actes.",
      icon: Users,
      bgColor: 'bg-emerald-600',
      textColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      url: '/notaire/Rendez-vous/rdv',
      needsProjet: true,
    },
    {
      title: 'Compromis de vente',
      description: 'Rédiger et gérer les avant-contrats et promesses de vente.',
      icon: FileSignature,
      bgColor: 'bg-amber-600',
      textColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      url: '/compromis-vente',
      needsProjet: true,
    },
    {
      title: 'Contrat de vente',
      description: 'Finaliser les actes authentiques de vente immobilière.',
      icon: ScrollText,
      bgColor: 'bg-purple-600',
      textColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
      url: '/notaire/contrats-vente',
      needsProjet: true,
    },
    {
      title: 'Agenda',
      description: "Consulter le planning de l'étude et les échéances importantes.",
      icon: CalendarDays,
      bgColor: 'bg-rose-600',
      textColor: 'text-rose-600',
      iconBg: 'bg-rose-50',
      url: '/notaire/agenda',
      needsProjet: false,
    }
  ],
  6: [
    {
      title: 'Projets',
      description: 'Gestion des projets immobiliers en cours.',
      icon: Projector,
      bgColor: 'bg-indigo-600',
      textColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      url: '/projets',
      needsProjet: false,
    },
    {
      title: 'Affectations',
      description: 'Assigner des dossiers aux membres de l\'équipe.',
      icon: Send,
      bgColor: 'bg-cyan-600',
      textColor: 'text-cyan-600',
      iconBg: 'bg-cyan-50',
      url: '/respoLivraison/affectation',
      needsProjet: true,
    },
   
    {
      title: 'Rendez-vous',
      description: 'Planifier et gérer les rendez-vous clients.',
      icon: Users,
      bgColor: 'bg-emerald-600',
      textColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      url: '/notaire/Rendez-vous/rdv',
      needsProjet: true,
    },
    {
      title: 'Compromis de vente',
      description: 'Gérer les avant-contrats de vente.',
      icon: FileSignature,
      bgColor: 'bg-amber-600',
      textColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      url: '/compromis-vente',
      needsProjet: true,
    },
    {
      title: 'Contrat de vente',
      description: 'Finaliser les actes de vente authentiques.',
      icon: ScrollText,
      bgColor: 'bg-purple-600',
      textColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
      url: '/notaire/contrats-vente',
      needsProjet: true,
    },
    {
      title: 'Agenda',
      description: 'Agenda complet de l\'étude.',
      icon: CalendarDays,
      bgColor: 'bg-rose-600',
      textColor: 'text-rose-600',
      iconBg: 'bg-rose-50',
      url: '/notaire/agenda',
      needsProjet: false,
    },
    {
      title: 'Remise des clés',
      description: 'Gérer les procédures de remise des clés.',
      icon: Key,
      bgColor: 'bg-orange-600',
      textColor: 'text-orange-600',
      iconBg: 'bg-orange-50',
      url: '/remiseCles',
      needsProjet: true,
    },
    {
      title: 'Historique Importation',
      description: 'Gérer les historiques des importations.',
      icon: Clock,
      bgColor: 'bg-red-600',
      textColor: 'text-red-600',
      iconBg: 'bg-red-50',
      url: '/histo-importation',
      needsProjet: true,
    }
  ],
  7: [
    {
      title: 'Comptabilité',
      description: 'Gestion complète de la comptabilité de l\'étude.',
      icon: TrendingUp,
      bgColor: 'bg-teal-600',
      textColor: 'text-teal-600',
      iconBg: 'bg-teal-50',
      url: '/comptabilite',
      needsProjet: true,
    },
    {
      title: 'Encaissements',
      description: 'Suivi et gestion des encaissements clients.',
      icon: CreditCard,
      bgColor: 'bg-lime-600',
      textColor: 'text-lime-600',
      iconBg: 'bg-lime-50',
      url: '/encaissements',
      needsProjet: true,
    },
  ],
  8: [
    {
      title: 'Services prestataire',
      description: 'Gestion des services prestataires externes.',
      icon: Briefcase,
      bgColor: 'bg-fuchsia-600',
      textColor: 'text-fuchsia-600',
      iconBg: 'bg-fuchsia-50',
      url: '/sav/services',
      needsProjet: true,
    },
    {
      title: 'Prestataires',
      description: 'Annuaire et gestion des prestataires partenaires.',
      icon: Building,
      bgColor: 'bg-amber-600',
      textColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      url: '/sav/prestataires',
      needsProjet: true,
    },
    {
      title: 'Réclamations',
      description: 'Suivi et traitement des réclamations clients.',
      icon: AlertTriangle,
      bgColor: 'bg-red-600',
      textColor: 'text-red-600',
      iconBg: 'bg-red-50',
      url: '/sav/reclamations',
      needsProjet: true,
    },
  ],
  9: [
    {
      title: 'CRM',
      description: 'Gestion de la relation client complète.',
      icon: Users,
      bgColor: 'bg-blue-600',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      url: '/crm',
      needsProjet: true,
    },
    {
      title: 'Vente',
      description: 'Suivi des opportunités et pipeline de vente.',
      icon: TrendingUp,
      bgColor: 'bg-green-600',
      textColor: 'text-green-600',
      iconBg: 'bg-green-50',
      url: '/ventes',
      needsProjet: true,
    },
  ]
}

// Titres par rôle
const ROLE_TITLES = {
  5: 'Menu Notaire',
  6: 'Menu Respo Livraison',
  7: 'Menu Comptabilité',
  8: 'Menu Sav',
  9: 'Menu Respo Commercial'
}

function MenuCard({
  title,
  description,
  icon: Icon,
  bgColor,
  textColor,
  iconBg,
  url,
  delay = 0,
  needsProjet = true,
  onClick,
}) {
  const { selectedProjet } = useProjet()
  const [showProjetDialog, setShowProjetDialog] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleCardClick = (e) => {
    e.preventDefault()
    
    // Si un gestionnaire onClick est fourni, l'utiliser
    if (onClick) {
      onClick(url, needsProjet)
      return
    }

    // Vérifier si un projet est nécessaire mais non sélectionné
    if (needsProjet && !selectedProjet && !localStorage.getItem('selectedProjet')) {
      setShowProjetDialog(true)
      return
    }

    // Navigation directe
    window.location.href = url
  }

  // Déterminer si le lien doit être désactivé
  const isDisabled = needsProjet && !selectedProjet && !localStorage.getItem('selectedProjet')

  return (
    <>
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          delay,
          ease: 'easeOut',
        }}
        className={`group relative bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
          isDisabled 
            ? 'opacity-60 cursor-not-allowed' 
            : 'cursor-pointer'
        }`}
        onClick={!isDisabled ? handleCardClick : undefined}
        onMouseEnter={() => !isDisabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150 ${bgColor}`}
        />
        <div className="relative z-10">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 ${iconBg}`}
          >
            <Icon className={`w-6 h-6 ${textColor}`} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2" style={serif}>
            {title}
          </h3>
          <p className="text-sm text-slate-500 mb-5 leading-relaxed">
            {description}
          </p>
          {isDisabled ? (
            <div className="flex items-center text-sm font-medium text-slate-400">
              <span className="text-amber-600 mr-2">⚠</span>
              Sélectionnez un projet d{"'"}abord
            </div>
          ) : (
            <div className="flex items-center text-sm font-medium text-slate-700 group-hover:text-amber-600 transition-colors">
              <Link 
                href={url} 
                className="flex items-center"
                onClick={(e) => {
                  // Empêcher la navigation directe si un projet est nécessaire
                  if (needsProjet && !selectedProjet && !localStorage.getItem('selectedProjet')) {
                    e.preventDefault()
                    setShowProjetDialog(true)
                  }
                }}
              >
                Accéder
                <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      {/* Dialog pour sélectionner un projet */}
      {showProjetDialog && (
        <ProjetDialog
          open={showProjetDialog}
          onClose={() => setShowProjetDialog(false)}
          onSelect={() => {
            setShowProjetDialog(false)
            // Naviguer après la sélection
            window.location.href = url
          }}
        />
      )}
    </>
  )
}

export const Dashboard_Menu = ({ userRole, name, onMenuClick }) => {
  const router = useRouter()
  const { selectedProjet, projets } = useProjet()
  const [showProjetDialog, setShowProjetDialog] = useState(false)
  const [initialCheckDone, setInitialCheckDone] = useState(false)

  const menuItems = MENU_BY_ROLE[userRole] || MENU_BY_ROLE[5]
  const roleTitle = ROLE_TITLES[userRole] || ROLE_TITLES[5]

  useEffect(() => {
    if (!userRole) {
      router.push("/login")
      return
    }

    // Vérifier si un projet est nécessaire pour l'utilisateur actuel
    const shouldRequireProjet = userRole >= 5 && userRole <= 9 // Rôles 5-9 nécessitent un projet
    
    if (shouldRequireProjet && !selectedProjet && !localStorage.getItem('selectedProjet') && !showProjetDialog && !initialCheckDone) {
      setShowProjetDialog(true)
      setInitialCheckDone(true)
    }
  }, [router, selectedProjet, showProjetDialog, userRole, initialCheckDone])

  const handleMenuClick = (url, needsProjet = true) => {
    // Si un gestionnaire parent est fourni, l'utiliser
    if (onMenuClick) {
      onMenuClick(url, needsProjet)
      return
    }

    // Vérifier si un projet est nécessaire mais non sélectionné
    if (needsProjet && !selectedProjet && !localStorage.getItem('selectedProjet')) {
      setShowProjetDialog(true)
      return
    }

    // Navigation
    router.push(url)
  }

  // Afficher le dialog de projet si nécessaire
  if (showProjetDialog) {
    return (
      <ProjetDialog
        open={showProjetDialog}
        onClose={() => {
          setShowProjetDialog(false)
          // Si l'utilisateur annule, le rediriger vers le tableau de bord
          if (!selectedProjet && !localStorage.getItem('selectedProjet')) {
            router.push('/tableau-de-bord')
          }
        }}
        projets={projets}
        onSelect={() => {
          setShowProjetDialog(false)
        }}
      />
    )
  }

  return (
    <div className="bg-slate-50 text-slate-900">
      <main className="min-h-screen">
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            {/* Welcome */}
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-light text-slate-900 mb-2">
                Bonjour, <span className="font-semibold">{name}</span>
              </h2>
              
              {selectedProjet || localStorage.getItem('selectedProjet') ? (
               <></>
              ) : (
                <div className="mt-2 inline-block px-4 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                  Sélectionnez un projet pour continuer
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
             
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {menuItems.map((item, i) => (
                  <MenuCard 
                    key={`${item.title}-${i}`} 
                    {...item} 
                    delay={i * 0.1}
                    onClick={() => handleMenuClick(item.url, item.needsProjet)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}