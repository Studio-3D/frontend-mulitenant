'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useProjet } from '@/context/ProjetContext';
import { APIURL, ENDPOINTS, RESOURCE_URL } from '@/configs/api';
import Table from '@/components/Table';
import FournisseursFilter from './FournisseursFilter';
import FournisseursForm from './FournisseursForm';
import { toast } from 'react-hot-toast';
import { Eye, PencilLine, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { fetchData_table_by_projet } from '@/configs/api-utils';
import { useAuth } from '@/context/AuthContext';

const FournisseursManager = () => {
  const { user } = useAuth();
  const { selectedProjet } = useProjet();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [showFormModal, setShowFormModal] = useState(false);
  const [currentFournisseur, setCurrentFournisseur] = useState(null);
  const [facturesModalOpen, setFacturesModalOpen] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState(null);
  const [refreshData, setRefreshData] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fournisseurToDelete, setFournisseurToDelete] = useState(null);

  const router = useRouter();
  
  const accesstoken = localStorage.getItem('accessToken');

  const entity = {
    API_URL: 'fournisseurs',
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

  const handleFilterChange = (values) => {
    setFilterValues(values);
    setCurrentPage(1);
  };

  const handleAddFournisseur = (e) => {
    if (e) {
      e.preventDefault(); // Prevent default link behavior
      e.stopPropagation(); // Stop event propagation
    }
    setCurrentFournisseur(null);
    setShowFormModal(true);
  };

  const handleViewFactures = (fournisseur) => {
    setSelectedFournisseur(fournisseur);
    setFacturesModalOpen(true);
  };

  const handleEditFournisseur = (id) => {
    const token = localStorage.getItem('accessToken');
    axios
      .get(`${APIURL.FOURNISSEURS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setCurrentFournisseur(response.data.fournisseur);
        setShowFormModal(true);
      })
      .catch((error) => {
        toast.error('Erreur lors du chargement du fournisseur');
        console.error('Error fetching fournisseur:', error);
      });
  };

  const handleDeleteFournisseur = (id) => {
    const fournisseur = data.find((f) => f.id === id);
    setFournisseurToDelete(fournisseur);
    setDeleteModalOpen(true);
  };

  const handleFormSave = () => {
    setShowFormModal(false);
    setCurrentFournisseur(null);
    setRefreshData((prev) => !prev);
  };

  const handleFormCancel = () => {
    setShowFormModal(false);
    setCurrentFournisseur(null);
  };

  const handleFileClick = (file) => {
    window.open(
      `${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user?.societe_id}/fournisseurs/${file}`,
      '_blank'
    );
  };

  const columns = [
    {
      key: 'ice',
      label: 'ICE',
      render: (row) => <span>{row.ice}</span>,
    },
    {
      key: 'code',
      label: 'Code',
      render: (row) => <span>{row.code}</span>,
    },
    {
      key: 'nom',
      label: 'Nom',
      render: (row) => <span className="font-medium">{row.nom}</span>,
    },
    {
      key: 'rc',
      label: 'RC',
      render: (row) => <span>{row.rc}</span>,
    },
    {
      key: 'fichier_rc',
      label: 'Fichier RC',
      render: (row) =>
        row.fichier_rc ? (
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => handleFileClick(row.fichier_rc)}
          >
            {row.fichier_rc}
          </span>
        ) : (
          '-'
        ),
    },
    {
      key: 'adresse',
      label: 'Adresse',
      render: (row) => <span>{row.adresse || '-'}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditFournisseur(row.id)}
            title="Modifier"
            className="p-1.5 !text-yellow-500 hover:text-yellow-700"
          >
            <PencilLine className="w-4 h-4" />
          </button>
          {row.factures && row.factures.length > 0 ? (
            <button
              onClick={() => handleViewFactures(row)}
              title="Voir Factures"
              className="p-1.5 !text-blue-500 hover:text-blue-700"
            >
              <Eye className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleDeleteFournisseur(row.id)}
              title="Supprimer"
              className="p-1.5 !text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const exportColumns = [
    { key: 'ice', label: 'ICE' },
    { key: 'code', label: 'Code' },
    { key: 'nom', label: 'Nom' },
    { key: 'rc', label: 'RC' },
    { key: 'fichier_rc', label: 'Fichier RC' },
    { key: 'adresse', label: 'Adresse' },
  ];

  const transformDataForExport = () => {
    return data.map((item) => ({
      ice: item?.ice || '',
      code: item?.code || '',
      nom: item?.nom || '',
      rc: item?.rc || '',
      fichier_rc: item?.fichier_rc || '',
      adresse: item?.adresse || '',
    }));
  };

  return (
    <div className="relative bg-white px-4 py-4">
      <Table
        showSearch={false}
        name_file_export="fournisseurs"
        data_to_export={transformDataForExport()}
        columns_export={exportColumns}
        columns={columns}
        data={data}
        totalRows={totalRows}
        loading={loading}
        error={error}
        emptyMessage="Aucun fournisseur trouvé"
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        enableExport={true}
        addLink={{
          pathname: '#', // Use hash to prevent navigation
          onClick: handleAddFournisseur
        }}
        filterComponent={
          <FournisseursFilter
            onSubmit={handleFilterChange}
            initialValues={filterValues}
          />
        }
      />

      {showFormModal && (
        <Modal isVisible={true} onClose={handleFormCancel}>
          <FournisseursForm
            fournisseur={currentFournisseur}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </Modal>
      )}

      {facturesModalOpen && selectedFournisseur && (
        <Modal isVisible={true} onClose={() => setFacturesModalOpen(false)}>
          <div className="p-5">
            <h2 className="text-xl font-bold mb-4">
              Factures du fournisseur: {selectedFournisseur.code} -{' '}
              {selectedFournisseur.nom}
            </h2>
            {selectedFournisseur.factures &&
            selectedFournisseur.factures.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedFournisseur.factures.map((facture) => (
                  <div
                    key={facture.id}
                    className="border p-4 rounded-md text-gray-500"
                  >
                    <p className="font-medium">N°: {facture.num_facture}</p>
                    <p className="text-green-600 font-bold">
                      Montant: {facture.montant?.toLocaleString()} DH
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Aucune facture trouvée</p>
            )}
          </div>
        </Modal>
      )}

      {deleteModalOpen && fournisseurToDelete && (
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          entityName="FOURNISSEURS"
          itemLabel={'Fournisseur'}
          entityId={fournisseurToDelete.id}
          onDeleted={() => {
            setRefreshData((prev) => !prev);
          }}
        />
      )}
    </div>
  );
};

export default FournisseursManager;