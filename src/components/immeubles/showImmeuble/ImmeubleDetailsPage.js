'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LeftCard } from './LeftCard';
import { RightCard } from './RightCard';
import { APIURL } from '@/configs/api';
import { useProjet } from '@/context/ProjetContext';
import { useAuth } from '@/context/AuthContext';
import { isAdmin, isSuperAdmin ,isCommercial, isRespoLivraison, isRespoCommercial, isAgentAdministratif} from '@/configs/enum';
import axios from 'axios';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import BreadCrumb from '@/app/(dashboard)/navigation/BreadCrumb';
import { useSociete } from '@/context/SocieteContext';
import { BIEN_ETATS } from '@/components/bien-utils';

// Define status mapping outside component to avoid recreation
const STATUS_CONFIG = {
  DISPONIBLE: { name: BIEN_ETATS.DISPONIBLE.label, color: 'bg-green-500' },
  PRE_RESERVATION: { name: BIEN_ETATS.PRE_RESERVATION.label, color: 'bg-yellow-500' },
  RESERVATION: { name: BIEN_ETATS.RESERVATION.label, color: 'bg-blue-500' },
  BLOQUE: { name: BIEN_ETATS.BLOQUE.label, color: 'bg-red-500' },
  VENDU: { name: BIEN_ETATS.VENDU.label, color: 'bg-purple-500' },
  ENCOURS_DE_PROPOSITION: { 
    name: BIEN_ETATS.ENCOURS_DE_PROPOSITION.label, 
    color: 'bg-orange-500' 
  },
};

// Helper function to get/set active tab from localStorage
const getStoredActiveTab = (immeubleId) => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(`immeuble-${immeubleId}-activeTab`);
  return stored || null;
};

const setStoredActiveTab = (immeubleId, tabName) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`immeuble-${immeubleId}-activeTab`, tabName);
};

