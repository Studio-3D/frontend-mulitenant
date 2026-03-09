'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LeftCard } from './LeftCard';
import { RightCard } from './RightCard';
import { APIURL } from '@/configs/api';
import { useProjet } from '@/context/ProjetContext';
import { useAuth } from '@/context/AuthContext';
import { isAdmin, isSuperAdmin,isCommercial, isRespoLivraison, isRespoCommercial } from '@/configs/enum';
import axios from 'axios';
import Modal from '@/components/Modal';
import BreadCrumb from '@/app/(dashboard)/navigation/BreadCrumb';
import DeleteData from '@/components/DeleteData';

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
const getStoredActiveTab = (projectId) => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(`project-${projectId}-activeTab`);
  return stored || null;
};

const setStoredActiveTab = (projectId, tabName) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`project-${projectId}-activeTab`, tabName);
};

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const {
    selectedProjet,
    selectProjet,
    clearSelectedProjet,
    fetchProjets,
    removeProjet,
  } = useProjet();
  const { user } = useAuth();
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

     const userRole = user?.role;
    
      useEffect(() => {
        if (
          user && 
          !isAdmin(userRole) &&
          !isSuperAdmin(userRole) &&
          !isCommercial(userRole)&&
          !isRespoLivraison(userRole)&&
          !isRespoCommercial(userRole)
        ) {
          router.push('/');
        }
      }, [user, userRole, router]);
  // Custom setActiveTab function that also persists to localStorage
  const setActiveTabPersistent = useCallback(
    (tabName) => {
      setActiveTab(tabName);
      setStoredActiveTab(id, tabName);
    },
    [id]
  );

  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${APIURL.PROJETS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const projectDetails = response.data;
      setProjectData(projectDetails);
      console.log('fetched project data', projectDetails);
      // Update the context with the full project details
      if (projectDetails.projet) {
        selectProjet(projectDetails.projet);
      }

      // Don't reset activeTab here - we'll handle it after checking localStorage
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError(err.message || 'Failed to fetch project details');

      // If the project doesn't exist or we can't access it, clear selection
      if (err.response?.status === 404) {
        clearSelectedProjet();
      }
    } finally {
      setLoading(false);
    }
  }, [id, selectProjet, clearSelectedProjet]);

  // Persist breadcrumb context for fast "Ajouter bien" navigation
  useEffect(() => {
    if (projectData?.projet) {
      try {
        const ctx = {
          projet: { id: projectData.projet.id, nom: projectData.projet.nom },
        };
        localStorage.setItem('bienBreadcrumbContext', JSON.stringify(ctx));
      } catch (e) {}
    }
  }, [projectData]);

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id, fetchProjectDetails]);

  // Handle edit action
  const handleEdit = () => {
    router.push(`/projets/editProject/${id}`);
  };

  // Handle delete action
  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    window.location.href = '/projets'; // go + reload in one step
  };

  const allTabsData = useMemo(() => {
    if (!projectData) return {};

    const typeBienOptions = Array.from(
      new Set(
        projectData?.projet.bien
          ?.map((b) => b.type_bien?.type)
          .filter(Boolean) || []
      )
    ).map((type) => ({ value: type, label: type }));

    // Calculate status counts dynamically
    const statusCounts = projectData?.projet.bien?.reduce((acc, b) => {
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
    // Dans la section qui map les biens dans ProjectDetailsPage.js
    const biens =
      projectData?.projet.bien?.map((b) => {
        const statusConfig = STATUS_CONFIG[b.etat] || {
          name: b.etat,
          color: 'bg-gray-500',
        };
        // Calculer le niveau formaté
        const getFormattedNiveau = (niveau) => {
          if (niveau === 0 || niveau === '0') return 'RDC';
          if (niveau === 1 || niveau === '1') return '1er étage';
          if (niveau === 2 || niveau === '2') return '2ème étage';
          if (niveau === 3 || niveau === '3') return '3ème étage';
          if (niveau === 4 || niveau === '4') return '4ème étage';
          if (niveau === 5 || niveau === '5') return '5ème étage';
          return niveau ? `${niveau}ème étage` : '';
        };

        // Prendre seulement la première composition
        const firstComposition = b.composition_bien?.[0] || {};

        return {
          id: b.id,
          nom_projet: projectData?.projet.nom,
          numero: b.numero,
          name: b.propriete_dite_bien,
          type: b.type_bien?.type || 'Inconnu',
          type_id: b.type_id || 'Inconnu',
          surface: b.superficie_habitable || b.superficie_architecte,
          price: b.prix,
          status: statusConfig.name,
          statusColor: statusConfig.color,
          originalStatus: b.etat,
          tranche_nom: b?.tranche?.nom || '',
          bloc_nom: b?.bloc?.nom || '',
          immeuble_nom: b?.immeuble?.nom || '',
          orientation: b?.orientation || '',
          etage: getFormattedNiveau(b?.niveau),
          niveau: b?.niveau,
          typologie: b?.typologie?.typologie || '',
          vue: b?.vue?.vue || '',
          conventionne: b?.conventionne || '', // Modifier ici - valeur par défaut vide au lieu de 0
          prix_unitaire: b?.prix_unitaire || 0,
          prix: b?.prix || '',
          num_parking: b?.num_parking || '',
          num_box: b?.num_box || 0,
          prix_box: b?.prix_box || 0,
          prix_parking: b?.prix_parking || 0,
          avance_minimale: b?.avance_minimale || 0,
          superficie_architecte: b?.superficie_architecte || 0,
          superficie_habitable: b?.habitable || 0,
          nbre_facades: b?.nbre_facades || 0,
          superficie_parking: b?.superficie_parking || 0,
          superficie_box: b?.superficie_box || 0,
          superficie_terrasse: b?.superficie_terrasse || 0,
          superficie_terrasse_calculer: b?.superficie_terrasse_calculer || 0,
          superficie_balcon: b?.superficie_balcon || 0,
          superficie_balcon_calculer: b?.superficie_balcon_calculer || 0,
          superficie_jardin: b?.superficie_jardin || 0,
          superficie_jardin_calculer: b?.superficie_jardin_calculer || 0,
          titre_foncier: b?.titre_foncier || '',
          superficie_total: b?.superficie_total || 0,
          superficie_vendable: b?.superficie_vendable || 0,
          // Données de la première composition seulement
          nbre_chambres: firstComposition.nbre_chambres || 0,
          nbre_salons: firstComposition.nbre_salons || 0,
          nbre_sdb: firstComposition.nbre_sdb || 0,
          nbre_cuisines: firstComposition.nbre_cuisines || 0,
          nbre_halls: firstComposition.nbre_halls || 0,
          nbre_terasses: firstComposition.nbre_terasses || 0,
          nbre_balcons: firstComposition.nbre_balcons || 0,
          nbre_buanderies: firstComposition.nbre_buanderies || 0,
          nbre_placards: firstComposition.nbre_placards || 0,
          nbre_receptions: firstComposition.nbre_receptions || 0,
          // Information sur le nombre total de compositions (pour information)
          total_compositions: b.composition_bien?.length || 0,
        };
      }) || [];
    // Map tranche data to match your column requirements
    const tranches =
      projectData?.projet.tranche?.map((t) => ({
        id: t.id,
        nom: t.nom,
        date_lancement: t.date_lancement,
        date_livraison: t.date_livraison,
        niveau_etages: t.niveau_etages || 0,
        nom_projet:projectData?.projet?.nom
      })) || [];

    // Map immeuble data to match your column requirements
    const immeubles =
      projectData?.projet.immeuble?.map((i) => ({
        id: i.id,
        nom: i.nom,
        tranche_nom: i?.tranche?.nom || '',
        bloc_nom: i?.bloc?.nom || '',
        titre_foncier: i.titre_foncier,
        nbre_biens: i.nbre_biens || 0,
        nom_projet: projectData?.projet.nom,
      })) || [];

    // Map bloc data to match your column requirements
    const blocs =
      projectData?.projet.bloc?.map((b) => ({
        id: b.id,
        nom: b.nom,
        tranche_nom: b?.tranche?.nom,
        titre_foncier: b.titre_foncier,
        nbre_immeubles: b.nbre_immeubles || 0,
        nbre_biens: b.nbre_biens || 0,
        nom_projet: projectData?.projet.nom,
      })) || [];

    return {
      tranche: {
        count: projectData?.projet.tranche_count || 0,
        items: tranches,
        nbr_count: projectData?.projet.nbre_tranches || 0,
      },
      blocs: {
        count: projectData?.projet.bloc_count || 0,
        items: blocs,
        nbr_count: projectData?.projet.nbre_blocs || 0,
      },
      immeuble: {
        count: projectData?.projet.immeuble_count || 0,
        items: immeubles,
        nbr_count: projectData?.projet.nbre_immeubles || 0,
      },
      bien: {
        count: projectData?.projet.bien_count || 0,
        statuses: defaultStatuses,
        items: biens,
        nbr_count: projectData?.projet.nbre_biens,
        typeBienOptions,
      },
    };
  }, [projectData]);

  const filteredTabsData = useMemo(() => {
    return Object.fromEntries(
      Object.entries(allTabsData).filter(
        ([_, tabData]) => tabData.nbr_count > 0
      )
    );
  }, [allTabsData]);

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
            onClick={() => router.push('/projets')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Return to Projects
          </button>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl font-semibold mb-4">Project Not Found</div>
          <button
            onClick={() => router.push('/projets')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Return to Projects
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    setShowDeleteModal(false);
    router.push(`/projets`);
  };
  return (
    <div className="w-full">
      {/* Breadcrumbs */}
      <div className="mb-4">
        <BreadCrumb
          onRoot={{ href: '/projets' }}
          items={[{ label: projectData?.projet?.nom || `Projet #${id}` }]}
        />
      </div>
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="w-full lg:w-1/3">
          <LeftCard
            project={{ ...projectData.projet }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canEdit={isSuperAdmin(user?.role) || isAdmin(user?.role)}
          />
        </div>
        <div className="w-full lg:w-2/3">
          <RightCard
            tabsData={filteredTabsData}
            activeTab={activeTab}
            setActiveTab={setActiveTabPersistent} // Use the persistent version
            fetchProjectData={fetchProjectDetails}
            nbre_blocs={projectData?.projet.nbre_blocs}
            nbre_immeubles={projectData?.projet?.nbre_immeubles}
            nbre_biens={projectData?.projet?.nbre_biens}
            nbre_tranches={projectData?.projet?.nbre_tranches}
            projectId={id}
            max_etages={projectData?.projet?.max_etages}
            tranches={projectData?.projet?.tranche}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.PROJETS}
            Id={id}
            type="Projet"
            message="Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible."
            accessToken={localStorage.getItem('accessToken')}
            onClose={() => handleBack()}
            onSuccess={handleDeleteSuccess}
          />
        </Modal>
      )}
    </div>
  );
};
