"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import Table from '@/components/Table';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from "@/context/AuthContext";
import { Eye, PencilLine, Trash2 } from "lucide-react";
import BienFilter from './BienFilter';
import { fetchData_table_by_projet, fetchDataByProjet_params } from '@/configs/api-utils';
import Modal from '../Modal';
import DeleteData from '../DeleteData';
import { BIEN_ETATS, decryptBienEtat, getEtatLabel, rowBienBackgroundColors } from '../bien-utils';
import BienImport from './BienImport';

export default function BienTable({ projetId, immeubleId, blocId, trancheId }) {
  const [biens, setBiens] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const accessToken = localStorage.getItem("accessToken");
  const [totalRows, setTotalRows] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
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

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
  };

  const resetFilters = () => {
    const reset = {
      propriete_dite_bien: '',
      num: '',
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
  };

  const fetchTypes = async () => {
    try {
      setActiveTab("tous");
      fetchTotalStats();
      await fetchDataByProjet_params('typeBiens', setTypes, () => {});
      setTypes(current => [{ id: 'tous', type: 'Tous', prenom: '' }, ...current]);
    } catch (error) {
      console.error("Erreur lors de la récupération des types :", error);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  useEffect(() => {
    fetchTotalStats();
  }, [filters]);

  const fetchStatsByType = (typeId) => {
    setStats([]);
    let params = { ...filters };

    if (projetId) {
      params = { ...params, projet_id: projetId };
    } else if (trancheId) {
      params = { ...params, tranche_id: trancheId };
    } else if (blocId) {
      params = { ...params, bloc_id: blocId };
    } else if (immeubleId) {
      params = { ...params, immeuble_id: immeubleId };
    }

    axios
      .get(`${APIURL.ROOTV1}/getEtatBien_ByType/${projetId}/${typeId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params
      })
      .then((response) => {
        const apiData = response.data.data;
        const totalItem = response.data.total;
        const allEtats = Object.keys(BIEN_ETATS);

        const transformedStats = allEtats.map((etat) => {
          const matchedData = apiData[etat] || {};
          const total = matchedData?.total || 0;
          const label = BIEN_ETATS[etat]?.label || "Inconnu";
          const color = rowBienBackgroundColors[decryptBienEtat(etat)] || "#CCCCCC";

          return {
            label,
            value: total,
            total: totalItem,
            color,
          };
        });

        setStats(transformedStats);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des données :", error);
      });
  };

  const fetchTotalStats = () => {
    let params = { ...filters };

    if (projetId) {
      params = { ...params, projet_id: projetId };
    } else if (trancheId) {
      params = { ...params, tranche_id: trancheId };
    } else if (blocId) {
      params = { ...params, bloc_id: blocId };
    } else if (immeubleId) {
      params = { ...params, immeuble_id: immeubleId };
    } else if (type_id) {
      params = { ...params, type_id: type_id };
    }

    setStats([]);

    axios
      .get(`${APIURL.ROOTV1}/getTotalsStatistique/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params,
      })
      .then((response) => {
        const apiData = response.data.data;
        const total1 = response.data.total;
        const allEtats = Object.keys(BIEN_ETATS);

        const transformedStats = allEtats.map((etat) => {
          const matchedData = apiData[etat] || {};
          const total = matchedData?.total || 0;
          const label = BIEN_ETATS[etat]?.label || "Inconnu";
          const color = rowBienBackgroundColors[decryptBienEtat(etat)] || "#CCCCCC";

          return {
            label,
            value: total,
            total: total1,
            color,
          };
        });

        setStats(transformedStats);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des statistiques globales :", error);
      });
  };

  const handleTypeClick = (typeId) => {
    setActiveTab(typeId);
    if (typeId === "tous") {
      settype_id(null);
      fetchTotalStats();
    } else {
      settype_id(typeId);
      fetchStatsByType(typeId);
    }
  };

  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters();
  };

  const columns = [
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
          <span
            className="text-xs font-medium px-2.5 py-0.5 rounded"
            style={{ backgroundColor: color }}
          >
            {label}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => {
        const canManageBiens = user?.role === 1 || user?.role === 2;
        
        return (
          <div className="flex gap-4 items-center">
            {canManageBiens && (
              <>
                <button
                  className="text-blue-500 hover:text-blue-700"
                  onClick={() => handleAction('view', row.id)}
                  title="Voir le bien"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  className="text-yellow-500 hover:text-yellow-700"
                  onClick={() => handleAction('edit', row.id)}
                  title="Modifier le bien"
                >
                  <PencilLine className="w-4 h-4" />
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => {
                    setSelectedId(row.id);
                    setShowDeleteModal(true);
                  }}  
                  title="Supprimer le bien"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        );
      }
    }
  ];

  const entity = {
    API_URL: "biens",
    dataKey: "data",
    name: "bien",
    searchFields: ['propriete_dite_bien', 'numero'],
  };

  const loadData = () => {
    const filtersToUse = {
      ...filters,
      ...(projetId ? { projet_id: projetId } : {}),
      ...(trancheId ? { tranche_id: trancheId } : {}),
      ...(blocId ? { bloc_id: blocId } : {}),
      ...(immeubleId ? { immeuble_id: immeubleId } : {}),
    };

    fetchData_table_by_projet(
      entity,
      filtersToUse,
      searchTerm,
      currentPage,
      rowsPerPage,
      accessToken,
      () => {},
      setError,
      setBiens,
      setTotalRows
    );
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, accessToken, projetId, trancheId, blocId, immeubleId, filters, currentPage, rowsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  const formattedBiens = biens
    .filter(bien => 
      searchTerm === '' || 
      bien.propriete_dite_bien?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bien.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bien.immeuble?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(bien => ({
      id: bien.id,
      propriete_dite_bien: bien.propriete_dite_bien || 'Sans nom',
      numero: bien.numero || '',
      niveau: bien.niveau?.toString() || '',
      immeuble_nom: bien.immeuble?.nom || '',
      prix: bien.prix?.toLocaleString('fr-FR') || '0',
      etat: bien.etat,
      type: bien?.type_bien?.type 
    }));

  const paginatedData = formattedBiens.slice(
    (currentPage - 1) * rowsPerPage, 
    currentPage * rowsPerPage
  );

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const data_to_export = () => {
    return formattedBiens.map((bien) => ({
      Désignation: bien.propriete_dite_bien,
      Numéro: bien.numero,
      Niveau: bien.niveau,
      Immeuble: bien?.immeuble_nom,
      tranche: bien?.tranche?.nom,
      bloc: bien?.bloc?.nom,
      type: bien?.type_bien?.type,
      Prix: bien.prix,
      État: bien.etat
    }));
  };  

  const columns_export = [
    { key: "Désignation", label: "Désignation" },
    { key: "Numéro", label: "Numéro" },
    { key: "Niveau", label: "Niveau" },
    { key: "Immeuble", label: "Immeuble" },
    { key: "tranche", label: "Tranche" },
    { key: "bloc", label: "Bloc" },
    { key: "type", label: "Type bien" },
    { key: "Prix", label: "Prix" },
    { key: "État", label: "État" },
  ];

  const handleImportClick = () => {
    setShowImportModal(true);
  };

  const handleAction = (action, id) => {
    switch (action) {
      case 'view':
        router.push(`/Biens/${id}`);
        break;
      case 'edit':
        router.push(`/Biens/${id}/modifier`);
        break;
      default:
        console.log(`Action ${action} for bien ${id}`);
    }
  };

  const canManageBiens = user?.role === 1 || user?.role === 2;
  
  const addButtonUrl = canManageBiens 
    ? `/Biens/ajouter?projet=${projetId}${blocId ? `&bloc=${blocId}` : ''}${immeubleId ? `&immeuble=${immeubleId}` : ''}${trancheId ? `&tranche=${trancheId}` : ''}`
    : "";

  return (
    <div>
      {/* Header with Select and Stats */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-medium ">Biens</h3>
          {/* Type Select Dropdown */}
          <div className="min-w-[100px]">
            <select
              value={activeTab}
              onChange={(e) => handleTypeClick(e.target.value)}
              className="w-full px-3 py-1 cursor-pointer border rounded-md shadow-sm focus:outline-none focus:ring-1"
            >
              {types.map(({ id, type }) => (
                <option key={id} value={id}>
                  {type}
                </option>
              ))}
            </select>
          </div>
      </div>

      {/* Statistics Section */}
      <div className="flex flex-col xl:flex-row items-center gap-1 mb-10">
        {/* Statistics */}
        <div className="flex-1">
          {stats?.length > 0 ? (
            <div className="grid xl:grid-cols-6 grid-cols-1 gap-1 ">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center p-2 rounded-md" 
                     style={{ backgroundColor: stat.color,
                      height: '50px', width: '100%'
                     }}>
                        <span className="text-xs font-bold ">{stat.label}</span>
                        <span className="text-sm ">
                          {stat.value} / {stat.total}
                        </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-sm text-gray-500">Aucune donnée disponible</span>
          )}
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        totalRows={totalRows}
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
        onSearchChange={handleSearchChange}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        enableExport={formattedBiens.length > 0}
        onFilterToggle={handleFilterToggle}
        data_to_export={data_to_export()}
        columns_export={columns_export}
        name_file_export={"bien_export"}
        data={formattedBiens}
        showSearch={false}
        enableImport={true}
        onImportClick={handleImportClick}
      />

      {/* Modals */}
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
              loadData();
            }}
          />
        </Modal>
      )}

      <BienImport
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        projetId={projetId}
        trancheId={trancheId}
        blocId={blocId}
        immeubleId={immeubleId}
      />
    </div>
  );
}