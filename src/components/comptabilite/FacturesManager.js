'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useProjet } from '@/context/ProjetContext';
import { APIURL, RESOURCE_URL } from '@/configs/api';
import Table from '@/components/Table';
import FacturesFilter from './FacturesFilter';
import FacturesForm from './FacturesForm';
import { toast } from 'react-hot-toast';
import { PencilLine, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import { format } from 'date-fns';
import { MODE_PAIEMENT } from '@/configs/enum';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { fetchData_table_by_projet } from '@/configs/api-utils';
import { useAuth } from '@/context/AuthContext';
import ProjectSelectorWrapper from './ProjectSelectorWrapper';

const FacturesManager = ({
  decompteId,
  montantDecompte,
  montantPaye,
  onFactureChange, // Add this prop
}) => {
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

  const accesstoken = localStorage.getItem('accessToken');

  const entity = {
    API_URL: 'factures',
    dataKey: 'data',
    searchFields: [''],
  };

  useEffect(() => {
    if (selectedProjet && selectedProjet.id) {
       // Make sure filterValues includes decompteId
    const filters = { ...filterValues };
    if (decompteId) {
      filters.decompteId = decompteId;
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
        setData,
        setTotalRows,decompteId
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
    if (showFormModal) {
      console.log('Form modal is open, should fetch fournisseurs data');
    }
  }, [showFormModal]);

  const handleFilterChange = (values) => {
    setFilterValues(values);
    setCurrentPage(1);
  };

  const handleAddFacture = (e) => {
    if (e) {
      e.preventDefault(); // Prevent default link behavior
      e.stopPropagation(); // Stop event propagation
    }
    setCurrentFacture(null);
    setShowFormModal(true);
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
    setCurrentFacture(null);
    setRefreshData((prev) => !prev);
    // Call the refresh callback to update decompte details
    if (onFactureChange) {
      onFactureChange();
    }
  };

  const handleFormCancel = () => {
    setShowFormModal(false);
    setCurrentFacture(null);
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
const getBanqueNom = (row) => {
  return row.banque?.nom || '-';
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
          className="text-blue-500 cursor-pointer font-medium"
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
    key: 'banque',
    label: 'Banque',
    render: (row) => <span>{getBanqueNom(row)}</span>,
  },
  {
    key: 'numero_paiement',
    label: 'N° Paiement',
    render: (row) => <span>{row.numero_paiement || '-'}</span>,
  },
  {
    key: 'echeance',
    label: 'Date Échéance',
    render: (row) => (
      <span>{row.echeance ? format(new Date(row.echeance), 'dd/MM/yyyy') : '-'}</span>
    ),
  },
  {
    key: 'pj_paiement',
    label: 'PJ Paiement',
    render: (row) =>
      row.pj_paiement ? (
        <span
          className="text-blue-500 cursor-pointer font-medium"
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
          className="flex items-center gap-1 text-yellow-500 hover:text-yellow-700"
        >
          <PencilLine className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDeleteFacture(row.id)}
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
  { key: 'banque', label: 'Banque' },
  { key: 'num_paiement', label: 'N° Paiement' },
  { key: 'echeance', label: 'Date Échéance' },
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
    banque: item.banque?.nom || '-',
    num_paiement: item.numero_paiement || '-',
    echeance: item.echeance ? format(new Date(item.echeance), 'dd/MM/yyyy') : '-',
  }));
};

  // Determine if we should show the "Add" button based on decompte status
 // Determine if we should show the "Add" button based on decompte status
const showAddButton = () => {
  if (decompteId && montantDecompte !== undefined && montantPaye !== undefined) {
    console.log('Checking:', { montantDecompte, montantPaye });
    // Convert to numbers to ensure proper comparison
    const montant = Number(montantDecompte);
    const paye = Number(montantPaye);
    return montant > paye;
  }
  return true;
};

  return (
    <div className="relative bg-white px-4 py-4">
      <ProjectSelectorWrapper>
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
        addLink={
          showAddButton()
            ? {
                pathname: '#', // Use hash to prevent navigation
                onClick: handleAddFacture,
              }
            : null
        }
        filterComponent={
          <FacturesFilter
            onSubmit={handleFilterChange}
            initialValues={filterValues}
            hideNumDecompte={!!decompteId} // Add this line

          />
        }
      />
      </ProjectSelectorWrapper>

      {showFormModal && (
        <Modal isVisible={true} onClose={handleFormCancel} maxWidth='max-w-3xl'>
          <FacturesForm
            facture={currentFacture}
            decompteId={decompteId}
            montantDecompte={montantDecompte}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
            onFactureChange={onFactureChange} // Add this line

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
            // Call the refresh callback to update decompte details
            if (onFactureChange) {
              onFactureChange();
            }
          }}
        />
      )}
    </div>
  );
};

export default FacturesManager;
