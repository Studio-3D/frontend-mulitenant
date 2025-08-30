'use client';
import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { LeftCard } from './LeftCard';
import { RightCard } from './RightCard';
import { APIURL } from "@/configs/api";
import { useProjet } from "@/context/ProjetContext";
import { useAuth } from "@/context/AuthContext";
import { isAdmin, isSuperAdmin } from "@/configs/enum";
import axios from "axios";
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';

// Define status mapping outside component to avoid recreation
const STATUS_CONFIG = {
  DISPONIBLE: { name: 'Disponible', color: 'bg-green-500' },
  PRE_RESERVATION: { name: 'Pré-réservé', color: 'bg-yellow-500' },
  RESERVATION: { name: 'Réservé', color: 'bg-blue-500' },
  BLOQUE: { name: 'Bloqué', color: 'bg-red-500' },
  VENDU: { name: 'Vendu', color: 'bg-purple-500' },
  ENCOURS_DE_PROPOSITION: { name: 'En cours de proposition', color: 'bg-orange-500' },
};

export const TrancheDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const {  selectProjet, clearSelectedProjet } = useProjet();
  const { user } = useAuth();
  const [trancheData, setTrancheData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('blocs');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const fetchTrancheDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${APIURL.TRANCHES}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const trancheDetails = response.data;
      setTrancheData(trancheDetails);
      console.log('fetched tranche data', trancheDetails);
      
      // Update the context with the project details if available
      if (trancheDetails.projet) {
        selectProjet(trancheDetails.projet);
      }
      
      setActiveTab('bien');
    } catch (err) {
      console.error("Error fetching tranche details:", err);
      setError(err.message || "Failed to fetch tranche details");
      
      // If the tranche doesn't exist or we can't access it, clear selection
      if (err.response?.status === 404) {
        clearSelectedProjet();
      }
    } finally {
      setLoading(false);
    }
  }, [id, selectProjet, clearSelectedProjet]);

  useEffect(() => {
    if (id) {
      fetchTrancheDetails();
    }
  }, [id, fetchTrancheDetails]);

  // Handle edit action
  const handleEdit = () => {
    router.push(`/Tranches/${id}/modifier`);
  };

  // Handle delete action
  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    router.push("/Projets"); // Redirect to projects page
  };

 const allTabsData = useMemo(() => {
  if (!trancheData || !trancheData.tranche) return {};

  const projet = trancheData.tranche.projet;
  // Check project counts to determine which tabs to show
  const showBiens = projet?.nbre_biens > 0;
  const showBlocs = projet?.nbre_blocs > 0;
  const showImmeubles = projet?.nbre_immeubles > 0;

  const biensData = showBiens ? trancheData.tranche.bien || [] : [];
  const blocsData = showBlocs ? trancheData.tranche.bloc || [] : [];
  const immeublesData = showImmeubles ? trancheData.tranche.immeuble || [] : [];

  // Rest of your existing tab data processing...
  const typeBienOptions = Array.from(
    new Set(
      biensData.map(b => b.type_bien?.type).filter(Boolean) || []
    )
  ).map(type => ({ value: type, label: type }));
  
  const statusCounts = biensData.reduce((acc, b) => {
    const status = b.etat;
    if (status) {
      acc[status] = (acc[status] || 0) + 1;
    }
    return acc;
  }, {});

  const defaultStatuses = Object.entries(STATUS_CONFIG).map(([key, config]) => ({
    name: config.name,
    count: statusCounts?.[key] || 0,
    color: config.color
  }));

  const biens = biensData.map(b => {
    const statusConfig = STATUS_CONFIG[b.etat] || { name: b.etat, color: 'bg-gray-500' };
    
    return {
      id: b.id,
      name: b.propriete_dite_bien,
      type: b.type_bien?.type || 'Inconnu',
      surface: b.superficie_habitable || b.superficie_architecte,
      price: b.prix,
      status: statusConfig.name,
      statusColor: statusConfig.color,
      originalStatus: b.etat,
    };
  }) || [];

  const immeubles = immeublesData.map(i => ({
    id: i.id,
    nom: i.nom,
    bloc_nom: blocsData.find(b => b.id === i.bloc_id)?.nom || '',
    titre_foncier: i.titre_foncier,
    nbre_biens: i.nbre_biens || 0,
  })) || [];

  const blocs = blocsData.map(b => ({
    id: b.id,
    nom: b.nom,
    titre_foncier: b.titre_foncier,
    nbre_immeubles: b.nbre_immeubles || 0,
    nbre_biens: b.nbre_biens || 0,
  })) || [];

  // Only include tabs if their corresponding project count is > 0
  const tabs = {};
  
  if (showBlocs) {
    tabs.blocs = {
      count: blocs.length,
      items: blocs,
      nbr_count: blocs.length,
    };
  }

  if (showImmeubles) {
    tabs.immeuble = {
      count: immeubles.length,
      items: immeubles,
      nbr_count: immeubles.length,
    };
  }

  if (showBiens) {
    tabs.bien = {
      count: biens.length,
      statuses: defaultStatuses,
      items: biens,
      nbr_count: biens.length,
      typeBienOptions,
    };
  }

  return tabs;
}, [trancheData]);

  const filteredTabsData = useMemo(() => {
    return Object.fromEntries(
      Object.entries(allTabsData).filter(([_, tabData]) => tabData.nbr_count >= 0)
    );
  }, [allTabsData]);

  useEffect(() => {
    if (!filteredTabsData[activeTab] && Object.keys(filteredTabsData).length > 0) {
      setActiveTab(Object.keys(filteredTabsData)[0]);
    }
  }, [filteredTabsData, activeTab]);

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

  if (!trancheData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl font-semibold mb-4">Tranche Not Found</div>
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
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="w-full lg:w-1/3">
          <LeftCard 
            tranche={{...trancheData.tranche}} 
            type="tranche"
            onEdit={handleEdit}  
            onDelete={handleDelete}  
            canEdit={isSuperAdmin(user?.role) || isAdmin(user?.role)}
          />
        </div>
        <div className="w-full lg:w-2/3">
          <RightCard
            tabsData={filteredTabsData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            fetchTrancheData={fetchTrancheDetails}
            trancheId={id}
            projetId={trancheData?.tranche?.projet_id}          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.TRANCHES}
            Id={id}
            type="Tranche"
            message="Êtes-vous sûr de vouloir supprimer cette tranche ? Cette action est irréversible."
            accessToken={localStorage.getItem("accessToken")}
            onClose={() => setShowDeleteModal(false)}
            onSuccess={handleDeleteSuccess}
          />
        </Modal>
      )}
    </div>
  );
};