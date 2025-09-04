'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LeftCard } from './LeftCard';
import { RightCard } from './RightCard';
import { APIURL } from '@/configs/api';
import { useProjet } from '@/context/ProjetContext';
import { useAuth } from '@/context/AuthContext';
import { isAdmin, isSuperAdmin } from '@/configs/enum';
import axios from 'axios';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import BreadCrumb from '@/app/(dashboard)/navigation/BreadCrumb';

// Define status mapping outside component to avoid recreation
const STATUS_CONFIG = {
  DISPONIBLE: { name: 'Disponible', color: 'bg-green-500' },
  PRE_RESERVATION: { name: 'Pré-réservé', color: 'bg-yellow-500' },
  RESERVATION: { name: 'Réservé', color: 'bg-blue-500' },
  BLOQUE: { name: 'Bloqué', color: 'bg-red-500' },
  VENDU: { name: 'Vendu', color: 'bg-purple-500' },
  ENCOURS_DE_PROPOSITION: {
    name: 'En cours de proposition',
    color: 'bg-orange-500',
  },
};

// Helper function to get/set active tab from localStorage
const getStoredActiveTab = (blocId) => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(`bloc-${blocId}-activeTab`);
  return stored || null;
};

const setStoredActiveTab = (blocId, tabName) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`bloc-${blocId}-activeTab`, tabName);
};

