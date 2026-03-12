'use client';

import DeleteData from '@/components/DeleteData';
import Modal from '@/components/Modal';
import Table from '@/components/Table';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { APIURL, ENDPOINTS, RESOURCE_URL } from '@/configs/api';
import { fetchData_table_by_projet } from '@/configs/api-utils';
import { isAdmin, isCommercial, isRespoLivraison, isSuperAdmin } from '@/configs/enum';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { useProjet } from '@/context/ProjetContext';
import format from 'date-fns/format';
import Input from '@/components/Input';
import { useSociete } from '@/context/SocieteContext';
const RemiseCleTable = ({searchParams}) => {
   const { selectedSociete } = useSociete();
  const { selectedProjet  } = useProjet();
  const [remisecles, setRemiseCles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem('accessToken');

  const router = useRouter();
  const [filters, setFilters] = useState({
    bien: '',
    date_remise: '',
    cc: '',
  });

  const [tempFilters, setTempFilters] = useState({ ...filters });

  const entity = {
    API_URL: 'RemiseCles',
    dataKey: 'data',
    name: 'RemiseCle',
    searchFields: ['nom'],
  };



  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
  };

  const handleFileClick = (file) => {
    const url = `${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user?.societe?.id}/remise_cles/${file}`;
    window.open(url, '_blank');
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
      setRemiseCles,
      setTotalRows
    );
  }, [searchTerm, currentPage, rowsPerPage, accesstoken, filters,selectedProjet,selectedSociete]);

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters); // C’est ici que fetchUsers va être déclenché
  };
  const resetFilters = () => {
    const reset = {
      bien: '',
      date_remise: '',
      cc: '',
    };
    setFilters(reset);
    setTempFilters(reset);
  };

  function NomBienComplet(bien) {
    const noms = [];

    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);

    noms.push(bien.propriete_dite_bien);

    return noms.join(' - ');
  }

  const handleEdit = (id) =>
    router.push(`${ENDPOINTS.REMISECLES}?id=${id}&action=edit`);

  const formatData = () => {
    return remisecles.map((cp) => ({
      id: cp.id,
      date_remise: cp.date_remise,
      user_id_remis: cp.user_id_remis,
      user_remis: cp.user_remis,
      bien_id: cp.bien_id,
      bien: cp.bien,
      fichier: cp.fichier,
      id_res: cp.id_res,
      code_reservation: cp.code_reservation,
    }));
  };

  const columns = [
    {
      key: 'date_remise',
      label: 'Date Remise',
      render: (row) => format(new Date(row.date_remise), 'dd/MM/yyyy'),
    },
    ...(user.role <= 2
      ? [
          {
            key: 'responsable',
            label: 'Responsable',
            render: (row) => (
              <Link
                target="_blank"
                href={`/utilisateurs/afficher-utilisateur/${row.user_id_remis}`}
                style={{ textDecoration: 'none' }}
              >
                <strong style={{fontWeight:600}}>
                  {row.user_remis?.name} {row.user_remis?.prenom}
                </strong>
              </Link>
            ),
          },
        ]
      : []),

    {
      key: 'code_reservation',
      label: 'Code reservation',
      sortable: true,
      render: (row) => (
        <Link
          target="_blank"
          href={'/ventes/reservations/' + row.id_res}
          style={{ textDecoration: 'none' }}
        >
          <strong style={{fontWeight:600}}>{row.code_reservation}</strong>
        </Link>
      ),
    },
    {
      key: 'bien',
      label: 'Bien',
      render: (row) => (
        <Link
          target="_blank"
          href={`/biens/${row.bien_id}`}
          style={{ textDecoration: 'none' }}
        >
           <strong style={{fontWeight:600}}>{NomBienComplet(row.bien)}</strong>
        </Link>
      ),
    },
    {
      key: 'fichier',
      label: 'Pièce Jointe',
      render: (row) =>
        row.fichier ? (
          <span
            className=" hover:underline cursor-pointer"
            onClick={() => handleFileClick(row.fichier)}
          >
            {row.fichier}
          </span>
        ) : (
          '-'
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3 items-center">
          <div title="Modifier">
            <Pencil
              className="w-4 h-4 !text-yellow-500 hover:text-yellow-700 cursor-pointer"
              onClick={() => handleEdit(row.id)}
            />
          </div>
          <div title="Détail du Vente">
             <Link
                                  href={`/ventes/reservations/${row.id_res}`}
                                  className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
                                  title="Voir les détails"
                                >
                                  <Eye className="w-4 h-4" />
               </Link>
                      
          
          </div>
          <div title="Supprimer">
            <Trash2
              className="w-4 h-4 !text-red-500 hover:text-red-700 cursor-pointer"
              onClick={() => {
                setSelectedId(row.id);
                setShowDeleteModal(true);
              }}
            />
          </div>
        </div>
      ),
    },
  ];

  const columns_export = [
    { key: 'Date Remise', label: 'Date Remise' },
    { key: 'Responsable', label: 'Responsable' },
    { key: 'code_reservation', label: 'Code Réservation' },
    { key: 'Bien', label: 'Bien' },
  ];

  const data_to_export = () => {
    return remisecles.map((row) => ({
      'Date Remise': row.date_remise
        ? format(new Date(row.date_remise), 'dd/MM/yyyy HH:mm')
        : '',
      Responsable: `${row.user_remis?.name || ''} ${
        row.user_remis?.prenom || ''
      }`,
      Bien: NomBienComplet(row.bien),
      code_reservation: row.code_reservation,
    }));
  };

  return (
    <>
      <Table
      title={'Remise des Clés'}
        showSearch={false}
        data_to_export={data_to_export()}
        columns_export={columns_export}
        name_file_export={'remise_cle_export'}
        columns={columns}
        onFilterToggle={handleFilterToggle}
        data={formatData()}
        filterComponent={
          <div className="space-y-4 p-4 rounded-lg">
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              }}
            >
              <Input
                type="date"
                label={'Date Remise'}
                value={tempFilters.date_remise}
                onChange={(e) =>
                  handleFilterChange('date_remise', e.target.value)
                }
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
              {user.role <= 2 && (
                <Input
                  type="text"
                  label={'Commercial'}
                  value={tempFilters.cc}
                  onChange={(e) => handleFilterChange('cc', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
              )}

              <Input
                type="text"
                label={'Bien'}
                value={tempFilters.bien}
                onChange={(e) => handleFilterChange('bien', e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
              >
                Réinitialiser
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Appliquer les filtres
              </button>
            </div>
          </div>
        }
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
          isCommercial(user.role)||
          isRespoLivraison(user.role)
            ? `${ENDPOINTS.REMISECLES}?action=add`
            : undefined
        }
      />

      {showDeleteModal && selectedId && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.REMISECLES}
            Id={selectedId}
            type="RemiseCle"
            message={`Êtes-vous sûr de vouloir supprimer cette remise du clé ?`}
            accessToken={accesstoken}
            onClose={() => {
              setShowDeleteModal(false);
              fetchData_table_by_projet(
                entity,
                filters,
                searchTerm,
                currentPage,
                rowsPerPage,
                accesstoken,
                setLoading,
                setError,
                setRemiseCles,
                setTotalRows
              );
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default RemiseCleTable;
