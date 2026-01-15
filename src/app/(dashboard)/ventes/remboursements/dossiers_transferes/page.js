'use client';

import React, { useEffect, useState } from 'react';
import Table from '@/components/Table';
import { Eye, Check } from 'lucide-react';
import { useAuth } from '../../../../../context/AuthContext';
import { useProjet } from '../../../../../context/ProjetContext';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { isAdmin, isSuperAdmin } from '../../../../../configs/enum';
import Link from 'next/link';
import { fetchData_table_by_id } from '../../../../../../src/configs/api-utils';
import Input from '@/components/Input';

const RemboDosTable = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const { user, token } = useAuth();
  const userRole = user?.role;
  const accessToken = token || localStorage.getItem('accessToken');

  const { selectedProjet } = useProjet();
  const router = useRouter();

  const [filters, setFilters] = useState({
    responsable: '',
    ancien_dossier: '',
    nouveau_dossier: '',
  });

  const [tempFilters, setTempFilters] = useState({ ...filters });

  const entity = {
    API_URL: 'get_remboursements_dos_transfert',
    searchFields: [''],
    id: selectedProjet?.id,
    dataKey: 'data',
  };

  const formatData = () => {
    return data.map((item) => ({
      ...item,
      responsable:
        item.desistement_not_trashed?.user?.name +
        ' ' +
        item.desistement_not_trashed?.user?.prenom,
      old_dos: item.reservation?.code_reservation,
      new_dos: item.dossier_transfert?.code_reservation,
      montant: item.montant_transfert,
    }));
  };

  const data_to_export = () => {
    return formatData().map((item) => ({
      'Date Transfert': item.created_at
        ? format(new Date(item.created_at), 'dd/MM/yyyy')
        : '',
      Responsable: item.responsable,
      'Ancien Dossier': item.old_dos,
      'Nouveau Dossier': item.new_dos,
      'Montant Transféré': item.montant?.toLocaleString() + ' DH',
    }));
  };

  const columns_export = [
    { key: 'Date Transfert', label: 'Date Transfert' },
    { key: 'Responsable', label: 'Responsable' },
    { key: 'Ancien Dossier', label: 'Ancien Dossier' },
    { key: 'Nouveau Dossier', label: 'Nouveau Dossier' },
    { key: 'Montant Transféré', label: 'Montant Transféré' },
  ];

  useEffect(() => {
    fetchData_table_by_id(
      entity,
      filters,
      searchTerm,
      currentPage,
      rowsPerPage,
      accessToken,
      setLoading,
      setError,
      setData,
      setTotalRows
    );
  }, [
    accessToken,
    currentPage,
    rowsPerPage,
    searchTerm,
    filters,
    selectedProjet,
  ]);

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
  };

  const resetFilters = () => {
    const reset = {
      responsable: '',
      ancien_dossier: '',
      nouveau_dossier: '',
    };
    setFilters(reset);
    setTempFilters(reset);
  };

  const columns = [
    {
      key: 'date',
      label: 'Date Transfert',
      render: (row) => (
        <span>
          {row.created_at
            ? format(new Date(row.created_at), 'dd/MM/yyyy')
            : '-'}
        </span>
      ),
    },
    ...(isSuperAdmin(userRole) || isAdmin(userRole)
      ? [
          {
            key: 'responsable',
            label: 'Responsable',
            render: (row) => (
              <Link
                target="_blank"
                href={`/Utilisateurs/afficher-utilisateur/${row.desistement_not_trashed?.user?.id}`}
                // className="text-blue-500 hover:text-blue-800"
              >
                <strong style={{ fontWeight: 600 }}>
                  {' '}
                  {row.desistement_not_trashed?.user?.name}{' '}
                  {row.desistement_not_trashed?.user?.prenom}
                </strong>
              </Link>
            ),
          },
        ]
      : []),
    {
      key: 'old_dos',
      label: 'Ancien Dossier',
      render: (row) => (
        <Link
          target="_blank"
          href={`/ventes/reservations/${row.reservation?.id}`}
         // className="text-blue-500 hover:text-blue-800"
        >
         <strong style={{ fontWeight: 600 }}>{row.reservation?.code_reservation || ' '}</strong>  
        </Link>
      ),
    },
    {
      key: 'new_dos',
      label: 'Nouveau Dossier',
      render: (row) => (
        <Link
          target="_blank"
          href={`ventes/reservations/${row.dossier_id_transfert}`}
          //className="text-blue-500 hover:text-blue-800"
        >
           <strong style={{ fontWeight: 600 }}>{row.dossier_transfert?.code_reservation || ' '}</strong>
        </Link>
      ),
    },
    {
      key: 'montant',
      label: 'Montant Transféré',
      render: (row) => (
        <span className="text-green-500 font-medium">
          {row.montant_transfert?.toLocaleString() + ' DH'}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className=" p-4">
        <Table
          title={'Dossier Transférés'}
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'remboursements_dossiers_export'}
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
          enableImport={false}
          showSearch={false}
          filterComponent={
            <div className="space-y-4">
              <div
                className="grid gap-5"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                }}
              >
                <Input
                  type="text"
                  placeholder="Responsable"
                  value={tempFilters.responsable}
                  onChange={(e) =>
                    handleFilterChange('responsable', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="text"
                  placeholder="Ancien Dossier"
                  value={tempFilters.ancien_dossier}
                  onChange={(e) =>
                    handleFilterChange('ancien_dossier', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="text"
                  placeholder="Nouveau Dossier"
                  value={tempFilters.nouveau_dossier}
                  onChange={(e) =>
                    handleFilterChange('nouveau_dossier', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={applyFilters}
                  className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-700"
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
    </>
  );
};

export default RemboDosTable;
