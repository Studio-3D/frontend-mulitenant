'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useProjet } from '@/context/ProjetContext';
import { useSociete } from '@/context/SocieteContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Table from '@/components/Table';
import { Eye, PencilLine, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import { isAdmin, isSuperAdmin } from '@/configs/enum';
import ProjetFilter from '../Projets/ProjetFilter';
import { toast } from 'react-hot-toast';

const ENTITY_CONFIG = {
  API_URL: 'projets',
  dataKey: 'projets',
  name: 'Projet',
  searchFields: ['nom', 'code', 'type', 'adresse'],
};

const INITIAL_FILTERS = {
  nom: '',
  code: '',
  type: '',
  adresse: '',
  date: '',
};

export default function ProjetsPage({ user_id }) {
  // Context hooks
  const { selectedSociete } = useSociete();
  const { user } = useAuth();
  const router = useRouter();

  // State management
  const [projets, setProjets] = useState([]);
  const [typeProjets, setTypeProjets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [tempFilters, setTempFilters] = useState(INITIAL_FILTERS);
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Memoized values
  const accessToken = useMemo(
    () =>
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null,
    []
  );

  const filteredProjets = useMemo(() => {
    if (!projets) return [];
    return projets.map((projet) => ({
      id: projet.id,
      nom: projet.nom || 'Sans nom',
      code: projet.code || '',
      type: projet.type_projet?.type || '',
      adresse: projet.adresse || '',
      date: new Date(projet.created_at).toLocaleDateString('fr-FR') || '',
    }));
  }, [projets]);

  const dataToExport = useMemo(() => {
    return filteredProjets.map((projet) => ({
      'Nom du projet': projet.nom,
      Code: projet.code,
      Type: projet.type,
      Adresse: projet.adresse,
      'Date création': projet.date,
    }));
  }, [filteredProjets]);

  const columns = useMemo(
    () => [
      { key: 'nom', label: 'Nom du projet' },
      { key: 'code', label: 'Code' },
      { key: 'type', label: 'Type' },
      { key: 'adresse', label: 'Adresse' },
      { key: 'date', label: 'Date création' },
      {
        key: 'actions',
        label: 'Actions',
        render: (row) => (
          <div className="flex gap-4 items-center">
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={() => handleAction('view', row.id)}
              title="Voir Projet"
            >
              <Eye className="w-4 h-4" />
            </button>
            {(isSuperAdmin(user?.role) || isAdmin(user?.role)) && (
              <>
                <button
                  className="text-yellow-500 hover:text-yellow-700"
                  onClick={() => handleAction('edit', row.id)}
                  title="Modifier Projet"
                >
                  <PencilLine className="w-4 h-4" />
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => {
                    setSelectedId(row.id);
                    setShowDeleteModal(true);
                  }}
                  title="Supprimer le projet"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [user?.role]
  );

  // API calls
  const fetchProjetsData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        size: rowsPerPage,
        search: searchTerm,
        ...(user_id && { user_id }),
        ...filters,
      };

      const response = await axios.get(
        `${APIURL.ROOT}/v1/${ENTITY_CONFIG.API_URL}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params,
        }
      );

      setProjets(response.data[ENTITY_CONFIG.dataKey] || []);
      setTotalRows(response.data.pagination?.totalItems || 0);
    } catch (err) {
      console.error('API Error:', err);
      const errorMessage =
        err.response?.data?.message || 'Erreur lors du chargement des données';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [accessToken, currentPage, rowsPerPage, searchTerm, user_id, filters]);

  const fetchTypeProjets = useCallback(async () => {
    try {
      const response = await axios.get(`${APIURL.ROOT}/v1/typeProjets`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setTypeProjets(response.data.typeProjets || []);
    } catch (error) {
      console.error('Error fetching type projets:', error);
      toast.error('Failed to fetch project types');
    }
  }, [accessToken]);

  // Handlers
  const handleAction = useCallback(
    (action, id) => {
      switch (action) {
        case 'view':
          router.push(`/Projets/${id}`);
          break;
        case 'edit':
          router.push(`/Projets/editProject/${id}`);
          break;
        default:
          console.log(`Action ${action} for project ${id}`);
      }
    },
    [router]
  );

  const handleFilterChange = useCallback((field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const applyFilters = useCallback(() => {
    setFilters(tempFilters);
    setCurrentPage(1);
  }, [tempFilters]);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setTempFilters(INITIAL_FILTERS);
    setCurrentPage(1);
  }, []);

  // Effects
  useEffect(() => {
    fetchTypeProjets();
  }, [fetchTypeProjets]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjetsData();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchProjetsData]);

  return (
    <div className="relative bg-white shadow-md rounded-lg px-4 py-4">
      <Table
        showSearch={false}
        loading={loading}
        title={user_id ? 'Liste des projets' : 'Projets'}
        data_to_export={dataToExport}
        columns_export={[
          { key: 'Nom du projet', label: 'Nom' },
          { key: 'Code', label: 'Code' },
          { key: 'Type', label: 'Type' },
          { key: 'Adresse', label: 'Adresse' },
          { key: 'Date création', label: 'Date de création' },
        ]}
        name_file_export="projet_export"
        columns={columns}
        filterComponent={
          <ProjetFilter
            tempFilters={tempFilters}
            handleFilterChange={handleFilterChange}
            resetFilters={resetFilters}
            applyFilters={applyFilters}
            typeProjets={typeProjets}
            loading={loading}
          />
        }
        data={filteredProjets}
        totalRows={totalRows}
        error={error}
        addLink={
          isSuperAdmin(user?.role) || (isAdmin(user?.role) && !user_id)
            ? '/Projets/addProject'
            : undefined
        }
        onSearchChange={setSearchTerm}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
        enableExport={filteredProjets.length > 0}
      />

      {showDeleteModal && selectedId && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.PROJETS}
            Id={selectedId}
            type="Projet"
            message="Êtes-vous sûr de vouloir supprimer ce projet ?"
            accessToken={accessToken}
            onClose={() => {
              setShowDeleteModal(false);
              fetchProjetsData();
            }}
          />
        </Modal>
      )}
    </div>
  );
}
