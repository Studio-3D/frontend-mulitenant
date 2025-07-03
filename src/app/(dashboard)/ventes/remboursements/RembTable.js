'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';

import { Eye, Check, Upload, Clock, X } from 'lucide-react';
import Table from '@/components/Table';
import { format } from 'date-fns';
import Link from 'next/link';
import SelectInput from '@/components/SelectInput';
import TextField from '@/components/Textfield';
import Button from '@/components/Button';
import axios from 'axios';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import VenteNavbar from '@/components/VenteNavbar';
import { APIURL } from '@/configs/api';
import Input from '@/components/Input';

import { fetchData_Select, fetchData_table_by_id } from '@/configs/api-utils';
import { isAdmin, isSuperAdmin } from '@/configs/enum';

export default function RembTable({ etat }) {
  // Authentication and state management
  const { user, token } = useAuth();
  const userRole = user.role;
  const accessToken = token || localStorage.getItem('accessToken');
  const FileUrl = process.env.NEXT_PUBLIC_IMG_URL;

  const initialFilters = {
    responsable: '',
    client: '',
    bien: '',
    montant_a_rembourser: '',
    type_remb: '',
    date_remb: '',
    num_paiement: '',
    pour_le_compte: '',
    date_accuse: '',
    date_decaissement: '',
    banque: '',
  };

  const [filters, setFilters] = useState(initialFilters);
  const [tempFilters, setTempFilters] = useState(initialFilters);

  // Table state
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog states
  const [openVR, setOpenVR] = useState(false);
  const [openAttAccuse, setOpenAttAccuse] = useState(false);
  const [openDecaissement, setOpenDecaissement] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedBien, setSelectedBien] = useState(null);
  const [banques, setBanques] = useState([]);
  const [loadingBanques, setLoadingBanques] = useState(false);

  // Form states
  const [dateRemboursement, setDateRemboursement] = useState(null);
  const [numPaiement, setNumPaiement] = useState(null);
  const [chequeRecu, setChequeRecu] = useState(null);
  const [pourLeCompte, setPourLeCompte] = useState(null);
  const [fichierAutorisation, setFichierAutorisation] = useState(null);
  const [modeRembourse, setModeRembourse] = useState(null);
  const [chequeClientSigne, setChequeClientSigne] = useState(null);
  const [dateDecaissement, setDateDecaissement] = useState(null);
  const [banqueId, setBanqueId] = useState(null);
  const [banqueAdd, setBanqueAdd] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [formErrors, setFormErrors] = useState(null);

  // API configuration
  const entity = {
    id: JSON.parse(localStorage.getItem('selectedProjet'))?.id + '/' + etat,
    API_URL: 'get_remboursements',
    dataKey: 'data',
    searchFields: [''],
  };

  // Fetch data effect
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

    // Fetch banques
    fetchData_Select('banques', setBanques, setLoadingBanques);
  }, [accessToken, currentPage, rowsPerPage, searchTerm, filters]);

  // Helper functions
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

  const handleView = (id) => {
    window.open(`/ventes/desistements/show/${id}`, '_blank');
  };

  const handleTraiterDemande = (id, client, bien) => {
    setSelectedId(id);
    setSelectedClient(client);
    setSelectedBien(bien);
    setOpenVR(true);
  };

  const handleTraiterAccuse = (id, client, bien) => {
    setSelectedId(id);
    setSelectedClient(client);
    setSelectedBien(bien);
    setOpenAttAccuse(true);
  };

  const handleTraiterDecaissement = (id, client, bien) => {
    setSelectedId(id);
    setSelectedClient(client);
    setSelectedBien(bien);
    setOpenDecaissement(true);
  };

  const handleFileClick = (file, code_reservation) => {
    window.open(
      `${FileUrl}/Docs/${user?.societe?.raison_sociale_concatene}_${user.societe?.id}/remboursements/cheques_reçus/${code_reservation}/${file}`,
      '_blank'
    );
  };

  const renderModeRemboursement = (mode) => {
    let label = '';
    let color = '';

    switch (mode) {
      case 'direct':
        label = 'Immédiat';
        color = 'bg-green-100 text-green-800';
        break;
      case 'apres_vente':
        label = 'Aprés Vente';
        color = 'bg-blue-100 text-blue-800';
        break;
      case 'transfert':
        label = 'Transfert dossier';
        color = 'bg-purple-100 text-purple-800';
        break;
      case 'transfert_rem_apres_vente':
        label = 'Transfert et Remboursement Aprés vente';
        color = 'bg-yellow-100 text-yellow-800';
        break;
      case 'transfert_rem_direct':
        label = 'Transfert et Remboursement Immédiat';
        color = 'bg-indigo-100 text-indigo-800';
        break;
      default:
        label = '';
        color = '';
    }

    return (
      <span className={`px-2 py-1 rounded text-xs ${color}`}>{label}</span>
    );
  };

  const formatData = () => {
    return data.map((remboursement) => ({
      id: remboursement.id,
      desistement_id: remboursement.desistement_id,
      client: `${remboursement?.aquereur?.client?.nom || ''} ${
        remboursement?.aquereur?.client?.prenom || ''
      }`.trim(),
      telephone: `${remboursement?.aquereur?.client?.telephone_num1 || ''} ${
        remboursement?.aquereur?.client?.telephone_num2
          ? `/${remboursement.aquereur.client.telephone_num2}`
          : ''
      }`,
      bien_id: remboursement.desistement?.bien_ancien?.id || '',
      bien: remboursement.desistement?.bien_ancien?.propriete_dite_bien || '',
      montant: `${
        remboursement.montant_a_rembourser?.toLocaleString() || '0'
      } DH`,
      mode_rembourse: remboursement.mode_rembourse,
      date_rembourse: remboursement.date_rembourse
        ? format(new Date(remboursement.date_rembourse), 'dd/MM/yyyy')
        : '',
      num_paiement: remboursement.num_paiement || '',
      pour_le_compte: remboursement.pour_le_compte || '',
      cheque_client_signe: remboursement.cheque_client_signe || '',
      date_decaissement: remboursement.date_decaissement
        ? format(new Date(remboursement.date_decaissement), 'dd/MM/yyyy HH:mm')
        : '',
      date_accuse: remboursement.date_accuse
        ? format(new Date(remboursement.date_accuse), 'dd/MM/yyyy HH:mm')
        : '',
      banque: remboursement.banque?.nom || '',
      responsable: `${remboursement.desistement?.user?.name || ''} ${
        remboursement.desistement?.user?.prenom || ''
      }`.trim(),
      responsable_id: remboursement.desistement?.user?.id,
      statut: remboursement.statut,
      etat: remboursement.etat,
      remb: remboursement,
    }));
  };

  // Table columns configuration
  const baseColumns = [
    { key: 'client', label: 'Clients' },
    { key: 'telephone', label: 'Téléphone' },
    {
      key: 'bien',
      label: 'Bien',
      render: (row) => (
        <Link
          href={`/Biens/${row.bien_id}`}
          className="text-blue-500 hover:text-blue-700"
          target="_blank"
        >
          {row.bien}
        </Link>
      ),
    },
    {
      key: 'montant',
      label: 'Montant à Rembourser',
      render: (row) => (
        <span className="text-green-500 font-semibold">{row.montant}</span>
      ),
    },
    {
      key: 'mode_rembourse',
      label: 'Remboursement',
      render: (row) => renderModeRemboursement(row.mode_rembourse),
    },
  ];

  const adminColumns =
    userRole <= 2
      ? [
          {
            key: 'responsable',
            label: 'Responsable',
            render: (row) => (
              <Link
                href={`/Utilisateurs/afficher-utilisateur/${row.responsable_id}`}
                className="text-blue-500 hover:text-blue-700"
                target="_blank"
              >
                {row.responsable}
              </Link>
            ),
          },
        ]
      : [];
  {
    /* demande apres vente */
  }

  const additionalColumns =
    etat != 0
      ? [
          { key: 'date_rembourse', label: 'Date Remboursement' },
          { key: 'num_paiement', label: 'N° Paiement' },
          { key: 'pour_le_compte', label: 'Pour le Compte' },
        ]
      : [];
  {
    /* 4  accusé chéque traité (remis le /cheque client signe) //valide */
  }

  const accuseColumns =
    etat != 3 && etat != 0
      ? [
          {
            key: 'cheque_client_signe',
            label: 'Chéque Client Signé',
            render: (row) =>
              row.cheque_client_signe ? (
                <button
                  onClick={() =>
                    handleFileClick(
                      row.cheque_client_signe,
                      row?.remb.reservation?.code_reservation
                    )
                  }
                  className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                >
                  Voir fichier
                </button>
              ) : null,
          },
        ]
      : [];
  {
    /* 2  accusé */
  }
  const decaissementColumns =
    etat != 1 && etat != 0 && etat != 3
      ? [
          { key: 'date_decaissement', label: 'Date Décaissement' },
          { key: 'date_accuse', label: 'Date Accusé' },
          { key: 'banque', label: 'Banque' },
        ]
      : [];

  const actionColumn = {
    key: 'actions',
    label: 'ACTIONS',
    width: '120px',
    render: (row) => {
      // Only show actions if desistement.statut == 1

      {
        /* etat /0=>demande de remboursement 3==>attente accusé chu cheque*/
      }

      if ((row.etat == 1 || row.etat == 0) && row.statut == 0) {
        return (
          <div className="flex gap-3 items-center">
            <Eye
              onClick={() => handleView(row.desistement_id)}
              className="w-4 h-4 !text-blue-500 hover:text-blue-700 cursor-pointer"
              title="Détail Désistement"
            />

            <Check
              onClick={() => handleTraiterDemande(row.id, row.client, row.bien)}
              className="w-4 h-4 text-green-500 hover:text-green-700"
              title="Traiter un demande"
            />
          </div>
        );
      } else if (etat == 3) {
        return (
          <div className="flex gap-3 items-center">
            <button
              onClick={() => handleView(row.desistement_id)}
              className="w-4 h-4 text-blue-500 hover:text-blue-700"
              title="Détail Désistement"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleTraiterAccuse(row.id, row.client, row.bien)}
              className="w-4 h-4 text-red-500 hover:text-red-700"
              title="Traiter Accusé"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        );
      } else if (etat == 1) {
        return (
          <div className="flex gap-3 items-center">
            <button
              onClick={() => handleView(row.desistement_id)}
              className="text-blue-500 hover:text-blue-700"
              title="Détail Désistement"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                handleTraiterDecaissement(row.id, row.client, row.bien)
              }
              className="text-yellow-500 hover:text-yellow-700"
              title="Décaissement"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        );
      }
    },
  };

  const columns = [
    ...adminColumns,
    ...baseColumns,
    ...additionalColumns,
    ...accuseColumns,
    ...decaissementColumns,
    actionColumn,
  ];

  // Export data configuration
  const data_to_export = () => {
    return data.map((remboursement) => ({
      Responsable: `${remboursement.desistement?.user?.name || ''} ${
        remboursement.desistement?.user?.prenom || ''
      }`.trim(),
      Client: `${remboursement?.aquereur?.client?.nom || ''} ${
        remboursement?.aquereur?.client?.prenom || ''
      }`.trim(),
      Téléphone: `${remboursement?.aquereur?.client?.telephone_num1 || ''} ${
        remboursement?.aquereur?.client?.telephone_num2
          ? `/${remboursement.aquereur.client.telephone_num2}`
          : ''
      }`,
      Bien: remboursement.desistement?.bien_ancien?.propriete_dite_bien || '',
      'Montant à Rembourser': `${
        remboursement.montant_a_rembourser?.toLocaleString() || '0'
      } DH`,
      Remboursement:
        remboursement.mode_rembourse == 'direct'
          ? 'Immédiat'
          : remboursement.mode_rembourse == 'apres_vente'
          ? 'Aprés Vente'
          : remboursement.mode_rembourse == 'transfert'
          ? 'Transfert dossier'
          : remboursement.mode_rembourse == 'transfert_rem_apres_vente'
          ? 'Transfert et Remboursement Aprés vente'
          : remboursement.mode_rembourse == 'transfert_rem_direct'
          ? 'Transfert et Remboursement Immédiat'
          : '',
      'Date Remboursement': remboursement.date_rembourse
        ? format(new Date(remboursement.date_rembourse), 'dd/MM/yyyy')
        : '',
      'N° Paiement': remboursement.num_paiement || '',
      'Pour le Compte': remboursement.pour_le_compte || '',
      'Chéque Client Signé': remboursement.cheque_client_signe || '',
      'Date Décaissement': remboursement.date_decaissement
        ? format(new Date(remboursement.date_decaissement), 'dd/MM/yyyy HH:mm')
        : '',
      'Date Accusé': remboursement.date_accuse
        ? format(new Date(remboursement.date_accuse), 'dd/MM/yyyy HH:mm')
        : '',
      Banque: remboursement.banque?.nom || '',
    }));
  };

  const columns_export = [
    { key: 'Responsable', label: 'Responsable' },
    { key: 'Client', label: 'Client' },
    { key: 'Téléphone', label: 'Téléphone' },
    { key: 'Bien', label: 'Bien' },
    { key: 'Montant à Rembourser', label: 'Montant à Rembourser' },
    { key: 'Remboursement', label: 'Remboursement' },
    { key: 'Date Remboursement', label: 'Date Remboursement' },
    { key: 'N° Paiement', label: 'N° Paiement' },
    { key: 'Pour le Compte', label: 'Pour le Compte' },
    { key: 'Chéque Client Signé', label: 'Chéque Client Signé' },
    { key: 'Date Décaissement', label: 'Date Décaissement' },
    { key: 'Date Accusé', label: 'Date Accusé' },
    { key: 'Banque', label: 'Banque' },
  ];

  // Status title
  const statusTitle =
    etat == 0
      ? 'les Demandes de Pré-remboursements'
      : etat == 1
      ? 'Attente Décaissement'
      : etat == 2
      ? 'Liste des Accusés'
      : etat == 3
      ? 'Attente Accusé du chèque'
      : etat == 4
      ? 'Accusé du chèque Traité'
      : '';

  // Form handlers
  const handleSubmitTraiterDemande = async (e) => {
    e.preventDefault();
    setDisabled(true);

    const formData = new FormData();
    formData.append('date_remboursement', dateRemboursement);
    formData.append('num_paiement', numPaiement);
    formData.append('pour_le_compte', pourLeCompte);
    formData.append('mode_rembourse_client', modeRembourse);

    if (chequeRecu) formData.append('cheque_recu', chequeRecu);
    if (fichierAutorisation)
      formData.append('fichier_autorisation', fichierAutorisation);

    try {
      await axios.post(
        `${APIURL.ROOTV1}/traiter_demande_pre_rembourse/${selectedId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      toast.success('Le chèque de remboursement est enregistré');
      setOpenVR(false);
      setDateRemboursement(null);
      setNumPaiement(null);
      setChequeRecu(null);
      setPourLeCompte(null);
      setFichierAutorisation(null);
      setModeRembourse(null);
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
    } catch (err) {
      const response = err.response;
      if (response?.status == 422) {
        setFormErrors(response.data.errors);
      } else {
        toast.error('Une erreur est survenue');
      }
    } finally {
      setDisabled(false);
    }
  };

  const handleSubmitTraiterAccuse = async (e) => {
    e.preventDefault();
    setDisabled(true);

    const formData = new FormData();
    formData.append('cheque_client_signe', chequeClientSigne);

    try {
      await axios.post(
        `${APIURL.ROOTV1}/traiter_accuse/${selectedId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      toast.success('Le Chèque du Remboursement est distribué au client');
      setOpenAttAccuse(false);
      setChequeClientSigne(null);
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
    } catch (err) {
      const response = err.response;
      if (response?.status == 422) {
        setFormErrors(response.data.errors);
      } else {
        toast.error('Une erreur est survenue');
      }
    } finally {
      setDisabled(false);
    }
  };

  const handleSubmitTraiterDecaissement = async (e) => {
    e.preventDefault();
    setDisabled(true);

    const formData = new FormData();
    formData.append('date_decaissement', dateDecaissement);
    formData.append('banque_id', banqueId);

    try {
      await axios.post(
        `${APIURL.ROOTV1}/traiter_decaissement/${selectedId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      toast.success('Le Chèque du Remboursement est débité');
      setOpenDecaissement(false);
      setDateDecaissement(null);
      setBanqueId(null);
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
    } catch (err) {
      const response = err.response;
      if (response?.status == 422) {
        setFormErrors(response.data.errors);
      } else {
        toast.error('Une erreur est survenue');
      }
    } finally {
      setDisabled(false);
    }
  };
  const type_remb = {
    1: { code: 1, label: 'Immédiat' },
    2: { code: 2, label: 'Aprés Vente' },
    3: { code: 3, label: 'Transfert dossier' },
    4: { code: 4, label: 'Transfert et Remboursement Aprés vente' },
    5: { code: 5, label: 'Transfert et Remboursement Immédiat' },
  };

  return (
    <>
      <VenteNavbar />

      <div className="relative bg-white shadow-md rounded-lg px-4 py-4">
        <p className="text-lg font-semibold mb-4">{statusTitle}</p>

        <Table
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'remboursements_export'}
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
                {(isSuperAdmin(userRole) || isAdmin(userRole)) && (
                  <Input
                    type="text"
                    placeholder="Responsable"
                    value={tempFilters.responsable}
                    onChange={(e) =>
                      handleFilterChange('responsable', e.target.value)
                    }
                    className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                  />
                )}
                <Input
                  type="text"
                  placeholder="Client"
                  value={tempFilters.client}
                  onChange={(e) => handleFilterChange('client', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="text"
                  placeholder="Bien"
                  value={tempFilters.bien}
                  onChange={(e) => handleFilterChange('bien', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="number"
                  placeholder="Montant à Rembourser"
                  value={tempFilters.montant_a_rembourser}
                  onChange={(e) =>
                    handleFilterChange('montant_a_rembourser', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                {/*apres vente */}
                {etat != 0 && (
                  <>
                    <SelectInput
                      value={tempFilters.type_remb}
                      onChange={(value) =>
                        handleFilterChange('type_remb', value)
                      }
                      options={Object.values(type_remb).map((data) => ({
                        value: data.code,
                        label: data.label,
                      }))}
                      placeholder="Remboursement"
                      className="h-10 text-sm w-full"
                    />

                    <input
                      type={tempFilters.date_remb ? 'date' : 'text'}
                      placeholder="Date Remboursement"
                      value={tempFilters.date_remb}
                      onFocus={(e) => (e.target.type = 'date')}
                      onChange={(e) =>
                        handleFilterChange('date_remb', e.target.value)
                      }
                      className="h-10 px-3 py-2 rounded-md border border-black-300 w-full text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="N° Paiement"
                      value={tempFilters.num_paiement}
                      onChange={(e) =>
                        handleFilterChange('num_paiement', e.target.value)
                      }
                      className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                    />
                    <Input
                      type="text"
                      placeholder="Pour le Compte"
                      value={tempFilters.pour_le_compte}
                      onChange={(e) =>
                        handleFilterChange('pour_le_compte', e.target.value)
                      }
                      className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                    />
                  </>
                )}

                {(etat == 2 || etat == 4) && (
                  <>
                   
                      <input
                      type={tempFilters.date_decaissement ? 'date' : 'text'}
                      placeholder="Date Décaissement"
                      value={tempFilters.date_decaissement}
                      onFocus={(e) => (e.target.type = 'date')}
                      onChange={(e) =>
                        handleFilterChange('date_decaissement', e.target.value)
                      }
                      className="h-10 px-3 py-2 rounded-md border border-black-300 w-full text-sm"
                    />
                     <input
                      type={tempFilters.date_accuse ? 'date' : 'text'}
                      placeholder="Date Accusé"
                      value={tempFilters.date_accuse}
                      onFocus={(e) => (e.target.type = 'date')}
                      onChange={(e) =>
                        handleFilterChange('date_accuse', e.target.value)
                      }
                      className="h-10 px-3 py-2 rounded-md border border-black-300 w-full text-sm"
                    />
                   

                    <SelectInput
                      value={tempFilters.banque}
                      onChange={(value) => handleFilterChange('banque', value)}
                      options={Object.values(banques).map((data) => ({
                        value: data.id,
                        label: data.nom,
                      }))}
                      placeholder="Banque"
                      className="h-10 text-sm w-full"
                    />
                  </>
                )}
              </div>

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

      {/* Modal for Traiter Demande */}
      <Modal isVisible={openVR} onClose={() => setOpenVR(false)}>
        <div className="w-full h-[60px] bg-green-600 px-4 mb-3">
          <div className="flex items-center justify-center h-full">
            <h1 className="text-2xl font-bold text-center text-white">
              Traiter un demande
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmitTraiterDemande} className="p-6">
          <div className="grid grid-cols-12 gap-4 mb-4">
            {/* Client and Bien fields */}
            <div className="col-span-8">
              <TextField
                label="Client:"
                name="client"
                required={true}
                control={false}
                errors={{}}
                backendErrors={{}}
                value={selectedClient}
                disabled
              />
            </div>
            <div className="col-span-4">
              <TextField
                label="Bien:"
                name="bien"
                required={true}
                control={false}
                errors={{}}
                backendErrors={{}}
                value={selectedBien}
                disabled
              />
            </div>

            {/* Date and Payment Number */}
            <div className="col-span-6">
              <TextField
                label="Date de Remboursement:"
                name="date_remb"
                type="date"
                required={true}
                control={false}
                errors={{}}
                backendErrors={{}}
                value={dateRemboursement} // Add this line
                onChange={(e) => setDateRemboursement(e.target.value)}
              />
            </div>
            <div className="col-span-6">
              <TextField
                label="N° Paiement:"
                name="num_paiement"
                type="number"
                required={true}
                control={false}
                errors={{}}
                backendErrors={{}}
                value={numPaiement} // Add this line
                onChange={(e) => setNumPaiement(e.target.value)}
              />
            </div>

            {/* Payment Mode */}
            <div className="col-span-12">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mode Remboursement:<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="mode_rembourse"
                    value="cheque"
                    required
                    onChange={() => setModeRembourse('cheque')}
                    className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="ml-2">Chèque</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="mode_rembourse"
                    value="virement"
                    onChange={() => setModeRembourse('virement')}
                    className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="ml-2">Virement</span>
                </label>
              </div>
            </div>

            {/* Receipt Upload */}
            <div className="col-span-12">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {modeRembourse == 'cheque' ? 'Chèque Reçu:' : 'Reçu:'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                required={modeRembourse == 'cheque'}
                accept="image/*, application/pdf"
                onChange={(e) => setChequeRecu(e.target.files[0])}
                className="w-full px-3 py-2 text-sm text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Account Selection */}
            <div className="col-span-12">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pour le Compte <span className="text-red-500">*</span>:
              </label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="pour_le_compte"
                    value="lui_meme"
                    required
                    onChange={() => setPourLeCompte('lui_meme')}
                    className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="ml-2">lui même</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="pour_le_compte"
                    value="autre"
                    onChange={() => setPourLeCompte('autre')}
                    className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="ml-2">Autre</span>
                </label>
              </div>
            </div>

            {/* Conditional Authorization File */}
            {pourLeCompte == 'autre' && (
              <div className="col-span-12 transition-all duration-200 ease-in-out">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fichier Authorisation <span className="text-red-500">*</span>:
                </label>
                <input
                  type="file"
                  required
                  accept="image/*, application/pdf"
                  onChange={(e) => setFichierAutorisation(e.target.files[0])}
                  className="w-full px-3 py-2 text-sm text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Error Messages */}
          {formErrors && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {Object.values(formErrors).map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" onClick={() => setOpenVR(false)}>
              Annuler
            </Button>
            <Button type="submit" loading={disabled}>
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal for Traiter Accusé */}
      <Modal isVisible={openAttAccuse} onClose={() => setOpenAttAccuse(false)}>
        <div className="w-full h-[60px] bg-blue-600 px-4 mb-3">
          <div className="flex items-center justify-center h-full">
            <h1 className="text-2xl font-bold text-center text-white">
              Traiter un Accusé du chèque
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmitTraiterAccuse} className="p-6">
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-8">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client:
              </label>
              <input
                type="text"
                value={selectedClient}
                disabled
                className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 text-sm"
              />
            </div>
            <div className="col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bien:
              </label>
              <input
                type="text"
                value={selectedBien}
                disabled
                className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 text-sm"
              />
            </div>
            <div className="col-span-12">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chèque client Signé:
              </label>
              <input
                type="file"
                required
                accept="image/*, application/pdf"
                onChange={(e) => setChequeClientSigne(e.target.files[0])}
                className="w-full text-sm"
              />
            </div>
          </div>

          {formErrors && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {Object.values(formErrors).map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              onClick={() => setOpenAttAccuse(false)}
              className="px-4 py-2 border rounded"
            >
              Annuler
            </Button>
            <Button type="submit" loading={disabled}>
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal for Traiter Décaissement */}
      <Modal
        isVisible={openDecaissement}
        onClose={() => setOpenDecaissement(false)}
      >
        <div className="w-full h-[60px] bg-black px-4 mb-3">
          <div className="flex items-center justify-center h-full">
            <h1 className="text-2xl font-bold text-center text-white">
              Traiter un Décaissement
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmitTraiterDecaissement} className="p-6">
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-8">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client:
              </label>
              <input
                type="text"
                value={selectedClient}
                disabled
                className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 text-sm"
              />
            </div>
            <div className="col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bien:
              </label>
              <input
                type="text"
                value={selectedBien}
                disabled
                className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 text-sm"
              />
            </div>
            <div className="col-span-12">
              <TextField
                label="Date Décaissement:"
                name="date_decaissement"
                type="datetime-local"
                required={true}
                control={false}
                errors={{}}
                backendErrors={{}}
                value={dateDecaissement}
                onChange={(e) => setDateDecaissement(e.target.value)}
              />
            </div>
            <div className="col-span-12">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banque:
              </label>
              <SelectInput
                value={banqueAdd}
                onChange={(value) => {
                  setBanqueAdd(value);
                  setBanqueId(value);
                }}
                options={banques.map((banque) => ({
                  value: banque.id, // Use just the ID as value
                  label: banque.nom,
                  original: banque, // Keep reference to full object if needed
                }))}
                placeholder="Choisissez un Banque"
                className="h-10 text-sm w-full"
                loading={loadingBanques}
              />
            </div>
          </div>

          {formErrors && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {Object.values(formErrors).map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              onClick={() => setOpenDecaissement(false)}
              className="px-4 py-2 border rounded"
            >
              Annuler
            </Button>
            <Button type="submit" loading={disabled}>
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
