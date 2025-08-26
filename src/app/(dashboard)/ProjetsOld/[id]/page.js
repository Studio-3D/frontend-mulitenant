'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { debounce } from 'lodash';
import { APIURL } from '@/configs/api';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import {
  Database,
  Layers,
  Building,
  Home,
  PencilLine,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Link from 'next/link';
import BienTable from '@/components/biens/BienTable';
import TrancheTable from '@/components/tranches/TrancheTable';
import BlocTable from '@/components/blocs/BlocTable';
import ImmeubleTable from '@/components/immeubles/ImmeubleTable';
import LoadingSpin from '@/components/LoadingSpin';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { selectProjet } = useProjet();
  const [projet, setProjet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') || 'biens';
  });
  const [confirming, setConfirming] = useState(false);
  const [hasSetProjet, setHasSetProjet] = useState(false);
  const [loadedTabs, setLoadedTabs] = useState({});
  const apiCache = useRef({});
  const abortControllers = useRef([]);
  const requestQueue = useRef([]);
  const isProcessing = useRef(false);

  const canManageProjet = user?.role === 1 || user?.role === 2;

  // Request queue processing
  const processQueue = useCallback(async () => {
    if (isProcessing.current || requestQueue.current.length === 0) return;

    isProcessing.current = true;
    const request = requestQueue.current.shift();

    try {
      const result = await request.fn();
      request.resolve(result);
    } catch (error) {
      request.reject(error);
    } finally {
      isProcessing.current = false;
      setTimeout(processQueue, 300); // 300ms delay between requests
    }
  }, []);

  // Add request to queue
  const enqueueRequest = useCallback(
    (fn) => {
      return new Promise((resolve, reject) => {
        requestQueue.current.push({ fn, resolve, reject });
        processQueue();
      });
    },
    [processQueue]
  );

  // Fetch with retry and rate limiting
  const fetchWithRetry = useCallback(
    async (fn, retries = 3, delay = 1000) => {
      try {
        return await enqueueRequest(fn);
      } catch (error) {
        if (error.response?.status === 429 && retries > 0) {
          await new Promise((res) => setTimeout(res, delay));
          return fetchWithRetry(fn, retries - 1, delay * 2);
        }
        throw error;
      }
    },
    [enqueueRequest]
  );

  // Fetch with caching
  const fetchWithCache = useCallback(
    async (cacheKey, fn) => {
      if (apiCache.current[cacheKey]) {
        return apiCache.current[cacheKey];
      }

      const result = await fetchWithRetry(fn);
      apiCache.current[cacheKey] = result;
      return result;
    },
    [fetchWithRetry]
  );

  const fetchProjectDetails = useCallback(async () => {
    const cacheKey = `project-${id}`;
    if (apiCache.current[cacheKey]) {
      setProjet(apiCache.current[cacheKey]);
      return;
    }

    const controller = new AbortController();
    abortControllers.current.push(controller);

    try {
      setLoading(true);
      await fetchWithRetry(async () => {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${APIURL.PROJETS}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (response.data.projet) {
          apiCache.current[cacheKey] = response.data.projet;
          setProjet(response.data.projet);

          if (!hasSetProjet) {
            selectProjet(response.data.projet);
            setHasSetProjet(true);
          }
        } else {
          setError('Projet non trouvé');
        }
      });
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error('Failed to load project:', err);
        setError('Erreur lors du chargement du projet');
      }
    } finally {
      setLoading(false);
    }
  }, [id, hasSetProjet, selectProjet, fetchWithRetry]);

  useEffect(() => {
    if (projet && !loading) return;
    if (!id) return;

    const timer = setTimeout(() => {
      fetchProjectDetails();
    }, 300);

    return () => {
      clearTimeout(timer);
      abortControllers.current.forEach((controller) => controller.abort());
      abortControllers.current = [];
    };
  }, [id, projet, loading, fetchProjectDetails]);

  // Track loaded tabs to prevent unnecessary requests
  useEffect(() => {
    if (activeTab && !loadedTabs[activeTab]) {
      setLoadedTabs((prev) => ({ ...prev, [activeTab]: true }));
    }
  }, [activeTab, loadedTabs]);

  const debouncedTabChange = useCallback(
    debounce((tab) => {
      setActiveTab(tab);
      const url = new URL(window.location);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url);
    }, 300),
    []
  );

  const handleDeleteConfirm = async () => {
    setConfirming(true);
    try {
      const token = localStorage.getItem('accessToken');
      await fetchWithRetry(async () => {
        await axios.delete(`${APIURL.PROJETS}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      });
      toast.success('Projet supprimé avec succès');
      router.push('/Projets');
    } catch (err) {
      console.error('Failed to delete project:', err);
      toast.error('Erreur lors de la suppression du projet');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin />
      </div>
    );
  }

  if (error || !projet) {
    return (
      <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-500 !text-red-700">
        <p className="font-medium">Erreur</p>
        <p>{error || 'Projet non trouvé'}</p>
        <Link
          href="/Projets"
          className="mt-4 inline-block text-[#009FFF] hover:underline"
        >
          Retour à la liste des projets
        </Link>
      </div>
    );
  }

  const showTrancheTab = projet.nbre_tranches > 0;
  const showBlocTab = projet.nbre_blocs > 0;
  const showImmeubleTab = projet.nbre_immeubles > 0;

  const tabs = [];
  if (showTrancheTab)
    tabs.push({
      id: 'tranches',
      label: 'Tranches',
      icon: <Database className="w-5 h-5" />,
    });
  if (showBlocTab)
    tabs.push({
      id: 'blocs',
      label: 'Blocs',
      icon: <Layers className="w-5 h-5" />,
    });
  if (showImmeubleTab)
    tabs.push({
      id: 'immeubles',
      label: 'Immeubles',
      icon: <Building className="w-5 h-5" />,
    });
  tabs.push({
    id: 'biens',
    label: 'Biens',
    icon: <Home className="w-5 h-5" />,
  });

  return (
    <div className="">
      <div className="flex flex-col lg:flex-row gap-6 ">
        {/* Project Card - Left Side */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative bg-blue-100 w-full h-32">
              <div className="relative w-full h-36">
                <img
                  src="/images/banners/img1A.jpg"
                  alt="Real Estate Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-24 h-24 hover:scale-105 transition-transform cursor-pointer rounded-full bg-blue-100 flex items-center justify-center mx-auto border-4 border-white shadow-md">
                  <span className="text-2xl font-bold text-[#009FFF]">
                    {projet.nom ? projet.nom.charAt(0).toUpperCase() : 'P'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-12 text-center border-b border-gray-200">
              <div className="p-4">
                <h1 className="text-xl font-semibold">{projet.nom}</h1>
                <div className="inline-block px-3 py-1 bg-blue-100 !text-blue-700 rounded-full text-sm mt-2">
                  {projet.code}
                </div>
              </div>
            </div>

            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div className="flex justify-center">
                  <div className="flex items-end gap-3">
                    <Database className="w-7 h-7 !text-green-500 shrink-0" />
                    <div className="flex flex-col leading-none text-left">
                      <span className="text-md font-medium">
                        {projet.tranche_count || 0}
                      </span>
                      <span className="text-gray-500">Tranches</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="flex items-end gap-3">
                    <Layers className="w-7 h-7 !text-orange-500 shrink-0" />
                    <div className="flex flex-col leading-none text-left">
                      <span className="text-md font-medium">
                        {projet.bloc_count || 0}
                      </span>
                      <span className="text-gray-500">Blocs</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center ml-4">
                  <div className="flex items-end gap-3">
                    <Building className="w-7 h-7 !text-red-500 shrink-0" />
                    <div className="flex flex-col leading-none text-left">
                      <span className="text-md font-medium">
                        {projet.immeuble_count || 0}
                      </span>
                      <span className="text-gray-500">Immeubles</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="flex items-end gap-3">
                    <Home className="w-7 h-7 !text-blue-500 shrink-0" />
                    <div className="flex flex-col leading-none text-left">
                      <span className="text-md font-medium">
                        {projet.bien_count || 0}
                      </span>
                      <span className="text-gray-500">Biens</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Détails</h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Adresse:</span>
                  <span className="font-medium">{projet.adresse}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Date autorisation:</span>
                  <span className="font-medium">
                    {projet.date_autorisation_construction &&
                      format(
                        new Date(projet.date_autorisation_construction),
                        'dd/MM/yyyy'
                      )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Date permis habiter:</span>
                  <span className="font-medium">
                    {projet.date_permis_habiter &&
                      format(
                        new Date(projet.date_permis_habiter),
                        'dd/MM/yyyy'
                      )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Titre foncier:</span>
                  <span className="font-medium">
                    {projet.titre_foncier || ''}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Surface terrain:</span>
                  <span className="font-medium">
                    {projet.surface_terrain} m²
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Prix acquisition:</span>
                  <span className="font-medium">
                    {projet.prix_acquisition} Dhs
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Limite annulation:</span>
                  <span className="font-medium">
                    {projet.limite_annulation_reservation} jours
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Prolongation réservation:
                  </span>
                  <span className="font-medium">
                    {projet.prolongation_reservation || ''} jours
                  </span>
                </div>

                {showTrancheTab && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre de tranches:</span>
                    <span className="font-medium">{projet.nbre_tranches}</span>
                  </div>
                )}

                {showBlocTab && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre de blocs:</span>
                    <span className="font-medium">{projet.nbre_blocs}</span>
                  </div>
                )}

                {showImmeubleTab && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Nombre {"d'"}immeubles:
                    </span>
                    <span className="font-medium">{projet.nbre_immeubles}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre de biens:</span>
                  <span className="font-medium">{projet.nbre_biens}</span>
                </div>
              </div>
            </div>

            {user?.role <= 2 && projet.user_projet?.length > 0 && (
              <div className="p-6 border-t border-gray-200">
                <h2 className="text-lg font-semibold mb-4">
                  Utilisateurs avec accès
                </h2>
                <div className="space-y-2">
                  {projet.user_projet.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center p-2 bg-gray-50 rounded-md"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <span className="text-sm font-medium !text-blue-700">
                          {assignment.user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span>
                        {assignment.user?.name} {assignment.user?.prenom}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {canManageProjet && (
              <div className="p-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <Link
                    href={`/Projets/${id}/modifier`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                  >
                    <PencilLine className="w-5 h-5" />
                    <span>Modifier</span>
                  </Link>

                  <button
                    onClick={() => setConfirming(true)}
                    disabled={confirming}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors disabled:bg-red-300"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project Content - Right Side */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`px-6 py-3 flex items-center gap-2 text-sm font-medium whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-b-2 border-[#009FFF] text-[#009FFF]'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => debouncedTabChange(tab.id)}
                  >
                    {tab.icon}
                    {tab.label}
                    {tab.id === 'tranches' && (
                      <span className="ml-1 text-xs">
                        ({projet.tranche_count || 0})
                      </span>
                    )}
                    {tab.id === 'blocs' && (
                      <span className="ml-1 text-xs">
                        ({projet.bloc_count || 0})
                      </span>
                    )}
                    {tab.id === 'immeubles' && (
                      <span className="ml-1 text-xs">
                        ({projet.immeuble_count || 0})
                      </span>
                    )}
                    {tab.id === 'biens' && (
                      <span className="ml-1 text-xs">
                        ({projet.bien_count || 0})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              <div className={`${activeTab !== 'tranches' ? 'hidden' : ''}`}>
                {loadedTabs.tranches && (
                  <TrancheTable
                    projetId={id}
                    key={`tranches-${id}`}
                    fetchWithCache={fetchWithCache}
                    fetchWithRetry={fetchWithRetry}
                  />
                )}
              </div>

              <div className={`${activeTab !== 'blocs' ? 'hidden' : ''}`}>
                {loadedTabs.blocs && (
                  <BlocTable
                    projetId={id}
                    key={`blocs-${id}`}
                    fetchWithCache={fetchWithCache}
                    fetchWithRetry={fetchWithRetry}
                  />
                )}
              </div>

              <div className={`${activeTab !== 'immeubles' ? 'hidden' : ''}`}>
                {loadedTabs.immeubles && (
                  <ImmeubleTable
                    projetId={id}
                    key={`immeubles-${id}`}
                    fetchWithCache={fetchWithCache}
                    fetchWithRetry={fetchWithRetry}
                  />
                )}
              </div>

              <div className={`${activeTab !== 'biens' ? 'hidden' : ''}`}>
                {loadedTabs.biens && (
                  <BienTable
                    projetId={id}
                    key={`biens-${id}`}
                    fetchWithCache={fetchWithCache}
                    fetchWithRetry={fetchWithRetry}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {confirming && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirmation</h3>
            <p className="mb-6">
              Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est
              irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
