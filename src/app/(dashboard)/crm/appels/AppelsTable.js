import React, { useEffect, useState } from 'react';
import Table from '@/components/Table';
import { FaRegEye, FaEdit, FaSync, FaRegIdCard } from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import { useAuth } from '../../../../context/AuthContext';
import { APIURL, ENDPOINTS } from '../../../../configs/api';
import { useRouter } from 'next/navigation';
import format from 'date-fns/format';
import { isAdmin, isCommercial, isSuperAdmin } from '../../../../configs/enum';
import { fetchData_table_by_projet } from '../../../../../src/configs/api-utils';
import Link from 'next/link';

import { VISITE_INTERETS } from '../../../../../src/configs/enum';
const AppelsTable = () => {

  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem('accessToken');

  const router = useRouter();
  const [appels, setAppels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const entity = {
    API_URL: 'appels',
    dataKey: 'data',
    searchFields: [],
  };

  useEffect(() => {
    fetchData_table_by_projet(
      entity,
      {},
      searchTerm,
      currentPage,
      rowsPerPage,
      accesstoken,
      setLoading,
      setError,
      setAppels,
      setTotalRows
    );
  }, [accesstoken, currentPage, rowsPerPage, searchTerm]);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1200); // Wait for 1.2s after user stops typing before updating the debounced value

    return () => clearTimeout(timer); // Clean up the timeout on each render
  }, [searchTerm]);

  const handleShow = (appelId) => {
    router.push(`/crm/appels/${appelId}`);
  };

  function handleEdit(appelId) {
    // Navigate to /utilisateurs?id={id}&action=edit
    router.push(`${ENDPOINTS.APPELS}?id=${appelId}&action=edit`);
  }

  function handle_convert_to_visite(prospect) {
    localStorage.setItem(
      'selectedProspect',
      JSON.stringify({ dataProspect: prospect })
    );
    router.push(`${ENDPOINTS.VISITES}?action=add`);
  }

  const voir_visite = (vId) => {
    window.open(`/crm/visites/${vId}`, '_blank');
  };

  // Format users data for table display
  const formatData = () => {
    return appels.map((data) => ({
      id: data.id,
      nomComplet: `${data.prospect.nom || ''} ${
        data.prospect.prenom || ''
      }`.trim(),
      telephone:
        (data.prospect.telephone ? data.prospect.telephone : '') +
          (data.prospect.telephone &&
          data.prospect.telephone_num2 &&
          data.prospect.telephone_num2 !== 'null'
            ? ' / ' + data.prospect.telephone_num2
            : '') || 'Non spécifié',
      cin: data.prospect.cin,
      source: data.prospect.source?.source,
      prospect: data.prospect,
      interet: data.last_traitement_appel?.interet,
      last_traitement_id: data.last_traitement_appel?.id || null,
      last_traitement_visite_id: data.last_traitement_appel?.visite_id || null,
    }));
  };

  const getInteretBadge = (interest) => {
    const interetInfo = VISITE_INTERETS[interest];
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${interetInfo.color}`}
      >
        {interetInfo.label}
      </span>
    );
  };
  // Table columns configuration
  const columns = [
    { key: 'cin', label: 'Cin' },

    {
      key: 'nomComplet',
      label: 'Nom Complet',
      render: (row) => {
        return (
          <Link href={'/crm/prospects/' + row.prospect.id} target="_blank">
            <strong style={{ fontWeight: 600 }}>{row.nomComplet}</strong>
          </Link>
        );
      },
    },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'source', label: 'Source' },
    {
      key: 'interet',
      label: 'Intéret',
      render: (row) => {
        return getInteretBadge(row.interet);
      },
    },

    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3 items-center">
          <FaRegEye
            className="w-4 h-4 text-blue-500 hover:text-blue-700 cursor-pointer"
            title="Voir détails"
            onClick={() => handleShow(row.id)}
          />
          <FaEdit
            className="w-4 h-4 text-yellow-500 hover:text-yellow-700 cursor-pointer"
            title="Modifier"
            onClick={() => handleEdit(row.last_traitement_id)}
          />

          <RiDeleteBin6Line
            className="w-4 h-4 text-red-500 hover:text-red-700 cursor-pointer"
            onClick={() => {
              setSelectedId(row.id);
              setShowDeleteModal(true);
            }}
            title="Supprimer Appel"
          />
          {row.last_traitement_visite_id == null ? (
            <FaSync
              className="w-4 h-4 text-green-500  cursor-pointer"
              title="Convertir en visite"
              onClick={() => handle_convert_to_visite(row.prospect)}
            />
          ) : (
            <FaRegIdCard
              onClick={() => voir_visite(row.last_traitement_visite_id)}
            />
          )}
        </div>
      ),
    },
  ];

  //EXPORT

  const data_to_export = () => {
    return appels.map((data) => ({
      nomComplet: `${data.prospect.nom || ''} ${
        data.prospect.prenom || ''
      }`.trim(),
      telephone:
        (data.prospect.telephone ? data.prospect.telephone : '') +
          (data.prospect.telephone &&
          data.prospect.telephone_num2 &&
          data.prospect.telephone_num2 !== 'null'
            ? ' / ' + data.prospect.telephone_num2
            : '') || 'Non spécifié',
      cin: data.prospect.cin,
      email: data?.prospect.email || '',
      type_prospect:
        data?.prospect.partenaire_id === null ? 'Particulier' : 'professionnel',
      partenaire: data?.prospect.partenaire_id
        ? data.partenaire?.description
        : '',
      source: data?.prospect.source?.source,
      interet: VISITE_INTERETS[data.last_traitement_appel?.interet]?.label,
      date:
        format(new Date(data?.last_traitement_appel?.date), 'dd/MM/yyyy') || '',
      date_traitement:
        format(
          new Date(data?.last_traitement_appel?.date_traitement),
          'dd/MM/yyyy'
        ) || '',
      type_appel:
        data?.last_traitement_appel?.type_appel == 1
          ? 'Entrant'
          : 'Sortant' || '',
    }));
  };

  const columns_export = [
    { key: 'nomComplet', label: 'nomComplet' },
    { key: 'telephone', label: 'Telephone' },
    { key: 'cin', label: 'Cin' },
    { key: 'email', label: 'Email' },
    { key: 'type_prospect', label: 'Type Prospect' },
    { key: 'source', label: 'Source' },
    { key: 'partenaire', label: 'Partenaire' },
    { key: 'interet', label: 'Intérêt' },
    { key: 'date', label: 'Date Appel' },
    { key: 'date_traitement', label: 'Date traitement' },
    { key: 'type_appel', label: 'Type Appel' },
  ];

  return (
    <>
      <div className="reflative">
        <Table
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'appels_export'}
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
          addLink={
            isSuperAdmin(user.role) ||
            isAdmin(user.role) ||
            isCommercial(user.role)
              ? `${ENDPOINTS.APPELS}?action=add`
              : undefined
          }
        />
      </div>
      {showDeleteModal && selectedId && (
        <Modal
          isVisible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        >
          <DeleteData
            route={APIURL.APPELS}
            Id={selectedId}
            message={'Etes-vous sûr de vouloir supprimer cette Appel ?'}
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
                setAppels,
                setTotalRows
              );
            }}
          />
        </Modal>
      )}{' '}
    </>
  );
};

export default AppelsTable;
