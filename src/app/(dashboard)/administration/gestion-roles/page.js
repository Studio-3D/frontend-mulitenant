'use client';

import { useState, useEffect } from 'react';
import { APIURL, ENDPOINTS } from '@/configs/api';
import axios from 'axios';
import toast from 'react-hot-toast';
import BreadCrumb from '../../navigation/BreadCrumb';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';
import LoadingSpin from '@/components/LoadingSpin';
import SelectInput from '@/components/SelectInput';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import {
  CheckCircle,
  XCircle,
  Building,
  FileText,
  Calculator,
  Wrench,
  Truck,
  CirclePlus,
  Trash2,
  RefreshCw,
  Archive,
  Users, // Pour RESPO_COMMERCIAL
  Clipboard, // Pour AGENT_ADMINISTRATIF
} from 'lucide-react';
import { isAdmin, isAgentAdministratif, isSuperAdmin } from '../../../../configs/enum';
import { useAuth } from '../../../../context/AuthContext';
import { useSociete } from '@/context/SocieteContext';
import { useProjet } from '@/context/ProjetContext';

const GestionRoles = () => {
  const { selectedSociete } = useSociete();
  const { selectedProjet,refreshProjets  } = useProjet();
  const { token, user } = useAuth();
  const accesstoken = token || localStorage.getItem('accessToken');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [newRoleForm, setNewRoleForm] = useState({
    role: '',
    actif: true,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const userRole = user?.role;
  const router = useRouter();

  // Vérifier les permissions
  useEffect(() => {
    if (!isAdmin(userRole) && !isSuperAdmin(userRole)&& !isAgentAdministratif(userRole)) {
      router.push('/');
    }
  }, [userRole, router]);

  // Icônes pour chaque type de rôle (lucide-react)
  const roleIcons = {
    2: Building,
    3: Building, // COMMERCIAL
    5: FileText, // NOTAIRE
    6: Truck, // RESPO_LIVRAISON
    7: Calculator, // COMPTABLE
    8: Wrench, // SAV
    9: Users, // RESPO_COMMERCIAL
    10: Clipboard, // AGENT_ADMINISTRATIF
  };

  // Couleurs pour chaque rôle
  const roleColors = {
    2: 'black',
    3: 'blue',
    5: 'orange',
    6: 'green',
    7: 'red',
    8: 'yellow',
    9: 'indigo', // RESPO_COMMERCIAL
    10: 'slate', // AGENT_ADMINISTRATIF
  };

  // Labels pour chaque rôle
  const roleLabels = {
    2: 'Administrateur',
    3: 'Commercial',
    5: 'Notaire',
    6: 'Responsable Livraison',
    7: 'Comptable',
    8: 'SAV',
    9: 'Responsable Commercial',
    10: 'Agent Saisie',
  };

  // Descriptions pour chaque rôle
  const roleDescriptions = {
    2: 'Service Administratif',
    3: 'Service Commercial (Visite & Ventes)',
    5: 'Service Notarial',
    6: 'Service Livraison',
    7: 'Service Comptable',
    8: 'Service Après-Vente (SAV)',
    9: 'Service Commercial (Responsable)',
    10: 'Service Administratif',
  };

  // Couleurs de fond pour Tailwind
  const roleBgColors = {
    'blue': 'bg-blue-100',
    'orange': 'bg-orange-100',
    'green': 'bg-green-100',
    'red': 'bg-red-100',
    'yellow': 'bg-yellow-100',
    'indigo': 'bg-indigo-100',
    'slate': 'bg-slate-100',
  };

  // Couleurs de texte pour Tailwind
  const roleTextColors = {
    'blue': 'text-blue-600',
    'orange': 'text-orange-600',
    'green': 'text-green-600',
    'red': 'text-red-600',
    'yellow': 'text-yellow-600',
    'indigo': 'text-indigo-600',
    'slate': 'text-slate-600',
  };

      const [oldProjetId, setOldProjetId] = useState(null);
      const [oldSocieteId, setOldSocieteId] = useState(null);
    useEffect(() => {
    if ((selectedProjet?.id && selectedProjet?.id !== oldProjetId)||(selectedSociete?.id && selectedSociete?.id !== oldSocieteId)) {
      if (oldProjetId||oldSocieteId) {
        // Projet ou société a changé
        //  console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet,.id}`);
        router.push('/');
      }
      setOldSocieteId(selectedSociete?.id)
      setOldProjetId(selectedProjet?.id);
    }
  }, [selectedProjet?.id, selectedSociete?.id, oldProjetId, oldSocieteId, router]);
  useEffect(() => {
    fetchRoles();
  }, [selectedProjet,selectedSociete]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(APIURL.GESTION_ROLES, {
        headers: { Authorization: `Bearer ${accesstoken}` },
      });

      if (response.data?.success) {
        setRoles(response.data.roles || []);
        setAvailableRoles(response.data.available_roles || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Erreur lors du chargement des rôles');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async (e) => {
    e.preventDefault();

    if (!newRoleForm.role) {
      toast.error('Veuillez sélectionner un rôle');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(APIURL.GESTION_ROLES, newRoleForm, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accesstoken}`,
        },
      });

      if (response.data?.success) {
        toast.success('Rôle ajouté avec succès');
        setShowAddForm(false);
        setNewRoleForm({ role: '', actif: true });
         // Refresh the project data to include the new/updated typologie
      if (selectedProjet?.id) {
        try {
          await refreshProjets(selectedProjet.id);
        } catch (refreshError) {
          console.error('Error refreshing project data:', refreshError);
          // Don't block navigation even if refresh fails
        }
      }
        fetchRoles();
      }
    } catch (error) {
      console.error('Error adding role:', error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Erreur lors de l'ajout du rôle");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = (roleId, roleValue) => {
    if (roleValue == 3 || roleValue == 2) {
    toast.error('Les rôles Commercial et Administrateur ne peuvent pas être supprimés');
    return;
    }
    setSelectedId(roleId);
    setShowDeleteModal(true);
  };

  // Filtrer les rôles disponibles pour l'ajout
  const getAvailableOptions = () => {
    if (availableRoles.length > 0 && 'exists' in availableRoles[0]) {
      return availableRoles
        .filter((role) => !role.exists)
        .map((role) => ({
          value: role.value.toString(),
          label: `${role.label === 'RESPO_LIVRAISON' ? 'Responsable Livraison' : role.label === 'RESPO_COMMERCIAL' ? 'Responsable Commercial' : role.label === 'AGENT_ADMINISTRATIF' ? 'Agent de saisie' : role.label} - ${role.description}`,
        }));
    }
    
    const existingRoleValues = roles.map(r => r.role);
    return [
      { value: 5, label: 'Notaire - Service Notarial' },
      { value: 6, label: 'Responsable Livraison - Service Livraison' },
      { value: 7, label: 'Comptable - Service Comptable' },
      { value: 8, label: 'SAV - Service Après-Vente (SAV)' },
      { value: 9, label: 'Responsable Commercial - Service Commercial (Responsable)' },
      {/* value: 10, label: 'Agent de saisie - Service Administratif'*/ },
    ].filter(option => !existingRoleValues.includes(Number(option.value)))
     .map(option => ({ value: option.value, label: option.label }));
  };

  const handleDeleteSuccess = () => {
    fetchRoles();
    setShowDeleteModal(false);
    setSelectedId(null);
  };

  if (loading) {
    return <LoadingSpin />;
  }

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-6">
        <BreadCrumb baseUrl="/tableau-de-bord" step="Gestion des rôles" />
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Gestion des rôles système
        </h1>
        <p className="text-gray-600">
          Activez ou désactivez les rôles disponibles dans l{"'"}application
        </p>
      </div>

      {/* Bouton d'ajout */}
      {getAvailableOptions().length > 0 && (
        <div className="mb-6">
          <Button
            type="submit"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2"
          >
            <CirclePlus className="h-5 w-5" />
            Ajouter un rôle
          </Button>
        </div>
      )}

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">
            Ajouter un nouveau rôle
          </h3>
          <form onSubmit={handleAddRole}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <SelectInput
                  placeholder="Sélectionner un type de rôle"
                  label="Type de rôle :"
                  name="role"
                  value={newRoleForm.role}
                  required={true}
                  options={getAvailableOptions()}
                  onChange={(value) =>
                    setNewRoleForm({ ...newRoleForm, role: value })
                  }
                />
                
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setNewRoleForm({ role: '', actif: true });
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                loading={submitting}
              >
                {submitting ? 'Ajout en cours...' : 'Ajouter le rôle'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des rôles actifs */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="divide-y">
          {roles.map((role) => {
            const roleNumber = Number(role.role);
            const IconComponent = roleIcons[roleNumber];
            const color = roleColors[roleNumber];
            const label = roleLabels[roleNumber];
            const description = roleDescriptions[roleNumber] || 'Description non disponible';
            const bgColor = roleBgColors[color] || 'bg-gray-100';
            const textColor = roleTextColors[color] || 'text-gray-600';

            return (
              <div key={role.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${bgColor}`}>
                      {IconComponent ? (
                        <IconComponent className={`h-6 w-6 ${textColor}`} />
                      ) : (
                        <Building className={`h-6 w-6 ${textColor}`} />
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {label}
                      </h3>
                      <p className="text-sm text-gray-600">{description}</p>
                      <div className="mt-1 flex items-center space-x-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          Créé le: {new Date(role.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Bouton supprimer - À DROITE */}
                    <button
                      onClick={() => handleDeleteRole(role.id, role.role)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Supprimer"
                      disabled={roleNumber === 2}/*|| roleNumber === 3*/
                    >
                      <Trash2
                        className={`h-5 w-5 ${roleNumber === 2 ? 'opacity-50 cursor-not-allowed' : ''}`}/*|| roleNumber === 3*/
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {roles.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun rôle configuré
            </h3>
            <p className="text-gray-500 mb-6">
              Commencez par ajouter des rôles à votre système
            </p>
            <Button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <CirclePlus className="h-5 w-5" />
              Ajouter un rôle
            </Button>
          </div>
        )}
      </div>

      {/* Information */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-1">
          Information importante
        </h3>
        <p className="text-blue-700 text-sm">
          • Le rôle Commercial est essentiel et ne peut être désactivé
          ou supprimé
          <br />
          • Seuls les rôles non encore ajoutés apparaissent dans la liste de sélection
        </p>
      </div>

      {/* Modal de suppression */}
      {showDeleteModal && selectedId && (
        <Modal
          isVisible={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedId(null);
          }}
        >
          <DeleteData
            route={APIURL.GESTION_ROLES}
            Id={selectedId}
            type="Role"
            message="Êtes-vous sûr de vouloir supprimer ce rôle ?"
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
              setSelectedId(null);
            }}
            onSuccess={handleDeleteSuccess}
          />
        </Modal>
      )}
    </div>
  );
};

export default GestionRoles;