'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import Table from '@/components/Table';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from "@/context/AuthContext";
import { Eye, PencilLine, Trash2 } from "lucide-react";
import BienFilter from './BienFilter';
import { fetchDataByProjet_params } from '@/configs/api-utils';
import Modal from '../Modal';
import DeleteData from '../DeleteData';
import { BIEN_ETATS, decryptBienEtat, getEtatLabel, rowBienBackgroundColors } from '../bien-utils';
import BienImport from './BienImport';

export default function BienTable({ projetId, immeubleId, blocId, trancheId }) {
  const [biens, setBiens] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
    propriete_dite_bien: '', immeuble: '', bloc: '', tranche: '', type_id: '',
    vue: '', typologie: '', etat: '', orientation: '', niveau: '',
    prix_min: '', prix_max: '', superficie_min: '', superficie_max: '',
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });
  const accessToken = localStorage.getItem("accessToken");

  const handleFilterChange = (field, value) => {
    setTempFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    const reset = {
      propriete_dite_bien: '', num: '', immeuble: '', bloc: '', tranche: '',
      type_id: '', vue: '', typologie: '', etat: '', orientation: '',
      niveau: '', prix_min: '', prix_max: '', superficie_min: '', superficie_max: '',
    };
    setFilters(reset);
    setTempFilters(reset);
    setCurrentPage(1);
  };

  const fetchTypes = async () => {
    try {
      setActiveTab("tous");
      await fetchTotalStats();
      await fetchDataByProjet_params('typeBiens', setTypes, () => {});
      setTypes(current => [{ id: 'tous', type: 'Tous', prenom: '' }, ...current]);
    } catch (error) {
      toast.error("Erreur lors du chargement des types");
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  useEffect(() => {
    fetchTotalStats();
  }, [filters]);

  const fetchStatsByType = async (typeId) => {
    setStats([]);
    let params = { ...filters, projet_id: projetId, type_id: typeId };

    try {
      const response = await axios.get(`${APIURL.ROOTV1}/getEtatBien_ByType/${projetId}/${typeId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params
      });

      const apiData = response.data.data;
      const totalItem = response.data.total;
      const allEtats = Object.keys(BIEN_ETATS);

      const transformedStats = allEtats.map((etat) => {
        const total = apiData[etat]?.total || 0;
        return {
          label: BIEN_ETATS[etat]?.label || "Inconnu",
          value: total,
          total: totalItem,
          color: rowBienBackgroundColors[decryptBienEtat(etat)] || "#CCCCCC",
        };
      });

      setStats(transformedStats);
    } catch (error) {
      toast.error("Erreur lors du chargement des statistiques");
    }
  };

  const fetchTotalStats = async () => {
    let params = { ...filters };
    if (projetId) params.projet_id = projetId;
    if (trancheId) params.tranche_id = trancheId;
    if (blocId) params.bloc_id = blocId;
    if (immeubleId) params.immeuble_id = immeubleId;
    if (type_id) params.type_id = type_id;

    setStats([]);

    try {
      const response = await axios.get(`${APIURL.ROOTV1}/getTotalsStatistique/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params,
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
    }
  };

  const handleTypeClick = (typeId) => {
    setActiveTab(typeId);
    settype_id(typeId === "tous" ? null : typeId);
    typeId === "tous" ? fetchTotalStats() : fetchStatsByType(typeId);
    setCurrentPage(1);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const filtersToUse = {
        ...filters,
        ...(projetId && { projet_id: projetId }),
        ...(trancheId && { tranche_id: trancheId }),
        ...(blocId && { bloc_id: blocId }),
        ...(immeubleId && { immeuble_id: immeubleId }),
      };

      const response = await axios.get(`${APIURL.ROOTV1}/biens`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          ...filtersToUse,
          search: searchTerm,
          page: currentPage,
          per_page: rowsPerPage,
        },
      });

      if (response.data?.data) {
        setBiens(response.data.data);
        setTotalRows(response.data.total || 0);
      } else {
        throw new Error("Format de données API invalide");
      }
    } catch (error) {
      toast.error("Échec du chargement des données");
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, accessToken, projetId, trancheId, blocId, immeubleId, filters, currentPage, rowsPerPage]);

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  const formattedBiens = biens.map(bien => ({
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
  }));

  // Apply pagination to the data prop
  const paginatedData = formattedBiens.slice(0, rowsPerPage);

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
  ];

  const data_to_export = () => formattedBiens.map((bien) => ({
    Désignation: bien.propriete_dite_bien,
    Numéro: bien.numero,
    Niveau: bien.niveau,
    Immeuble: bien.immeuble_nom,
    Tranche: bien.tranche,
    Bloc: bien.bloc,
    Type: bien.type,
    Prix: bien.prix,
    État: getEtatLabel(bien.etat),
  }));

  const columns_export = [
    { key: "Désignation", label: "Désignation" },
    { key: "Numéro", label: "Numéro" },
    { key: "Niveau", label: "Niveau" },
    { key: "Immeuble", label: "Immeuble" },
    { key: "Tranche", label: "Tranche" },
    { key: "Bloc", label: "Bloc" },
    { key: "Type", label: "Type bien" },
    { key: "Prix", label: "Prix" },
    { key: "État", label: "État" },
  ];

  const handleAction = (action, id) => {
    if (action === 'view') router.push(`/Biens/${id}`);
    else if (action === 'edit') router.push(`/Biens/${id}/modifier`);
  };

  const addButtonUrl = (user?.role === 1 || user?.role === 2)
    ? `/Biens/ajouter?projet=${projetId}${blocId ? `&bloc=${blocId}` : ''}${immeubleId ? `&immeuble=${immeubleId}` : ''}${trancheId ? `&tranche=${trancheId}` : ''}`
    : "";

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-medium">Biens</h3>
        <div className="min-w-[100px]">
          <select value={activeTab} onChange={(e) => handleTypeClick(e.target.value)} className="w-full px-3 py-1 cursor-pointer border rounded-md shadow-sm focus:outline-none focus:ring-1">
            {types.map(({ id, type }) => (
              <option key={id} value={id}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row items-center gap-1 mb-10">
        <div className="flex-1">
          {stats?.length > 0 ? (
            <div className="grid xl:grid-cols-6 grid-cols-1 gap-1">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center p-2 rounded-md" style={{ backgroundColor: stat.color, height: '50px', width: '100%' }}>
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

      <Table
        columns={columns}
        totalRows={totalRows}
        loading={loading}
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
        enableExport={biens.length > 0}
        onFilterToggle={(isOpen) => { if (!isOpen) resetFilters(); }}
        data_to_export={data_to_export()}
        columns_export={columns_export}
        name_file_export={"bien_export"}
        data={paginatedData} // Use paginated data here
        showSearch={true}
        enableImport={true}
        onImportClick={() => setShowImportModal(true)}
      />

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