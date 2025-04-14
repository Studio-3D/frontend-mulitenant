'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Table from '@/components/Table';
import { useAuth } from '../../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchData_table_by_id } from '../../../../../../src/configs/api-utils';
import format from 'date-fns/format';
import { FaRegEye, FaEdit, FaRegEdit, FaCheck } from 'react-icons/fa';

import { Statuts_Prospect } from '../../../../../../src/configs/enum';

const HistoriquesTable = (id) => {
  const [historiques, setHistoriques] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem('accessToken');

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
      searchTerm,
      currentPage,
      rowsPerPage,
      accesstoken,
      setLoading,
      setError,
      setHistoriques,
      setTotalRows
    );
  }, [accesstoken, currentPage, rowsPerPage, searchTerm]);

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

  // Format users data for table display
  const formatData = () => {
    return historiques.map((pro) => ({
      id: pro.id,

      date_traitement: pro.date_traitement
        ? format(new Date(pro.date_traitement), 'dd/MM/yyyy ')
        : '',
      //statut: Statuts_Prospect[pro.statut]?.label,
      statut: pro.statut,
      rdv: pro.rdv ? format(new Date(pro.rdv), 'dd/MM/yyyy H:m') : '',
      rappel: pro.date_rappel
        ? format(new Date(pro.date_rappel), 'dd/MM/yyyy ')
        : '',
      commentaire: pro.statut,
      visite_id:pro.visite_id
    }));
  };

  // Table columns configuration
  const columns = [
    {
      key: '',
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
        if (!row.statut) return ''; // or return null;

        const roleColors = {
          'Planification Rendez Vous': 'bg-blue-100 text-[#009FFF]',
          Injoignable: 'bg-purple-100 text-purple-600',
          Rappel: 'bg-yellow-100 text-yellow-600',
          
        };

        return (
          <span
            className={`px-2 py-1 rounded text-sm font-semibold ${
              roleColors[row.statut] || 'bg-gray-100 text-gray-600'
            }`}
          >
            {row.statut}
          </span>
        );
      },
    },
    { key: 'rdv', label: 'Rendez Vous' },
    { key: 'rappel', label: 'Date Rappel' },
    { key: 'commentaire', label: 'Commentaire' },

    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3 items-center">
          {row.visite_id != null && (
            <FaRegEye
              className="w-4 h-4 text-blue-500 hover:text-blue-700 cursor-pointer"
              title="Voir Visite"
              onClick={() => handleShow(row.visite_id)}
            />
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
      date_traitement: pro.date_traitement
        ? format(new Date(pro.date_traitement), 'dd/MM/yyyy')
        : '',
      statut: Statuts_Prospect[pro.statut]?.label,

      rdv: pro.rdv ? format(new Date(pro.rdv), 'dd/MM/yyyy H:m') : '',
      rappel: pro.date_rappel
        ? format(new Date(pro.date_rappel), 'dd/MM/yyyy')
        : '',
      commentaire: pro.commentaire || '',
    }));
  };

  const columns_export = [
    { key: 'date_traitement', label: 'Date Traitement' },
    { key: 'statut', label: 'Statut' },
    { key: 'rdv', label: 'Rendez-vous' },
    { key: 'rappel', label: 'Date Rappel' },
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
        />
      </div>
    </>
  );
};

export default HistoriquesTable;
