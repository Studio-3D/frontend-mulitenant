'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useProjet } from '@/context/ProjetContext';
import { APIURL, RESOURCE_URL } from '@/configs/api';
import Table from '@/components/Table';
import FacturesFilter from './FacturesFilter';
import FacturesForm from './FacturesForm';
import { toast } from 'react-hot-toast';
import { PencilLine, Trash, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import { format } from 'date-fns';
import { MODE_PAIEMENT } from '@/configs/enum';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { fetchData_table_by_projet } from '@/configs/api-utils';
import { useAuth } from '@/context/AuthContext';

const FacturesManager = ({ decompteId, montantDecompte, montantPaye }) => {
    const { user } = useAuth();
  
  const { selectedProjet } = useProjet();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [showFormModal, setShowFormModal] = useState(false);
  const [currentFacture, setCurrentFacture] = useState(null);
  const [refreshData, setRefreshData] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [factureToDelete, setFactureToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const id = searchParams.get('id');
  const queryDecompteId = searchParams.get('decompteId');
  const queryMontantDecompte = searchParams.get('montantDecompte');

  const accesstoken = localStorage.getItem('accessToken');

  const entity = {
    API_URL: 'factures',
    dataKey: 'data',
    searchFields: [''],
  };
  useEffect(() => {
    if (selectedProjet && selectedProjet.id) {
      fetchData_table_by_projet(
        entity,
        filterValues,
        searchTerm,
        currentPage,
        rowsPerPage,
        accesstoken,
        setLoading,
        setError,
        setData,
        setTotalRows
      );
    }
  }, [
    accesstoken,
    currentPage,
    rowsPerPage,
    searchTerm,
    filterValues,
    selectedProjet,
    refreshData,
  ]);

  useEffect(() => {
    if (action === 'edit' && id) {
      handleEditFacture(id);
    } else if (action === 'add') {
      setShowFormModal(true);
      setCurrentFacture(null);
    }
  }, [action, id]);

  useEffect(() => {
    if (showFormModal) {
      // Add this debug message when form modal is shown
      console.log('Form modal is open, should fetch fournisseurs data');
    }
  }, [showFormModal]);

  const handleFilterChange = (values) => {
    setFilterValues(values);
    setCurrentPage(1);
  };

  const handleEditFacture = (id) => {
    const token = localStorage.getItem('accessToken');
    axios
      .get(`${APIURL.FACTURES}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setCurrentFacture(response.data.facture);
        setShowFormModal(true);
      })
      .catch((error) => {
        toast.error('Erreur lors du chargement de la facture');
        console.error('Error fetching facture:', error);
      });
  };
  const handleDeleteFacture = (id) => {
    const facture = data.find((f) => f.id === id);
    setFactureToDelete(facture);
    setDeleteModalOpen(true);
  };

  const handleFormSave = () => {
    setShowFormModal(false);
    setRefreshData((prev) => !prev);
    router.push('/comptabilite/factures');
  };

  const handleFileClick = (fileType, filename) => {
    const basePath = `${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user?.societe_id}/factures`;
    const url =
      fileType === 'paiement'
        ? `${basePath}/paiements/${filename}`
        : `${basePath}/${filename}`;

    window.open(url, '_blank');
  };

  const getModePaiementLabel = (code) => {
    return MODE_PAIEMENT[code]?.label || 'Inconnu';
  };

  const columns = [
    {
      key: 'date_facture',
      label: 'Date',
      render: (row) => (
        <span>{format(new Date(row.date_facture), 'dd/MM/yyyy')}</span>
      ),
    },
    {
      key: 'fournisseur',
      label: 'Fournisseur',
      render: (row) => (
        <span>
          {row.fournisseur?.code}/{row.fournisseur?.nom}
        </span>
      ),
    },
    {
      key: 'num_facture',
      label: 'N° Facture',
      render: (row) => <span>{row.num_facture}</span>,
    },
    {
      key: 'decompte',
      label: 'Décompte N°',
      render: (row) => <span>{row.decompte?.numero || '-'}</span>,
    },
    {
      key: 'piece_jointe',
      label: 'Pièce Jointe',
      render: (row) =>
        row.piece_jointe ? (
          <span
            className="text-blue-700  cursor-pointer font-medium"
            onClick={() => handleFileClick('facture', row.piece_jointe)}
          >
            {row.piece_jointe}
          </span>
        ) : (
          <span className="text-gray-500">-</span>
        ),
    },
    {
      key: 'montant',
      label: 'Montant',
      render: (row) => (
        <span className="font-medium !text-green-600">
          {row.montant?.toLocaleString()} DH
        </span>
      ),
    },
    {
      key: 'date_paiement',
      label: 'Date Paiement',
      render: (row) => (
        <span>{format(new Date(row.date_paiement), 'dd/MM/yyyy')}</span>
      ),
    },
    {
      key: 'mode_paiement',
      label: 'Mode Paiement',
      render: (row) => (
        <span className="px-2 py-1 bg-blue-100 !text-blue-800 rounded-full text-xs">
          {getModePaiementLabel(row.mode_paiement)}
        </span>
      ),
    },
    {
      key: 'pj_paiement',
      label: 'PJ Paiement',
      render: (row) =>
        row.pj_paiement ? (
          <span
            className="text-blue-700  cursor-pointer font-medium"
            onClick={() => handleFileClick('paiement', row.pj_paiement)}
          >
            {row.pj_paiement}
          </span>
        ) : (
          <span className="text-gray-500">-</span>
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditFacture(row.id)}
            title="Modifier"
            className="flex items-center gap-1  text-yellow-500  hover:text-yellow-700"
          >
            <PencilLine className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteFacture(row.id)}
            title="Supprimer"
            className="flex items-center gap-1  !text-red-500  hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const exportColumns = [
    { key: 'date', label: 'Date' },
    { key: 'code_numFac', label: 'CODE / Nom Fournisseur' },
    { key: 'num_facture', label: 'N° Facture' },
    { key: 'dec_num', label: 'Décompte N°' },
    { key: 'ht', label: 'HT' },
    { key: 'taux_tva', label: 'Taux TVA' },
    { key: 'tva', label: 'TVA' },
    { key: 'retenu_gar', label: 'Retenue de Garantie' },
    { key: 'ttc', label: 'TTC' },
    { key: 'montant_pay', label: 'Montant Payé' },
    { key: 'date_pay', label: 'Date de Paiement' },
    { key: 'mode_pay', label: 'Mode Paiement' },
  ];

  const transformDataForExport = () => {
    return data.map((item) => ({
      date: format(new Date(item.date_facture), 'dd/MM/yyyy'),
      code_numFac: `${item.fournisseur?.code}/${item.fournisseur?.nom}`,
      num_facture: item.num_facture,
      dec_num: item.decompte?.numero || '',
      ht: `${item.ht?.toLocaleString()} DH`,
      taux_tva: `${(item.taux_tva * 100).toFixed(0)}%`,
      tva: `${item.tva?.toLocaleString()} DH`,
      retenu_gar: `${item.retenue_garantie?.toLocaleString()} DH`,
      ttc: `${item.ttc?.toLocaleString()} DH`,
      montant_pay: `${item.montant?.toLocaleString()} DH`,
      date_pay: format(new Date(item.date_paiement), 'dd/MM/yyyy'),
      mode_pay: getModePaiementLabel(item.mode_paiement),
    }));
  };

  // Determine if we should show the "Add" button based on decompte status
  const showAddButton = () => {
    if (decompteId && montantDecompte && montantPaye) {
      return montantDecompte > montantPaye;
    }
    return true;
  };

  const addButtonLink = queryDecompteId
    ? `/comptabilite/factures?action=add&decompteId=${queryDecompteId}&montantDecompte=${queryMontantDecompte}`
    : '/comptabilite/factures?action=add';

  return (
    <div className="relative bg-white rounded-lg px-4 py-4">
      <Table
        showSearch={false}
        name_file_export="factures"
        data_to_export={transformDataForExport()}
        columns_export={exportColumns}
        columns={columns}
        data={data}
        totalRows={totalRows}
        loading={loading}
        error={error}
        emptyMessage="Aucune facture trouvée"
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        enableExport={true}
        addLink={showAddButton() ? addButtonLink : null}
        filterComponent={
          <FacturesFilter
            onSubmit={handleFilterChange}
            initialValues={filterValues}
          />
        }
        // Convert 0-indexed to 1-indexed for display
      />

      {showFormModal && (
        <Modal
          isVisible={true}
          onClose={() => {
            setShowFormModal(false);
            router.push('/comptabilite/factures');
          }}
        >
          <FacturesForm
            facture={currentFacture}
            decompteId={queryDecompteId || decompteId}
            montantDecompte={queryMontantDecompte || montantDecompte}
            onSave={handleFormSave}
            onCancel={() => {
              setShowFormModal(false);
              router.push('/comptabilite/factures');
            }}
          />
        </Modal>
      )}

      {deleteModalOpen && factureToDelete && (
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          entityName="FACTURES"
          itemLabel={'Facture'}
          entityId={factureToDelete.id}
          onDeleted={() => {
            setRefreshData((prev) => !prev);
            router.push('/comptabilite/factures');
          }}
        />
      )}
    </div>
  );
};

export default FacturesManager;
