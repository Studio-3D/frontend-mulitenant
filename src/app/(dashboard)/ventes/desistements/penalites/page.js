'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../../context/AuthContext';
import { fetchData_table_by_id } from '../../../../../../src/configs/api-utils';
import { Eye, Check, Upload, Clock } from 'lucide-react';
import Table from '@/components/Table';
import { format } from 'date-fns';
import { MODE_PAIEMENT, type_dst, type_dst_dp } from '@/configs/enum';
import { isAdmin, isSuperAdmin ,isCommercial} from '../../../../../configs/enum';
import { APIURL } from '@/configs/api';
import Link from 'next/link';
import SelectInput from '@/components/SelectInput';
import TextField from '@/components/Textfield';
import Button from '@/components/Button';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Document from './recu';
import Input from '@/components/Input';

import { useProjet } from '@/context/ProjetContext';
export default function PenalitesTable() {
  // Authentication and state management
  const { user, token } = useAuth();
  const userRole = user?.role;
  const accessToken = token || localStorage.getItem('accessToken');
  const etat_penalite = JSON.parse(localStorage.getItem('etat_penalite'));
  const router = useRouter();

  const initialFilters = {
    num_recu: '',
    responsable: '',
    date: '',
    penalite: '',
    type_desistement: '',
    mode_paiement: '',
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
  // Table state
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [num_penalite, set_num_penalite] = useState([]);

  // Dialog state
  const [dialogData, setDialogData] = useState({
    date_encaissement: null,
    commentaire: null,
    num_remise: null,
    action: null,
    errors: null,
    disabled: false,
    open: false,
    selectedId: 0,
  });
  const { selectedProjet } = useProjet();
        useEffect(() => {
          if (
            !isAdmin(userRole) &&
            !isSuperAdmin(userRole) &&
            !isCommercial(userRole)
          ) {
            router.push('/');
          }
        }, [router]);
        
  // API configuration
  const entity = {
    id: selectedProjet?.id + '/' + etat_penalite,
    API_URL: 'penalites',
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
  }, [
    accessToken,
    currentPage,
    rowsPerPage,
    searchTerm,
    filters,
    selectedProjet,
  ]);

  // Helper functions
  const updateDialogState = (updates) => {
    setDialogData((prev) => ({ ...prev, ...updates }));
  };

 
  const handleValiderRejeter = (id, num_recu) => {
    set_num_penalite(num_recu);
    updateDialogState({ open: true, selectedId: id });
  };

  const handleCloseDialog = () => {
    updateDialogState({ open: false });
  };

  const handleSubmitValiderRejeter = async (e) => {
    e.preventDefault();
    updateDialogState({ disabled: true });

    try {
      await axios.put(
        `${APIURL.ROOTV1}/traiter_penalite/${dialogData.selectedId}`,
        {
          commentaire: dialogData.commentaire,
          date_encaiss: dialogData.date_encaissement,
          n_remise: dialogData.num_remise,
          etat: dialogData.action,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      updateDialogState({
        commentaire: null,
        date_encaissement: null,
        num_remise: null,
        open: false,
        disabled: false,
      });
      toast.success('Action Traité avec Succés');
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
      if (response?.status === 422) {
        updateDialogState({ errors: response.data.errors });
      }
      updateDialogState({ disabled: false });
    }
  };

  // Data formatting
  const formatDesistementType = (penalite) => {
    if (penalite.desistement.type !== 2) {
      return type_dst[penalite.desistement.type]?.label || 'Inconnu';
    }
    return type_dst_dp[penalite.desistement.type_dp]?.label || 'Inconnu';
  };

  const getTypeColor = (typeLabel) => {
    if (typeLabel.includes('Définitif')) return 'bg-red-100 text-red-800';
    if (typeLabel.includes('Profit')) return 'bg-blue-100 text-blue-800';
    return 'bg-purple-100 text-purple-800';
  };

  const formatData = () => {
    return data.map((penalite) => ({
      id: penalite.id,
      num_recu: penalite.sr === 0 ? penalite.num_recu : 'SR',
      date: format(new Date(penalite.created_at), 'dd/MM/yyyy'),
      cc: `${penalite.desistement?.user?.name || ''} ${
        penalite.desistement?.user?.prenom || ''
      }`.trim(),
      sr: penalite.sr,
      cc_id: penalite.desistement?.user?.id,
      code_reservation:
        penalite.desistement.reservation_ancien?.code_reservation || '',
      reservation_id: penalite.desistement.reservation_ancien?.id,
      type_desistement: formatDesistementType(penalite),
      type_color: getTypeColor(formatDesistementType(penalite)),
      penalite: `${penalite.montant.toLocaleString()} DH`,
      mode_paiement: MODE_PAIEMENT[penalite.mode_paiement]?.label,
      date_validation: penalite.date_validation
        ? format(new Date(penalite.date_validation), 'dd/MM/yyyy')
        : '',
      responsable_validation: penalite.user_id_valider
        ? `${penalite.responsable_validation?.name || ''} ${
            penalite.responsable_validation?.prenom || ''
          }`.trim()
        : '',
      pen: penalite,
    }));
  };

  // Table columns configuration
  const baseColumns = [
    { key: 'num_recu', label: 'N° Reçu' },
    { key: 'date', label: 'Date' },
  ];

  const adminColumns =
    isSuperAdmin(userRole) || isAdmin(userRole)
      ? [
          {
            key: 'cc',
            label: 'CC',
            render: (row) => (
              <Link
                href={`/Utilisateurs/afficher-utilisateur/${row.cc_id}`}
                target="_blank"
              
              >
                 <strong style={{ fontWeight: 600 }}>{row.cc}</strong>
                
              </Link>
            ),
          },
        ]
      : [];

  const typeColumn = {
    key: 'type_desistement',
    label: 'Type Désistement',
    render: (row) => (
      <span className={`px-2 py-1 rounded text-xs ${row.type_color}`}>
        {row.type_desistement}
      </span>
    ),
  };

  const reservationColumn = {
    key: 'code_reservation',
    label: 'Code Réservation',
    render: (row) => (
      <Link
        href={`/ventes/reservations/${row.reservation_id}`}
        target="_blank"
        className=""
      >
         <strong style={{ fontWeight: 600 }}>{row.code_reservation}</strong>
      </Link>
    ),
  };

  const validationColumns =
    (isSuperAdmin(userRole) || isAdmin(userRole)) &&
    [1, 2].includes(etat_penalite)
      ? [
          {
            key: 'date_validation',
            label: etat_penalite === 1 ? 'Date Validation' : 'Date Rejet',
          },
          {
            key: 'responsable_validation',
            label:
              etat_penalite === 1
                ? 'Responsable Validation'
                : 'Responsable Rejet',
          },
        ]
      : [];

  const actionColumn =
    isAdmin(userRole) || isSuperAdmin(userRole) ? (
      {
        key: 'actions',
        label: 'ACTIONS',
        width: '120px',
        render: (row) => {
          // Only show actions if desistement.statut == 1
          if (row.pen?.desistement?.statut !== 1) return null;

          return (
            <div className="flex gap-2">
              
              
               <Link
              href={`/ventes/desistements/penalites/${row.id}`}
              className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
              title="Détail Pénalité"
            >
              <Eye className="w-4 h-4" />
            </Link>

              {etat_penalite === 5 && (
                <button
                  onClick={() => handleValiderRejeter(row.id, row.num_recu)}
                  className="text-green-500 hover:text-green-700"
                  title="Valider/Rejeter"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              {row.sr == 0 && (
                <PDFDownloadLink
                  document={
                    <Document
                      data={[
                        row.pen.desistement.reservation_ancien
                          ?.code_reservation,
                        row.pen.num_recu,
                        row.pen.montant,
                        row.pen.mode_paiement,
                        row.pen.numero_paiement,
                        row.pen.desistement.reservation_ancien?.bien
                          .propriete_dite_bien,
                        row.pen.desistement.user.name,
                        row.pen.desistement.user.prenom,
                        row.pen.desistement.reservation_ancien?.aquereurs_ancien?.map(
                          (aq, i, arr) => {
                            return [
                              aq.client.cin +
                                '  ' +
                                aq.client.nom +
                                ' ' +
                                aq.client.prenom +
                                (arr.length - 1 === i ? +' ' : ' et '),
                            ];
                          }
                        ),
                      ]}
                    />
                  }
                  fileName="recu_penalite.pdf"
                >
                  {({ loading }) => (
                    <button
                      className={`text-indigo-500 hover:text-indigo-700 ${
                        loading ? 'opacity-50' : ''
                      }`}
                      title="Télécharger PDF"
                      disabled={loading}
                    >
                      {loading ? '...' : <Upload className="w-4 h-4" />}
                    </button>
                  )}
                </PDFDownloadLink>
              )}
            </div>
          );
        },
      }
    ) : (
      <button
        className="text-yellox-500 hover:text-yellow-700"
        title="En Attente Validation Désistement"
      >
        <Clock className="w-4 h-4" />
      </button>
    );
  const columns = [
    ...baseColumns,
    ...adminColumns,
    reservationColumn,
    typeColumn,
    { key: 'penalite', label: 'Pénalités' },
    { key: 'mode_paiement', label: 'Mode Paiement' },
    ...validationColumns,
    ...(actionColumn ? [{ ...actionColumn, key: 'actions' }] : []), // Fixed line
  ];

  // Export data configuration
  const data_to_export = () => {
    return data.map((penalite) => ({
      'N° Reçu': penalite.sr === 0 ? penalite.num_recu : 'SR',
      Date: format(new Date(penalite.created_at), 'dd/MM/yyyy'),
      CC: `${penalite.desistement?.user?.name || ''} ${
        penalite.desistement?.user?.prenom || ''
      }`.trim(),
      'Code Réservation':
        penalite.desistement.reservation_ancien?.code_reservation || '',
      'Type Désistement': formatDesistementType(penalite),
      Pénalités: `${penalite.montant.toLocaleString()} DH`,
      'Mode Paiement': MODE_PAIEMENT[penalite.mode_paiement]?.label,
      'Date Validation': penalite.date_validation
        ? format(new Date(penalite.date_validation), 'dd/MM/yyyy')
        : '',
      'Responsable Validation': penalite.user_id_valider
        ? `${penalite.responsable_validation?.name || ''} ${
            penalite.responsable_validation?.prenom || ''
          }`.trim()
        : '',
    }));
  };

  const columns_export = [
    { key: 'N° Reçu', label: 'N° Reçu' },
    { key: 'Date', label: 'Date' },
    { key: 'CC', label: 'CC' },
    { key: 'Code Réservation', label: 'Code Réservation' },
    { key: 'Type Désistement', label: 'Type Désistement' },
    { key: 'Pénalités', label: 'Pénalités' },
    { key: 'Mode Paiement', label: 'Mode Paiement' },
    { key: 'Date Validation', label: 'Date Validation' },
    { key: 'Responsable Validation', label: 'Responsable Validation' },
  ];

  // Status title
  const statusTitles = {
    5: 'En Attente',
    1: 'Validées',
    2: 'Rejetées',
  };

  const Type_dst_t = {
    1: { code: 1, label: 'Définitif' },
    3: { code: 3, label: 'Changement de Bien' },
    11: { code: 11, label: "Profit d'un Proche" },
    12: { code: 12, label: 'au profit un co reservataire' },
    13: { code: 13, label: 'partiel' },
  };

  return (
    <>
      <div className="relative p-4">
        <Table
          title={`Pénalités - ${
            etat_penalite == 1
              ? 'Validées'
              : (etat_penalite == 5 ||etat_penalite==0)
              ? 'En cours'
              : etat_penalite == 2
              ? 'Rejeté'
              : 'Autre'
          } `}
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'penalites_export'}
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
                {/* Regular inputs */}

                <Input
                  type="text"
                  label="N° Reçu"
                  value={tempFilters.num_recu}
                  onChange={(e) =>
                    handleFilterChange('num_recu', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                {userRole <= 2 && (
                  <Input
                    type="text"
                    label="Responsable"
                    value={tempFilters.responsable}
                    onChange={(e) =>
                      handleFilterChange('responsable', e.target.value)
                    }
                    className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                  />
                )}
                <Input
                  type="date"
                  label="Date"
                  value={tempFilters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />

                <Input
                  type="number"
                  label="Pénalité"
                  value={tempFilters.penalite}
                  onChange={(e) =>
                    handleFilterChange('penalite', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />

                <SelectInput
                  value={tempFilters.mode_paiement}
                  onChange={(value) =>
                    handleFilterChange('mode_paiement', value)
                  }
                  options={Object.values(MODE_PAIEMENT).map((data) => ({
                    value: data.code,
                    label: data.label,
                  }))}
                  label="Choisir un Mode Paiement"
                  className="h-10 text-sm w-full"
                />
                <SelectInput
                  value={tempFilters.type_desistement}
                  onChange={(value) =>
                    handleFilterChange('type_desistement', value)
                  }
                  options={Object.values(Type_dst_t).map((data) => ({
                    value: data.code,
                    label: data.label,
                  }))}
                  label="Choisir Type desistement"
                  className="h-10 text-sm w-full"
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

        {/* Dialog for Valider/Rejeter */}
        {dialogData.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="w-full h-[60px] bg-[green] px-4 mb-3">
                <div className="flex items-center justify-center h-full">
                  <h1 className="text-2xl font-bold text-center text-white">
                    Traitement Pénalité
                  </h1>
                </div>
              </div>

              <form onSubmit={handleSubmitValiderRejeter}>
                <div>
                  <TextField
                    label="N° Pénalité"
                    name="pen"
                    control={false}
                    errors={{}}
                    backendErrors={{}}
                    value={num_penalite}
                    disabled
                  />
                </div>
                <div className="mb-4">
                  <SelectInput
                    label="Action"
                    value={dialogData.action}
                    onChange={(e) => updateDialogState({ action: e })}
                    options={[
                      { value: '', label: 'Sélectionner une action' },
                      { value: '1', label: 'Valider' },
                      { value: '2', label: 'Rejeter' },
                    ]}
                  />
                </div>

                {dialogData.action == '1' && (
                  <>
                    <div className="mb-4">
                      <TextField
                        type="number"
                        label="N° Remise"
                        name="remiseNumber"
                        control={false}
                        errors={{}}
                        backendErrors={{}}
                        value={dialogData.num_remise}
                        onChange={(e) =>
                          updateDialogState({ num_remise: e.target.value })
                        }
                        required={false}
                      />
                    </div>
                    <div className="mb-4">
                      <TextField
                        label="Date Encaissement"
                        name="encaiss"
                        type="date"
                        control={false}
                        errors={{}}
                        backendErrors={{}}
                        value={dialogData.date_encaissement}
                        onChange={(e) =>
                          updateDialogState({
                            date_encaissement: e.target.value,
                          })
                        }
                        required={true}
                      />
                    </div>
                  </>
                )}

                {dialogData.action == '2' && (
                  <div className="mb-4">
                    <TextField
                      control={false}
                      label="Commentaire"
                      name="comment"
                      value={dialogData.commentaire}
                      onChange={(e) =>
                        updateDialogState({ commentaire: e.target.value })
                      }
                      multi={true}
                      errors={{}}
                      backendErrors={{}}
                      rows={4}
                      required
                      width="w-full"
                      height="h-full"
                    />
                  </div>
                )}

                {dialogData.errors && (
                  <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                    {Object.values(dialogData.errors).map((error, index) => (
                      <p key={index}>{error}</p>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    type=""
                    onClick={handleCloseDialog}
                    className="px-4 py-2 border rounded"
                  >
                    Annuler
                  </Button>
                  <Button type="submit" loading={dialogData.disabled}>
                    Enregistrer
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
