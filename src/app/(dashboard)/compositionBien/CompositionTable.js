'use client';

import DeleteData from '@/components/DeleteData';
import Modal from '@/components/Modal';
import Table from '@/components/Table';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';

import { useAuth } from '@/context/AuthContext';

import { Eye, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Composition({ bien, reloadTrigger }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [compositionBiens, setCompositionBien] = useState([]);
  const accessToken = localStorage.getItem('accessToken');
  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem('accessToken');
  const router = useRouter();
  const selectedBien = localStorage.getItem('selectedBien');
  const [showEditModal, setShowEditModal] = useState(false);

  const [filters, setFilters] = useState({
    nbre_balcons: '',
    nbre_buanderies: '',
    nbre_chambres: '',
    nbre_cuisines: '',
    nbre_salons: '',
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const fetchCompositionBiensFromApi = (pageNumber) => {
    setLoading(true);
    const selectedBienId = bien ? bien : selectedBien;
    axios
      .get(APIURL.COMPOSITIONBIENS, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          page: pageNumber + 1,
          currentPage,
          bien_id: selectedBienId,
          ...filters,
        }, // Increment page number by 1 for API
      })
      .then((response) => {
        const { compositionBiens, pagination } = response.data;

        const itemsPerPage = pagination.perPage || 10; // ou pagination.pageSize

        const updatedBiens = compositionBiens.map((item, idx) => ({
          ...item,
          classement: pageNumber * itemsPerPage + idx + 1, // index global
        }));

        setCompositionBien(updatedBiens);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const [selectedRow, setSelectedRow] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleShow = (id) => {
    const row = compositionBiens.find((item) => item.id === id);
    setSelectedRow(row);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedRow(null);
  };

  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
  };

  useEffect(() => {
    fetchCompositionBiensFromApi(0); // Fetch initial data for the first page
  }, [
    searchTerm,
    currentPage,
    rowsPerPage,
    accesstoken,
    filters,
    reloadTrigger,
  ]);

  const handleEdit = (id) => {
    const row = compositionBiens.find((item) => item.id === id);
    if (row) {
      setSelectedRow({ ...row }); // copier les données
      setShowEditModal(true);
    }
  };

  const onUpdate = async (data) => {
    setLoading({ ...loading, form: true });
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([key]) => key.startsWith('nbre'))
    );

    const allZero = Object.values(filteredData).every((value) => {
      const num = Number(value);
      return num === 0 || value === '' || value === null;
    });

    if (allZero) {
      toast.error(
        'Toutes les données commençant par "nbre" sont égales à 0 ou vides'
      );
      setLoading({ ...loading, form: false });
      return;
    }

    filteredData.bien_id = bien ? bien : selectedBien;

    try {
      const url = `${APIURL.COMPOSITIONBIENS}/${selectedRow.id}`;
      const method = 'put';

      const response = await axios({
        method,
        url,
        data: filteredData, // 👉 JSON object, not FormData
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 200) {
        toast.success('Composition modifiée avec succès');
        setShowEditModal(false);
        fetchCompositionBiensFromApi(0);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      const response = error.response;

      if (response?.status === 422) {
        setBackendErrors(response.data.errors);
        Object.values(response.data.errors).forEach((messages) => {
          messages.forEach((msg) => toast.error(msg));
        });
        setTimeout(() => setBackendErrors({}), 5000);
      } else {
        toast.error("Une erreur s'est produite lors de la mise à jour.");
      }
    } finally {
      setLoading({ ...loading, form: false });
    }
  };

  const columns = [
    {
      key: 'classement',
      label: '#',
      render: (row) => (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700">
          {row.classement}
        </div>
      ),
    },
    { key: 'nbre_chambres', label: 'Nbre chambres' },
    { key: 'nbre_salons', label: 'Nbre salons' },

    { key: 'nbre_sdb', label: 'Nbre Salle de Bains' },
    { key: 'nbre_balcons', label: 'Nbre balcons' },
    { key: 'nbre_terasses', label: 'Nbre terasses' },
    {
      key: 'actions',
      label: 'Actions',
      render: (
        row // ✅ correction ici
      ) => (
        <div className="flex gap-3 items-center">
          <button
            className="text-teal-500 hover:text-teal-700"
            onClick={() => handleShow(row.id)} // ✅ Ouvre la popup
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

  const formatData = compositionBiens.map((c, index) => ({
    ...c,
    index, // pour le render du numéro
  }));

  return (
    <div>
      {/* Project Selection Modal */}

      <Table
        columns={columns}
        onFilterToggle={handleFilterToggle}
        data={compositionBiens}
        addLink={`/biens/${bien}/ajouter-composition`}
        totalRows={totalRows}
        loading={loading}
        error={error}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        showSearch={false}
      />
      {showDeleteModal && selectedId && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.COMPOSITIONBIENS}
            Id={selectedId}
            type="composition"
            message={`Êtes-vous sûr de vouloir supprimer cette composition ?`}
            accessToken={accesstoken}
            onClose={() => {
              setShowDeleteModal(false);
              fetchCompositionBiensFromApi(0); // Recharger les données après suppression
            }}
          />
        </Modal>
      )}
      {showModal && selectedRow && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-xl p-6 rounded-lg shadow-xl">
            <div className="w-full h-[60px] bg-blue-600 px-4 mb-5">
              <div className="flex items-center justify-center h-full">
                <h1 className="text-3xl font-bold text-center text-white">
                  Détails des pièces
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(selectedRow)
                .filter(([key]) => key.startsWith('nbre_'))
                .map(([key, value]) => {
                  // Extract the part after 'nbre_'
                  const roomType = key.replace('nbre_', '');

                  // Create a mapping for special cases
                  const roomNames = {
                    sdb: 'salon de bain',
                    // Add other mappings if needed
                    // 'wc': 'toilettes',
                    // 'autres': 'autres pièces'
                  };

                  // Get the display name, fallback to replacing underscores with spaces
                  const displayName =
                    roomNames[roomType] || roomType.replace('_', ' ');

                  return (
                    <div key={key} className="flex flex-col">
                      <span className="text-sm text-gray-500 capitalize">
                        {displayName}
                      </span>
                      <span className="text-base font-medium text-gray-900">
                        {value}
                      </span>
                    </div>
                  );
                })}
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && selectedRow && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-xl p-6 rounded-lg shadow-xl">
            <div className="w-full h-[60px] bg-blue-600 px-4 mb-5">
              <div className="flex items-center justify-center h-full">
                <h1 className="text-3xl font-bold text-center text-white">
                  Modifier les piéces
                </h1>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdate(selectedRow); // 🔁 utilise onUpdate ici
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(selectedRow)
                  .filter(([key]) => key.startsWith('nbre_'))
                  .map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <label
                        htmlFor={key}
                        className="text-sm text-gray-600 capitalize mb-1"
                      >
                        {key.replace('nbre_', '').replace('_', ' ')}
                      </label>
                      <input
                        type="number"
                        name={key}
                        id={key}
                        value={selectedRow[key]}
                        onChange={(e) =>
                          setSelectedRow((prev) => ({
                            ...prev,
                            [key]: parseInt(e.target.value, 10),
                          }))
                        }
                        className="border rounded px-3 py-2 text-sm"
                      />
                    </div>
                  ))}
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
