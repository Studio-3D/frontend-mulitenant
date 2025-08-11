'use client';

import React, { useEffect, useState } from 'react';
import Table from '@/components/Table';
import { Eye, Pencil, Download, PencilLine } from 'lucide-react';

import { useAuth } from '../../../../../context/AuthContext';
import { useProjet } from '../../../../../context/ProjetContext';
import { useRouter } from 'next/navigation';
import { fetchData_table_by_projet } from '../../../../../../src/configs/api-utils';
import { format } from 'date-fns';

import Input from '@/components/Input';

const RelancesFreinsTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { token } = useAuth();
  const { selectedProjet } = useProjet();
  const accesstoken = token || localStorage.getItem('accessToken');

  const router = useRouter();
  // Declare the entity object in the component scope
  const [filters, setFilters] = useState({
    nom_prenom: '',
    telephone: '',
    frein: '',
    date: '',
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

  const entity = {
    API_URL: 'get_clients_freins',
    dataKey: 'data',
    searchFields: [''],
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
      setData,
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

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1200); // Wait for 1.2s after user stops typing before updating the debounced value

    return () => clearTimeout(timer); // Clean up the timeout on each render
  }, [searchTerm]);
  const handleShow = (origin_id,visite_id) => {
    localStorage.setItem('v_id_cadre',visite_id);
    window.open(`/crm/visites/${origin_id}`, '_blank');
  };
  const handle_Bien = (frId, nom_prenom) => {
    localStorage.setItem('nom_prenom_frein', nom_prenom);
    window.open(`/crm/visites/freins/${frId}`, '_blank');
  };

  const formatData = () => {
    return data.map((pro) => {
      return {
        id: pro.id,
        date: pro.date,
        nomComplet: `${pro.nom + ' ' + pro.prenom}`.trim(),
        frein: pro.frein,

        telephone:
          (pro.telephone ? pro.telephone : '') +
            (pro.telephone && pro.telephone_2 && pro.telephone_2 !== 'null'
              ? ' / ' + pro.telephone_2
              : '') || 'Non spécifié',
        frein_id_origin: pro.id_origin,
        visiteId:pro.visite_id
      };
    });
  };

  // Table columns configuration
  const columns = [
    {
      key: 'date',
      label: 'Date ',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>
            {row.date ? format(new Date(row.date), 'dd/MM/yyyy ') : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'nomComplet',
      label: 'Nom Complet',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>{row.nomComplet}</span>
        </div>
      ),
    },

    { key: 'telephone', label: 'Téléphone' },
    { key: 'frein', label: 'Frein' },

    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3 items-center">
          <div title="Voir Détails">
            <Eye
              className="w-4 h-4 !text-blue-500 hover:text-blue-700 cursor-pointer"
              title="Voir détails"
              onClick={() => handleShow(row.frein_id_origin,row.visiteId)}
            />
          </div>
          <div title="Traiter les Biens Disponibles">
            <PencilLine
              className="w-4 h-4 !text-yellow-500 hover:text-yellow-700 cursor-pointer"
              onClick={() => handle_Bien(row.id, row.nomComplet)}
            />
          </div>
        </div>
      ),
    },
  ];

  {
    /* Dynamic Modals Import */
  }

  //EXPORT

  const data_to_export = () => {
    return data.map((pro) => {
      return {
        date:
          pro.date != null ? format(new Date(pro.date), 'dd/MM/yyyy') : null,

        nomComplet: `${pro.nom + ' ' + pro.prenom}`.trim(),
        frein: pro.frein,

        telephone:
          (pro.telephone ? pro.telephone : '') +
            (pro.telephone && pro.telephone_2 && pro.telephone_2 !== 'null'
              ? ' / ' + pro.telephone_2
              : '') || 'Non spécifié',
      };
    });
  };

  const columns_export = [
    { key: 'date', label: 'Date' },
    { key: 'nomComplet', label: 'Nom Complet' },
    { key: 'frein', label: 'Frein' },
    { key: 'telephone', label: 'Téléphone' },
  ];

  //npm install jspdf

  return (
    <>
      <div className="relative bg-white shadow-md rounded-lg px-4 py-4">
        <Table
          showSearch={false}
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'Freins_Clients_export'}
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
                  label="Date"
                  value={tempFilters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="text"
                  label="Nom Complet"
                  value={tempFilters.nom_prenom}
                  onChange={(e) =>
                    handleFilterChange('nom_prenom', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="number"
                  label="Téléphone"
                  value={tempFilters.telephone}
                  onChange={(e) =>
                    handleFilterChange('telephone', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="text"
                  label="frein"
                  value={tempFilters.frein}
                  onChange={(e) => handleFilterChange('frein', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
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

export default RelancesFreinsTable;
