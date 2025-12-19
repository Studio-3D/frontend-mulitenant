import React, { useState, useEffect } from 'react';
import { FolderSearch, ArrowUp, ArrowDown } from 'lucide-react';
import Table from '@/components/Table';
import { APIURL } from '../../../configs/api';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import Link from 'next/link';
import { fetchData_table_by_id } from '@/configs/api-utils';
import Input from '@/components/Input';

export const TransfertTab = ({
  reservationData,
  user,
  accessToken: propAccessToken,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const [error, setError] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const accessToken = propAccessToken || localStorage.getItem('accessToken');
  const reservationId = reservationData?.reservation?.id;

  const initialFilters = {
    dossier: '',
    date: '',
    montant: '',
  };

  const [filters, setFilters] = useState(initialFilters);
  const [tempFilters, setTempFilters] = useState(initialFilters);

  // Single optimized handler for all filter changes
  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setTempFilters(initialFilters);
  };

  const entity = {
    id: reservationId,
    API_URL: 'get_detail_transfert',
    dataKey: 'data',
    searchFields: [''],
  };

  useEffect(() => {
    fetchData_table_by_id(
      entity,
      filters,
      null,
      currentPage,
      rowsPerPage,
      accessToken,
      setLoading,
      setError,
      setData,
      setTotalRows
    );
  }, [accessToken, currentPage, rowsPerPage, filters]);

  const formatData = () => {
    return data.map((transfert) => ({
      id: transfert.id,
      date_transfert: transfert.created_at
        ? format(new Date(transfert.created_at), 'dd/MM/yyyy')
        : '',
      nouveau_dossier: transfert.dossier_transfert?.code_reservation,
      montant: transfert.montant_transfert?.toLocaleString() + ' DH',
      dossier_id_transfert: transfert.dossier_id_transfert,
    }));
  };

  const columns = [
    {
      key: 'date_transfert',
      label: 'Date de Transfert',
      renderHeader: () => (
        <div
          className="flex items-center cursor-pointer"
        >
          Date de Transfert
        </div>
      ),
    },
    {
      key: 'nouveau_dossier',
      label: 'Nouveau Dossier',
      render: (row) => (
        <Link
          href={`/ventes/reservations/${row.dossier_id_transfert}`}
          target="_blank"
          className="text-blue-500 hover:text-blue-700 hover:underline"
        >
          {row.nouveau_dossier}
        </Link>
      ),
      renderHeader: () => (
        <div
          className="flex items-center cursor-pointer"
        >
          Nouveau Dossier
        </div>
      ),
    },
    {
      key: 'montant',
      label: 'Montant Transféré',
      renderHeader: () => (
        <div
          className="flex items-center cursor-pointer"
        >
          Montant Transféré
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Table */}
      <div className="overflow-x-auto">
        <Table
          columns={columns}
          data={formatData()}
          totalRows={totalRows}
          loading={loading}
          error={error}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          enableExport
          showSearch={false}
          filterComponent={
            <div className="space-y-4">
              <div
                className="grid gap-5"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                }}
              >
                {/* Regular inputs */}

                <Input
                  label={'Dossier'}
                  type="text"
                  placeholder="Dossier"
                  value={tempFilters.dossier}
                  onChange={(e) =>
                    handleFilterChange('dossier', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />

                <Input
                label={'Montant'}
                  type="number"
                  placeholder="Montant"
                  value={tempFilters.montant}
                  onChange={(e) =>
                    handleFilterChange('montant', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                 <Input
                label={'Date'}
                  type="date"
                  value={tempFilters.date}
                  onChange={(e) =>
                    handleFilterChange('date', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
               
              </div>

              {/* Buttons */}
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
    </div>
  );
};
