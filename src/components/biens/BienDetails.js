'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Pencil,
  ArrowLeft,
  Building,
  Home,
  MapPin,
  Tag,
  Euro,
  FileText,
  AlignLeft,
  Files,
  CreditCard,
  Receipt,
  Image,
  EyeIcon,
} from 'lucide-react';
import { getEtatLabel, getOrientationLabelFromAbbreviation, isAgentAdministratif, isNotaire, isRespoCommercial, isRespoLivraison } from '@/configs/enum';
import BienSuperficies from './BienSuperficies';
import BienComposition from './BienComposition';
import BienDescriptionGenerator from './BienDescriptionGenerator';
import BienDossiers from './BienDossiers';
import BienTvaCollecte from './BienTvaCollecte';
import BienMedia from './BienMedia';
import { useProjet } from '@/context/ProjetContext';
import { isAdmin, isSuperAdmin ,isCommercial,isComptable} from '@/configs/enum';

import BreadCrumb from '@/app/(dashboard)/navigation/BreadCrumb';
import EncaissementTable from '@/app/(dashboard)/encaissements/EncaissementTable';
import { useSociete } from '@/context/SocieteContext';
export default function BienDetails({ id }) {
  const [bien, setBien] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('superficies');
  const [bienDescription, setBienDescription] = useState('');
  const router = useRouter();
  const { user } = useAuth();
  const { selectedProjet } = useProjet();
   const { selectedSociete } = useSociete();
  // Only admins and super admins can edit properties
  const canEditBien = user?.role === 1 || user?.role === 2|| user?.role === 10;

  const userRole = user?.role;
      
        useEffect(() => {
          if (
            user && 
            !isAdmin(userRole) &&
            !isSuperAdmin(userRole) &&
            !isCommercial(userRole)&&
            !isComptable(userRole)&&
            !isRespoLivraison(userRole)&&
            !isRespoCommercial(userRole)&&
            !isNotaire(userRole)&&
            !isAgentAdministratif(userRole)
          ) {
            router.push('/');
          }
        }, [user, userRole, router]);
  // Read breadcrumb context for names without fetching
  // Simple cache et comparaison
  const [oldProjetId, setOldProjetId] = useState(null);

  useEffect(() => {
    if (selectedProjet?.id && selectedProjet.id !== oldProjetId) {
      if (oldProjetId) {
        // Projet a changé
        console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet.id}`);
        router.push('/projets/' + selectedProjet.id);
      }
      setOldProjetId(selectedProjet.id);
    }
  }, [selectedProjet?.id, oldProjetId, router]);
    const [oldSocieteId, setOldSocieteId] = useState(null);
  	 useEffect(() => {
  if ((selectedSociete?.id && selectedSociete?.id !== oldSocieteId)) {
    if (oldSocieteId) {
      // Projet ou société a changé
      router.push('/projets');
    }
    setOldSocieteId(selectedSociete?.id)
  }
}, [selectedSociete?.id, oldSocieteId, router]);

  useEffect(() => {
    const fetchBienDetails = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${APIURL.BIENS}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.bien) {
          setBien(response.data.bien);
          setBienDescription(response.data.bien.description || '');

          // If the property belongs to a project, store the project in localStorage
          if (response.data.bien.projet_id) {
            try {
              const projectResponse = await axios.get(
                `${APIURL.PROJETS}/${response.data.bien.projet_id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (projectResponse.data && projectResponse.data.projet) {
                localStorage.setItem(
                  'selectedProjet',
                  JSON.stringify(projectResponse.data.projet)
                );
              }
            } catch (err) {
              console.error('Error fetching project details:', err);
            }
          }
        } else {
          setError('Bien non trouvé');
        }
      } catch (err) {
        console.error('Error fetching bien details:', err);
        setError(
          err.response?.data?.message || 'Erreur lors du chargement du bien'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBienDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-500 !text-red-700">
        <p className="font-medium">Erreur</p>
        <p>{error}</p>
        <Link
          href="/biens"
          className="text-blue-500 hover:underline mt-2 inline-block"
        >
          Retour à la liste des biens
        </Link>
      </div>
    );
  }

  // Format price with thousand separators
  const formatPrice = (price) => {
    return price ? price.toLocaleString('fr-FR') + ' Dhs' : '';
  };

  // Get the status badge with proper formatting
  const getStatusBadge = (etat) => {
    const statusClasses = {
      DISPONIBLE: 'bg-green-100 !text-green-800 border border-green-300',
      PRE_RESERVATION:
        'bg-yellow-100 !text-yellow-800 border border-yellow-300',
      RESERVATION: 'bg-blue-100 !text-blue-800 border border-blue-300',
      BLOQUE: 'bg-red-100 !text-red-800 border border-red-300',
      VENDU: 'bg-purple-100 text-purple-800 border border-purple-300',
      ENCOURS_DE_PROPOSITION:
        'bg-orange-100 text-orange-800 border border-orange-300',
    };

    return (
      <span
        className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
          statusClasses[etat] || 'bg-gray-100 !text-gray-800'
        }`}
      >
        {getEtatLabel(etat)}
      </span>
    );
  };

  // Define tabs with description - ADD media tab
  const tabs = [
    {
      id: 'superficies',
      label: 'Superficies',
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      id: 'composition',
      label: 'Composition',
      icon: <Home className="w-4 h-4" />,
    },
    { id: 'media', label: 'Médias', icon: <Image className="w-4 h-4" /> },
    { id: 'dossiers', label: 'Dossiers', icon: <Files className="w-4 h-4" /> },
    {
      id: 'encaissements',
      label: 'Encaissements',
      icon: <CreditCard className="w-4 h-4" />,
    },
  ];
  if (bien.etat == 'RESERVATION') {
    tabs.push({
      id: 'tva_collecte',
      label: 'TVA Collecté',
      icon: <Receipt className="w-4 h-4" />,
    });
  }

  // Render the appropriate content for the active tab - ADD media case
  const renderTabContent = () => {
    switch (activeTab) {
      case 'superficies':
        return <BienSuperficies bien={bien} />;
      case 'composition':
        return <BienComposition bien={bien} />;
      case 'media':
        return <BienMedia bienId={id} />;
      case 'dossiers':
        return <BienDossiers bienId={id} />;
      case 'encaissements':
        return <EncaissementTable bien_id={id} />;
      case 'tva_collecte':
        return <BienTvaCollecte bienId={id} bien={bien} />;
      default:
        return <BienSuperficies bien={bien} />;
    }
  };

  // Helper function to render avatar with icon
  const renderIconAvatar = (icon, bgColor = 'bg-blue-100') => (
    <div
      className={`flex items-center justify-center w-8 h-8 rounded-full ${bgColor} !text-blue-600 flex-shrink-0`}
    >
      {icon}
    </div>
  );

  const handleView_Reservation = (reservationId) => {
    window.open(`/ventes/reservations/${reservationId}`, '_blank');
  };

  return (
    <div className=" ">
      <div className="space-y-6 ">
        {/* Header with actions - Redesigned with professional white background */}
        <div className="mb-1">
          <BreadCrumb
            onRoot={{ href: '/projets' }}
            items={[
              bien.projet
                ? { label: bien.projet.nom, href: `/projets/${bien.projet_id}` }
                : null,
              bien.tranche
                ? {
                    label: bien.tranche.nom,
                    href: `/tranches/${bien.tranche_id}`,
                  }
                : null,
              bien.bloc
                ? { label: bien.bloc.nom, href: `/blocs/${bien.bloc_id}` }
                : null,
              bien.immeuble
                ? {
                    label: bien.immeuble.nom,
                    href: `/immeubles/${bien.immeuble_id}`,
                  }
                : null,
              { label: bien.propriete_dite_bien },
            ].filter(Boolean)}
          />
        </div>
        <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-gray-800">
                {bien.propriete_dite_bien}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* État actuel badge */}

              {getStatusBadge(bien.etat)}
              {bien.etat == 'RESERVATION' && (
                <button
                  title="Détail du Réservation"
                  onClick={() => handleView_Reservation(bien?.reservation?.id)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <EyeIcon className="h-5 w-5 text-gray-700" />
                </button>
              )}

              {/* Partager button */}
              {canEditBien && (
                <BienDescriptionGenerator
                  bien={bien}
                  onDescriptionSaved={(desc) => setBienDescription(desc)}
                  buttonText="Partager"
                />
              )}

              {/* Modifier button */}
              {canEditBien && (
                <Link
                  href={`/biens/${id}/modifier`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Pencil className="w-4 h-4" />
                  Modifier
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* General info section */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="border-b border-gray-200 px-4 py-2">
            <h2 className="text-base font-medium text-gray-800">
              Informations générales
            </h2>
          </div>

          <div className="p-3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {/* Basic information */}
              <div className="flex items-start gap-2">
                {renderIconAvatar(
                  <Home className="w-4 h-4" />,
                  'bg-indigo-100'
                )}
                <div className="min-w-0">
                  <h3 className="text-xs font-medium !text-gray-500">Numéro</h3>
                  <p className="mt-0.5 font-semibold text-sm truncate">
                    {bien.numero || ''}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                {renderIconAvatar(
                  <Building className="w-4 h-4" />,
                  'bg-purple-100'
                )}
                <div className="min-w-0">
                  <h3 className="text-xs font-medium !text-gray-500">
                    Type de bien
                  </h3>
                  <p className="mt-0.5 font-semibold text-sm truncate">
                    {bien.type_bien?.type || ''}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                {renderIconAvatar(<Tag className="w-4 h-4" />, 'bg-teal-100')}
                <div className="min-w-0">
                  <h3 className="text-xs font-medium !text-gray-500">
                    Typologie
                  </h3>
                  <p className="mt-0.5 font-semibold text-sm truncate">
                    {bien.typologie?.typologie || ''}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                {renderIconAvatar(
                  <MapPin className="w-4 h-4" />,
                  'bg-amber-100'
                )}
                <div className="min-w-0">
                  <h3 className="text-xs font-medium !text-gray-500">Niveau</h3>
                  <p className="mt-0.5 font-semibold text-sm">
                    {bien.niveau !== null
                      ? bien.niveau == 0
                        ? 'RDC'
                        : bien.niveau == 1
                        ? '1er étage'
                        : `${bien.niveau}ème étage`
                      : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                {renderIconAvatar(<Euro className="w-4 h-4" />, 'bg-green-200')}
                <div className="min-w-0">
                  <h3 className="text-xs font-medium !text-gray-500">Prix</h3>
                  <p className="mt-0.5 font-semibold text-sm !text-green-600 truncate">
                    {formatPrice(bien.prix)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                {renderIconAvatar(
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>,
                  'bg-pink-100'
                )}
                <div className="min-w-0">
                  <h3 className="text-xs font-medium !text-gray-500">
                    Orientation
                  </h3>
                  <p className="mt-0.5 font-semibold text-sm truncate">
                    {bien.orientation
                      ? getOrientationLabelFromAbbreviation(bien.orientation)
                      : ''}
                  </p>
                </div>
              </div>

              {/* Prix unitaire */}
              <div className="flex items-start gap-2">
                {renderIconAvatar(
                  <Euro className="w-4 h-4" />,
                  'bg-purple-100'
                )}
                <div className="min-w-0">
                  <h3 className="text-xs font-medium !text-gray-500">
                    Prix unitaire
                  </h3>
                  <p className="mt-0.5 font-semibold text-sm text-purple-600 truncate">
                    {formatPrice(bien.prix_unitaire)}
                  </p>
                </div>
              </div>

              {/* Avance minimale */}
              <div className="flex items-start gap-2">
                {renderIconAvatar(<Euro className="w-4 h-4" />, 'bg-amber-100')}
                <div className="min-w-0">
                  <h3 className="text-xs font-medium !text-gray-500">
                    Avance minimale
                  </h3>
                  <p className="mt-0.5 font-semibold text-sm text-amber-700 truncate">
                    {formatPrice(bien.avance_minimale)}
                  </p>
                </div>
              </div>

              {/* Nombre de façades */}
              <div className="flex items-start gap-2">
                {renderIconAvatar(
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>,
                  'bg-blue-100'
                )}
                <div className="min-w-0">
                  <h3 className="text-xs font-medium !text-gray-500">
                    Nombre de façades
                  </h3>
                  <p className="mt-0.5 font-semibold text-sm">
                    {bien.nbre_facades || ''}
                  </p>
                </div>
              </div>

              {/* Vue */}
              {bien.vue && (
                <div className="flex items-start gap-2">
                  {renderIconAvatar(
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="M15 3h6v6" />
                      <path d="M10 14 21 3" />
                      <path d="M19 10v11H3V5h11" />
                    </svg>,
                    'bg-cyan-100'
                  )}
                  <div className="min-w-0">
                    <h3 className="text-xs font-medium !text-gray-500">Vue</h3>
                    <p className="mt-0.5 font-semibold text-sm truncate">
                      {bien.vue.vue}
                    </p>
                  </div>
                </div>
              )}

              {bien.titre_foncier && (
                <div className="flex items-start gap-2">
                  {renderIconAvatar(
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <path d="M7 9h10" />
                      <path d="M7 13h10" />
                      <path d="M7 17h4" />
                    </svg>,
                    'bg-orange-100'
                  )}
                  <div className="min-w-0">
                    <h3 className="text-xs font-medium !text-gray-500">
                      Titre foncier
                    </h3>
                    <p className="mt-0.5 font-semibold text-sm truncate">
                      {bien.titre_foncier}
                    </p>
                  </div>
                </div>
              )}

              {/* Conventionné */}
              <div className="flex items-start gap-2">
                {renderIconAvatar(
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>,
                  bien.conventionne ? 'bg-green-200' : 'bg-red-200'
                )}
                <div className="min-w-0">
                  <h3 className="text-xs font-medium !text-gray-500">
                    Conventionné
                  </h3>
                  <p
                    className={`mt-0.5 font-semibold text-sm ${
                      bien.conventionne ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {bien.conventionne ? 'Oui' : 'Non'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation for other content */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 !text-blue-600 bg-blue-50'
                      : 'border-transparent !text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}
