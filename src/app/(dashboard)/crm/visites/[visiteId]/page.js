"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import CRMNavbar from '@/components/CRMNavbar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  VISITE_INTERETS, 
  VISITE_STATUT,
  VISITE_TYPE_NOTIF,
  ORIENTATIONS
} from '@/configs/enum';

export default function VisiteDetailsPage({ params }) {
  const router = useRouter();
  const { visiteId } = params;
  const [visite, setVisite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVisiteDetails = async () => {
      if (!visiteId) return;
      
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${APIURL.VISITES}/${visiteId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setVisite(response.data.visite);
      } catch (err) {
        console.error("Error fetching visite details:", err);
        setError("Impossible de récupérer les détails de la visite");
      } finally {
        setLoading(false);
      }
    };

    fetchVisiteDetails();
  }, [visiteId]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'PPP', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'PPP à HH:mm', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const statusInfo = VISITE_STATUT[status] || { label: 'Inconnu', color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getInterestBadge = (interest) => {
    const interestInfo = VISITE_INTERETS[interest] || { label: 'Inconnu', color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${interestInfo.color}`}>
        {interestInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <CRMNavbar />
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !visite) {
    return (
      <div className="container mx-auto px-4">
        <CRMNavbar />
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error || "Visite non trouvée"}</p>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => router.push('/CRM/Visites')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <CRMNavbar />

      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Détails de la visite</h1>
          <div className="space-x-2">
            <button 
              onClick={() => router.push(`/CRM/Visites/edit/${visiteId}`)}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              Modifier
            </button>
            <button 
              onClick={() => router.push('/CRM/Visites')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retour à la liste
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visite Information */}
          <div className="col-span-2">
            <h2 className="text-lg font-medium border-b pb-2 mb-4">Informations de la visite</h2>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Date de la visite</p>
            <p className="mt-1">{formatDate(visite.date)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Intérêt</p>
            <p className="mt-1">{getInterestBadge(visite.interet)}</p>
          </div>

          {visite.statut && (
            <div>
              <p className="text-sm font-medium text-gray-500">Statut</p>
              <p className="mt-1">{getStatusBadge(visite.statut)}</p>
            </div>
          )}

          {visite.rdv && (
            <div>
              <p className="text-sm font-medium text-gray-500">Rendez-vous</p>
              <p className="mt-1">{formatDateTime(visite.rdv)}</p>
            </div>
          )}

          {visite.date_relance && (
            <div>
              <p className="text-sm font-medium text-gray-500">Date de relance</p>
              <p className="mt-1">{formatDate(visite.date_relance)}</p>
            </div>
          )}

          {visite.mode_relance && (
            <div>
              <p className="text-sm font-medium text-gray-500">Mode de relance</p>
              <p className="mt-1">{VISITE_TYPE_NOTIF[visite.mode_relance]?.label || visite.mode_relance}</p>
            </div>
          )}

          {visite.bien && (
            <div>
              <p className="text-sm font-medium text-gray-500">Bien</p>
              <p className="mt-1">{visite.propriete_dite_bien || '-'}</p>
            </div>
          )}

          {visite.prix && (
            <div>
              <p className="text-sm font-medium text-gray-500">Prix</p>
              <p className="mt-1">{visite.prix.toLocaleString()} DH</p>
            </div>
          )}

          {/* Display freins information if interet is 3 (Perdu) */}
          {visite.interet === 3 && visite.frein && (
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">Freins</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {visite.frein.map((frein, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {frein}
                  </span>
                ))}
              </div>
            </div>
          )}

          {visite.description_autre && (
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">Description autre frein</p>
              <p className="mt-1">{visite.description_autre}</p>
            </div>
          )}

          {visite.commentaire && (
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">Commentaire</p>
              <p className="mt-1">{visite.commentaire}</p>
            </div>
          )}

          {/* Prospect Information */}
          <div className="col-span-2 mt-8">
            <h2 className="text-lg font-medium border-b pb-2 mb-4">Informations du prospect</h2>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Nom complet</p>
            <p className="mt-1">{`${visite.nom || ''} ${visite.prenom || ''}`}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">CIN</p>
            <p className="mt-1">{visite.cin || '-'}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="mt-1">{visite.email || '-'}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Téléphone</p>
            <p className="mt-1">
              {visite.telephone || '-'}
              {visite.telephone2 && ` / ${visite.telephone2}`}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Ville</p>
            <p className="mt-1">{visite.ville || '-'}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Source</p>
            <p className="mt-1">{visite.source?.source || '-'}</p>
          </div>

          {visite.source?.source === 'Partenaire' && visite.partenaire && (
            <div>
              <p className="text-sm font-medium text-gray-500">Partenaire</p>
              <p className="mt-1">{visite.partenaire.description || '-'}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-500">Accepte d'être contacté</p>
            <p className="mt-1">{visite.notifie === 1 ? 'Oui' : 'Non'}</p>
          </div>

          {/* Commercial Information */}
          <div className="col-span-2 mt-8">
            <h2 className="text-lg font-medium border-b pb-2 mb-4">Commercial</h2>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Nom complet</p>
            <p className="mt-1">{`${visite.nom_cc || ''} ${visite.prenom_cc || ''}`}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Créé le</p>
            <p className="mt-1">{formatDateTime(visite.created_at)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Dernière modification</p>
            <p className="mt-1">{formatDateTime(visite.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
