import React, { useEffect, useState } from 'react';
import Table from '@/components/Table';
import {
  Eye,
  Pencil,
  RefreshCw,
  CreditCard,
  Trash2,
  PencilLine,
} from 'lucide-react';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import { useAuth } from '../../../../context/AuthContext';
import { APIURL, ENDPOINTS } from '../../../../configs/api';
import { useRouter } from 'next/navigation';
import { formatDate } from '../../../../utils/dateUtils';
import { isAdmin, isCommercial, isSuperAdmin } from '../../../../configs/enum';
import { fetchData_table_by_projet } from '../../../../../src/configs/api-utils';
import Link from 'next/link';
import Input from '@/components/Input';
import { format } from 'date-fns'; // Add this import
import { useProjet } from '@/context/ProjetContext';
import { VISITE_INTERETS } from '../../../../../src/configs/enum';
const AppelsTable = ({ dataClient, searchParams }) => {
  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem('accessToken');
  const { selectedProjet } = useProjet();

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

  const [filters, setFilters] = useState({
    date: '',
    nom: '',
    prenom: '',
    telephone: '',
    interet: '',
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const entity = {
    API_URL: 'appels',
    dataKey: 'data',
    searchFields: ['date', 'nom', 'prenom', 'telephone'],
  };

  useEffect(() => {
    const action = searchParams?.get('action');
    if (action === 'add' || action === 'edit') {
      console.log('Skipping API call - in form mode');
      return;
    }
    const params_url = dataClient ? { client_id: dataClient?.id } : {};
    const combinedFilters = { ...filters, ...params_url };

    fetchData_table_by_projet(
      entity,
      combinedFilters,
      searchTerm,
      currentPage,
      rowsPerPage,
      accesstoken,
      setLoading,
      setError,
      setAppels,
      setTotalRows
    );
  }, [
    searchParams,
    accesstoken,
    currentPage,
    rowsPerPage,
    searchTerm,
    filters,
    selectedProjet,
  ]);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1200); // Wait for 1.2s after user stops typing before updating the debounced value

    return () => clearTimeout(timer); // Clean up the timeout on each render
  }, [searchTerm]);

  function handleEdit(appelId) {
    // Navigate to /utilisateurs?id={id}&action=edit
    router.push(`${ENDPOINTS.APPELS}?id=${appelId}&action=edit`);
  }

  const canAddAppel =
    isSuperAdmin(user.role) || isAdmin(user.role) || isCommercial(user.role);

  function getAddLinkForAppel(user) {
    if (canAddAppel) {
      if (dataClient) {
        return {
          pathname: `${ENDPOINTS.APPELS}?action=add`,
          onClick: () => {
            localStorage.setItem(
              'selectedClient',
              JSON.stringify({ info: { dataClient: dataClient } })
            );
          },
        };
      }
      return `${ENDPOINTS.APPELS}?action=add`;
    }
    return undefined;
  }

  const handle_convert_to_visite = (prospect) => {
    localStorage.setItem(
      'selectedProspect',
      JSON.stringify({
        info: { dataProspect: prospect },
      })
    );
    router.push(`${ENDPOINTS.VISITES}?action=add`);
  };
  const voir_visite = (vId) => {
    window.open(`/crm/visites/${vId}`, '_blank');
  };

  // Format users data for table display
  const formatData = () => {
    return appels.map((data) => ({
      id: data.id,
      date:
        data?.last_traitement_appel?.date != null
          ? formatDate(data?.last_traitement_appel?.date)
          : null,
      nom: `${data.prospect.nom || ''} `.trim(),
      prenom: `${data.prospect.prenom || ''}`.trim(),
      telephone:
        (data.prospect.telephone ? data.prospect.telephone : '') +
          (data.prospect.telephone &&
          data.prospect.telephone_num2 &&
          data.prospect.telephone_num2 !== 'null'
            ? ' / ' + data.prospect.telephone_num2
            : '') || 'Non spécifié',
      cin: data.prospect.cin,
      // source: data.prospect.source?.source,
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
    { key: 'date', label: 'Date' },
    {
      key: 'nom',
      label: 'Nom',
      render: (row) => {
        return (
          <Link href={'/crm/prospects/' + row.prospect.id} target="_blank">
            <strong style={{ fontWeight: 600 }}>{row.nom}</strong>
          </Link>
        );
      },
    },
    {
      key: 'prenom',
      label: 'Prénom',
      render: (row) => {
        return (
          <Link href={'/crm/prospects/' + row.prospect.id} target="_blank">
            <strong style={{ fontWeight: 600 }}>{row.prenom}</strong>
          </Link>
        );
      },
    },
    { key: 'telephone', label: 'Téléphone' },
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
          <Link
            href={`/crm/appels/${row.id}`}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
            title="Voir les détails"
          >
            <Eye className="w-4 h-4" />
          </Link>

          <Link
            href={`${ENDPOINTS.APPELS}?id=${row.last_traitement_id}&action=edit`}
            className="flex items-center gap-1 text-yellow-500 hover:text-yellow-700"
            title="Modifier"
          >
            <PencilLine className="w-4 h-4" />
          </Link>

          <div title="Supprimer Appel">
            <Trash2
              className="w-4 h-4 !text-red-500 hover:text-red-700 cursor-pointer"
              onClick={() => {
                setSelectedId(row.id);
                setShowDeleteModal(true);
              }}
            />
          </div>

          {row.last_traitement_visite_id == null ? (
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handle_convert_to_visite(row.prospect);
              }}
              className="flex items-center gap-1 text-green-500 hover:text-green-700"
              title="Convertir en visite"
            >
              <RefreshCw className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href={`/crm/visite/${row.last_traitement_visite_id}`}
              className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
              title="Voir Visite"
            >
              <CreditCard className="w-4 h-4" />
            </Link>
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
    { key: 'date', label: 'Date Appel' },
    { key: 'cin', label: 'Cin' },
    { key: 'nomComplet', label: 'nomComplet' },
    { key: 'telephone', label: 'Telephone' },
    { key: 'email', label: 'Email' },
    { key: 'type_prospect', label: 'Type Prospect' },
    { key: 'source', label: 'Source' },
    { key: 'partenaire', label: 'Partenaire' },
    { key: 'interet', label: 'Intérêt' },
    { key: 'date_traitement', label: 'Date traitement' },
    { key: 'type_appel', label: 'Type Appel' },
  ];

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };
  const applyFilters = () => {
    setFilters(tempFilters);
  };
  const resetFilters = () => {
    const reset = {
      date: '',
      nom: '',
      prenom: '',
      telephone: '',
      interet: '',
    };
    setFilters(reset);
    setTempFilters(reset);
  };

  return (
    <>
      <div className="relative py-4">
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
          enableExport={formatData().length > 0}
          enableImport={false}
          showSearch={false}
          addLink={getAddLinkForAppel(user)}
          /* addLink={
            isSuperAdmin(user.role) ||
            isAdmin(user.role) ||
            isCommercial(user.role)
              ? `${ENDPOINTS.APPELS}?action=add`
              : undefined
          } */
          filterComponent={
            <div className="space-y-4 p-4 rounded-lg ">
              <div
                className="grid gap-1"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                }}
              >
                {/* Champs de recherche */}

                <Input
                  type="date"
                  label="Date"
                  value={tempFilters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="text"
                  label="Nom"
                  value={tempFilters.nom}
                  onChange={(e) => handleFilterChange('nom', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="text"
                  label="Prénom"
                  value={tempFilters.prenom}
                  onChange={(e) => handleFilterChange('prenom', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />

                <Input
                  type="number"
                  label="Téléphone"
                  value={tempFilters.telephone}
                  onChange={(e) =>
                    handleFilterChange('telephone', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                {/*<SelectInput
                  value={tempFilters.interet}
                  onChange={(value) => handleFilterChange('interet', value)}
                  options={Object.values(VISITE_INTERETS).map((data) => ({
                    value: data.code,
                    label: data.label,
                  }))}
                  label="Choisir un Intéret"
                  className="h-10 text-sm w-full"
                />*/}
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
      {showDeleteModal && selectedId && (
        <Modal
          isVisible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        >
          <DeleteData
            route={APIURL.APPELS}
            Id={selectedId}
            type="Appel"
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
