'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import Table from '@/components/Table';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from "@/context/AuthContext";
import { Eye, PencilLine, Trash2 } from "lucide-react";
import BienFilter from './BienFilter';
import Modal from '../Modal';
import DeleteData from '../DeleteData';
import { BIEN_ETATS, decryptBienEtat, getEtatLabel, rowBienBackgroundColors } from '../bien-utils';
import SelectInput from '../SelectInput';
import BienImport from './BienImport';

export default function BienTable({ projetId, immeubleId, blocId, trancheId }) {
  const [biens, setBiens] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [stats, setStats] = useState([]);
  const [types, setTypes] = useState([]);
  const [activeTab, setActiveTab] = useState("tous");
  const [type_id, settype_id] = useState(null);
  const router = useRouter();
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    propriete_dite_bien: '', 
    immeuble: '', 
    bloc: '', 
    tranche: '', 
    type_id: '',
    vue: '', 
    typologie: '', 
    etat: '', 
    orientation: '', 
    niveau: '',
    prix_min: '', 
    prix_max: '', 
    superficie_min: '', 
    superficie_max: '',
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });
  const accessToken = localStorage.getItem("accessToken");

  // Memoized select options
  const selectOptions = useMemo(() => {
    return [
      { value: 'tous', label: 'Tous' },
      ...types.map(type => ({
        value: type.id,
        label: type.type
      }))
    ];
  }, [types]);


 const handleRowsPerPageChange = (rows) => {
  setRowsPerPage(rows);
  setCurrentPage(1); 
};

  // Fetch total stats
  const fetchTotalStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      let params = { ...filters };
      if (projetId) params.projet_id = projetId;
      if (trancheId) params.tranche_id = trancheId;
      if (blocId) params.bloc_id = blocId;
      if (immeubleId) params.immeuble_id = immeubleId;
      if (type_id) params.type_id = type_id;

      const response = await axios.get(`${APIURL.ROOTV1}/getTotalsStatistique/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params
      });

      const apiData = response.data.data;
      const total1 = response.data.total;
      const allEtats = Object.keys(BIEN_ETATS);

      const transformedStats = allEtats.map((etat) => ({
        label: BIEN_ETATS[etat]?.label || "Inconnu",
        value: apiData[etat]?.total || 0,
        total: total1,
        color: rowBienBackgroundColors[decryptBienEtat(etat)] || "#CCCCCC",
      }));

      setStats(transformedStats);
    } catch (error) {
      toast.error("Erreur lors du chargement des statistiques globales");
    } finally {
      setStatsLoading(false);
    }
  }, [filters, projetId, trancheId, blocId, immeubleId, type_id, accessToken]);

  // Fetch stats by type
  const fetchStatsByType = useCallback(async (typeId) => {
    try {
      setStatsLoading(true);
      let params = { ...filters, type_id: typeId };
      if (projetId) params.projet_id = projetId;
      if (trancheId) params.tranche_id = trancheId;
      if (blocId) params.bloc_id = blocId;
      if (immeubleId) params.immeuble_id = immeubleId;

      const response = await axios.get(`${APIURL.ROOTV1}/getTotalsStatistique/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params
      });

      const apiData = response.data.data;
      const total1 = response.data.total;
      const allEtats = Object.keys(BIEN_ETATS);

      const transformedStats = allEtats.map((etat) => ({
        label: BIEN_ETATS[etat]?.label || "Inconnu",
        value: apiData[etat]?.total || 0,
        total: total1,
        color: rowBienBackgroundColors[decryptBienEtat(etat)] || "#CCCCCC",
      }));

      setStats(transformedStats);
    } catch (error) {
      toast.error("Erreur lors du chargement des statistiques par type");
    } finally {
      setStatsLoading(false);
    }
  }, [filters, projetId, trancheId, blocId, immeubleId, accessToken]);

  // Fetch stats and types
  const fetchStatsAndTypes = useCallback(async () => {
    try {
      await fetchTotalStats();
      
      const typesResponse = await axios.get(`${APIURL.ROOTV1}/typeBiens`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      setTypes(typesResponse.data.data || []);
    } catch (error) {
      toast.error("Erreur lors du chargement des types");
    }
  }, [accessToken, fetchTotalStats]);

  // Fetch biens data with pagination
  const fetchBiens = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    const params = {
      ...filters,
      ...(projetId && { projet_id: projetId }),
      ...(trancheId && { tranche_id: trancheId }),
      ...(blocId && { bloc_id: blocId }),
      ...(immeubleId && { immeuble_id: immeubleId }),
      ...(type_id && { type_id }),
      page: currentPage,
      size: rowsPerPage, // Use the rowsPerPage state here
    };

    const response = await axios.get(`${APIURL.ROOTV1}/biens`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params
    });

    if (response.data?.data) {
      setBiens(response.data.data);
      setTotalRows(response.data.pagination?.totalItems || response.data.total || 0);
    } else {
      throw new Error("Invalid API response format");
    }
  } catch (err) {
    console.error('Error loading biens:', err);
    setError(err.response?.data?.message || "Erreur lors du chargement des biens");
    toast.error("Échec du chargement des données");
  } finally {
    setLoading(false);
  }
}, [filters, projetId, trancheId, blocId, immeubleId, type_id, currentPage, rowsPerPage, accessToken]);

  // Filter handlers
  const handleFilterChange = (field, value) => {
    setTempFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    const reset = {
      propriete_dite_bien: '', 
      immeuble: '', 
      bloc: '', 
      tranche: '', 
      type_id: '',
      vue: '', 
      typologie: '', 
      etat: '', 
      orientation: '', 
      niveau: '',
      prix_min: '', 
      prix_max: '', 
      superficie_min: '', 
      superficie_max: '',
    };
    setFilters(reset);
    setTempFilters(reset);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
  setCurrentPage(page);
};

  // Handle type selection
  const handleTypeClick = (typeId) => {
    setActiveTab(typeId);
    settype_id(typeId === "tous" ? null : typeId);
    setCurrentPage(1);
  };

  // Fetch data when dependencies change
  useEffect(() => {
    if (projetId) {
      fetchBiens();
      fetchStatsAndTypes();
    }
  }, [projetId, fetchBiens, fetchStatsAndTypes]);

  // Fetch stats when filters or type changes
  useEffect(() => {
    if (projetId) {
      if (activeTab === "tous") {
        fetchTotalStats();
      } else {
        fetchStatsByType(activeTab);
      }
    }
  }, [filters, activeTab, projetId, fetchTotalStats, fetchStatsByType]);

  // Format biens for table
  const formattedBiens = useMemo(() => biens.map(bien => ({
    id: bien.id,
    propriete_dite_bien: bien.propriete_dite_bien || 'Sans nom',
    numero: bien.numero || '',
    niveau: bien.niveau?.toString() || '',
    immeuble_nom: bien.immeuble?.nom || '',
    tranche: bien.tranche?.nom || '',
    bloc: bien.bloc?.nom || '',
    prix: bien.prix?.toLocaleString('fr-FR') || '0',
    etat: bien.etat,
    type: bien.type_bien?.type || '',
  })), [biens]);

  // Table columns
  const columns = useMemo(() => [
    { key: 'propriete_dite_bien', label: 'Désignation' },
    { key: 'numero', label: 'Numéro' },
    { key: 'niveau', label: 'Niveau' },
    { key: 'type', label: 'Type' },
    { key: 'prix', label: 'Prix (Dhs)' },
    {
      key: 'etat',
      label: 'État',
      render: (row) => {
        const label = getEtatLabel(row.etat);
        const color = rowBienBackgroundColors[decryptBienEtat(row.etat)];
        return (
          <span className="text-xs font-medium px-2.5 py-0.5 rounded" style={{ backgroundColor: color }}>
            {label}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => {
        const canManage = user?.role === 1 || user?.role === 2;
        return (
          <div className="flex gap-4 items-center">
            {canManage && (
              <>
                <button onClick={() => handleAction('view', row.id)} title="Voir le bien" className="text-blue-500 hover:text-blue-700">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => handleAction('edit', row.id)} title="Modifier le bien" className="text-yellow-500 hover:text-yellow-700">
                  <PencilLine className="w-4 h-4" />
                </button>
                <button onClick={() => { setSelectedId(row.id); setShowDeleteModal(true); }} title="Supprimer le bien" className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        );
      }
    }
  ], [user?.role]);

  // Export data
  const data_to_export = useMemo(() => formattedBiens.map((bien) => ({
    Désignation: bien.propriete_dite_bien,
    Numéro: bien.numero,
    Niveau: bien.niveau,
    Immeuble: bien.immeuble_nom,
    Tranche: bien.tranche,
    Bloc: bien.bloc,
    Type: bien.type,
    Prix: bien.prix,
    État: getEtatLabel(bien.etat),
  })), [formattedBiens]);

  const columns_export = useMemo(() => [
    { key: "Désignation", label: "Désignation" },
    { key: "Numéro", label: "Numéro" },
    { key: "Niveau", label: "Niveau" },
    { key: "Immeuble", label: "Immeuble" },
    { key: "Tranche", label: "Tranche" },
    { key: "Bloc", label: "Bloc" },
    { key: "Type", label: "Type bien" },
    { key: "Prix", label: "Prix" },
    { key: "État", label: "État" },
  ], []);

  // Handle actions
  const handleAction = (action, id) => {
    if (action === 'view') router.push(`/Biens/${id}`);
    else if (action === 'edit') router.push(`/Biens/${id}/modifier`);
  };

  // Add button URL
  const addButtonUrl = (user?.role === 1 || user?.role === 2)
    ? `/Biens/ajouter?projet=${projetId}${blocId ? `&bloc=${blocId}` : ''}${immeubleId ? `&immeuble=${immeubleId}` : ''}${trancheId ? `&tranche=${trancheId}` : ''}`
    : "";

  // Error and empty states
  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (!projetId) {
    return <div className="p-4">Veuillez sélectionner un projet</div>;
  }

  return (
    <div>
      
      <div>
        {/* title section */}
          <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Biens</h3>
          <div className="min-w-[100px] relative z-10">
            <SelectInput
              value={activeTab}
              onChange={handleTypeClick}
              options={selectOptions}
              width="w-full"
            />
          </div>
        </div>

        {/* Stats Section with Loading State */}
      <div className="flex flex-col xl:flex-row items-center gap-1 mb-6">
        <div className="flex-1">
          {statsLoading ? (
            <div className="grid xl:grid-cols-6 grid-cols-1 gap-1">
              {Array.from({ length: 6 }).map((_, index) => (
                <div 
                  key={index} 
                  className="h-[50px] w-full bg-gray-200 rounded-md animate-pulse"
                ></div>
              ))}
            </div>
          ) : stats?.length > 0 ? (
            <div className="grid xl:grid-cols-6 grid-cols-1 gap-1">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center p-2 rounded-md" 
                  style={{ 
                    backgroundColor: stat.color, 
                    height: '50px', 
                    width: '100%' 
                  }}
                >
                  <span className="text-xs font-bold">{stat.label}</span>
                  <span className="text-sm">{stat.value} / {stat.total}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-sm text-gray-500">Aucune donnée disponible</span>
          )}
        </div>
      </div>
      
        {/* Table Section */}
        <Table
          showSearch={false}
          columns={columns}
          data={formattedBiens}
          totalRows={totalRows}
          loading={loading}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          filterComponent={
            <BienFilter
              tempFilters={tempFilters}
              handleFilterChange={handleFilterChange}
              resetFilters={resetFilters}
              applyFilters={applyFilters}
              trancheId={trancheId}
              blocId={blocId}
              immeubleId={immeubleId}
            />
          }
          error={error}
          addLink={addButtonUrl}
          currentPage={currentPage}
          enableExport={formattedBiens.length > 0}
          data_to_export={data_to_export}
          columns_export={columns_export}
          name_file_export={"bien_export"}
          onFilterToggle={(isOpen) => { if (!isOpen) resetFilters(); }}
          enableImport={true}
          onImportClick={() => setShowImportModal(true)}
          showRowsPerPage={true} // Make sure this is true to show the rows per page selector
        />
        </div>    

      {showDeleteModal && selectedId && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.BIENS}
            Id={selectedId}
            type="Bien"
            message="Êtes-vous sûr de vouloir supprimer ce bien ?"
            accessToken={accessToken}
            onClose={() => {
              setShowDeleteModal(false);
              fetchBiens();
            }}
          />
        </Modal>
      )}

      <BienImport
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        projetId={projetId}
      />
    </div>
  );
}