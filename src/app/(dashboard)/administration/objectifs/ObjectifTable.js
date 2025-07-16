'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Table from '@/components/Table';
import { Eye, Pencil, Check, RefreshCw, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import { useAuth } from '../../../../context/AuthContext';
import { useProjet } from '../../../../context/ProjetContext';
import { APIURL, ENDPOINTS } from '../../../../configs/api';
import { useRouter } from 'next/navigation';
import { fetchData_table_by_projet } from '../../../../configs/api-utils';
import { isAdmin, isCommercial, isSuperAdmin } from '../../../../configs/enum';
import Input from '@/components/Input';
import { format } from 'date-fns';

const ObjectifTable = () => {
  const [objectifs, setObjectifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user, token } = useAuth();
  const { selectedProjet } = useProjet();
  const accesstoken = token || localStorage.getItem('accessToken');

  const router = useRouter();
  // Declare the entity object in the component scope
  const [filters, setFilters] = useState({
    date: "",commercial:""  
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const entity = {
    API_URL: 'objectifs',
    dataKey: 'data',
    searchFields: ['objectif'],
  };

  useEffect(() => {
    fetchData_table_by_projet(
      entity,
      filters,
      searchTerm,
      currentPage,
      rowsPerPage,
      accesstoken,
      setLoading,
      setError,
      setObjectifs,
      setTotalRows
    );
  }, [
    accesstoken,
    currentPage,
    rowsPerPage,
    searchTerm,
    filters,
    selectedProjet,
  ]);



  useEffect(() => {
        fetchData_table_by_projet(
          entity,
          filters,
          searchTerm,
          currentPage,
          rowsPerPage,
          accesstoken,
          setLoading,
          setError,
          setObjectifs,
          setTotalRows
        );
      
  }, [
    accesstoken,
    currentPage,
    rowsPerPage,
    searchTerm,
    filters,
    selectedProjet,
  ]);


  function handleEdit(ObjectifId) {
    router.push(`${ENDPOINTS.OBJECTIFS}?id=${ObjectifId}&action=edit`);
  }

  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
  };



  
  // Format users data for table display
  const formatData = () => {
    return objectifs.map((obj) => ({
      id: obj.id,
    date: obj.created_at ? format(new Date(obj.created_at), 'dd/MM/yyyy') : 'N/A',
    user: obj.user ? `${obj.user.name} ${obj.user.prenom}` : 'N/A',
    visites: obj.visites ? 
      `S: ${obj.visites.semaine} | J: ${obj.visites.jours} | M: ${obj.visites.mois}` : 
      'N/A',
    appels: obj.appels ? 
      `S: ${obj.appels.semaine} | J: ${obj.appels.jours} | M: ${obj.appels.mois}` : 
      'N/A',
    reservations: obj.reservations ? 
      `S: ${obj.reservations.semaine} | J: ${obj.reservations.jours} | M: ${obj.reservations.mois}` : 
      'N/A',
  }));
  };

   const columns = [
    { 
      key: 'date', 
      label: 'Date',
      sortable: true,
      onSort: () => requestSort("date"),
    },
    {
      key: "user",
      label: "Commercial",
      sortable: true,
      onSort: () => requestSort("user"),
    },
    {
      key: "visites",
      label: "Visites",
      sortable: true,
      onSort: () => requestSort("visites"),
    },
    {
      key: "appels",
      label: "Appels",
      sortable: true,
      onSort: () => requestSort("appels"),
    },
    {
      key: "reservations",
      label: "Réservations",
      sortable: true,
      onSort: () => requestSort("reservations"),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-3 items-center">
          <button
          className="text-blue-500 hover:text-blue-700"
          onClick={() => handleEdit(row.id)}
          title="Modifier"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          className="text-red-500 hover:text-red-700"
          onClick={() => {
            setSelectedId(row.id);
            setShowDeleteModal(true);
          }}
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        </div>
      ),
    },
  ];

   
  

  const data_to_export = () => {
    return objectifs.map((obj) => ({ 
     'ID': obj.id,
      'Date': obj.created_at ? format(new Date(obj.created_at), 'dd/MM/yyyy') : 'N/A',
      'Commercial': obj.user ? `${obj.user.name} ${obj.user.prenom}` : 'N/A',
      'Visites Jours': obj.visites?.jours || 0,
      'Visites Semaine': obj.visites?.semaine || 0,
      'Visites Mois': obj.visites?.mois || 0,
      'Appels Jours': obj.appels?.jours || 0,
      'Appels Semaine': obj.appels?.semaine || 0,
      'Appels Mois': obj.appels?.mois || 0,
      'Réservations Jours': obj.reservations?.jours || 0,
      'Réservations Semaine': obj.reservations?.semaine || 0,
      'Réservations Mois': obj.reservations?.mois || 0
    }));
  };

  const columns_export = [
  { key: 'ID', label: 'ID' },
  { key: 'Date', label: 'Date' },
  { key: 'Commercial', label: 'Commercial' },
  { key: 'Visites Jours', label: 'Visites (Jour)' },
  { key: 'Visites Semaine', label: 'Visites (Semaine)' },
  { key: 'Visites Mois', label: 'Visites (Mois)' },
  { key: 'Appels Jours', label: 'Appels (Jour)' },
  { key: 'Appels Semaine', label: 'Appels (Semaine)' },
  { key: 'Appels Mois', label: 'Appels (Mois)' },
  { key: 'Réservations Jours', label: 'Réservations (Jour)' },
  { key: 'Réservations Semaine', label: 'Réservations (Semaine)' },
  { key: 'Réservations Mois', label: 'Réservations (Mois)' },
];

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };
  const applyFilters = () => {
    setFilters(tempFilters);
  };
  const resetFilters = () => {
    const reset = {
      date: "",commercial:""  
    };
    setFilters(reset);
    setTempFilters(reset);
  };

  return (
    <>
      <div className="reflative bg-white rounded-lg shadow-md p-4">
        <Table
          title={'Objectifs'}
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'objectifs_export'}
          columns={columns}
          data={formatData()}
          totalRows={totalRows}
          loading={loading}
          error={error}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          onSearchChange={setSearchTerm}
          enableExport={true}
          onFilterToggle={handleFilterToggle}
          addLink={
            isSuperAdmin(user.role) ||
            isAdmin(user.role) ||
            isCommercial(user.role)
              ? `${ENDPOINTS.OBJECTIFS}?action=add`
              : undefined
          }
          filterComponent={
          <div className="space-y-4 ">
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              }}
            >
              <Input
                type="text"
                placeholder="commercial..."
                value={tempFilters.commercial}
                onChange={(e) =>
                  handleFilterChange("commercial", e.target.value)
                }
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
              <input
                type="text"
                placeholder="Date..."
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) =>
                  (e.target.type = e.target.value ? "date" : "text")
                }
                value={tempFilters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />

              <div className="flex  gap-3 items-center">
                <button
                  type="button"
                  onClick={applyFilters}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Appliquer les filtres
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        }
        showSearch={false}
        />
      </div>

      {showDeleteModal && selectedId && (
        <Modal
          isVisible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        >
          <DeleteData
            route={APIURL.OBJECTIFS}
            Id={selectedId}
            type='Objectif'
            message={'Etes-vous sûr de vouloir supprimer ce Objectif ?'}
            accessToken={accesstoken}
            onClose={() => {
              setShowDeleteModal(false);
              fetchData_table_by_projet(
                entity,
                {},
                searchTerm,
                currentPage,
                rowsPerPage,
                accesstoken,
                setLoading,
                setError,
                setObjectifs,
                setTotalRows
              );
            }}
          />
        </Modal>
      )}

     
    </>
  );
};

export default ObjectifTable;
