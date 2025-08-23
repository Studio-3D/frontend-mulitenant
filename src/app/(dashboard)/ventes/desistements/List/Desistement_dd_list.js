'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../../context/AuthContext';
import { fetchData_table_by_projet } from '../../../../../../src/configs/api-utils';
import { Eye, Pencil, PencilLine } from 'lucide-react';
import Link from 'next/link';
import Input from '@/components/Input';
import SelectInput from '@/components/SelectInput';
import DateRangePicker from '@/components/DateRangePicker';

import Table from '@/components/Table';
import { formatDate } from '../../../../../utils/dateUtils';
import { motif_desistements } from '@/configs/enum';

export default function Desistement_dd_list() {
  const etat_desistement = JSON.parse(localStorage.getItem('etat_dst'));
  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem('accessToken');
  const user_role = user.role;

  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const status = {
    1: { id: 2, label: 'Rejeté' },
    2: { id: 1, label: 'Validé' },
    3:
      user_role <= 2
        ? { id: 5, label: 'En Attente' }
        : { id: 0, label: 'En cours' },
  };

  const initialFilters = {
    cc: '',
    code_reservation: '',
    de_date_des: '',
    a_date_des: '',
    de_date_respo_req: '',
    a_date_respo_req: '',
    responsable: '',
    penalite: '',
    nom_prenom: '',
    motif: '',
    type: 'dst_definitif',
    statut: etat_desistement,
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
    API_URL: 'desistements',
    dataKey: 'data',
    searchFields: [],
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
      setData,
      setTotalRows
    );
  }, [accesstoken, currentPage, rowsPerPage, searchTerm, filters]);

  const handleView = (desId) => {
    router.push(`/ventes/desistements/show/${desId}`);
  };

  const handleView_reservation = (reservationId) => {
    router.push(`/ventes/reservations/${reservationId}`);
  };

  const handleCorriger = (desId, reservationId) => {
    router.push(`/ventes/desistements/corriger_desistement/${desId}`);
    localStorage.setItem('res_id_rejete', reservationId);
  };

  // Format data for table display with client IDs
  const formatData = () => {
    return data.map((desistement) => {
      // Collect client information from both aquereurs and aquereurs_ancien
      const clients = [];

      // Process aquereurs
      if (desistement.reservation_ancien?.aquereurs) {
        desistement.reservation_ancien.aquereurs.forEach((a) => {
          if (a?.client) {
            clients.push({
              name: `${a.client.nom || ''} ${a.client.prenom || ''}`.trim(),
              id: a.client.id,
            });
          }
        });
      }

      // Process aquereurs_ancien
      if (desistement.reservation_ancien?.aquereurs_ancien) {
        desistement.reservation_ancien.aquereurs_ancien.forEach((a) => {
          if (a?.client) {
            clients.push({
              name: `${a.client.nom || ''} ${a.client.prenom || ''}`.trim(),
              id: a.client.id,
            });
          }
        });
      }

      return {
        id: desistement.id,
        date: desistement.created_at
          ? formatDate(desistement.created_at)
          : '',
        cc: `${desistement?.user?.name || ''} ${
          desistement?.user?.prenom || ''
        }`.trim(),
        code_reservation:
          desistement.reservation_ancien?.code_reservation || '',
        clients: clients,
        nom_prenom: clients.map((c) => c.name).join(', ') || '',
        motif: motif_desistements[desistement.motif]?.label || '',
        penalite: desistement.penalite_desistement?.montant
          ? `${desistement.penalite_desistement.montant.toLocaleString()} DH`
          : '',
        date_validation: desistement.date_validation
          ? formatDate(desistement.date_validation)
          : '',
        responsable_validation: desistement.user_id_valider
          ? `${desistement.responsable_validation?.name || ''} ${
              desistement.responsable_validation?.prenom || ''
            }`.trim()
          : '',
        reservation_id: desistement.reservation_id,
      };
    });
  };

  const columns = [
    { key: 'date', label: 'Date' },
    ...(user_role <= 2
      ? [{ key: 'cc', label: 'Responsable', width: '100px' }]
      : []),
    { key: 'code_reservation', label: 'Code Réservation' },
    {
      key: 'nom_prenom',
      label: 'Nom & Prénom',
      render: (row) => (
        <div className="flex flex-col gap-1">
          {row.clients.map((client, index) =>
            client.id ? (
              <Link
                key={index}
                href={`/ventes/clients/show/${client.id}`}
                className="text-blue-500 hover:text-blue-800"
                target="_blank"
              >
                {client.name}
              </Link>
            ) : (
              <span key={index}>{client.name}</span>
            )
          )}
        </div>
      ),
    },
    { key: 'motif', label: 'Motif' },
    { key: 'penalite', label: 'Pénalité' },
    ...(user_role <= 2 && !(etat_desistement == 5 || etat_desistement == 0)
      ? [
          {
            key: 'date_validation',
            label:
              etat_desistement == 1
                ? 'Date Validation'
                : etat_desistement == 2
                ? 'Date Rejet'
                : '',
          },

          {
            key: 'responsable_validation',
            label:
              etat_desistement == 1
                ? 'Responsable Validation'
                : etat_desistement == 2
                ? 'Responsable Rejet'
                : '',
          },
        ]
      : []),
    {
      key: 'actions',
      label: 'ACTIONS',
      width: '120px',
      render: (row) => (
        <div className="flex gap-2">
          {etat_desistement != 2 && (
            <button
              onClick={() => handleView(row.id)}
              className="text-blue-500 hover:text-blue-700"
              title="Détail Désistement"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleView_reservation(row.reservation_id)}
            className="text-green-500 hover:text-green-700"
            title="Détail Réservation"
          >
            <Eye className="w-4 h-4" />
          </button>
          {etat_desistement == 2 && (
            <button
              onClick={() => handleCorriger(row.id, row.reservation_id)}
              className="text-red-500 hover:text-red-700"
              title="Corriger"
            >
              <PencilLine className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  // Data for export (updated to match formatData structure)
  const data_to_export = () => {
    return data.map((desistement) => {
      // Collect client names same way as in formatData
      const clients = [];

      // Process aquereurs
      if (desistement.reservation_ancien?.aquereurs) {
        desistement.reservation_ancien.aquereurs.forEach((a) => {
          if (a?.client) {
            clients.push(
              `${a.client.nom || ''} ${a.client.prenom || ''}`.trim()
            );
          }
        });
      }

      // Process aquereurs_ancien
      if (desistement.reservation_ancien?.aquereurs_ancien) {
        desistement.reservation_ancien.aquereurs_ancien.forEach((a) => {
          if (a?.client) {
            clients.push(
              `${a.client.nom || ''} ${a.client.prenom || ''}`.trim()
            );
          }
        });
      }

      return {
        Date: desistement.created_at
          ? formatDate(desistement.created_at)
          : '',
        CC: `${desistement?.user?.name || ''} ${
          desistement?.user?.prenom || ''
        }`.trim(),
        'Code Réservation':
          desistement.reservation_ancien?.code_reservation || '',
        'Nom & Prénom': clients.join(', ') || '',
        Motif: motif_desistements[desistement.motif]?.label || '',
        Pénalité: desistement.penalite_desistement?.montant
          ? `${desistement.penalite_desistement.montant.toLocaleString()} DH`
          : '',
        'Date Validation': desistement.date_validation
          ? formatDate(desistement.date_validation)
          : '',
        'Responsable Validation': desistement.user_id_valider
          ? `${desistement.responsable_validation?.name || ''} ${
              desistement.responsable_validation?.prenom || ''
            }`.trim()
          : '',
      };
    });
  };

  const columns_export = [
    { key: 'Date', label: 'Date' },
    { key: 'CC', label: 'Responsable' },
    { key: 'Code Réservation', label: 'Code Réservation' },
    { key: 'Nom & Prénom', label: 'Nom & Prénom' },
    { key: 'Motif', label: 'Motif' },
    { key: 'Pénalité', label: 'Pénalité' },
    { key: 'Date Validation', label: 'Date Validation' },
    { key: 'Responsable Validation', label: 'Responsable Validation' },
  ];

  return (
    <div className="relative bg-white shadow-md rounded-lg px-4 py-4">
      <p className="text-lg font-semibold mb-4">
        Désistements Définitifs{' '}
        {etat_desistement == 5
          ? 'En Attentes'
          : etat_desistement == 0
          ? 'Encours'
          : etat_desistement == 1
          ? 'Validés'
          : etat_desistement == 2
          ? 'Rejetés'
          : null}
      </p>

      <Table
        showSearch={false}
        data_to_export={data_to_export()}
        columns_export={columns_export}
        name_file_export={'desistements_export'}
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
        filterComponent={
          <div className="space-y-4">
            <div
              className="grid gap-5"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              }}
            >
              {/* Regular inputs */}
              {user_role <= 2 && (
                <Input
                  type="text"
                  label="Responsable"
                  value={tempFilters.cc}
                  onChange={(e) => handleFilterChange('cc', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
              )}
              <Input
                type="text"
                label="Code Réservation"
                value={tempFilters.code_reservation}
                onChange={(e) =>
                  handleFilterChange('code_reservation', e.target.value)
                }
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
              {user_role <= 2 &&
                !(etat_desistement == 5 || etat_desistement == 0) && (
                  <Input
                    type="text"
                    label="Responsable Validation"
                    value={tempFilters.responsable}
                    onChange={(e) =>
                      handleFilterChange('responsable', e.target.value)
                    }
                    className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                  />
                )}

              <Input
                type="number"
                label="Pénalité"
                value={tempFilters.penalite}
                onChange={(e) => handleFilterChange('penalite', e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
              <Input
                type="text"
                label="Nom et Prénom"
                value={tempFilters.nom_prenom}
                onChange={(e) =>
                  handleFilterChange('nom_prenom', e.target.value)
                }
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
              <SelectInput
                value={tempFilters.motif}
                onChange={(value) => handleFilterChange('motif', value)}
                options={Object.values(motif_desistements).map((data) => ({
                  value: data.id,
                  label: data.label,
                }))}
                label="Choisir un Motif"
                className="h-10 text-sm w-full"
              />
              <SelectInput
                value={tempFilters.statut}
                onChange={(value) => handleFilterChange('statut', value)}
                options={Object.values(status).map((data) => ({
                  value: data.id,
                  label: data.label,
                }))}
                label="Choisir un Statut"
                placeholder=""
                className="h-10 text-sm w-full"
              />
            </div>

            {/* Date range inputs in their own row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <DateRangePicker
                startName="de_date_des"
                endName="a_date_des"
                startValue={tempFilters.de_date_des}
                endValue={tempFilters.a_date_des}
                onChange={handleFilterChange}
                label="Choisir une Date"
              />
              {user_role <= 2 &&
                !(etat_desistement == 5 || etat_desistement == 0) && (
                  <DateRangePicker
                    startName="de_date_respo_req"
                    endName="a_date_respo_req"
                    startValue={tempFilters.de_date_respo_req}
                    endValue={tempFilters.a_date_respo_req}
                    onChange={handleFilterChange}
                    label="Choisir une Date Validation"
                  />
                )}
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
  );
}
