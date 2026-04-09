'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Table from '@/components/Table';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import { useAuth } from '../../../../context/AuthContext';
import { useProjet } from '../../../../context/ProjetContext';
import { APIURL } from '../../../../configs/api';
import { useRouter } from 'next/navigation';
import { fetchData_table_by_projet } from '../../../../configs/api-utils';
import { isAdmin, isCommercial, isSuperAdmin } from '../../../../configs/enum';
import Input from '@/components/Input';
import Link from 'next/link';
import { useSociete } from '@/context/SocieteContext';

const EcheanceTrancheTable = ({ searchParams }) => {
  const { selectedSociete } = useSociete();
  const { selectedProjet } = useProjet();
  const [tranches, setTranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEcheancesModal, setShowEcheancesModal] = useState(false);
  const [selectedEcheances, setSelectedEcheances] = useState([]);
  const [selectedTrancheName, setSelectedTrancheName] = useState('');
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
    tranche: '',
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const entity = {
    API_URL: 'EcheancesTranche',
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
      setTranches,
      setTotalRows
    );
  }, [
    searchParams,
    accesstoken,
    currentPage,
    rowsPerPage,
    searchTerm,
    filters,
    selectedProjet,selectedSociete
  ]);

  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
  };

  // Format users data for table display
  const formatData = () => {
    return tranches.map((tranche) => ({
      id: tranche.id,
      tranche: tranche.nom,
      echeances: tranche.echeance_tranches,
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR'); // Format: dd/mm/yyyy
  };

  // Function to handle eye icon click and show echeances modal
  const handleViewEcheances = (tranche) => {
    setSelectedEcheances(tranche.echeances || []);
    setSelectedTrancheName(tranche.tranche);
    setShowEcheancesModal(true);
  };

  // Format echeances data for the modal table
  const formatEcheancesData = () => {
    return selectedEcheances.map((echeance, index) => ({
      id: echeance.id,
      numEcheance: index + 1,
      date: formatDate(echeance.date),
      montant: echeance.montant,
    }));
  };


  {
    /*
      key: 'echeances',
      label: 'Échéances',
      render: (row) => (
        <div>
          {row.echeances?.map((echeance, index) => (
            <div key={echeance.id} className="text-xs text-black-500 mb-1">
              Échéance {index + 1} : date: {formatDate(echeance.date)} Montant:{' '}
              {echeance.montant}
              {index < row.echeances.length - 1 && <br />}
            </div>
          ))}
        </div>
      ),
    */
  }
  const columns = [
    { key: 'tranche', label: 'Tranche' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3 items-center">
          <button
            className="flex items-center gap-1 text-green-500 hover:text-green-700"
            title="Voir les échéances"
            onClick={() => handleViewEcheances(row)}
          >
            <Eye className="w-4 h-4" />
          </button>
          {isAdmin(user.role)||isSuperAdmin(user.role)&& (
          <> 
           <Link
            href={`/administration/echeance-tranches?id=${row.id}&action=edit`}
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
          </>
          )}
        
        </div>
      ),
    },
  ];

  const data_to_export = () => {
    return tranches.map((tranche) => ({
      tranche: tranche.nom,
      echeances:
        tranche.echeance_tranches
          ?.map(
            (echeance, index) =>
              `Échéance ${index + 1}: date:${formatDate(
                echeance.date
              )} Montant:${echeance.montant}`
          )
          .join(' | ') || '',
    }));
  };

  const columns_export = [
    { key: 'tranche', label: 'Tranche' },
    { key: 'echeances', label: 'Échéances' },
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
          title={'Echéances  Tranches'}
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'tranches_export'}
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
            isAdmin(user.role) 
              ? `/administration/echeance-tranches?action=add`
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
                <Input
                  label={'Tranche'}
                  type="text"
                  placeholder="Tranche..."
                  value={tempFilters.tranche}
                  onChange={(e) =>
                    handleFilterChange('tranche', e.target.value)
                  }
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

      {/* Delete Modal */}
      {showDeleteModal && selectedId && (
        <Modal
          isVisible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        >
          <DeleteData
            route={APIURL.ECHEANCESTRANCE}
            Id={selectedId}
            type="Source"
            message={'Etes-vous sûr de vouloir supprimer cette echeance ?'}
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
                setTranches,
                setTotalRows
              );
            }}
          />
        </Modal>
      )}

      {/* Echeances Modal */}
      {/* Echeances Modal */}
      <Modal
        isVisible={showEcheancesModal}
        onClose={() => setShowEcheancesModal(false)}
      >
        <div className="p-6 w-full max-w-4xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Échéances - {selectedTrancheName}
            </h2>
            <button
              onClick={() => setShowEcheancesModal(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Static Table without Pagination */}

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#009FFF] text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Num Échéance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formatEcheancesData().map((echeance) => (
                  <tr key={echeance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {echeance.numEcheance}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {echeance.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {echeance.montant} MAD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {formatEcheancesData().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucune échéance trouvée
              </div>
            )}
          </div>

          {/* Export button instead of full pagination controls */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              Total: {formatEcheancesData().length} échéance(s)
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EcheanceTrancheTable;
