'use client';

import React, { useEffect, useState } from 'react';
import Table from '@/components/Table';
import { Pencil, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import { useAuth } from '../../../context/AuthContext';
import { useProjet } from '../../../context/ProjetContext';
import { APIURL, ENDPOINTS } from '../../../configs/api';
import { useRouter } from 'next/navigation';
import { fetchData_table_by_projet } from '../../../configs/api-utils';
import { isAdmin, isCommercial, isSuperAdmin } from '../../../configs/enum';
import Input from '@/components/Input';
import Link from 'next/link';
import format from 'date-fns/format';
import SelectInput from '@/components/SelectInput';
import DateRangePicker from '@/components/DateRangePicker';

const EtapeTable = ({ searchParams }) => {
  const { selectedProjet } = useProjet();
  const [etapes, setEtapes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem('accessToken');

  const router = useRouter();
  // Declare the entity object in the component scope
  const [filters, setFilters] = useState({
    date_debut: '',
    date_fin: '',
    etat: '',
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const etatOptions = [
    { value: '0', label: 'Non Commencé' },
    { value: '1', label: 'En Cours' },
    { value: '2', label: 'Terminé' },
  ];

  // Get etat label function
  const getEtatLabel = (etatValue) => {
    const option = etatOptions.find(
      (opt) => opt.value === etatValue.toString()
    );
    return option ? option.label : etatValue;
  };

  const entity = {
    API_URL: 'etapesProjet',
    dataKey: 'data',
    searchFields: [''],
  };

  useEffect(() => {
    const action = searchParams?.get('action');
    if (action === 'add' || action === 'edit') {
      console.log('Skipping API call - in form mode');
      return;
    }
    fetchData_table_by_projet(
      entity,
      filters,
      searchTerm,
      currentPage,
      rowsPerPage,
      accesstoken,
      setLoading,
      setError,
      setEtapes,
      setTotalRows
    );
  }, [
    searchParams,
    accesstoken,
    currentPage,
    rowsPerPage,
    searchTerm,
    filters,
    selectedProjet,
  ]);

  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
  };

  // Format users data for table display
  const formatData = () => {
    return etapes.map((et) => ({
      id: et.id,
      description: et.description,
      date_fin: et.date_fin
        ? format(new Date(et.date_fin), 'dd/MM/yyyy')
        : null,
      date_debut: et.date_debut
        ? format(new Date(et.date_debut), 'dd/MM/yyyy')
        : null,
      etat: et.etat,
    }));
  };

  const columns = [
    { key: 'description', label: 'Description' },
    { key: 'date_debut', label: 'Date debut' },
    { key: 'date_fin', label: 'Date fin' },
    {
      key: 'etat',
      label: 'Etat',
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-sm font-semibold ${
            {
              0: 'bg-gray-100 text-gray-500',
              1: 'bg-blue-100 text-blue-500',
              2: 'bg-green-100 text-green-500',
            }[row.etat] || 'bg-gray-100 text-gray-500'
          }`}
        >
          {getEtatLabel(row.etat)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3 items-center">
          <Link
            href={`${ENDPOINTS.ETAPESPROJET}?id=${row.id}&action=edit`}
            className="text-blue-500 hover:text-blue-700"
            title="Modifier"
          >
            <Pencil className="w-4 h-4" />
          </Link>
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
    return etapes.map((et) => ({
      description: et.description,
      date_fin: et.date_fin
        ? format(new Date(et.date_fin), 'dd/MM/yyyy')
        : null,
      date_debut: et.date_debut
        ? format(new Date(et.date_debut), 'dd/MM/yyyy')
        : null,
      etat: getEtatLabel(et.etat),
    }));
  };

  const columns_export = [
    { key: 'description', label: 'Description' },
    { key: 'date_debut', label: 'Date debut' },
    { key: 'description', label: 'Date fin' },
    { key: 'etat', label: 'Etat' },
  ];

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };
  const applyFilters = () => {
    setFilters(tempFilters);
  };
  const resetFilters = () => {
    const reset = {
      tranche: '',
    };
    setFilters(reset);
    setTempFilters(reset);
  };

  return (
    <>
      <div className="reflative bg-white rounded-lg shadow-md p-4">
        <Table
          showSearch={false}
          title={'Etapes du Projet'}
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'etapes_projet_export'}
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
              ? `${ENDPOINTS.ETAPESPROJET}?action=add`
              : undefined
          }
          filterComponent={
            <div className="space-y-4 ">
              <div
                className="grid gap-5"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                }}
              >
                <SelectInput
                  value={tempFilters.etat}
                  onChange={(value) => handleFilterChange('etat', value)}
                  options={Object.values(etatOptions).map((data) => ({
                    value: data.value,
                    label: data.label,
                  }))}
                  label="Choisir un Etat"
                  className="h-10 text-sm w-full"
                />
                <DateRangePicker
                  label="Choisir une Date"
                  startName="date_debut"
                  endName="date_fin"
                  startValue={tempFilters.date_debut}
                  endValue={tempFilters.date_fin}
                  onChange={handleFilterChange}
                  labeL="Choisir une Date"
                />
              </div>

              {/* Boutons */}
              <div className="flex justify-end gap-3 pt-2">
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
          }
        />
      </div>

      {showDeleteModal && selectedId && (
        <Modal
          isVisible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        >
          <DeleteData
            route={APIURL.ETAPESPROJET}
            Id={selectedId}
            type="Source"
            message={'Etes-vous sûr de vouloir supprimer cette etape ?'}
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
                setEtapes,
                setTotalRows
              );
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default EtapeTable;
