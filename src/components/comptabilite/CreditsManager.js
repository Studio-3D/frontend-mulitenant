'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useProjet } from '@/context/ProjetContext';
import { APIURL, RESOURCE_URL } from '@/configs/api';
import Table from '@/components/Table';
import CreditsFilter from './CreditsFilter';
import CreditsForm from './CreditsForm';
import { toast } from 'react-hot-toast';
import { PencilLine, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import format from 'date-fns/format';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { useAuth } from '@/context/AuthContext';

const CreditsManager = ({}) => {
  const { user } = useAuth();

  const { selectedProjet } = useProjet();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [showFormModal, setShowFormModal] = useState(false);
  const [currentCredit, setCurrentCredit] = useState(null);
  const [refreshData, setRefreshData] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [creditToDelete, setCreditToDelete] = useState(null);

  const router = useRouter();

  const fetchData = async () => {
    if (!selectedProjet) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = {
        page,
        size: rowsPerPage,
        search: searchTerm,
        ...filterValues,
      };

      const response = await axios.get(
        `${APIURL.ROOT}/v1/projets/${selectedProjet.id}/credits/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      console.log('Credits API response:', response.data);

      const fetchedData = response.data.data || [];
      const pagination = response.data.pagination || {};

      setData(fetchedData);
      setTotalRows(pagination.totalItems || fetchedData.length);
      setError(null);
    } catch (err) {
      console.error('Error fetching credits data:', err);
      setError('Erreur lors du chargement des données');
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjet && selectedProjet.id) {
      fetchData();
    }
  }, [
    selectedProjet,
    page,
    rowsPerPage,
    searchTerm,
    filterValues,
    refreshData,
  ]);

  const handleFilterChange = (values) => {
    setFilterValues(values);
    setPage(1);
  };

  const handleAddCredit = (e) => {
    if (e) {
      e.preventDefault(); // Prevent default link behavior
      e.stopPropagation(); // Stop event propagation
    }
    setCurrentCredit(null);
    setShowFormModal(true);
  };

  const handleEditCredit = (id) => {
    const token = localStorage.getItem('accessToken');
    axios
      .get(`${APIURL.CREDITS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setCurrentCredit(response.data.credit);
        setShowFormModal(true);
      })
      .catch((error) => {
        toast.error('Erreur lors du chargement du crédit');
        console.error('Error fetching credit:', error);
      });
  };

  const handleDeleteCredit = (id) => {
    const credit = data.find((c) => c.id === id);
    setCreditToDelete(credit);
    setDeleteModalOpen(true);
  };

  const handleFormSave = () => {
    setShowFormModal(false);
    setCurrentCredit(null);
    setRefreshData((prev) => !prev);
  };

  const handleFormCancel = () => {
    setShowFormModal(false);
    setCurrentCredit(null);
  };

  const handleFileClick = (file) => {
    window.open(
      `${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user?.societe_id}/credits/${file}`,
      '_blank'
    );
  };

  const columns = [
    {
      key: 'date',
      label: 'Date',
      render: (row) =>
        row.date ? format(new Date(row.date), 'dd/MM/yyyy') : '-',
    },
    {
      key: 'num_contrat',
      label: 'N° Contrat',
      render: (row) => <span>{row.num_contrat}</span>,
    },
    {
      key: 'banque',
      label: 'Banque',
      render: (row) => <span>{row.banque?.nom}</span>,
    },
    {
      key: 'piece_jointe',
      label: 'Pièce Jointe',
      render: (row) =>
        row.piece_jointe ? (
          <span
            className="text-blue-600 cursor-pointer font-medium"
            onClick={() => handleFileClick(row.piece_jointe)}
          >
            {row.piece_jointe}
          </span>
        ) : (
          <span className="text-gray-500">-</span>
        ),
    },
    {
      key: 'montant_capital',
      label: 'Montant Capital',
      render: (row) => (
        <span className="font-semibold !text-blue-700">
          {row.montant_capital.toLocaleString()} DH
        </span>
      ),
    },
    {
      key: 'frais_dossier',
      label: 'Frais Dossier',
      render: (row) => <span>{row.frais_dossier.toLocaleString()} DH</span>,
    },
    {
      key: 'periode',
      label: 'Période',
      render: (row) => (
        <span>
          {row.de && row.a
            ? `Du ${format(new Date(row.de), 'dd/MM/yyyy')} au ${format(
                new Date(row.a),
                'dd/MM/yyyy'
              )}`
            : '-'}
        </span>
      ),
    },
    {
      key: 'nb_mois',
      label: 'Nombre Mois',
      render: (row) => <span>{row.nb_mois}</span>,
    },
    {
      key: 'taux_interet',
      label: 'Taux Intérêt',
      render: (row) => <span>{row.taux_interet}%</span>,
    },
    {
      key: 'montant_interet',
      label: 'Montant Intérêt',
      render: (row) => (
        <span className="font-medium !text-green-600">
          {row.montant_interet.toLocaleString()} DH
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditCredit(row.id)}
            title="Modifier"
            className="flex items-center gap-1 text-yellow-500 hover:text-yellow-700"
          >
            <PencilLine className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteCredit(row.id)}
            title="Supprimer"
            className="flex items-center gap-1 !text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const exportColumns = [
    { key: 'date', label: 'Date' },
    { key: 'num_contrat', label: 'N° Contrat' },
    { key: 'banque', label: 'Banque' },
    { key: 'montant_capital', label: 'Montant Capital' },
    { key: 'frais_dossier', label: 'Frais Dossier' },
    { key: 'periode', label: 'Période' },
    { key: 'nb_mois', label: 'Nombre Mois' },
    { key: 'taux_interet', label: 'Taux Intérêt' },
    { key: 'montant_interet', label: 'Montant Intérêt' },
  ];

  const transformDataForExport = () => {
    return data.map((item) => ({
      date: item.date ? format(new Date(item.date), 'dd/MM/yyyy') : '',
      num_contrat: item.num_contrat || '',
      banque: item.banque?.nom || '',
      montant_capital: item.montant_capital?.toLocaleString() + ' DH' || '',
      frais_dossier: item.frais_dossier?.toLocaleString() + ' DH' || '',
      periode:
        item.de && item.a
          ? `Du ${format(new Date(item.de), 'dd/MM/yyyy')} au ${format(
              new Date(item.a),
              'dd/MM/yyyy'
            )}`
          : '',
      nb_mois: item.nb_mois || '',
      taux_interet: item.taux_interet ? `${item.taux_interet}%` : '',
      montant_interet: item.montant_interet?.toLocaleString() + ' DH' || '',
    }));
  };

  return (
    <div className="relative bg-white px-4 py-4">
      <Table
        showSearch={false}
        name_file_export="credits"
        data_to_export={transformDataForExport()}
        columns_export={exportColumns}
        columns={columns}
        data={data}
        totalRows={totalRows}
        loading={loading}
        error={error}
        emptyMessage="Aucun crédit trouvé"
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        currentPage={page}
        rowsPerPage={rowsPerPage}
        enableExport={true}
        addLink={{
          pathname: '#', // Use hash to prevent navigation
          onClick: handleAddCredit
        }}
        filterComponent={
          <CreditsFilter
            onSubmit={handleFilterChange}
            initialValues={filterValues}
          />
        }
      />

      {showFormModal && (
        <Modal isVisible={true} onClose={handleFormCancel} maxWidth='max-w-3xl'>
          <CreditsForm
            credit={currentCredit}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </Modal>
      )}

      {deleteModalOpen && creditToDelete && (
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          entityName="CREDITS"
          itemLabel={'Credit'}
          entityId={creditToDelete.id}
          onDeleted={() => setRefreshData((prev) => !prev)}
        />
      )}
    </div>
  );
};

export default CreditsManager;