'use client';

import DeleteData from '@/components/DeleteData';
import Modal from '@/components/Modal';
import Table from '@/components/Table';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';

import { useAuth } from '@/context/AuthContext';

import { Eye, Pencil, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { isAdmin, isSuperAdmin, isCommercial, isRespoCommercial, isAgentAdministratif } from '@/configs/enum';

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
  const [backendErrors, setBackendErrors] = useState({});

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
        },
      })
      .then((response) => {
        const { compositionBiens, pagination } = response.data;

        const itemsPerPage = pagination.perPage || 10;

        const updatedBiens = compositionBiens.map((item, idx) => ({
          ...item,
          classement: pageNumber * itemsPerPage + idx + 1,
        }));

        setCompositionBien(updatedBiens);
        setTotalRows(pagination.total);
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
    if (!isOpen) resetFilters();
  };

  useEffect(() => {
    fetchCompositionBiensFromApi(0);
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
      setSelectedRow({ ...row });
      setShowEditModal(true);
    }
  };

  const onUpdate = async (data) => {
    setLoading(true);
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([key]) => key.startsWith('nbre'))
    );

    const allZero = Object.values(filteredData).every((value) => {
      const num = Number(value);
      return num === 0 || value === '' || value === null;
    });

    if (allZero) {
      toast.error('Toutes les données commençant par "nbre" sont égales à 0 ou vides');
      setLoading(false);
      return;
    }

    filteredData.bien_id = bien ? bien : selectedBien;

    try {
      const url = `${APIURL.COMPOSITIONBIENS}/${selectedRow.id}`;
      const method = 'put';

      const response = await axios({
        method,
        url,
        data: filteredData,
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
      setLoading(false);
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
    { key: 'nbre_chambres', label: 'Chambres' },
    { key: 'nbre_salons', label: 'Salons' },
    { key: 'nbre_sejour', label: 'Séjours' },
    { key: 'nbre_kitchenette', label: 'Kitchenettes' },
    { key: 'nbre_sdb', label: 'Salles de bain' },
    { key: 'nbre_balcons', label: 'Balcons' },
    { key: 'nbre_terasses', label: 'Terrasses' },
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
          {(isAdmin(user?.role) || isAgentAdministratif(user?.role)) && (
            <>
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
            </>
          )}
        </div>
      ),
    },
  ];

  // Mapping des noms de pièces pour l'affichage
  const roomNames = {
    chambres: 'Chambres',
    salons: 'Salons',
    sejour: 'Séjours',
    kitchenette: 'Kitchenettes',
    sdb: 'Salles de bain',
    balcons: 'Balcons',
    terrasses: 'Terrasses',
    buanderies: 'Buanderies',
    placards: 'Placards',
    halls: 'Halls',
    receptions: 'Réceptions',
    cuisines: 'Cuisines',
  };

  return (
    <div>
      <Table
        columns={columns}
        onFilterToggle={handleFilterToggle}
        data={compositionBiens}
        addLink={isAdmin(user?.role) && `/biens/${bien}/ajouter-composition`}
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

      {/* Modal Suppression */}
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
              fetchCompositionBiensFromApi(0);
            }}
          />
        </Modal>
      )}

      {/* Modal Détails (responsive) */}
      {showModal && selectedRow && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg md:max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Détails de la composition
              </h2>
              <button
                onClick={handleClose}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(selectedRow)
                  .filter(([key]) => key.startsWith('nbre_') && selectedRow[key] > 0)
                  .map(([key, value]) => {
                    const roomType = key.replace('nbre_', '');
                    const displayName = roomNames[roomType] || roomType.replace('_', ' ');
                    
                    return (
                      <div key={key} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600 capitalize">
                          {displayName}:
                        </span>
                        <span className="text-lg font-semibold text-blue-600">
                          {value}
                        </span>
                      </div>
                    );
                  })}
              </div>
              
              {/* Message si aucune donnée */}
              {Object.entries(selectedRow).filter(([key]) => key.startsWith('nbre_') && selectedRow[key] > 0).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucune information de composition disponible
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Édition (responsive) */}
      {showEditModal && selectedRow && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg md:max-w-2xl lg:max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Modifier la composition
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              onUpdate(selectedRow);
            }}>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(selectedRow)
                    .filter(([key]) => key.startsWith('nbre_'))
                    .map(([key, value]) => {
                      const roomType = key.replace('nbre_', '');
                      const displayName = roomNames[roomType] || roomType.replace('_', ' ');
                      const inputValue = (value !== null && value !== undefined && !isNaN(value)) ? value : '';
                      const hasError = backendErrors[key]?.[0];

                      return (
                        <div key={key} className="flex flex-col">
                          <label
                            htmlFor={key}
                            className="text-sm font-medium text-gray-700 mb-1 capitalize"
                          >
                            {displayName}
                          </label>
                          <input
                            type="number"
                            name={key}
                            id={key}
                            min="0"
                            value={inputValue}
                            onChange={(e) =>
                              setSelectedRow((prev) => ({
                                ...prev,
                                [key]: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                              }))
                            }
                            className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              hasError ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {hasError && (
                            <p className="text-red-500 text-xs mt-1">{hasError}</p>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Animation CSS */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}