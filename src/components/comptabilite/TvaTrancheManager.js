'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useProjet } from '@/context/ProjetContext';
import { APIURL } from '@/configs/api';
import Table from '@/components/Table';
import TvaDialog from './TvaDialog';
import TvaFilter from './TvaFilter';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Edit, Eye, PencilLine, PlusCircle } from 'lucide-react';
import { fetchData_table_by_projet } from '@/configs/api-utils';
import Link from 'next/link';

const TvaTrancheManager = ({}) => {
  const { selectedProjet } = useProjet();
  const router = useRouter();
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
  }, [
    accesstoken,
    currentPage,
    rowsPerPage,
    searchTerm,
    filterValues,
    selectedProjet,
  ]);

  const handleAddTva = (tranche) => {
    setSelectedTranche(tranche);
    setDialogAction(0);
    setDialogOpen(true);
  };

  const handleEditTva = (tranche) => {
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
          coefficient: formData.coeff,
          qp_bati: formData.qp_bati,
          action: dialogAction,
        },
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('TVA calculée avec succès');
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
      closeDialog();
    } catch (err) {
      console.error('Error saving TVA data:', err);
      toast.error('Erreur lors du calcul de la TVA');
    }
  };

  const handleFilterChange = (values) => {
    setFilterValues(values);
    setCurrentPage(1);
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
      key: 'valeur_terrain_reevalue',
      label: 'Valeur Terrain Réévalué',
      render: (row) =>
        row.valeur_terrain_reevalue?.toFixed(2).toLocaleString() || '-',
    },
    {
      key: 'qp_bati',
      label: 'QP Terrain Bati',
      render: (row) => row.qp_bati?.toLocaleString() || '-',
    },
    {
      key: 'qp_percent',
      label: 'QP En %',
      render: (row) =>
        row.qp_terrain_tranche_percent
          ? `${row.qp_terrain_tranche_percent * 100}`
          : '-',
    },
    {
      key: 'qp_valeur',
      label: 'QP En Valeur',
      render: (row) =>
        row.qp_terrain_tranche_valeur?.toFixed(2).toLocaleString() || '-',
    },
    {
      key: 'sup',
      label: 'Total Sup',
      // render: () => '23 183', // Hardcoded like in the original code
      render: (row) => row.bien_sum_superficie_total?.toLocaleString() || '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          {row.coefficient_tranche === null ? (
            <button
              onClick={() => handleAddTva(row)}
              title="Ajouter TVA"
              className="flex items-center gap-1 !text-green-500  hover:text-green-700"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          ) : (
            <>
              <Link
                href={`/comptabilite/tva/biens/${row.id}`}
                className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
                title="Voir Détails tva des biens"
              >
                <Eye className="w-4 h-4" />
              </Link>

              <button
                onClick={() => handleEditTva(row)}
                title="Modifier TVA"
                className="flex items-center gap-1 text-yellow-500  hover:text-yellow-700"
              >
                <PencilLine className="w-4 h-4" />
              </button>
            </>
          )}

          <Link
            href={`/tranches/${row.id}`}
            className="flex items-center gap-1 text-purple-500 hover:text-purple-700"
            title="Voir Détails Tranche"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ];

  // For export functionality
  const exportColumns = [
    { key: 'nom', label: 'Tranche' },
    { key: 'coefficient', label: 'Coefficient de Réévaluation' },
    { key: 'valeur_terrain_reevalue', label: 'Valeur Terrain Réévalué' },
    { key: 'qp_bati', label: 'QP Terrain Bati' },
    { key: 'qp_terrain_tranche_percent', label: 'QP En %' },
    { key: 'qp_terrain_tranche_valeur', label: 'QP En Valeur' },
    { key: 'bien_sum_superficie_total', label: 'Total Sup' },
    { key: 'nbre_blocs', label: 'Nbre blocs' },
    { key: 'nbre_immeubles', label: 'Nbre immeubles' },
    { key: 'nbre_biens', label: 'Nbre biens' },
    { key: 'pr', label: 'Projet' },
  ];

  const transformDataForExport = () => {
    return data.map((item) => ({
      nom: item?.nom || '',
      coefficient: item?.coefficient_tranche?.coefficient || '',
      valeur_terrain_reevalue:
        item?.valeur_terrain_reevalue?.toLocaleString() || '',
      qp_bati: item?.qp_bati?.toLocaleString() || '',
      qp_terrain_tranche_percent: item?.qp_terrain_tranche_percent
        ? (item.qp_terrain_tranche_percent * 100).toFixed(2)
        : '',
      qp_terrain_tranche_valeur:
        item?.qp_terrain_tranche_valeur?.toLocaleString() || '',
      nbre_blocs: item?.nbre_blocs || '',
      nbre_immeubles: item?.nbre_immeubles || '',
      nbre_biens: item?.nbre_biens || '',
      pr: selectedProjet?.nom || '',
      bien_sum_superficie_total: item?.bien_sum_superficie_total || '',
    }));
  };

  return (
    <div className="relative bg-white px-4 py-4">
      <div className="bg-[#3a3349] text-white p-4 rounded-lg mb-4 grid grid-cols-2 gap-4">
        <div>
          <h5 className="font-medium" style={{ float: 'left' }}>
            Prix {"d'"}Acquisition:
            <span className="ml-2">
              {selectedProjet?.prix_acquisition?.toLocaleString()}
            </span>
          </h5>
        </div>
        <div>
          <h5 className="font-medium" style={{ float: 'right' }}>
            Total Superficie Terrain:
            <span className="ml-2">
              {selectedProjet?.surface_terrain?.toLocaleString()}
            </span>
          </h5>
        </div>
      </div>

      <Table
        showSearch={false}
        name_file_export="tva_Tranche_export"
        data_to_export={transformDataForExport()}
        columns_export={exportColumns}
        columns={columns}
        data={data}
        totalRows={totalRows}
        loading={loading}
        error={error}
        emptyMessage="Aucune tranche trouvée"
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        enableExport={true}
        filterComponent={
          <TvaFilter
            onSubmit={handleFilterChange}
            initialValues={filterValues}
          />
        }
      />

      {dialogOpen && selectedTranche && (
        <TvaDialog
          isOpen={dialogOpen}
          onClose={closeDialog}
          onSave={handleDialogSave}
          tranche={selectedTranche}
          action={dialogAction}
          projet={selectedProjet}
        />
      )}
    </div>
  );
};

export default TvaTrancheManager;
