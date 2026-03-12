'use client';

import DeleteData from '@/components/DeleteData';
import Modal from '@/components/Modal';
import Table from '@/components/Table';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Pencil, Trash2, Eye, Wrench } from 'lucide-react';

import { APIURL, ENDPOINTS } from '@/configs/api';
import { fetchData_table_by_projet } from '@/configs/api-utils';
import { isAdmin, isSuperAdmin } from '@/configs/enum';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/Input';
import { useProjet } from '@/context/ProjetContext'; // Import ProjetContext
import { format } from 'date-fns';
import Link from 'next/link';
import { useSociete } from '@/context/SocieteContext';

const CommissionTableParType = ({ type }) => {
  const { selectedSociete } = useSociete();
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem('accessToken');
  const [filters, setFilters] = useState({ nom: '' });
  const [tempFilters, setTempFilters] = useState({ ...filters });
  const { selectedProjet, fetchProjets } = useProjet(); // Get selectedProjet from context
  const [showProjetModal, setShowProjetModal] = useState(false); // State for project modal
  //

  const entity = {
    API_URL:
      type === 0
        ? 'commissions_cumuls_by_projet'
        : type === 1
        ? 'commissions_traites'
        : undefined,
    dataKey: 'data',
    name: 'commissions',
    searchFields: [''],
  };

  // Check if a project is selected
  useEffect(() => {
    if (!selectedProjet && !showProjetModal) {
      fetchProjets(); // Fetch projects if not already done
      setShowProjetModal(true);
    }
  }, [selectedProjet, showProjetModal, fetchProjets]);

  // Reset state when project changes
  useEffect(() => {
    if (selectedProjet) {
      setCommissions([]);
      setCurrentPage(1);
      setError('');
    }
  }, [selectedProjet]);

  useEffect(() => {
    if (selectedProjet) {
      fetchData_table_by_projet(
        entity,
        filters,
        searchTerm,
        currentPage,
        rowsPerPage,
        accesstoken,
        setLoading,
        setError,
        setCommissions,
        setTotalRows
      );
    }
  }, [
    searchTerm,
    currentPage,
    rowsPerPage,
    accesstoken,
    filters,
    selectedProjet,selectedSociete
  ]); // Add selectedProjet dependency


    const getMode_paiement_badge = (mode) => {
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${mode=='moitie'?'bg-orange-100 !text-orange-800':'bg-green-100 !text-green-800'}`}
        >
          {mode}
        </span>
      );
    };

  const columns = [
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (row) => row.date || '',
    },

    {
      key: 'responsable',
      label: 'Responsable',
      sortable: true,
      render: (row) => (
        <Link
          target="_blank"
          href={`/utilisateurs/afficher-utilisateur/${row.id}`}
        >
          <strong>
            {`${row.user?.name || ''} ${row.user?.prenom || ''}`.trim()}
          </strong>
        </Link>
      ),
    },

    {
      key: 'montant',
      label: 'Montant',
      sortable: true,
      render: (row) => row?.montant?.toLocaleString() + ' DH',
    },
    // Colonne conditionnelle selon type === 1
    ...(type === 1
      ? [
          {
            key: 'mode_paiement',
            label: 'Mode Paiement',
            sortable: true,
            render: (row) => getMode_paiement_badge(row?.mode_paiement),
          },
        ]
      : []),
  ];

  const formatData = () => {
    return commissions.map((com) => {
      const rawDate =
        type === 1 ? com?.date_traitement : type === 0 ? com?.created_at : null;
      let formattedDate = '';
      if (rawDate) {
        const dateObj = new Date(rawDate);
        if (!isNaN(dateObj)) {
          formattedDate = format(dateObj, 'dd/MM/yyyy');
        }
      }

      return {
        id: com.id,
        date: formattedDate,
        user: com?.user,
        montant: com?.montant,
        mode_paiement: type === 1 ? com?.mode_paiement : undefined,
      };
    });
  };

  const data_to_export = () => {
    return commissions.map((cm) => {
      const dateValue =
        type === 1 ? cm?.date_traitement : type === 0 ? cm?.created_at : null;
      let formattedDate = '';
      if (dateValue) {
        const dateObj = new Date(dateValue);
        if (!isNaN(dateObj)) {
          formattedDate = format(dateObj, 'dd/MM/yyyy');
        }
      }
      return {
        date: formattedDate,
        responsable: `${cm?.user?.name || ''} ${cm?.user?.prenom || ''}`.trim(),
        montant: cm?.montant ? `${cm.montant.toLocaleString()} DH` : '',
        ...(type === 1 && { mode_paiement: cm?.mode_paiement || '' }),
      };
    });
  };

  const columns_export = [
    { key: 'date', label: 'Date' },
    { key: 'responsable', label: 'Responsable' },
    { key: 'montant', label: 'Montant' },
    // Ajoute la colonne mode_paiement seulement si type === 1
    ...(type === 1 ? [{ key: 'mode_paiement', label: 'Mode Paiement' }] : []),
  ];

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters); // C'est ici que fetchUsers va être déclenché
  };
  const resetFilters = () => {
    const reset = {
      nom: '',
    };
    setFilters(reset);
    setTempFilters(reset);
  };

  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
  };

  return (
    <>
      <div className="relative bg-white rounded-lg shadow-md p-4">
        <Table
          title={
            type === 0
              ? 'Commissions Cumulées'
              : type === 1
              ? 'Commissions Traitées'
              : 'Commissions'
          }
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={type === 1?'commissions_mensuelles_traites_export':'commissions_cumules_export'}
          columns={columns}
          data={formatData()}
          onFilterToggle={handleFilterToggle}
          /*filterComponent={
            <div className="space-y-4 rounded-lg">
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                }}
              >
                <Input
                  type="text"
                  placeholder="Nom..."
                  value={tempFilters.nom}
                  onChange={(e) => handleFilterChange('nom', e.target.value)}
                  className="h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
                >
                  Réinitialiser
                </button>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Appliquer les filtres
                </button>
              </div>
            </div>
          }*/
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
        />
      </div>
    </>
  );
};

export default CommissionTableParType;
