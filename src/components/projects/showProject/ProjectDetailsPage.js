'use client';
import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { LeftCard } from './LeftCard';
import { RightCard } from './RightCard';
import { APIURL } from "@/configs/api";
import { useProjet } from "@/context/ProjetContext";
import axios from "axios";

// Define status mapping outside component to avoid recreation
const STATUS_CONFIG = {
  DISPONIBLE: { name: 'Disponible', color: 'bg-green-500' },
  PRE_RESERVATION: { name: 'Pré-réservé', color: 'bg-yellow-500' },
  RESERVATION: { name: 'Réservé', color: 'bg-blue-500' },
  BLOQUE: { name: 'Bloqué', color: 'bg-red-500' },
  VENDU: { name: 'Vendu', color: 'bg-purple-500' },
  ENCOURS_DE_PROPOSITION: { name: 'En cours de proposition', color: 'bg-orange-500' },
};

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const { selectProjet } = useProjet();
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('bien');
  
  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${APIURL.PROJETS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjectData(response.data);
      selectProjet(response.data.projet);
      setActiveTab('bien'); 
      console.log("Project details fetched successfully:", response.data);
    } catch (err) {
      console.error("Error fetching project details:", err);
      setError(err.message || "Failed to fetch project details");
    } finally {
      setLoading(false);
    }
  }, [id, selectProjet]);

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id, fetchProjectDetails]);

  const allTabsData = useMemo(() => {
    if (!projectData) return {};

    const typeBienOptions = Array.from(
      new Set(
        projectData?.projet.bien?.map(b => b.type_bien?.type).filter(Boolean) || []
      )
    ).map(type => ({ value: type, label: type }));
    
    // Calculate status counts dynamically
    const statusCounts = projectData?.projet.bien?.reduce((acc, b) => {
      const status = b.etat;
      if (status) {
        acc[status] = (acc[status] || 0) + 1;
      }
      return acc;
    }, {});

    // Map to the expected status format with dynamic counts using STATUS_CONFIG
    const defaultStatuses = Object.entries(STATUS_CONFIG).map(([key, config]) => ({
      name: config.name,
      count: statusCounts?.[key] || 0,
      color: config.color
    }));

    // Map bien data to match your column requirements
    const biens = projectData?.projet.bien?.map(b => {
      const statusConfig = STATUS_CONFIG[b.etat] || { name: b.etat, color: 'bg-gray-500' };
      
      return {
        id: b.id,
        name: b.propriete_dite_bien,
        type: b.type_bien?.type || 'Inconnu',
        surface: b.superficie_habitable || b.superficie_architecte,
        price: b.prix,
        status: statusConfig.name, // Use the display name from STATUS_CONFIG
        statusColor: statusConfig.color, // Include the color for table display
        originalStatus: b.etat, // Keep original status for filtering/sorting if needed
      };
    }) || [];

    // Map tranche data to match your column requirements
    const tranches = projectData?.projet.tranche?.map(t => ({
      id: t.id,
      nom: t.nom,
      date_lancement: t.date_lancement,
      date_livraison: t.date_livraison,
      niveau_etages: t.niveau_etages || 0,
    })) || [];

    // Map immeuble data to match your column requirements
    const immeubles = projectData?.projet.immeuble?.map(i => ({
      id: i.id,
      nom: i.nom,
      tranche_nom: projectData?.projet.tranche.find(t => t.id === i.tranche_id)?.nom || '',
      bloc_nom: projectData?.projet.bloc.find(b => b.id === i.bloc_id)?.nom || '',
      titre_foncier: i.titre_foncier,
      nbre_biens: 0, // Default value since it wasn't in the API response
    })) || [];

    // Map bloc data to match your column requirements
    const blocs = projectData?.projet.bloc?.map(b => ({
      id: b.id,
      nom: b.nom,
      tranche_nom: projectData?.projet.tranche?.find(t => t.id === b.tranche_id)?.nom || '',
      titre_foncier: b.titre_foncier,
      nbre_immeubles: b.nbre_immeubles || 0, // Default value since it wasn't in the API response
      nbre_biens: b.nbre_biens || 0, // Default value since it wasn't in the API response
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
      Object.entries(allTabsData).filter(([_, tabData]) => tabData.nbr_count > 0)
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
        <div className="flex flex-colc  lg:flex-row gap-6 h-full">
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
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (!projectData) {
    return <div className="p-4">Project not found</div>;
  }

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="w-full lg:w-1/3">
          <LeftCard project={{ ...projectData.projet }} />
        </div>
        <div className="w-full lg:w-2/3">
          <RightCard
            tabsData={filteredTabsData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            fetchProjectData={fetchProjectDetails}
            projectId={id}
          />
        </div>
      </div>
    </div>
  );
};