export const ImmeubleDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { selectProjet, clearSelectedProjet, selectedProjet } = useProjet();
   const { selectedSociete } = useSociete();
  const { user } = useAuth();
  const [immeubleData, setImmeubleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('bien');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const userRole = user?.role;
      
        useEffect(() => {
          if (
            user && 
            !isAdmin(userRole) &&
            !isSuperAdmin(userRole) &&
            !isCommercial(userRole)&&
            !isRespoLivraison(userRole)&&
            !isRespoCommercial(userRole)&&
            !isAgentAdministratif(userRole)
          ) {
            router.push('/');
          }
        }, [user, userRole, router]);
  const fetchImmeubleDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${APIURL.IMMEUBLES}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const immeubleDetails = response.data;
      setImmeubleData(immeubleDetails);
      console.log('fetched immeuble data', immeubleDetails);

      // Update the context with the project details if available
      if (immeubleDetails.projet) {
        selectProjet(immeubleDetails.projet);
      }

      setActiveTab('bien');
    } catch (err) {
      console.error('Error fetching immeuble details:', err);
      setError(err.message || 'Failed to fetch immeuble details');

      // If the immeuble doesn't exist or we can't access it, clear selection
      if (err.response?.status === 404) {
        clearSelectedProjet();
      }
    } finally {
      setLoading(false);
    }
  }, [id, selectProjet, clearSelectedProjet]);

  useEffect(() => {
    if (id) {
      fetchImmeubleDetails();
    }
  }, [id, fetchImmeubleDetails]);

  useEffect(() => {
    // console.log('projet_id==>'+ selectedProjet?.id + 'w projet d tranche'+trancheData?.tranche?.projet_id)
    if (
      immeubleData?.immeuble?.projet_id != undefined &&
      selectedProjet?.id != immeubleData?.immeuble?.projet_id
    ) {
      router.push('/projets/' + selectedProjet?.id);
    }
  }, [selectedProjet?.id, immeubleData?.immeuble?.projet_id]);

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

  // Persist breadcrumb context for fast "Ajouter bien" page
  useEffect(() => {
    if (immeubleData?.immeuble) {
      try {
        const ctx = {
          projet: immeubleData.immeuble.projet
            ? {
                id: immeubleData.immeuble.projet_id,
                nom: immeubleData.immeuble.projet.nom,
              }
            : undefined,
          tranche: immeubleData.immeuble.tranche
            ? {
                id: immeubleData.immeuble.tranche_id,
                nom: immeubleData.immeuble.tranche.nom,
              }
            : undefined,
          bloc: immeubleData.immeuble.bloc
            ? {
                id: immeubleData.immeuble.bloc_id,
                nom: immeubleData.immeuble.bloc.nom,
              }
            : undefined,
          immeuble: {
            id: immeubleData.immeuble.id,
            nom: immeubleData.immeuble.nom,
          },
        };
        localStorage.setItem('bienBreadcrumbContext', JSON.stringify(ctx));
      } catch (e) {
        // ignore
      }
    }
  }, [immeubleData]);

  // Handle edit action
  const handleEdit = () => {
    router.push(`/immeubles/${id}`);
  };

  // Handle delete action
  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    // Redirect to the bloc page if available, otherwise to the tranche or project page
    if (immeubleData?.immeuble?.bloc_id) {
      localStorage.setItem(
        `bloc-${immeubleData?.immeuble?.bloc_id}-activeTab`,
        'immeuble'
      );
      router.push(`/blocs/${immeubleData?.immeuble?.bloc_id}`);
    } else if (immeubleData?.immeuble?.tranche_id) {
      localStorage.setItem(
        `tranche-${immeubleData?.immeuble?.tranche_id}-activeTab`,
        'immeuble'
      );

      router.push(`/tranches/${immeubleData?.immeuble?.tranche_id}`);
    } else if (immeubleData?.immeuble?.projet_id) {
      localStorage.setItem(
        `project-${immeubleData?.immeuble?.projet_id}-activeTab`,
        'immeuble'
      );
      router.push(`/projets/${immeubleData?.immeuble?.projet_id}`);
    } else {
      router.push('/projets');
    }
  };

  const allTabsData = useMemo(() => {
    if (!immeubleData || !immeubleData.immeuble) return {};

    // Access the properties from the immeuble object
    const biensData = immeubleData.immeuble.bien || [];

    // Get tranche and bloc data from immeubleData
    const trancheData = immeubleData.immeuble.tranche
      ? [immeubleData.immeuble.tranche]
      : [];
    const blocData = immeubleData.immeuble.bloc
      ? [immeubleData.immeuble.bloc]
      : [];
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
     biensData?.map((b) => {
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
          nom_projet: b?.projet.nom,
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
          typologie_id: b?.typologie?.id || '',
          vue_id: b?.vue?.id || '',
          conventionne: b?.conventionne || '', // Modifier ici - valeur par défaut vide au lieu de 0
          prix_unitaire: b?.prix_unitaire || 0,
          prix: b?.prix || '',
          num_parking: b?.num_parking || '',
          num_box: b?.num_box || 0,
          prix_box: b?.prix_box || 0,
          prix_parking: b?.prix_parking || 0,
          avance_minimale: b?.avance_minimale || 0,
          superficie_architecte: b?.superficie_architecte || 0,
          superficie_habitable: b?.superficie_habitable || 0,
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
    nbre_kitchenette: firstComposition.nbre_kitchenette || 0,
    nbre_terasses: firstComposition.nbre_terasses || 0,
    nbre_balcons: firstComposition.nbre_balcons || 0,
    nbre_buanderies: firstComposition.nbre_buanderies || 0,
    nbre_placards: firstComposition.nbre_placards || 0,
    nbre_receptions: firstComposition.nbre_receptions || 0,
    nbre_sejour: firstComposition.nbre_sejour || 0,
    total_compositions: b.composition_bien?.length || 0,
        };
      }) || [];

    // Map tranche data for filtering
    const tranches = trancheData.map((t) => ({
      id: t.id,
      nom: t.nom,
    }));

    // Map bloc data for filtering
    const blocs = blocData.map((b) => ({
      id: b.id,
      nom: b.nom,
    }));

    return {
      bien: {
        count: biens.length,
        statuses: defaultStatuses,
        items: biens,
        nbr_count: biens.length,
        typeBienOptions,
        // Include tranche and bloc data for filtering
        tranches: tranches,
        blocs: blocs,
      },
    };
  }, [immeubleData]);

  const filteredTabsData = useMemo(() => {
    return Object.fromEntries(
      Object.entries(allTabsData).filter(
        ([_, tabData]) => tabData.nbr_count >= 0
      )
    );
  }, [allTabsData]);

  /*  useEffect(() => {
    if (
      !filteredTabsData[activeTab] &&
      Object.keys(filteredTabsData).length > 0
    ) {
      setActiveTab(Object.keys(filteredTabsData)[0]);
    }
  }, [filteredTabsData, activeTab]);
*/

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
            onClick={() => router.push('/projets')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Return to Projects
          </button>
        </div>
      </div>
    );
  }

  if (!immeubleData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl font-semibold mb-4">Immeuble Not Found</div>
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

  return (
    <div className="w-full">
      {/* Breadcrumbs */}
      <div className="mb-4">
        <BreadCrumb
          onRoot={{ href: '/projets' }}
          items={[
            immeubleData?.immeuble?.projet
              ? {
                  label: immeubleData.immeuble.projet.nom,
                  href: `/projets/${immeubleData.immeuble.projet_id}`,
                }
              : null,
            immeubleData?.immeuble?.tranche
              ? {
                  label: immeubleData.immeuble.tranche.nom,
                  href: `/tranches/${immeubleData.immeuble.tranche_id}`,
                }
              : null,
            immeubleData?.immeuble?.bloc
              ? {
                  label: immeubleData.immeuble.bloc.nom,
                  href: `/blocs/${immeubleData.immeuble.bloc_id}`,
                }
              : null,
            { label: immeubleData?.immeuble?.nom || 'Immeuble' },
          ].filter(Boolean)}
        />
      </div>
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="w-full lg:w-1/3">
          <LeftCard
            immeuble={{ ...immeubleData.immeuble }}
            type="immeuble"
            onEdit={handleEdit}
            onDelete={handleDelete}
            canEdit={isSuperAdmin(user?.role) || isAdmin(user?.role)|| isAgentAdministratif(user?.role)}
          />
        </div>
        <div className="w-full lg:w-2/3">
          <RightCard
            tabsData={filteredTabsData}
            activeTab={activeTab}
            // setActiveTab={setActiveTab}
            setActiveTab={setActiveTabPersistent}
            fetchImmeubleData={fetchImmeubleDetails}
            nbre_tranches={immeubleData?.immeuble?.projet?.nbre_tranches}
            nbre_blocs={immeubleData?.immeuble?.projet?.nbre_blocs}
            immeubleId={id}
            breadcrumbContext={{
              projet: immeubleData?.immeuble?.projet
                ? {
                    id: immeubleData.immeuble.projet_id,
                    nom: immeubleData.immeuble.projet.nom,
                  }
                : undefined,
              tranche: immeubleData?.immeuble?.tranche
                ? {
                    id: immeubleData.immeuble.tranche_id,
                    nom: immeubleData.immeuble.tranche.nom,
                  }
                : undefined,
              bloc: immeubleData?.immeuble?.bloc
                ? {
                    id: immeubleData.immeuble.bloc_id,
                    nom: immeubleData.immeuble.bloc.nom,
                  }
                : undefined,
              immeuble: immeubleData?.immeuble
                ? {
                    id: immeubleData.immeuble.id,
                    nom: immeubleData.immeuble.nom,
                  }
                : undefined,
            }}
            projetId={immeubleData?.immeuble?.projet_id}
            max_etages={immeubleData?.immeuble?.projet?.max_etages}
            trancheId={immeubleData?.immeuble?.tranche_id}
            blocs= {immeubleData?.immeuble?.bloc}
            tranches={immeubleData?.immeuble.tranche ? [immeubleData?.immeuble.tranche] : []}
            typologies={immeubleData?.immeuble?.projet?.typologies || []}
            vues={immeubleData?.immeuble?.projet?.vues || []}
            typeBiens={immeubleData?.immeuble?.projet?.types_bien || []}
    
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.IMMEUBLES}
            Id={id}
            type="Immeuble"
            message="Êtes-vous sûr de vouloir supprimer cet immeuble ? Cette action est irréversible."
            accessToken={localStorage.getItem('accessToken')}
            // onClose={() => setShowDeleteModal(false)}
            onClose={() => {
              setShowDeleteModal(false);
            }}
            onSuccess={handleDeleteSuccess}
          />
        </Modal>
      )}
    </div>
  );
};
