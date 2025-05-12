'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import { isAdmin, isSuperAdmin } from '@/configs/enum';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import ComptabiliteTabsNav from '@/components/comptabilite/ComptabiliteTabsNav';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';

const TvaCollectesPage = () => {
  const params = useParams();
  const bienId = params.bienId;
  
  const { user } = useAuth();
  const { selectedProjet } = useProjet();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [biensDetail, setBiensDetail] = useState(null);
  const [ancien, setAncien] = useState(null);
  const [filterValues, setFilterValues] = useState({});
  const [paginatedData, setPaginatedData] = useState({
    data: [],
    currentPage: 1,
    totalItems: 0,
    totalPages: 0
  });

  // Check user permissions and project selection
  useEffect(() => {
    if (user && !isAdmin(user.role) && !isSuperAdmin(user.role)) {
      router.push('/home');
    } else if (!selectedProjet) {
      router.push('/comptabilite');
    }
  }, [user, selectedProjet, router]);

  const fetchBien = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${APIURL.ROOT}/v1/biens/${bienId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { data } = response;
      setBiensDetail(data.bien);
      if (data.bien.tva_collectes?.length > 0) {
        setAncien(0);
      } else if (data.bien.tva_collectes_ancien_reservation?.length > 0) {
        setAncien(1);
      } else {
        setAncien(null);
      }
    } catch (error) {
      console.error('Error fetching bien details:', error);
      toast.error('Erreur lors du chargement des détails du bien');
    }
  };

  const fetchTvaCollectes = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const apiUrl = `${APIURL.ROOT}/v1/projets/${selectedProjet.id}/get_tva_collecte_par_bien/`;
      
      const params = {
        bien_id: bienId,
        ancien: ancien,
        page: page + 1,
        size,
        ...filterValues
      };

      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      const data = response.data.data || [];
      const pagination = response.data.pagination || {};
      
      setPaginatedData({
        data,
        currentPage: pagination.current_page || 1,
        totalItems: pagination.total_items || data.length,
        totalPages: pagination.total_pages || 1
      });
    } catch (error) {
      console.error('Error fetching TVA collectes:', error);
      toast.error('Erreur lors du chargement des données TVA collectes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bienId) {
      fetchBien();
    }
  }, [bienId]);

  useEffect(() => {
    if (bienId && ancien !== null) {
      fetchTvaCollectes();
    }
  }, [bienId, ancien, page, size, filterValues]);

  const handleShowReservation = (resId) => {
    window.open(`/reservations/${resId}`, '_blank');
  };

  if (!user || !selectedProjet || !biensDetail) {
    return <div className="p-6 text-center">Chargement...</div>;
  }

  const color_title = ancien === 0 ? '#9370db' : '#3E2C5A';

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">TVA Collectes - {biensDetail.propriete_dite_bien}</h1>
      
      <ComptabiliteTabsNav />
      
      <div className="mt-6 grid grid-cols-12 gap-6">
        {/* TVA Info Card */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold" style={{ color: color_title }}>
                Informations du TVA
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Prix Vente TTC:</span>
                <span className="font-semibold">{biensDetail.bien_tva?.prix_ttc?.toLocaleString()} DH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">% TVA Appliqué:</span>
                <span className="font-semibold">20%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">QP Terrain En Valeur:</span>
                <span className="font-semibold">{biensDetail.bien_tva?.qp_terrain_valeur?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600 font-medium">TVA Globale:</span>
                <span className="text-blue-600 font-semibold">{biensDetail.bien_tva?.tva?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600 font-medium">Cumul TVA Déclarée:</span>
                <span className="text-green-600 font-semibold">{biensDetail.tva_collectes_sum_tva_a_payer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600 font-medium">TVA Reste à Déclarer:</span>
                <span className="text-red-600 font-semibold">
                  {(biensDetail.bien_tva?.tva - biensDetail.tva_collectes_sum_tva_a_payer).toFixed(2)} DH
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TVA Collectes Table */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold" style={{ color: color_title }}>
                {ancien === 0 || ancien === null ? 'Les TVA Collectés' : 'Les Anciens TVA Collectés'}
              </h2>
            </div>
            
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code Réservation</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type Encaissement</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode Encaissement</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avance Terrain</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avance Bien TTC</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avance Bien HT</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TVA à Déclarer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="11" className="px-4 py-4 text-center">Chargement...</td>
                      </tr>
                    ) : paginatedData.data.length === 0 ? (
                      <tr>
                        <td colSpan="11" className="px-4 py-4 text-center">Aucune donnée disponible</td>
                      </tr>
                    ) : (
                      paginatedData.data.map(item => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.encaissement?.date_encaissement ? 
                              format(new Date(item.encaissement.date_encaissement), 'dd/MM/yyyy') : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.reservation?.code_reservation || '-'}
                          </td>
                          <td className="px-4 py-3">
                            {item.reservation?.aquereurs ? 
                              Object.keys(item.reservation.aquereurs).map(key => (
                                <div key={key}>
                                  <Link 
                                    href={`/clients/${item.reservation.aquereurs[key].client.id}`}
                                    target="_blank"
                                    className="text-blue-600 hover:underline"
                                  >
                                    {item.reservation.aquereurs[key].client.nom} {item.reservation.aquereurs[key].client.prenom}
                                  </Link>
                                </div>
                              )) : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.encaissement ? (
                              <span>
                                {item.encaissement.type_encaissement == '1' ? '+' : 
                                 item.encaissement.type_encaissement == '2' ? '-' :
                                 item.encaissement.type_encaissement == '3' ? '-' :
                                 item.encaissement.type_encaissement == '4' ? '+' :
                                 item.encaissement.type_encaissement == '5' ? '+' :
                                 item.encaissement.type_encaissement == '6' ? '+' : ''}
                                {item.encaissement.montant} DH
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.encaissement ? (
                              <span className={`inline-flex px-2 py-1 text-xs rounded-full
                                ${item.encaissement.type_encaissement == '1' ? 'bg-green-100 text-green-800' : 
                                 item.encaissement.type_encaissement == '2' ? 'bg-red-100 text-red-800' :
                                 item.encaissement.type_encaissement == '3' ? 'bg-yellow-100 text-yellow-800' :
                                 item.encaissement.type_encaissement == '4' ? 'bg-blue-100 text-blue-800' :
                                 item.encaissement.type_encaissement == '5' ? 'bg-purple-100 text-purple-800' :
                                 item.encaissement.type_encaissement == '6' ? 'bg-pink-100 text-pink-800' : 
                                'bg-gray-100 text-gray-800'}`}
                              >
                                {item.encaissement.type_encaissement == '1' ? 'Avances' : 
                                 item.encaissement.type_encaissement == '2' ? 'Restitution' :
                                 item.encaissement.type_encaissement == '3' ? 'Remboursement' :
                                 item.encaissement.type_encaissement == '4' ? 'Décharge Reliquat' :
                                 item.encaissement.type_encaissement == '5' ? 'Déblocage Crédit' :
                                 item.encaissement.type_encaissement == '6' ? 'Pénalité' : '-'}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.encaissement?.avance?.mode_paiement || '-'}
                            {item.encaissement?.avance?.banque ? 
                              ` ${item.encaissement.avance.banque.nom} N°P: ${item.encaissement.avance.numero_paiement}` : ''}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.avance_terrain.toString().replace(/,/g, '.')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.avance_bien_ttc.toString().replace(/,/g, '.')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.avance_bien_ht.toString().replace(/,/g, '.')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.tva_a_payer.toString().replace(/,/g, '.')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              onClick={() => handleShowReservation(item.reservation_id)}
                              title="Détail Réservation"
                              className="p-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                            >
                              <Eye size={16} strokeWidth={2.5} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination controls */}
              <div className="py-3 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setPage(Math.min(paginatedData.totalPages - 1, page + 1))}
                    disabled={page >= paginatedData.totalPages - 1}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Suivant
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Affichage de <span className="font-medium">{page * size + 1}</span> à{' '}
                      <span className="font-medium">
                        {Math.min((page + 1) * size, paginatedData.totalItems)}
                      </span>{' '}
                      sur <span className="font-medium">{paginatedData.totalItems}</span> résultats
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setPage(0)}
                        disabled={page === 0}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Premier</span>
                        &laquo;
                      </button>
                      <button
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Précédent</span>
                        &lsaquo;
                      </button>
                      {/* Page numbers */}
                      {[...Array(Math.min(5, paginatedData.totalPages)).keys()].map((i) => {
                        const pageNumber = i + Math.max(0, Math.min(page - 2, paginatedData.totalPages - 5));
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setPage(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border ${
                              page === pageNumber
                                ? 'bg-blue-50 border-blue-500 text-blue-600 z-10'
                                : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                            } text-sm font-medium`}
                          >
                            {pageNumber + 1}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setPage(Math.min(paginatedData.totalPages - 1, page + 1))}
                        disabled={page >= paginatedData.totalPages - 1}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Suivant</span>
                        &rsaquo;
                      </button>
                      <button
                        onClick={() => setPage(paginatedData.totalPages - 1)}
                        disabled={page >= paginatedData.totalPages - 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Dernier</span>
                        &raquo;
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TvaCollectesPage;