export const BlocDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { selectProjet, clearSelectedProjet } = useProjet();
  const { user } = useAuth();
  const [blocData, setBlocData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('immeuble');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchBlocDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${APIURL.BLOCS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      
      const blocDetails = response.data;
      setBlocData(blocDetails);
      console.log('fetched bloc data', blocDetails);

      // Update the context with the project details if available
      if (blocDetails.projet) {
        selectProjet(blocDetails.projet);
      }

      setActiveTab('bien');
    } catch (err) {
      console.error('Error fetching bloc details:', err);
      setError(err.message || 'Failed to fetch bloc details');

      // If the bloc doesn't exist or we can't access it, clear selection
      if (err.response?.status === 404) {
        clearSelectedProjet();
      }
    } finally {
      setLoading(false);
    }
  }, [id, selectProjet, clearSelectedProjet]);

  useEffect(() => {
    if (id) {
      fetchBlocDetails();
    }
  }, [id, fetchBlocDetails]);

  // Persist breadcrumb context for fast "Ajouter bien" page
  useEffect(() => {
    if (blocData?.bloc) {
      try {
        const ctx = {
          projet: blocData.bloc.projet
            ? { id: blocData.bloc.projet_id, nom: blocData.bloc.projet.nom }
            : undefined,
          tranche: blocData.bloc.tranche
            ? { id: blocData.bloc.tranche_id, nom: blocData.bloc.tranche.nom }
            : undefined,
          bloc: { id: blocData.bloc.id, nom: blocData.bloc.nom },
        };
        localStorage.setItem('bienBreadcrumbContext', JSON.stringify(ctx));
      } catch (e) {
        // ignore
      }
    }
  }, [blocData]);

  // Handle edit action
  const handleEdit = () => {
    router.push(`/Blocs/${id}/modifier`);
  };

  // Handle delete action
  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    //router.push("/Projets"); // Redirect to projects page
    // Redirect to the tranche page if available, otherwise to the project page
    if (blocData?.bloc?.tranche_id) {
      localStorage.setItem(
        `tranche-${blocData?.bloc?.tranche_id}-activeTab`,
        'blocs'
      );
      router.push(`/Tranches/${blocData?.bloc?.tranche_id}`);
    } else if (blocData?.bloc?.projet_id) {
      localStorage.setItem(
        `project-${blocData?.bloc?.projet_id}-activeTab`,
        'blocs'
      );
      router.push(`/Projets/${blocData?.bloc?.projet_id}`);
    } else {
      router.push('/Projets');
    }
  };

  const allTabsData = useMemo(() => {
    if (!blocData || !blocData.bloc) return {};

    // Access the properties from the bloc object

    const projet = blocData.bloc.projet;
    // Check project counts to determine which tabs to show
    const showBiens = projet?.nbre_biens > 0;
    const showImmeubles = projet?.nbre_immeubles > 0;

    const biensData = showBiens ? blocData.bloc.bien || [] : [];
    const immeublesData = showImmeubles ? blocData.bloc.immeuble || [] : [];
    const trancheData = blocData.bloc.tranche ? [blocData.bloc.tranche] : [];

    const typeBienOptions = Array.from(
      new Set(biensData.map((b) => b.type_bien?.type).filter(Boolean) || [])
    ).map((type) => ({ value: type, label: type }));

    // Calculate status counts dynamically
    const statusCounts = biensData.reduce((acc, b) => {
      const status = b.etat;
      if (status) {
        acc[status] = (acc[status] || 0) + 1;
      }
      return acc;
    }, {});

    // Map to the expected status format with dynamic counts using STATUS_CONFIG
    const defaultStatuses = Object.entries(STATUS_CONFIG).map(
      ([key, config]) => ({
        name: config.name,
        count: statusCounts?.[key] || 0,
        color: config.color,
      })
    );

    // Map bien data to match your column requirements
    const biens =
      biensData.map((b) => {
        const statusConfig = STATUS_CONFIG[b.etat] || {
          name: b.etat,
          color: 'bg-gray-500',
        };

        return {
          id: b.id,
          numero: b.numero,
          name: b.propriete_dite_bien,
          type: b.type_bien?.type || 'Inconnu',
          surface: b.superficie_habitable || b.superficie_architecte,
          price: b.prix,
          status: statusConfig.name,
          statusColor: statusConfig.color,
          originalStatus: b.etat,
          tranche_nom: b?.tranche?.nom || '',
          bloc_nom: b?.bloc?.nom || '',
          immeuble_nom: b?.immeuble?.nom || '',
        };
      }) || [];

    // Map immeuble data to match your column requirements
    const immeubles =
      immeublesData.map((i) => ({
        id: i.id,
        nom: i.nom,
        titre_foncier: i.titre_foncier,
        nbre_biens: i.nbre_biens || 0,
        tranche_nom: i?.tranche?.nom || '',
      })) || [];

    // Map tranche data for filtering - FIXED: Use items array structure
    const tranches = trancheData.map((t) => ({
      id: t.id,
      nom: t.nom,
    }));
    // Only include tabs if their corresponding project count is > 0
    const tabs = {};
    // Always include tranche tab if we have tranche data
    if (tranches.length > 0) {
      tabs.tranche = {
        items: tranches, // This should be an array of items
      };
    }
    if (showImmeubles) {
      tabs.immeuble = {
        count: immeubles.length,
        items: immeubles,
        nbr_count: immeubles.length,
        tranches: tranches,
      };
    }

    if (showBiens) {
      tabs.bien = {
        count: biens.length,
        statuses: defaultStatuses,
        items: biens,
        nbr_count: biens.length,
        typeBienOptions,
        tranches: tranches, // This should be an array, not an object with items
      };
    }

    return tabs;
  }, [blocData]);

  const filteredTabsData = useMemo(() => {
    return Object.fromEntries(
      Object.entries(allTabsData).filter(
        ([_, tabData]) => tabData.nbr_count >= 0
      )
    );
  }, [allTabsData]);

  /*  useEffect(() => {
    if (!filteredTabsData[activeTab] && Object.keys(filteredTabsData).length > 0) {
      setActiveTab(Object.keys(filteredTabsData)[0]);
    }
  }, [filteredTabsData, activeTab]);*/
  // Custom setActiveTab function that also persists to localStorage
  const setActiveTabPersistent = useCallback(
    (tabName) => {
      setActiveTab(tabName);
      setStoredActiveTab(id, tabName);
    },
    [id]
  );
  // Set active tab based on localStorage or first available tab
  useEffect(() => {
    if (Object.keys(filteredTabsData).length > 0) {
      // Try to get the stored active tab for this project
      const storedTab = getStoredActiveTab(id);

      // If we have a stored tab and it exists in the current tabs, use it
      if (storedTab && filteredTabsData[storedTab]) {
        setActiveTab(storedTab);
      }
      // Otherwise use the first available tab
      else if (!activeTab || !filteredTabsData[activeTab]) {
        setActiveTabPersistent(Object.keys(filteredTabsData)[0]);
      }
    }
  }, [filteredTabsData, id, activeTab, setActiveTabPersistent]);

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          <div className="w-full lg:w-1/3">
            <div className="h-[89vh] w-full rounded-lg bg-gray-200 animate-pulse" />
          </div>
          <div className="w-full lg:w-2/3">
            <div className="h-[89vh] w-full rounded-lg bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl font-semibold mb-4">Error</div>
          <div className="text-gray-600 mb-6">{error}</div>
          <button
            onClick={() => router.push('/Projets')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Return to Projects
          </button>
        </div>
      </div>
    );
  }

  if (!blocData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl font-semibold mb-4">Bloc Not Found</div>
          <button
            onClick={() => router.push('/Projets')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Return to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Breadcrumbs */}
      <div className="mb-4">
        <BreadCrumb
          onRoot={{ href: '/Projets' }}
          items={[
            blocData?.bloc?.projet
              ? {
                  label: blocData.bloc.projet.nom,
                  href: `/Projets/${blocData.bloc.projet_id}`,
                }
              : null,
            blocData?.bloc?.tranche
              ? {
                  label: blocData.bloc.tranche.nom,
                  href: `/Tranches/${blocData.bloc.tranche_id}`,
                }
              : null,
            { label: blocData?.bloc?.nom || 'Bloc' },
          ].filter(Boolean)}
        />
      </div>
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="w-full lg:w-1/3">
          <LeftCard
            bloc={{ ...blocData.bloc }}
            type="bloc"
            onEdit={handleEdit}
            onDelete={handleDelete}
            canEdit={isSuperAdmin(user?.role) || isAdmin(user?.role)}
          />
        </div>
        <div className="w-full lg:w-2/3">
          <RightCard
            tabsData={filteredTabsData}
            activeTab={activeTab}
            setActiveTab={setActiveTabPersistent}
            fetchBlocData={fetchBlocDetails}
            blocId={id}
            nbre_tranches={blocData?.bloc?.projet?.nbre_tranches}
            nbre_immeubles={blocData?.bloc?.projet?.nbre_immeubles}
            projectId={blocData?.bloc?.projet_id}
            breadcrumbContext={{
              projet: blocData?.bloc?.projet
                ? { id: blocData.bloc.projet_id, nom: blocData.bloc.projet.nom }
                : undefined,
              tranche: blocData?.bloc?.tranche
                ? {
                    id: blocData.bloc.tranche_id,
                    nom: blocData.bloc.tranche.nom,
                  }
                : undefined,
              bloc: blocData?.bloc
                ? { id: blocData.bloc.id, nom: blocData.bloc.nom }
                : undefined,
            }}
            max_etages={blocData?.bloc?.projet?.max_etages}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.BLOCS}
            Id={id}
            type="Bloc"
            message="Êtes-vous sûr de vouloir supprimer ce bloc ? Cette action est irréversible."
            accessToken={localStorage.getItem('accessToken')}
            onClose={() => setShowDeleteModal(false)}
            onSuccess={handleDeleteSuccess}
          />
        </Modal>
      )}
    </div>
  );
};
