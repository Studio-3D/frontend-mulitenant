'use client';

import DeleteData from '@/components/DeleteData';
import Modal from '@/components/Modal';
import Table from '@/components/Table';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Pencil, Trash2, Eye, Wrench } from 'lucide-react';
import Link from 'next/link';

import { APIURL, ENDPOINTS } from '@/configs/api';
import { fetchData_table_by_projet } from '@/configs/api-utils';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext'; // Import ProjetContext
import axios from 'axios';
import toast from 'react-hot-toast';
import CommissionConfigForm from '../../administration/commissions/configuration/page';
import Button from '@/components/Button';

const CommissionTable = () => {
  const [commissions, setCommissions] = useState([]);
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
  const [filters, setFilters] = useState({ nom: '' });
  const [tempFilters, setTempFilters] = useState({ ...filters });
  const { selectedProjet, projets, fetchProjets } = useProjet(); // Get selectedProjet from context
  const [showProjetModal, setShowProjetModal] = useState(false); // State for project modal
  //
  const [openTraiter, setOpenTraiter] = useState(false);
  const [inputs, setInputs] = useState([]);
  const [checkedItemsCumul, setCheckedItemsCumul] = useState({});
  const [totalMontantSelected, setTotalMontantSelected] = useState(0);

  const [ID, setID] = useState(null);
  const [User, setUser] = useState('');
  const [montantCommissionNow, setMontantCommissionNow] = useState(0);
  const [montantCommissionNowNonEdit, setMontantCommissionNowNonEdit] =
    useState(0);
  const [totalMontantFinale, setTotalMontantFinale] = useState(0);
  const [totalCommissionCumulEtNow, setTotalCommissionCumulEtNow] = useState(0);

  const [modePaiement, setModePaiement] = useState('complet');
  const [dateTraitement, setDateTraitement] = useState('');
  const [errors, setErrors] = useState(null);
  const [disabledVar, setDisabledVar] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const accessToken = localStorage.getItem('accessToken');
  const entity = {
    API_URL: 'commissions_mensuelle_en_attente',
    dataKey: 'data',
    name: 'commissions',
    searchFields: [''],
  };

  // Check if a project is selected
  useEffect(() => {
    if (!selectedProjet && !showProjetModal) {
      fetchProjets(); // Fetch projects if not already done
      setShowProjetModal(true);
    }
  }, [selectedProjet, showProjetModal, fetchProjets]);

  // Reset state when project changes
  useEffect(() => {
    if (selectedProjet) {
      setCommissions([]);
      setCurrentPage(1);
      setError('');
    }
  }, [selectedProjet]);

  useEffect(() => {
    if (selectedProjet) {
      fetchData_table_by_projet(
        entity,
        filters,
        searchTerm,
        currentPage,
        rowsPerPage,
        accesstoken,
        setLoading,
        setError,
        setCommissions,
        setTotalRows
      );
    }
  }, [
    searchTerm,
    currentPage,
    rowsPerPage,
    accesstoken,
    filters,
    selectedProjet,
  ]); // Add selectedProjet dependency

  useEffect(() => {
      //Implementing the setInterval method
      const interval = setInterval(() => {
        if (localStorage.getItem('load_data_commission_mensuelle') == 1) {
          if (selectedProjet) {
              fetchData_table_by_projet(
                entity,
                filters,
                searchTerm,
                currentPage,
                rowsPerPage,
                accesstoken,
                setLoading,
                setError,
                setCommissions,
                setTotalRows
              );
            }
          localStorage.removeItem('load_data_commission_mensuelle');
        }
      }, 1000);
  
      //Clearing the interval
      return () => clearInterval(interval);
    }, [
       searchTerm,
    currentPage,
    rowsPerPage,
    accesstoken,
    filters,
    selectedProjet,
    ]);
  
  // Ouvre ou ferme le modal
  const toggleDialog = () => setOpenTraiter(!openTraiter);

  // Récupération des commissions cumulées pour le modal
  const fetchCumuleCommission = async (us_id, montant_now) => {
    setTotalCommissionCumulEtNow(0);
    try {
      const response = await axios.get(
        `${APIURL.ROOTV1}/cummulles_commissions/` + us_id,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = response.data;
      setInputs(data.cummules_commission || []);
      const initialChecked = {};
      (data.cummules_commission || []).forEach((item) => {
        initialChecked[item.id] = false;
      });
      setCheckedItemsCumul(initialChecked);
      const somme = (data.cummules_commission || []).reduce(
        (acc, item) => acc + item.montant,
        0
      );
      setTotalCommissionCumulEtNow(somme + montant_now);
    } catch (error) {
      console.error('Erreur fetch commissions cumulées:', error);
    }
  };

  const handleconfigClick = () => {
    setShowConfigModal(true); // ouvrir la modale d'import
  };

  // Ouvre le modal avec les infos de la ligne sélectionnée
  const handleTraiterAccuse = (id, name, montant) => {
    setID(id);
    setUser(name);
    setMontantCommissionNow(montant);
    setMontantCommissionNowNonEdit(montant);
    setTotalMontantFinale(montant);
    setTotalCommissionCumulEtNow(0);
    fetchCumuleCommission(id, montant);
    setOpenTraiter(true);
  };

  // Gestion checkbox
  const handleCheckboxChange = (id, montant) => {
    setCheckedItemsCumul((prev) => {
      const newChecked = { ...prev, [id]: !prev[id] };
      const selectedMontants = inputs.reduce(
        (acc, item) => acc + (newChecked[item.id] ? item.montant : 0),
        0
      );
      setTotalMontantSelected(selectedMontants);
      const somme = selectedMontants + montantCommissionNowNonEdit;
      setTotalMontantFinale(somme);
      if (modePaiement === 'moitie') {
        setMontantCommissionNow(somme / 2);
      } else {
        setMontantCommissionNow(somme);
      }
      return newChecked;
    });
  };

  // Changement mode paiement
  const handleChangeModePaiement = (e) => {
    setModePaiement(e.target.value);
    if (e.target.value === 'moitie') {
      setMontantCommissionNow(totalMontantFinale / 2);
    } else {
      setMontantCommissionNow(totalMontantFinale);
    }
  };

  // Soumission formulaire
  const onSubmitTraiter = async (e) => {
    e.preventDefault();
    setDisabledVar(true);
    setErrors(null);
    try {
      const formData = new FormData();
      formData.append(
        'projet_id',
       selectedProjet?.id || ''
      );
      formData.append('checkedItemsCumul', JSON.stringify(checkedItemsCumul));
      formData.append(
        'total_commission_cumul_et_now',
        totalCommissionCumulEtNow
      );
      formData.append('montant', montantCommissionNow);
      formData.append('mode_paiement', modePaiement);
      formData.append('date_traitement', dateTraitement);

      const res = await axios.post(
        `${APIURL.ROOTV1}/traiter_commission/${ID}`,
        formData,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (res.status === 200) {
        toast.success('Commission traitée avec succès');
        setOpenTraiter(false);
        fetchData_table_by_projet(
        entity,
        {},
        searchTerm,
        currentPage,
        rowsPerPage,
        accesstoken,
        setLoading,
        setError,
        setCommissions,
        setTotalRows
      );
      } else if (res.status === 422) {
        setErrors(
          res.data.response?.data?.errors || { form: ['Erreur de validation'] }
        );
      }
    } catch (error) {
      setErrors({ form: ['Erreur lors de la soumission'] });
      console.error(error);
    } finally {
      setDisabledVar(false);
    }
  };

  // Colonnes du tableau
  const columns = [
    {
      key: 'responsable',
      label: 'Responsable',
      render: (row) => (
        <Link
          target="_blank"
          href={`/utilisateurs/afficher-utilisateur/${row.id}`}
        >
          <strong>{row.name + ' ' + row.prenom}</strong>
        </Link>
      ),
    },
    {
      key: 'nb_vente',
      label: 'Nombre de Vente',
      render: (row) => <span style={{ color: 'blue' }}>{row.nb_vente}</span>,
    },
    {
      key: 'commission',
      label: 'Commission Montant',
      render: (row) => (
        <span style={{ color: 'green' }}>
          {row.commission.toLocaleString()} DH
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          className="text-red-500 hover:text-red-700"
          title="Traiter"
          onClick={() =>
            handleTraiterAccuse(
              row.id,
              `${row.name} ${row.prenom}`,
              row.commission
            )
          }
        >
          <Wrench className="w-5 h-5" />
        </button>
      ),
    },
  ];

  const formatData = () => {
    return commissions.map((com) => ({
      id: com.id,
      name: com.name, // ou 'nom' selon ton API
      prenom: com.prenom,
      nb_vente: com.nb_vente,
      commission: com.commission,
      prestataires: com?.prestataires,
    }));
  };

  const data_to_export = () => {
    return commissions.map((cm) => ({
      nomComplet: `${cm.name} ${cm.prenom}`,
      nb_vente: cm.nb_vente,
      commission: `${cm.commission.toLocaleString()} DH`,
    }));
  };

  const columns_export = [
    { key: 'nomComplet', label: 'Responsable' },
    { key: 'nb_vente', label: 'Nombre de Vente' },
    { key: 'commission', label: 'Commission Montant' },
  ];
  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters); // C'est ici que fetchUsers va être déclenché
  };
  const resetFilters = () => {
    const reset = {
      nom: '',
    };
    setFilters(reset);
    setTempFilters(reset);
  };

  const selectedCommission = commissions.find(
    (commission) => commission.id === selectedId
  );

  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
  };

  return (
    <>
      <div className="reflative bg-white rounded-lg shadow-md p-4">
        {/* Modal de traitement commission */}
        {openTraiter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
              <div className="w-full h-[60px] bg-[#009FFF] px-4 mb-5">
                <div className="flex items-center justify-center h-full">
                  <h1 className="text-3xl font-bold text-center text-white">
                    Traiter une Commission
                  </h1>
                </div>
              </div>

              <form onSubmit={onSubmitTraiter} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1">
                    Commercial :
                  </label>
                  <input
                    type="text"
                    value={User}
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                  />
                </div>
                {inputs.length > 0 && (
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded p-2">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-blue-600 text-white">
                        <tr>
                          <th className="px-2 py-1">Montant Cumulé</th>
                          <th className="px-2 py-1">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inputs.map((item, idx) => (
                          <tr
                            key={`${item.id}_${idx}`}
                            className="border-b border-gray-200"
                          >
                            <td className="px-2 py-1">{item.montant}</td>
                            <td className="px-2 py-1">
                              <input
                                type="checkbox"
                                checked={checkedItemsCumul[item.id] || false}
                                onChange={() =>
                                  handleCheckboxChange(item.id, item.montant)
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div>
                  <label className="block font-semibold mb-1">Montant :</label>
                  <input
                    type="text"
                    value={montantCommissionNow}
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">
                    Mode Remboursement <span className="text-red-500 ml-1">*</span>:
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="mode_paiement"
                        value="moitie"
                        checked={modePaiement === 'moitie'}
                        onChange={handleChangeModePaiement}
                        required
                        className="cursor-pointer"
                      />
                      <span>Moitié</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="mode_paiement"
                        value="complet"
                        checked={modePaiement === 'complet'}
                        onChange={handleChangeModePaiement}
                        required
                        className="cursor-pointer"
                      />
                      <span>Complet</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">
                    Date Traitement <span className="text-red-500 ml-1">*</span> :
                  </label>
                  <input
                    type="date"
                    value={dateTraitement}
                    onChange={(e) => setDateTraitement(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                {errors && (
                  <div className="bg-red-100 text-red-700 p-2 rounded">
                    {Object.keys(errors).map((key) =>
                      errors[key].map((msg, idx) => (
                        <p key={`${key}-${idx}`}>{msg}</p>
                      ))
                    )}
                  </div>
                )}
                <div className="flex justify-end gap-2 mt-[10%]">
                  <Button type="button" onClick={() => setOpenTraiter(false)}>
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={disabledVar}
                    loading={disabledVar}
                  >
                    Enregistrer
                  </Button>
                </div>
                
              </form>
            </div>
          </div>
        )}
        {/* Table des commissions */}
        <Table
          title={'Commissions Mensuelles en Attente'}
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'commission_export'}
          columns={columns}
          data={formatData()}
          onFilterToggle={handleFilterToggle}
          /*filterComponent={
            <div className="space-y-4 rounded-lg">
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
              >
                <Input
                  type="text"
                  label="Nom"                 value={tempFilters.nom}
                  onChange={(e) => handleFilterChange("nom", e.target.value)}
                  className="h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
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
          }*/
          totalRows={totalRows}
          loading={loading}
          error={error}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          onSearchChange={setSearchTerm}
          enableExport={true}
          showSearch={false}
          enableConfig
          onConfigClick={handleconfigClick}
        />
        {showConfigModal && (
          <Modal isVisible={true} onClose={() => setShowConfigModal(false)}maxWidth="max-w-4xl" // Largeur plus grande pour le formulaire
>
            <CommissionConfigForm
              onClose={() => setShowConfigModal(false)}
              onSuccess={() => setShowConfigModal(false)} // juste fermer le modal

            />
          </Modal>
        )}
      </div>
    </>
  );
};

export default CommissionTable;
