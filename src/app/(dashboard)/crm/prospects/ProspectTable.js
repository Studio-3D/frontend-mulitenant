'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Table from '@/components/Table';
import { Eye, Pencil, Check, RefreshCw, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import { useAuth } from '../../../../context/AuthContext';
import { useProjet } from '../../../../context/ProjetContext';
import { APIURL, ENDPOINTS } from '../../../../configs/api';
import { useRouter } from 'next/navigation';
import { fetchData_table_by_projet } from '../../../../../src/configs/api-utils';
import { isAdmin, isCommercial, isSuperAdmin } from '../../../../configs/enum';
import Modal_Traite from './Modal_Traite';
import { Statuts_Prospect } from '../../../../../src/configs/enum';
import Input from '@/components/Input';
import SelectInput from '@/components/SelectInput';

const ProspectTable = () => {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open_traite, setOpen_traite] = useState(false);
  const [traite_id, setId_traite] = useState(null);
  const [num_tel, setTel_num] = useState(null);
  const [nom_prenom, setNomPrenom] = useState(null);

  const { user, token } = useAuth();
  const { selectedProjet } = useProjet();
  const accesstoken = token || localStorage.getItem('accessToken');

  const router = useRouter();
  // Declare the entity object in the component scope
  const [filters, setFilters] = useState({
    nom: '',
    prenom: '',
    cin: '',
    telephone: '',
    email: '',
    statut: '',
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const entity = {
    API_URL: 'prospects',
    dataKey: 'prospects',
    searchFields: ['nom', 'prenom', 'email', 'telephone', 'cin'],
  };

  useEffect(() => {
    fetchData_table_by_projet(
      entity,
      filters,
      searchTerm,
      currentPage,
      rowsPerPage,
      accesstoken,
      setLoading,
      setError,
      setProspects,
      setTotalRows
    );
  }, [accesstoken, currentPage, rowsPerPage, searchTerm, filters, selectedProjet]);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1200); // Wait for 1.2s after user stops typing before updating the debounced value

    return () => clearTimeout(timer); // Clean up the timeout on each render
  }, [searchTerm]);

  useEffect(() => {
    //Implementing the setInterval method
    const interval = setInterval(() => {
      if (localStorage.getItem('load_data_prospect') == 1) {
        localStorage.removeItem('load_data_prospect');

        fetchData_table_by_projet(
          entity,
          filters,
          searchTerm,
          currentPage,
          rowsPerPage,
          accesstoken,
          setLoading,
          setError,
          setProspects,
          setTotalRows
        );
      }
    }, 1000);

    //Clearing the interval
    return () => clearInterval(interval);
  }, [accesstoken, currentPage, rowsPerPage, searchTerm, filters, selectedProjet]);

  const handleShow = (prospectId) => {
    router.push(`/crm/prospects/${prospectId}`);
  };

  function handleEdit(ProspectId) {
    console.log(`Editing Prospect ID: ${ProspectId}`); // Debugging
    router.push(`${ENDPOINTS.PROSPECTS}?id=${ProspectId}&action=edit`);
  }

  const handleraiter = (Id, num_tel, nom_prenom) => {
    setOpen_traite(!open_traite);
    setId_traite(Id);
    setTel_num(num_tel);
    setNomPrenom(nom_prenom);
  };

  function handle_convert_to_visite(row) {
    localStorage.setItem(
      'selectedProspect',
      JSON.stringify({ dataProspect: row })
    );
    router.push(`${ENDPOINTS.VISITES}?action=add`);
  }
  // Format users data for table display
  const formatData = () => {
    return prospects.map((pro) => ({
      id: pro.id,
      nom: `${pro.nom || ''}`.trim(),
      prenom: `${pro.prenom || ''}`.trim(),
      nomComplet: `${pro.nom || ''} ${pro.prenom || ''}`.trim(),
      email: pro.email,
      telephone:
        (pro.telephone ? pro.telephone : '') +
          (pro.telephone && pro.telephone_num2 && pro.telephone_num2 !== 'null'
            ? ' / ' + pro.telephone_num2
            : '') || 'Non spécifié',
      cin: pro.cin,
      client: pro.client,
      visites: pro.visites,
      appels: pro.appels,
      origin: pro.origin,
      statut:
        pro.last_statut != null
          ? Statuts_Prospect[pro.last_statut?.statut]?.label
          : '',
      prospect: pro,
    }));
  };

  // Table columns configuration
  const columns = [
    {
      key: 'nom',
      label: 'Nom',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>{row.nom}</span>
        </div>
      ),
    },
    {
      key: 'prenom',
      label: 'Prénom',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>{row.prenom}</span>
        </div>
      ),
    },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'cin', label: 'Cin' },
    { key: 'email', label: 'Email' },

    {
      key: 'statut',
      label: 'Statut',
      render: (row) => {
        if (!row.statut) return ''; // or return null;

        const roleColors = {
          'Planification Rendez Vous': 'bg-blue-100 text-[#009FFF]',
          Injoignable: 'bg-purple-100 text-purple-600',
          Rappel: 'bg-yellow-100 !text-yellow-600',
        };

        return (
          <span
            className={`px-2 py-1 rounded text-sm font-semibold ${
              roleColors[row.statut] || 'bg-gray-100 !text-gray-600'
            }`}
          >
            {row.statut}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3 items-center">
          <Eye
            className="w-4 h-4 !text-blue-500 hover:text-blue-700 cursor-pointer"
            title="Voir détails"
            onClick={() => handleShow(row.id)}
          />
          <Pencil
            className="w-4 h-4 !text-yellow-500 hover:text-yellow-700 cursor-pointer"
            title="Modifier"
            onClick={() => handleEdit(row.id)}
          />

          <Check
            className="w-4 h-4  hover:text-['rgb(87,80,129)']-700 text-['rgb(87,80,129)'] cursor-pointer"
            title="Traiter"
            onClick={() => handleraiter(row.id, row.telephone, row.nomComplet)}
          />
          <RefreshCw
            className="w-4 h-4 !text-green-500  cursor-pointer"
            title="Convertir en visite"
            onClick={() => handle_convert_to_visite(row.prospect)}
          />

          {row.client == null &&
            row.visites.length == 0 &&
            row.appels == null && (
              <Trash2
                className="w-4 h-4 !text-red-500 hover:text-red-700 cursor-pointer"
                onClick={() => {
                  setSelectedId(row.id);
                  setShowDeleteModal(true);
                }}
                title="Supprimer utilisateur"
              />
            )}
        </div>
      ),
    },
  ];

  {
    /* Dynamic Modals Import */
  }

  //EXPORT

  const data_to_export = () => {
    return prospects.map((pro) => ({
      nomComplet: `${pro.nom || ''} ${pro.prenom || ''}`.trim(),
      email: pro.email,
      telephone:
        (pro.telephone ? pro.telephone : '') +
          (pro.telephone && pro.telephone_num2 && pro.telephone_num2 !== 'null'
            ? ' / ' + pro.telephone_num2
            : '') || 'Non spécifié',
      cin: pro.cin,

      type_client: pro.partenaire_id === null ? 'Particulier' : 'professionnel',
      partenaire: pro.partenaire_id ? pro.partenaire?.description : '',
      source: pro?.source?.source,
    }));
  };

  const columns_export = [
    { key: 'nomComplet', label: 'nomComplet' },
    { key: 'telephone', label: 'Telephone' },
    { key: 'cin', label: 'Cin' },
    { key: 'email', label: 'Email' },
    { key: 'type_client', label: 'Type Prospect' },
    { key: 'source', label: 'Source' },
    { key: 'partenaire', label: 'Partenaire' },
  ];

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };
  const applyFilters = () => {
    setFilters(tempFilters);
  };
  const resetFilters = () => {
    const reset = {
      nom: '',
      prenom: '',
      cin: '',
      telephone: '',
      email: '',
      statut: '',
    };
    setFilters(reset);
    setTempFilters(reset);
  };

  return (
    <>
      <div className="reflative">
        <Table
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'propects_export'}
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
          enableImport={true}
          addLink={
            isSuperAdmin(user.role) ||
            isAdmin(user.role) ||
            isCommercial(user.role)
              ? `${ENDPOINTS.PROSPECTS}?action=add`
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
                {/* Champs de recherche */}
                <Input
                  type="text"
                  placeholder="Cin"
                  value={tempFilters.cin}
                  onChange={(e) => handleFilterChange('cin', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="text"
                  placeholder="Nom"
                  value={tempFilters.nom}
                  onChange={(e) => handleFilterChange('nom', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="text"
                  placeholder="Prénom"
                  value={tempFilters.prenom}
                  onChange={(e) => handleFilterChange('prenom', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />

                <Input
                  type="number"
                  placeholder="Téléphone"
                  value={tempFilters.telephone}
                  onChange={(e) =>
                    handleFilterChange('telephone', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={tempFilters.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <SelectInput
                  value={tempFilters.statut}
                  onChange={(value) => handleFilterChange('statut', value)}
                  options={Object.values(Statuts_Prospect).map((data) => ({
                    value: data.id,
                    label: data.label,
                  }))}
                  placeholder="Choisir un Statut"
                  className="h-10 text-sm w-full"
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

      {showDeleteModal && selectedId && (
        <Modal
          isVisible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        >
          <DeleteData
            route={APIURL.PROSPECTS}
            Id={selectedId}
            message={'Etes-vous sûr de vouloir supprimer ce Prospect ?'}
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
                setProspects,
                setTotalRows
              );
            }}
          />
        </Modal>
      )}

      {open_traite == true && (
        <>
          <Modal isVisible={true} onClose={() => setOpen_traite(false)}>
            <Modal_Traite
              nom_prenom={nom_prenom}
              num_tel={num_tel}
              id={traite_id}
              onClose={() => setOpen_traite(false)}
            />
          </Modal>
        </>
      )}
    </>
  );
};

export default ProspectTable;