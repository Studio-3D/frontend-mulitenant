'use client';

import React, { useEffect, useState } from 'react';
import Table from '@/components/Table';
import { useAuth } from '../../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchData_table_by_id } from '../../../../../../src/configs/api-utils';
import format from 'date-fns/format';
import { Eye } from 'lucide-react';

import { Statuts_Prospect, getProspectStatusLabel, getProspectStatusColor } from '../../../../../../src/configs/enum';

// Function to get status label using the centralized mapping
const getStatusLabel = (rawStatus) => {
  return getProspectStatusLabel(rawStatus);
};

import SelectInput from '@/components/SelectInput';
import Input from '@/components/Input';
const HistoriquesTable = (id) => {
  const [historiques, setHistoriques] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { token } = useAuth();
  const accesstoken = token || localStorage.getItem('accessToken');

  const [filters, setFilters] = useState({
    date_traitement: '',
    rdv: '',
    statut: '',
    date_rappel: '',
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };
  const resetFilters = () => {
    const reset = Object.fromEntries(
      Object.keys(filters).map((key) => [key, ''])
    );
    setFilters(reset);
    setTempFilters(reset);
  };
  const applyFilters = () => {
    setFilters(tempFilters);
  };

  const router = useRouter();
  // Declare the entity object in the component scope
  const entity = {
    id: JSON.stringify(id.id),
    API_URL: 'historiques_prospects',
    dataKey: 'historiques',
    name: 'historique',
    searchFields: ['date_traitement', 'statut', 'rappel'],
  };

  useEffect(() => {
    fetchData_table_by_id(
      entity,
      filters,
      searchTerm,
      currentPage,
      rowsPerPage,
      accesstoken,
      setLoading,
      setError,
      setHistoriques,
      setTotalRows
    );
  }, [accesstoken, currentPage, rowsPerPage, searchTerm, filters]);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1200); // Wait for 1.2s after user stops typing before updating the debounced value

    return () => clearTimeout(timer); // Clean up the timeout on each render
  }, [searchTerm]);

  const handleShow = (vId) => {
    router.push(`/crm/visites/${vId}`);
  };
  const handleShowAppel = (Id) => {
    router.push(`/crm/appels/${Id}`);
  };
  // Format users data for table display
  const formatData = () => {
    return historiques.map((pro) => {
      const mappedStatus = getStatusLabel(pro.statut);

      return {
        id: pro.id,
        date_traitement: pro.date_traitement,
        statut: mappedStatus,
        rdv: pro.rdv ? format(new Date(pro.rdv), 'dd/MM/yyyy H:m') : '',
        rappel: pro.date_rappel
          ? format(new Date(pro.date_rappel), 'dd/MM/yyyy ')
          : '',
        commentaire: pro.commentaire || '',
        user_traite: pro.user ? `${pro.user.name || ''} ${pro.user.prenom || ''}`.trim() : '',
        visite_id: pro.visite_id,
        appel_id: pro.appel_id,
      };
    });
  };

  // Table columns configuration
  const columns = [
    {
      key: 'date_traitement',
      label: 'Date Traitement',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>{row.date_traitement}</span>
        </div>
      ),
    },

    {
      key: 'statut',
      label: 'Statut',
      render: (row) => {
        if (!row.statut) return '';

        return (
          <span
            className={`px-2 py-1 rounded text-sm font-semibold ${getProspectStatusColor(row.statut)}`}
          >
            {row.statut}
          </span>
        );
      },
    },
    { key: 'rdv', label: 'Rendez Vous' },
    { key: 'rappel', label: 'Date Rappel' },
    { key: 'user_traite', label: 'Traité par' },
    { key: 'commentaire', label: 'Commentaire' },

    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3 items-center">
          {row.visite_id != null && (
            <div title="Voir Visite">
              <Eye
                className="w-4 h-4 !text-blue-500 hover:text-blue-700 cursor-pointer"
                title="Voir Visite"
                onClick={() => handleShow(row.visite_id)}
              />
            </div>
          )}
          {row.appel_id != null && (
            <div title="Voir Appel">
              <Eye
                className="w-4 h-4 !text-green-500 hover:text-green-700 cursor-pointer"
                onClick={() => handleShowAppel(row.appel_id)}
              />
            </div>
          )}
        </div>
      ),
    },
  ];

  {
    /* Dynamic Modals Import */
  }

  //EXPORT
  const data_to_export = () => {
    return historiques.map((pro) => ({
      date_traitement: pro.date_traitement,
      statut: getStatusLabel(pro.statut),
      rdv: pro.rdv ? format(new Date(pro.rdv), 'dd/MM/yyyy H:m') : '',
      rappel: pro.date_rappel
        ? format(new Date(pro.date_rappel), 'dd/MM/yyyy')
        : '',
      user_traite: pro.user ? `${pro.user.name || ''} ${pro.user.prenom || ''}`.trim() : '',
      commentaire: pro.commentaire || '',
    }));
  };

  const columns_export = [
    { key: 'date_traitement', label: 'Date Traitement' },
    { key: 'statut', label: 'Statut' },
    { key: 'rdv', label: 'Rendez-vous' },
    { key: 'rappel', label: 'Date Rappel' },
    { key: 'user_traite', label: 'Traité par' },
    { key: 'commentaire', label: 'Commentaire' },
  ];
  return (
    <>
      <div className="reflative">
        <Table
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'historiques_propects_export'}
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
          showSearch={false}
          filterComponent={
            <div className="space-y-4 p-4 rounded-lg ">
              <div
                className="grid gap-5"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                }}
              >
                {/* Champs de recherche */}
                <Input
                  type="date"
                  label="Date Traitement"
                  value={tempFilters.date_traitement}
                  onChange={(e) =>
                    handleFilterChange('date_traitement', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />

                <Input
                  type="date"
                  label="Rendez Vous"
                  value={tempFilters.rdv}
                  onChange={(e) => handleFilterChange('rdv', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />

                <Input
                  type="date"
                  label="Date Rappel"
                  value={tempFilters.date_rappel}
                  onChange={(e) =>
                    handleFilterChange('date_rappel', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />

                <SelectInput
                  value={tempFilters.statut}
                  onChange={(value) => handleFilterChange('statut', value)}
                  options={Object.values(Statuts_Prospect).map((data) => ({
                    value: data.id,
                    label: data.label,
                  }))}
                  placeholder="Choisir un Statut"
                  className="h-10 text-sm w-full"
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
    </>
  );
};

export default HistoriquesTable;
