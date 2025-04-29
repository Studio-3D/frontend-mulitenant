'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Table from '@/components/Table';
import { FaRegEye, FaEdit, FaCheck, FaSync } from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import { useAuth } from '../../../../context/AuthContext';
import { APIURL, ENDPOINTS } from '../../../../configs/api';
import { useRouter } from 'next/navigation';
import { fetchData_table_by_projet } from '../../../../../src/configs/api-utils';
import { isAdmin, isCommercial, isSuperAdmin } from '../../../../configs/enum';
import Modal_Traite from './Modal_Traite';
import { Statuts_Prospect } from '../../../../../src/configs/enum';

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
  const accesstoken = token || localStorage.getItem('accessToken');

  const router = useRouter();
  // Declare the entity object in the component scope

  const entity = {
    API_URL: 'prospects',
    dataKey: 'prospects',
    searchFields: ['fullname', 'email', 'telephone', 'cin'],
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
      setProspects,
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

  useEffect(() => {
    //Implementing the setInterval method
    const interval = setInterval(() => {
      if (localStorage.getItem('load_data_prospect') == 1) {
        localStorage.setItem('load_data_prospect', 0);

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
      }
    }, 1000);

    //Clearing the interval
    return () => clearInterval(interval);
  }, [accesstoken, currentPage, rowsPerPage, searchTerm]);

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
      prospect: pro
    }));
  };

  // Table columns configuration
  const columns = [
    {
      key: 'nomComplet',
      label: 'Nom Complet',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>{row.nomComplet}</span>
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
          Rappel: 'bg-yellow-100 text-yellow-600',
        };

        return (
          <span
            className={`px-2 py-1 rounded text-sm font-semibold ${
              roleColors[row.statut] || 'bg-gray-100 text-gray-600'
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
          <FaRegEye
            className="w-4 h-4 text-blue-500 hover:text-blue-700 cursor-pointer"
            title="Voir détails"
            onClick={() => handleShow(row.id)}
          />
          <FaEdit
            className="w-4 h-4 text-yellow-500 hover:text-yellow-700 cursor-pointer"
            title="Modifier"
            onClick={() => handleEdit(row.id)}
          />

          <FaCheck
            className="w-4 h-4  hover:text-['rgb(87,80,129)']-700 text-['rgb(87,80,129)'] cursor-pointer"
            title="Traiter"
            onClick={() => handleraiter(row.id, row.telephone, row.nomComplet)}
          />
          <FaSync
            className="w-4 h-4 text-green-500  cursor-pointer"
            title="Convertir en visite"
            onClick={() => handle_convert_to_visite(row.prospect)}
          />

          {row.client == null &&
            row.visites.length == 0 &&
            row.appels == null && (
              <RiDeleteBin6Line
                className="w-4 h-4 text-red-500 hover:text-red-700 cursor-pointer"
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
