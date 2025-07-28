"use client";
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useProjet } from '@/context/ProjetContext';
import { useSociete } from '@/context/SocieteContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Table from '@/components/Table';
import { Eye, PencilLine, Trash2 } from "lucide-react";
import * as XLSX from 'xlsx';
import { APIURL } from '@/configs/api';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import { fetchData_Select, fetchData_table_by_projet } from '@/configs/api-utils';
import Input from '@/components/Input';
import { isAdmin, isSuperAdmin } from '@/configs/enum';
import Select from 'react-select';
import InputSelect from '@/components/inputSelect';
import ProjetFilter from './ProjetFilter';

export default function ProjetsPage({ user_id }) {
  const { selectedSociete } = useSociete();
  const { fetchProjets } = useProjet();
  const { user } = useAuth();
  const [hasFetched, setHasFetched] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
  const [projets, setProjets] = useState([]);
  const [Typeprojets, setTypeProjets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [filters, setFilters] = useState({ nom: '', code: '', type: '', adresse: '', date: '' });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const entity = useMemo(() => ({
    API_URL: "projets",
    dataKey: "projets",
    name: "Projet",
    searchFields: ['nom', 'code', 'type', 'adresse'],
  }), []);

  // Memoized filtered projects
  const filteredProjets = useMemo(() => {
    if (!projets) return [];
    return projets.map(projet => ({
      id: projet.id,
      nom: projet.nom || 'Sans nom',
      code: projet.code || '',
      type: projet.type_projet?.type || '',
      adresse: projet.adresse || '',
      date: new Date(projet.created_at).toLocaleDateString('fr-FR') || '',
    }));
  }, [projets]);

  // Debounced fetch function
  const fetchProjetsData = useCallback(() => {
    const params_url = user_id ? { user_id: user_id } : {};
    const combinedFilters = { ...filters, ...params_url };
    
    fetchData_table_by_projet(
      entity,
      combinedFilters,
      searchTerm,
      currentPage,
      rowsPerPage,
      accessToken,
      setLoading,
      setError,
      setProjets,
      setTotalRows
    );
  }, [entity, filters, searchTerm, currentPage, rowsPerPage, accessToken, user_id]);

  // Fetch data with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjetsData();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [fetchProjetsData]);

  // Fetch type projects once
  useEffect(() => {
    fetchData_Select('typeProjets', setTypeProjets, setLoading);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((field, value) => {
    setTempFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const applyFilters = useCallback(() => {
    setFilters(tempFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, [tempFilters]);

  const resetFilters = useCallback(() => {
    const reset = { nom: '', code: '', type: '', adresse: '', date: '' };
    setFilters(reset);
    setTempFilters(reset);
    setCurrentPage(1); // Reset to first page when filters reset
  }, []);

  const handleFilterToggle = useCallback((isOpen) => {
    if (!isOpen) resetFilters();
  }, [resetFilters]);

  // Table columns with memoization
  const columns = useMemo(() => [
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
        </div>
      )
    }
  ], []);

  // Handle actions
  const handleAction = useCallback((action, id) => {
    switch (action) {
      case 'view':
        router.push(`/Projets/${id}`);
        break;
      case 'edit':
        router.push(`/Projets/${id}/modifier`);
        break;
      default:
        console.log(`Action ${action} for project ${id}`);
    }
  }, [router]);

  // Data for export
  const data_to_export = useMemo(() => {
    return filteredProjets.map((projet) => ({
      'Nom du projet': projet.nom,
      'Code': projet.code,
      'Type': projet.type,
      'Adresse': projet.adresse,
      'Date création': projet.date,
    }));
  }, [filteredProjets]);

  const columns_export = useMemo(() => [
    { key: "Nom du projet", label: "Nom" },
    { key: "Code", label: "Code" },
    { key: "Type", label: "Type" },
    { key: "Adresse", label: "Adresse" },
    { key: "Date création", label: "Date de création" },
  ], []);

  return (
    <div className="relative bg-white shadow-md rounded-lg px-4 py-4">
      <Table
        loading={loading}
        title={user_id ? 'Liste des projets' : 'Projets'}
        data_to_export={data_to_export}
        columns_export={columns_export}
        name_file_export={"projet_export"}
        columns={columns}
        filterComponent={
          <ProjetFilter
            tempFilters={tempFilters}
            handleFilterChange={handleFilterChange}
            resetFilters={resetFilters}
            applyFilters={applyFilters}
            typeProjets={Typeprojets}
            loading={loading}
          />
        }
        data={filteredProjets}
        totalRows={totalRows}
        error={error}
        onFilterToggle={handleFilterToggle}
        addLink={((isSuperAdmin(user?.role) || isAdmin(user?.role)) && !user_id ? "/Projets/ajouter" : undefined)}
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