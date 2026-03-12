'use client';

import DeleteData from '@/components/DeleteData';
import Modal from '@/components/Modal';
import Table from '@/components/Table';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Pencil, Trash2, Eye } from 'lucide-react';
import axios from 'axios';
import { APIURL, ENDPOINTS } from '@/configs/api';
import { fetchData_table_by_projet } from '@/configs/api-utils';
import { isAdmin, isSav, isSuperAdmin } from '@/configs/enum';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/Input';
import InputSelect from '@/components/inputSelect';

import { useProjet } from '@/context/ProjetContext'; // Import ProjetContext
import ProjetDialog from '@/components/ProjetDialog'; // Import ProjetDialog
import Select from 'react-select';
import { useSociete } from '@/context/SocieteContext';

const PrestataireTable = (serviceId) => {
   const { selectedSociete } = useSociete();
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [services, setServices] = useState([]);
  const accessToken = localStorage.getItem('accessToken');
  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem('accessToken');
  const router = useRouter();
  const [filters, setFilters] = useState({
    nom: '',
    prenom: '',
    cin: '',
    email: '',
    telephone: '',
    serviceId: serviceId?.service?.id == null ? '' : serviceId?.service?.id,
  });

  const [tempFilters, setTempFilters] = useState({ ...filters });
  const { selectedProjet, projets, fetchProjets } = useProjet();
  const [showProjetModal, setShowProjetModal] = useState(false);

  const entity = {
    API_URL: 'Prestataires',
    dataKey: 'data',
    name: 'Prestataire',
    searchFields: ['nom'],
  };

  useEffect(() => {
    if (!selectedProjet && !showProjetModal && !serviceId) {
      fetchProjets(); // Fetch projects if not already done
      setShowProjetModal(true);
    }
  }, [selectedProjet, showProjetModal, fetchProjets, serviceId]);

  const fetchServices = async () => {
    if (!selectedProjet) return;

    try {
      const response = await axios.get(
        `${APIURL.ROOT}/v1/projets/${selectedProjet.id}/ServicesPrestataires/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const { data } = response;
      setServices(data.services);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (selectedProjet) {
      fetchServices();
    }
  }, [selectedProjet]);

  function handleShow(Id) {
    router.push(`/sav/prestataires/show/${Id}`);
  }

  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters();
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
      setPrestataires,
      setTotalRows
    );
  }, [searchTerm, currentPage, rowsPerPage, accesstoken, filters,selectedSociete]);

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
      email: '',
      telephone: '',
      serviceId: serviceId?.service?.id == null ? '' : serviceId?.service?.id,
    };
    setFilters(reset);
    setTempFilters(reset);
  };

  const handleEdit = (id) =>
    router.push(`${ENDPOINTS.Prestataires}?id=${id}&action=edit`);

  const allColumns = [
    { key: 'cin', label: 'CIN' },
    { key: 'nom', label: 'Nom' },
    { key: 'prenom', label: 'Prénom' },
    { key: 'email', label: 'Email' },
    {
      key: 'service',
      label: 'Service',
      render: (row) => {
        return row.service.nom;
      },
    },
    { key: 'telephone', label: 'Téléphone' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3 items-center">
          <button
            className="text-teal-500 hover:text-teal-700"
            onClick={() => handleShow(row.id)}
            title="Voir"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => handleEdit(row.id)}
            title="Modifier"
          >
            <Pencil className="w-4 h-4" />
          </button>
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
        </div>
      ),
    },
  ];

  const columns = !serviceId?.service?.id
    ? allColumns
    : allColumns.filter((col) => col.key !== 'service');

  const formatData = () => {
    return prestataires.map((pre) => ({
      id: pre.id,
      cin: pre.cin,
      nom: pre.nom,
      prenom: pre.prenom,
      email: pre.email,
      service: pre.service || '',
      telephone: pre.telephone,
      reclamations: pre.reclamations || [],
    }));
  };

  const data_to_export = () => {
    return prestataires?.map((pre) => ({
      CIN: pre.cin,
      Nom: pre.nom,
      Prénom: pre.prenom,
      Email: pre.email,
      Service: pre.service?.nom || '',
      Téléphone: pre.telephone,
      Adresse: pre.adresse,
    }));
  };

  const selectedPrestataire = prestataires.find(
    (prestataire) => prestataire.id === selectedId
  );

  const columns_export = [
    { key: 'CIN', label: 'CIN' },
    { key: 'Nom', label: 'Nom' },
    { key: 'Prénom', label: 'Prénom' },
    { key: 'Email', label: 'Email' },
    { key: 'Service', label: 'Service' },
    { key: 'Téléphone', label: 'Téléphone' },
  ];

   // Simple cache et comparaison for return back en cas de changer projet
  const [oldProjetId, setOldProjetId] = useState(null);

  useEffect(() => {
    if (selectedProjet?.id && selectedProjet.id !== oldProjetId) {
      if (oldProjetId) {
        // Projet a changé

        console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet.id}`);
        router.push('/sav/services');
      }
      setOldProjetId(selectedProjet.id);
    }
  }, [selectedProjet?.id, oldProjetId, router]);

  const handleProjectSelected = () => {
    setShowProjetModal(false);
    setCurrentPage(1);

    if (selectedProjet) {
      fetchServices();
      fetchData_table_by_projet(
        entity,
        filters,
        searchTerm,
        1,
        rowsPerPage,
        accesstoken,
        setLoading,
        setError,
        setPrestataires,
        setTotalRows
      );
    }
  };

  return (
    <div className="relative bg-white shadow-md rounded-lg px-4 py-4">
      {/* Project Selection Modal */}
      {!serviceId && (
        <ProjetDialog
          open={showProjetModal}
          onClose={() => setShowProjetModal(false)}
          projets={projets}
          onSelect={handleProjectSelected}
        />
      )}
      <Table
        showSearch={false}
        title={
          serviceId?.service?.nom
            ? `Prestataires liées à ${serviceId?.service?.nom}`
            : 'Prestataires'
        }
        data_to_export={data_to_export()}
        columns_export={columns_export}
        name_file_export={'prestataire_export'}
        columns={columns}
        onFilterToggle={handleFilterToggle}
        data={formatData()}
        filterComponent={
          <div className="space-y-4 p-4 rounded-lg ">
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              }}
            >
              <Input
                label={'Nom'}
                type="text"
                placeholder="Nom..."
                value={tempFilters.nom}
                onChange={(e) => handleFilterChange('nom', e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
              <Input
                label={'Prénom'}
                type="text"
                placeholder="Prénom..."
                value={tempFilters.prenom}
                onChange={(e) => handleFilterChange('prenom', e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
              <Input
                label={'CIN'}
                type="text"
                placeholder="Cin..."
                value={tempFilters.cin}
                onChange={(e) => handleFilterChange('cin', e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />

              <Input
                label={'Email'}
                type="text"
                placeholder="Email..."
                value={tempFilters.email}
                onChange={(e) => handleFilterChange('email', e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />

              <Input
                label={'Téléphone'}
                type="text"
                placeholder="Téléphone..."
                value={tempFilters.telephone}
                onChange={(e) =>
                  handleFilterChange('telephone', e.target.value)
                }
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />

              {!serviceId?.service?.id && (
                <div className="mb-3">
                  <label className="block !text-gray-700 text-sm font-bold mb-1">
                    Service
                  </label>
                  <Select
                    isClearable
                    value={
                      services
                        .map((service) => ({
                          value: service.id,
                          label: service.nom,
                          id: service.id,
                        }))
                        .find(
                          (option) => option.value === tempFilters.serviceId
                        ) || null
                    }
                    onChange={(selected) =>
                      handleFilterChange('serviceId', selected?.value || null)
                    }
                    options={services.map((service) => ({
                      value: service.id,
                      label: service.nom,
                      id: service.id,
                    }))}
                    isLoading={loading}
                    placeholder="Choisir un service..."
                    className="text-sm"
                  />
                </div>
              )}
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
          (isSuperAdmin(user.role) || isAdmin(user.role)|| isSav(user.role)) && selectedProjet
            ? `${ENDPOINTS.Prestataires}?action=add`
            : undefined
        }
      />
      {showDeleteModal && selectedId && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.Prestataires}
            Id={selectedId}
            type="Prestataire"
            message={
              selectedPrestataire &&
              selectedPrestataire.reclamations &&
              selectedPrestataire.reclamations.length > 0
                ? `Attention : la suppression de ce prestataire entraînera également la suppression de tous les réclamations associés. Êtes-vous sûr de vouloir le supprimer ?`
                : `Êtes-vous sûr de vouloir supprimer ce prestataire ?`
            }
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
                setPrestataires,
                setTotalRows
              );
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default PrestataireTable;
