'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useProjet } from '@/context/ProjetContext';
import { APIURL } from '@/configs/api';
import Table from '@/components/Table';
import CoefficientDialog from './CoefficientDialog';
import CoefficientFilter from './CoefficientFilter';
import { toast } from 'react-hot-toast';
import { Edit, PlusCircle, Eye } from 'lucide-react';

const CoefficientManager = ({ userRole }) => {
  const { selectedProjet } = useProjet();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState({});
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTranche, setSelectedTranche] = useState(null);
  const [dialogAction, setDialogAction] = useState(0); // 0 for add, 1 for edit

  const fetchData = async () => {
    if (!selectedProjet) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = {
        page,
        size: rowsPerPage,
        search: searchTerm,
        ...filterValues
      };

      // Updated URL structure to use nested resources pattern
      const response = await axios.get(`${APIURL.ROOT}/v1/projets/${selectedProjet.id}/tranches/`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      const fetchedTranches = response.data.data || [];
      const pagination = response.data.pagination || {};
      
      setData(fetchedTranches);
      setTotalRows(pagination.totalItems || fetchedTranches.length);
      setError(null);
    } catch (err) {
      console.error('Error fetching tranches data:', err);
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
  }, [selectedProjet, page, rowsPerPage, searchTerm, filterValues]);

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
      const token = localStorage.getItem('accessToken');
      await axios({
        method: 'put',
        url: `${APIURL.ROOTV1}/calculer_tva/${selectedTranche.id}`,
        data: { 
          coefficient: formData.coefficient, 
          qp_bati: selectedTranche.qp_bati,
          action: dialogAction 
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Coefficient enregistré avec succès');
      fetchData();
      closeDialog();
    } catch (err) {
      console.error('Error saving coefficient data:', err);
      toast.error('Erreur lors de l\'enregistrement du coefficient');
    }
  };

  const handleFilterChange = (values) => {
    setFilterValues(values);
    setPage(1);
  };

  const columns = [
    { 
      key: 'nom', 
      label: 'Tranche',
      render: (row) => <span className="font-medium">{row.nom}</span>
    },
    { 
      key: 'coefficient', 
      label: 'Coefficient de Réévaluation',
      render: (row) => row.coefficient_tranche?.coefficient || '-'
    },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          {row.coefficient_tranche === null ? (
            <button
              onClick={() => handleAddCoefficient(row)}
              title="Ajouter Coefficient"
              className="p-1.5 bg-green-100 !text-green-600 rounded-full hover:bg-green-200"
            >
              <PlusCircle size={16} />
            </button>
          ) : (
            <button
              onClick={() => handleEditCoefficient(row)}
              title="Modifier Coefficient"
              className="p-1.5 bg-amber-100 text-amber-600 rounded-full hover:bg-amber-200"
            >
              <Edit size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  const exportColumns = [
    { key: 'nom', label: 'Tranche' },
    { key: 'coefficient', label: 'Coefficient de Réévaluation' }
  ];

  const transformDataForExport = () => {
    return data.map((item) => ({
      nom: item?.nom || "",
      coefficient: item?.coefficient_tranche?.coefficient || ""
    }));
  };

  return (
    <div>
      <Table
        name_file_export="coefficients"
        data_to_export={transformDataForExport()}
        columns_export={exportColumns}
        columns={columns}
        data={data}
        totalRows={totalRows}
        loading={loading}
        error={error}
        emptyMessage="Aucune tranche trouvée"
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        currentPage={page}
        rowsPerPage={rowsPerPage}
        enableExport={true}
        filterComponent={<CoefficientFilter onSubmit={handleFilterChange} initialValues={filterValues} />}
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
