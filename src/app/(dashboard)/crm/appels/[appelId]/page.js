"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import CRMNavbar from '@/components/CRMNavbar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { VISITE_INTERETS, VISITE_TYPE_NOTIF } from '@/configs/enum';

// Define types of calls enum
const TYPES_APPELS = {
  1: { code: 1, label: 'Entrant' },
  2: { code: 2, label: 'Sortant' }
};

export default function AppelDetailsPage({ params }) {
  const router = useRouter();
  const { appelId } = params;
  const [appel, setAppel] = useState(null);
  const [traitements, setTraitements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppelDetails = async () => {
      if (!appelId) return;
      
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${APIURL.APPELS}/${appelId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setAppel(response.data.appel);
        
        // Fetch the appel traitements history
        const traitementsResponse = await axios.get(`${APIURL.ROOT}/v1/get_traitements_appel/${appelId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTraitements(traitementsResponse.data.traitements || []);
      } catch (err) {
        console.error("Error fetching appel details:", err);
        setError("Impossible de récupérer les détails de l'appel");
      } finally {
        setLoading(false);
      }
    };

    fetchAppelDetails();
  }, [appelId]);

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

  const getInterestBadge = (interest) => {
    const interestInfo = VISITE_INTERETS[interest] || { label: 'Inconnu', color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${interestInfo.color}`}>
        {interestInfo.label}
      </span>
    );
  };

  const viewProspect = () => {
    if (appel && appel.prospect) {
      router.push(`/CRM/Prospects/${appel.prospect.id}`);
    }
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

  if (error || !appel) {
    return (
      <div className="container mx-auto px-4">
        <CRMNavbar />
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error || "Appel non trouvé"}</p>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => router.push('/CRM/Appels')}
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        {/* Prospect Info Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold border-b pb-2 mb-4">Détails du Prospect</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">CIN</p>
                <p className="mt-1">{appel.prospect?.cin || '-'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Nom</p>
                <p className="mt-1">{appel.prospect?.nom || '-'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Prénom</p>
                <p className="mt-1">{appel.prospect?.prenom || '-'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Téléphone</p>
                <p className="mt-1">
                  {appel.prospect?.telephone || '-'}
                  {appel.prospect?.telephone_num2 && <span> / {appel.prospect.telephone_num2}</span>}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Source</p>
                <p className="mt-1">{appel.prospect?.source?.source || '-'}</p>
              </div>
              
              {appel.prospect?.source?.source === 'Partenaire' && appel.prospect?.partenaire && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Partenaire</p>
                  <p className="mt-1">{appel.prospect.partenaire.description || '-'}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-500">Accepte d'être contacté</p>
                <p className="mt-1">{appel.prospect?.notifie === 1 ? 'Oui' : 'Non'}</p>
              </div>
              
              <button
                onClick={viewProspect}
                className="w-full px-4 py-2 mt-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Voir Prospect
              </button>
            </div>
          </div>
        </div>
        
        {/* Appel Details and History */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Historique des Appels</h2>
              <div className="space-x-2">
                <button 
                  onClick={() => router.push(`/CRM/Appels/edit/${appel.last_traitement_appel?.id}`)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-100"
                >
                  Modifier
                </button>
                <button 
                  onClick={() => router.push('/CRM/Appels')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Retour à la liste
                </button>
              </div>
            </div>
            
            {/* Treatments/Calls History Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intérêt</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commercial</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Traitement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commentaire</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {traitements.length > 0 ? (
                    traitements.map((traitement, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(traitement.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {TYPES_APPELS[traitement.type_appel]?.label || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getInterestBadge(traitement.interet)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {traitement.nom_cc} {traitement.prenom_cc}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(traitement.date_traitement)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {traitement.commentaire || '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucun historique disponible
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Current Call Details */}
          {appel.last_traitement_appel && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold border-b pb-2 mb-4">Détails du dernier traitement</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date de l'appel</p>
                  <p className="mt-1">{formatDate(appel.last_traitement_appel.date)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Type d'appel</p>
                  <p className="mt-1">{TYPES_APPELS[appel.last_traitement_appel.type_appel]?.label || '-'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Intérêt</p>
                  <p className="mt-1">{getInterestBadge(appel.last_traitement_appel.interet)}</p>
                </div>
                
                {appel.last_traitement_appel.date_relance && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date de relance</p>
                    <p className="mt-1">{formatDate(appel.last_traitement_appel.date_relance)}</p>
                  </div>
                )}
                
                {appel.last_traitement_appel.mode_relance && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Mode de relance</p>
                    <p className="mt-1">{VISITE_TYPE_NOTIF[appel.last_traitement_appel.mode_relance]?.label || '-'}</p>
                  </div>
                )}
                
                {appel.last_traitement_appel.rdv && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rendez-vous</p>
                    <p className="mt-1">{formatDateTime(appel.last_traitement_appel.rdv)}</p>
                  </div>
                )}
                
                {appel.last_traitement_appel.commentaire && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Commentaire</p>
                    <p className="mt-1">{appel.last_traitement_appel.commentaire}</p>
                  </div>
                )}
                
                {appel.last_traitement_appel.freins && appel.last_traitement_appel.freins.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Freins</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {appel.last_traitement_appel.freins.map((frein, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {frein}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Conditional display for related visite */}
                {appel.last_traitement_appel.visite_id && (
                  <div className="col-span-2 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-700">
                      Cet appel a été converti en visite
                    </p>
                    <button
                      onClick={() => router.push(`/CRM/Visites/${appel.last_traitement_appel.visite_id}`)}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Voir la visite
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
