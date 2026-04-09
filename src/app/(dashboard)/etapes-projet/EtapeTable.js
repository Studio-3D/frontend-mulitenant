'use client';

import React, { useEffect, useState } from 'react';
import Table from '@/components/Table';
import { Pencil, Trash2, Play, CheckCircle } from 'lucide-react';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import { useAuth } from '../../../context/AuthContext';
import { useProjet } from '../../../context/ProjetContext';
import { APIURL, ENDPOINTS } from '../../../configs/api';
import { useRouter } from 'next/navigation';
import { fetchData_table_by_projet } from '../../../configs/api-utils';
import { isAdmin, isCommercial, isSuperAdmin } from '../../../configs/enum';
import Input from '@/components/Input';
import Link from 'next/link';
import format from 'date-fns/format';
import SelectInput from '@/components/SelectInput';
import DateRangePicker from '@/components/DateRangePicker';
import axios from 'axios';
import toast from 'react-hot-toast';
import Button from '@/components/Button';
import { useSociete } from '@/context/SocieteContext';

const EtapeTable = ({ searchParams }) => {
  const { selectedProjet ,refreshProjets} = useProjet();
  const { selectedSociete } = useSociete();
  const [etapes, setEtapes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedEtape, setSelectedEtape] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem('accessToken');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusFormData, setStatusFormData] = useState({
    date_debut: '',
    date_fin: '',
    projet_id: selectedProjet?.id, //''
  });

  const router = useRouter();
  // Declare the entity object in the component scope
  const [filters, setFilters] = useState({
    date_debut: '',
    date_fin: '',
    etat: '',
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const etatOptions = [
    { value: '0', label: 'Non Commencé' },
    { value: '1', label: 'En Cours' },
    { value: '2', label: 'Terminé' },
  ];

  // Get etat label function
  const getEtatLabel = (etatValue) => {
    const option = etatOptions.find(
      (opt) => opt.value === etatValue.toString()
    );
    return option ? option.label : etatValue;
  };

  const entity = {
    API_URL: 'etapesProjet',
    dataKey: 'data',
    searchFields: [''],
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
      setEtapes,
      setTotalRows
    );
  }, [
    searchParams,
    accesstoken,
    currentPage,
    rowsPerPage,
    searchTerm,
    filters,
    selectedProjet,selectedSociete
  ]);

  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
  };

  // Format users data for table display
  const formatData = () => {
    return etapes.map((et) => ({
      id: et.id,
      description: et.description,
      date_fin: et.date_fin
        ? format(new Date(et.date_fin), 'dd/MM/yyyy')
        : null,
      date_debut: et.date_debut
        ? format(new Date(et.date_debut), 'dd/MM/yyyy')
        : null,
      date_fin_prevu: et.date_fin_prevu
        ? format(new Date(et.date_fin_prevu), 'dd/MM/yyyy')
        : null,
      date_debut_prevu: et.date_debut_prevu
        ? format(new Date(et.date_debut_prevu), 'dd/MM/yyyy')
        : null,
      etat: et.etat,
      // Include original data for status updates
      originalData: et,
    }));
  };

  const handleStatusUpdate = (etape) => {
    setSelectedEtape(etape);
    setStatusFormData({
      date_debut: '',
      date_fin: '',
    });
    setShowStatusModal(true);
  };
  const handleStatusSubmit = async () => {
    if (!selectedEtape) return;

    setStatusLoading(true);
    try {
      let newEtat;
      let updateData = {
        // projet_id: selectedProjet?.id, // Add projet_id here
      };

      const currentEtat = parseInt(selectedEtape.etat);

      if (currentEtat === 0) {
        newEtat = 1;
        if (!statusFormData.date_debut) {
          toast.error('La date de début est requise');
          setStatusLoading(false);
          return;
        }
        updateData = {
          ...updateData,
          etat: newEtat,
          date_debut: statusFormData.date_debut,
        };
      } else if (currentEtat === 1) {
        newEtat = 2;
        if (!statusFormData.date_fin) {
          toast.error('La date de fin est requise');
          setStatusLoading(false);
          return;
        }
        updateData = {
          ...updateData,
          etat: newEtat,
          date_fin: statusFormData.date_fin,
        };
      }

      const dataToSend = new FormData();
      Object.entries(updateData).forEach(([key, value]) => {
        dataToSend.append(key, value);
      });
      dataToSend.append('_method', 'PATCH');

      const response = await axios.post(
        `${APIURL.ETAPESPROJET}/${selectedEtape.id}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success('Statut mis à jour avec succès');
        setShowStatusModal(false);
        setSelectedEtape(null);

        fetchData_table_by_projet(
          entity,
          filters,
          searchTerm,
          currentPage,
          rowsPerPage,
          accesstoken,
          setLoading,
          setError,
          setEtapes,
          setTotalRows
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setStatusLoading(false);
    }
  };

  const getStatusButtonProps = (etape) => {
    console.log('Etape data:', etape); // Debug log
    console.log('Etape etat:', etape.etat, 'Type:', typeof etape.etat); // Debug log

    // Convert etat to number for comparison since API returns string
    const etatNum = parseInt(etape.etat);

    if (etatNum === 0) {
      return {
        icon: Play,
        label: 'Démarrer',
        color: 'text-green-500 hover:text-green-700',
        title: 'Marquer comme En Cours',
      };
    } else if (etatNum === 1) {
      return {
        icon: CheckCircle,
        label: 'Terminer',
        color: 'text-blue-500 hover:text-blue-700',
        title: 'Marquer comme Terminé',
      };
    }
    return null;
  };
  const columns = [
    { key: 'description', label: 'Description' },
    { key: 'date_debut_prevu', label: 'Date début prévue' },
    { key: 'date_fin_prevu', label: 'Date fin prevu' },
    { key: 'date_debut', label: 'Date début' },
    { key: 'date_fin', label: 'Date fin' },
    {
      key: 'etat',
      label: 'Etat',
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-sm font-semibold ${
            {
              0: 'bg-gray-100 text-gray-500',
              1: 'bg-blue-100 text-blue-500',
              2: 'bg-green-100 text-green-500',
            }[row.etat] || 'bg-gray-100 text-gray-500'
          }`}
        >
          {getEtatLabel(row.etat)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actiddons',
      render: (row) => {
        const statusButtonProps = getStatusButtonProps(row);

        return (
          <div className="flex gap-3 items-center">
            {(isAdmin(user.role)||isSuperAdmin(user.role))&& (
              <>
                {statusButtonProps && (
                  <button
                    className={statusButtonProps.color}
                    onClick={() => handleStatusUpdate(row.originalData)}
                    title={statusButtonProps.title}
                  >
                    {statusButtonProps.icon === Play && (
                      <Play className="w-4 h-4" />
                    )}
                    {statusButtonProps.icon === CheckCircle && (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </button>
                )}
                {row.etat == '0' && (
                  <Link
                    href={`${ENDPOINTS.ETAPESPROJET}?id=${row.id}&action=edit`}
                    className="text-blue-500 hover:text-blue-700"
                    title="Modifier"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                )}

              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => {
                  setSelectedId(row.id);
                  setShowDeleteModal(true);
                }}
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              </>
            )}     
          </div>
          
         
        );
      },
    },
  ];

  const data_to_export = () => {
    return etapes.map((et) => ({
      description: et.description,
      date_fin: et.date_fin
        ? format(new Date(et.date_fin), 'dd/MM/yyyy')
        : null,
      date_debut: et.date_debut
        ? format(new Date(et.date_debut), 'dd/MM/yyyy')
        : null,
      date_fin_prevu: et.date_fin_prevu
        ? format(new Date(et.date_fin_prevu), 'dd/MM/yyyy')
        : null,
      date_debut_prevu: et.date_debut_prevu
        ? format(new Date(et.date_debut_prevu), 'dd/MM/yyyy')
        : null,
      etat: getEtatLabel(et.etat),
    }));
  };

  const columns_export = [
    { key: 'description', label: 'Description' },
    { key: 'date_debut_prevu', label: 'Date début prévue' },
    { key: 'date_fin_prevu', label: 'Date fin prevu' },
    { key: 'date_debut', label: 'Date début' },
    { key: 'date_fin', label: 'Date fin' },
    { key: 'etat', label: 'Etat' },
  ];

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };
  const applyFilters = () => {
    setFilters(tempFilters);
  };
  const resetFilters = () => {
    const reset = {
      tranche: '',
    };
    setFilters(reset);
    setTempFilters(reset);
  };

  const StatusUpdateModal = () => {
    if (!selectedEtape) return null;

    // Convert etat to number for comparison
    const etatNum = parseInt(selectedEtape.etat);
    const isStarting = etatNum === 0;
    const isFinishing = etatNum === 1;

    return (
      <Modal
        isVisible={showStatusModal}
        onClose={() => setShowStatusModal(false)}
      >
        <div className="p-6 w-96">
          <h3 className="text-lg font-semibold mb-4">
            {isStarting ? 'Marquer comme En Cours' : 'Marquer comme Terminé'}
          </h3>

          <div className="space-y-4">
            {isStarting && (
              <div>
                <Input
                  label="Date de début:"
                  required={true}
                  type="date"
                  value={statusFormData.date_debut}
                  onChange={(e) =>
                    setStatusFormData((prev) => ({
                      ...prev,
                      date_debut: e.target.value,
                    }))
                  }
                  className="w-full"
                />
              </div>
            )}

            {isFinishing && (
              <div>
                <Input
                  label="Date de fin:"
                  required={true}
                  type="date"
                  value={statusFormData.date_fin}
                  onChange={(e) =>
                    setStatusFormData((prev) => ({
                      ...prev,
                      date_fin: e.target.value,
                    }))
                  }
                  className="w-full"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={() => setShowStatusModal(false)}
                disabled={statusLoading} // Disable cancel during submit
              >
                Annuler
              </Button>
              <Button
                type="submit"
                onClick={handleStatusSubmit}
                disabled={statusLoading}
              >
                {statusLoading ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Enregistrement...
                  </div>
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  const getCurrentEtapeTitle = () => {
    const currentEtape = etapes.find((etape) => etape.etat === '1'); // Find etape with etat "1" (En Cours)
    if (currentEtape) {
      return `Étapes du Projet - Actuellement: ${currentEtape.description}`;
    }
    return 'Étapes du Projet';
  };
  return (
    <>
      <div className="reflative bg-white rounded-lg shadow-md p-4">
        <Table
          showSearch={false}
          title={getCurrentEtapeTitle()}
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'etapes_projet_export'}
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
          onFilterToggle={handleFilterToggle}
          addLink={
            isSuperAdmin(user.role) ||
            isAdmin(user.role)
              ? `${ENDPOINTS.ETAPESPROJET}?action=add`
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
                <SelectInput
                  value={tempFilters.etat}
                  onChange={(value) => handleFilterChange('etat', value)}
                  options={Object.values(etatOptions).map((data) => ({
                    value: data.value,
                    label: data.label,
                  }))}
                  label="Choisir un Etat"
                  className="h-10 text-sm w-full"
                />
                <DateRangePicker
                  label="Choisir une Date"
                  startName="date_debut"
                  endName="date_fin"
                  startValue={tempFilters.date_debut}
                  endValue={tempFilters.date_fin}
                  onChange={handleFilterChange}
                  labeL="Choisir une Date"
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
            route={APIURL.ETAPESPROJET}
            Id={selectedId}
            type="Source"
            message={'Etes-vous sûr de vouloir supprimer cette etape ?'}
            accessToken={accesstoken}
            onClose={async () => {
              setShowDeleteModal(false);
               // Refresh project data after deletion
              if (selectedProjet?.id) {
                try {
                  await refreshProjets(selectedProjet.id);
                } catch (refreshError) {
                  console.error('Error refreshing project after deletion:', refreshError);
                }
              }
              fetchData_table_by_projet(
                entity,
                {},
                searchTerm,
                currentPage,
                rowsPerPage,
                accesstoken,
                setLoading,
                setError,
                setEtapes,
                setTotalRows
              );
            }}
          />
        </Modal>
      )}

      <StatusUpdateModal />
    </>
  );
};

export default EtapeTable;
