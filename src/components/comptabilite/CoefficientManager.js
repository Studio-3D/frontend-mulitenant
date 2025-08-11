'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useProjet } from '@/context/ProjetContext';
import { APIURL } from '@/configs/api';
import Table from '@/components/Table';
import CoefficientDialog from './CoefficientDialog';
import CoefficientFilter from './CoefficientFilter';
import { toast } from 'react-hot-toast';
import {  Eye, PencilLine, PlusCircle } from 'lucide-react';
import { fetchData_table_by_projet } from '@/configs/api-utils';

const CoefficientManager = ({}) => {

  const { selectedProjet } = useProjet();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTranche, setSelectedTranche] = useState(null);
  const [dialogAction, setDialogAction] = useState(0); // 0 for add, 1 for edit

  const accesstoken = localStorage.getItem('accessToken');

  const entity = {
    API_URL: 'tranches',
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
  ]);

  const handleAddCoefficient = (tranche) => {
    setSelectedTranche(tranche);
    setDialogAction(0);
    setDialogOpen(true);
  };

  const handleEditCoefficient = (tranche) => {
    setSelectedTranche(tranche);
    setDialogAction(1);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedTranche(null);
  };

  const handleDialogSave = async (formData) => {
    try {
      await axios({
        method: 'put',
        url: `${APIURL.ROOTV1}/calculer_tva/${selectedTranche.id}`,
        data: {
          coefficient: formData.coefficient,
          qp_bati: selectedTranche.qp_bati,
          action: dialogAction,
        },
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      });

      toast.success('Coefficient enregistré avec succès');
      fetchData_table_by_projet(
        entity,
        {},
        searchTerm,
        currentPage,
        rowsPerPage,
        accesstoken,
        setLoading,
        setError,
        setData,
        setTotalRows
      );
      closeDialog();
    } catch (err) {
      console.error('Error saving coefficient data:', err);
      toast.error("Erreur lors de l'enregistrement du coefficient");
    }
  };

  const handleFilterChange = (values) => {
    setFilterValues(values);
    setCurrentPage(1);
  };
  const handleShow = (trancheId) => {
    window.open(`/Tranches/${trancheId}`, '_blank');
  };

  const columns = [
    {
      key: 'nom',
      label: 'Tranche',
      render: (row) => <span className="font-medium">{row.nom}</span>,
    },
    {
      key: 'coefficient',
      label: 'Coefficient de Réévaluation',
      render: (row) => row.coefficient_tranche?.coefficient || '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleShow(row.id)}
            title="Détail Tranche" // Updated title to be clearer
            className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.coefficient_tranche === null ? (
            <button
              onClick={() => handleAddCoefficient(row)}
              title="Ajouter Coefficient"
              className="flex items-center gap-1 !text-green-500  hover:text-green-700 "
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleEditCoefficient(row)}
              title="Modifier Coefficient"
              className="flex items-center gap-1 text-yellow-500 hover:text-yellow-700  "
            >
              <PencilLine className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const exportColumns = [
    { key: 'nom', label: 'Tranche' },
    { key: 'coefficient', label: 'Coefficient de Réévaluation' },
  ];

  const transformDataForExport = () => {
    return data.map((item) => ({
      nom: item?.nom || '',
      coefficient: item?.coefficient_tranche?.coefficient || '',
    }));
  };

  return (
    <div className="relative bg-white rounded-lg px-4 py-4">
      <Table
        showSearch={false}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        name_file_export="coefficients"
        data_to_export={transformDataForExport()}
        columns_export={exportColumns}
        columns={columns}
        data={data}
        totalRows={totalRows}
        loading={loading}
        error={error}
        emptyMessage="Aucune tranche trouvée"
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        enableExport={true}
        filterComponent={
          <CoefficientFilter
            onSubmit={handleFilterChange}
            initialValues={filterValues}
          />
        }
      />

      {dialogOpen && selectedTranche && (
        <CoefficientDialog
          isOpen={dialogOpen}
          onClose={closeDialog}
          onSave={handleDialogSave}
          tranche={selectedTranche}
          action={dialogAction}
        />
      )}
    </div>
  );
};

export default CoefficientManager;
