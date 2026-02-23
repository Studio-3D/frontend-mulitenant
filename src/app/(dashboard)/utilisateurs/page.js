'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Table from '@/components/Table';
import Link from 'next/link';
import { Eye, PencilLine, ShieldX, ShieldCheck, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import BlockUser from '@/components/Utilisateurs/BlockUser';
import UnblockUser from '@/components/Utilisateurs/UnblockUser';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useSociete } from '../../../context/SocieteContext';
import { APIURL, RESOURCE_URL } from '../../../configs/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import DeleteData from '@/components/DeleteData';
import Input from '@/components/Input';
import SelectInput from '@/components/SelectInput';
import {
  EDUCATION_LEVELS,
  encryptUserType,
  GENDERS,
  USER_STATUS,
  USER_TYPES,
} from '@/components/user-utils';
import format from 'date-fns/format';
import { isAdmin, isSuperAdmin } from '@/configs/enum';

const Page = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    nom: '',
    email: '',
    telephone: '',
    societe: '',
    role: '',
    gender: '',
    niveau: '',
    status: '',
  });

  const [tempFilters, setTempFilters] = useState({ ...filters });

  const { user, token } = useAuth();
  const { selectedSociete } = useSociete();
  const router = useRouter();

  const accesstoken = token || localStorage.getItem('accessToken');

  // Fetch users from API with pagination and search
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page: currentPage,
        size: rowsPerPage,
        ...filters,
        // Add search term to parameters if it exists
        ...(searchTerm && { search: searchTerm }),
      };

      if (user?.role !== 1 && selectedSociete?.id) {
        params.societe_id = selectedSociete.id;
      }

      const response = await axios.get(APIURL.UTILISATEURS, {
        headers: { Authorization: `Bearer ${accesstoken}` },
        params,
      });

      // Filter out current user from results
      const filteredUsers = response.data.users.filter(
        (u) => u.id !== user?.id
      );

      setUsers(filteredUsers);
      setTotalRows(
        response.data.pagination?.totalItems || filteredUsers.length
      );
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors du chargement';
      setError(msg);
      if (err.response?.status === 401) {
        router.push('/');
        // Avoid duplicate toast: Auth guards or other layers may already notify on logout
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    rowsPerPage,
    searchTerm,
    selectedSociete,
    token,
    user?.role,
    user?.id,
    router,
    filters,
    accesstoken,
  ]);

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page when filters change
    setFilters(tempFilters);
  };

  const resetFilters = () => {
    const reset = {
      nom: '',
      email: '',
      telephone: '',
      societe: '',
      role: '',
      gender: '',
      niveau: '',
      status: '',
    };
    setCurrentPage(1); // Reset to first page when filters reset
    setFilters(reset);
    setTempFilters(reset);
    setSearchTerm(''); // Also reset search term
  };
      useEffect(() => {
          if (
            !isAdmin(user?.role) &&
            !isSuperAdmin(user?.role) 
          ) {
            router.push('/');
          }
        }, [user, user?.role, router]);
  // Fetch users when pagination, filters or search changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Format user role text
  const getRoleText = (roleId) => {
    switch (parseInt(roleId)) {
      case 1:
        return 'Super Admin';
      case 2:
        return 'Admin';
      case 3:
        return 'Commercial';
      case 5:
        return 'Notaire';
      case 6:
        return 'Responsable Livraison';
      case 7:
        return 'Comptable';
      case 8:
        return 'Service Après-Vente';
      case 9:
        return 'Responsable Commercial';
      case 10:
        return 'Agent Administratif';
      default:
        return 'Utilisateur';
    }
  };

  // Format users data for table display
  const formatUsers = () => {
    return users.map((us) => ({
      id: us.id,
      avatar: us.photo
        ? `${RESOURCE_URL.DOCS}/${
            us.societe
              ? us?.societe?.raison_sociale_concatene
              : user?.societe?.raison_sociale_concatene
          }_${us.societe_id ? us.societe_id : user.societe_id}/users/${
            us?.photo
          }`
        : '/default-avatar.png',
      nomComplet: `${us.name || ''} ${us.prenom || ''}`.trim(),
      email: us.email,
      telephone: us.phone || 'Non spécifié',
      role: getRoleText(us.role),
      date: format(new Date(us.created_at), 'dd/MM/yyyy'),
      status: us.is_actif ? 'Actif' : 'Inactif',
    }));
  };

  const data_to_export = () => {
    return users.map((us) => ({
      nom: us.name,
      prenom: us.prenom,
      prenom: us.prenom,
      email: us.email,
      telephone: us.phone || '',
      role: getRoleText(us.role),
      date: format(new Date(us.created_at), 'dd/MM/yyyy'),
      status: us.is_actif ? 'Actif' : 'Inactif',
      societe: us.societe?.raison_sociale,
      adresse: us.adresse,
      gender: us.gender,
      cin: us.cin,
      fonction: us.fonction,
      date_embauche: us.date_embauche,
      niveau_etude: us.niveau_etude,
      cnss: us.cnss,
      solde_conge: us.solde_conge,
      societe: us.societe.raison_sociale,
      adresse: us.adresse,
      gender: us.gender,
      cin: us.cin,
      fonction: us.fonction,
      date_embauche: us.date_embauche,
      niveau_etude: us.niveau_etude,
      cnss: us.cnss,
      solde_conge: us.solde_conge,
    }));
  };

  const columns_export = Object.keys(data_to_export()[0] || {}).map((key) => ({
    key,
    label: key,
  }));

  // Table columns configuration
  const columns = [
    {
      key: 'nomComplet',
      label: 'Nom Complet',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar}
            alt={row.nomComplet}
            className="w-7 h-7 rounded-full border border-gray-300"
            onError={(e) => {
              e.target.src =
                'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
            }}
          />
          <span>{row.nomComplet}</span>
        </div>
      ),
    },
    { key: 'email', label: 'Email' },
    { key: 'date', label: 'Date' },
    { key: 'telephone', label: 'Téléphone' },
    {
  key: 'role',
  label: 'Rôle',
  render: (row) => {
    const roleColors = {
      'Super Admin': 'bg-blue-100 text-[#009FFF]',
      Admin: 'bg-purple-100 text-purple-600',
      Commercial: 'bg-yellow-100 !text-yellow-600',
      'Responsable Livraison': 'bg-orange-100 !text-orange-600',
      Notaire: 'bg-green-100 !text-green-600',
      Comptable: 'bg-red-100 !text-red-600',
      'Service Après-Vente': 'bg-indigo-100 !text-indigo-600',
      'Responsable Commercial': 'bg-cyan-100 !text-cyan-600',
      'Agent Administratif': 'bg-slate-100 !text-slate-600',
      Utilisateur: 'bg-gray-100 !text-gray-600',
    };

    // Utilisation de la fonction getRoleText qui est déjà définie
    const roleText = getRoleText(row.roleId || row.originalRoleId); // Adaptez selon votre structure de données
    
    // Ou directement depuis le row formaté
    const role = row.role || roleText;
    
    const colorClass = roleColors[role] || roleColors['Utilisateur'];
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
        {role}
      </span>
    );
  }
},
    {
      key: 'status',
      label: 'Statut',
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-sm font-semibold ${
            row.status === 'Actif'
              ? 'bg-green-100 !text-green-600'
              : 'bg-red-100 text-[#E53935]'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-4 items-center text-sm">
          <Link
            href={`/utilisateurs/afficher-utilisateur/${row.id}`}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
            title="Voir les détails"
          >
            <Eye className="w-4 h-4" />
          </Link>

          <Link
            href={`/utilisateurs/afficher-utilisateur/${row.id}?edit=true`}
            className="flex items-center gap-1 text-yellow-500 hover:text-yellow-700"
            title="Modifier l'utilisateur"
          >
            <PencilLine className="w-4 h-4" />
          </Link>

          {row.status === 'Actif' ? (
            <button
              onClick={() => {
                setSelectedUserId(row.id);
                setShowBlockModal(true);
              }}
              className="flex items-center gap-1 text-red-500 hover:text-red-700"
              title="Bloquer l'utilisateur"
            >
              <ShieldX className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedUserId(row.id);
                setShowUnblockModal(true);
              }}
              className="flex items-center gap-1 text-green-500 hover:text-green-700"
              title="Débloquer l'utilisateur"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              setSelectedUserId(row.id);
              setShowDeleteModal(true);
            }}
            className="flex items-center gap-1 text-red-500 hover:text-red-700"
            title="Supprimer l'utilisateur"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="relative bg-white shadow-md rounded-lg px-4 py-4">
        <Table
          showSearch={false}
          title={'Utilisateurs'}
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'utilisateur_export'}
          columns={columns}
          filterComponent={
            <div className="space-y-4 ">
              <div
                className="grid gap-3 "
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                }}
              >
                {/* Champs de recherche */}
                <Input
                  label={'Nom & prénom'}
                  type="text"
                  placeholder="Nom & prénom..."
                  value={tempFilters.nom}
                  onChange={(e) => handleFilterChange('nom', e.target.value)}
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

                {!selectedSociete && (
                  <Input
                    label={'Société'}
                    type="text"
                    placeholder="Société..."
                    value={tempFilters.societe}
                    onChange={(e) =>
                      handleFilterChange('societe', e.target.value)
                    }
                    className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                  />
                )}

                <SelectInput
                  label={'Role'}
                  value={tempFilters.role}
                  onChange={(value) => handleFilterChange('role', value)}
                  options={Object.entries(USER_TYPES)
                    .filter(([key]) => key !== 'SUPERADMIN')
                    .map(([key, label]) => ({
                      value: encryptUserType(label),
                      label,
                    }))}
                  placeholder="Rôle"
                />
                <SelectInput
                  label={'Genre'}
                  value={tempFilters.gender}
                  onChange={(value) => handleFilterChange('gender', value)}
                  options={Object.values(GENDERS).map(({ code, label }) => ({
                    value: code,
                    label,
                  }))}
                  placeholder="Genre"
                  className="h-10 text-sm w-full"
                />

                <SelectInput
                  label={'Niveau'}
                  value={tempFilters.niveau}
                  onChange={(value) => handleFilterChange('niveau', value)}
                  options={Object.entries(EDUCATION_LEVELS).map(
                    ([key, label]) => ({
                      value: label,
                      label,
                    })
                  )}
                  placeholder="Niveau d'étude"
                  className="h-10 text-sm w-full"
                />

                <SelectInput
                  label={'Status'}
                  value={tempFilters.status?.toString()}
                  onChange={(value) =>
                    handleFilterChange('status', Number(value))
                  }
                  options={Object.values(USER_STATUS).map(
                    ({ code, label }) => ({
                      value: code.toString(),
                      label,
                    })
                  )}
                  placeholder="Statut"
                  className="h-10 text-sm w-full"
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
          data={
            user?.role === 1
              ? formatUsers()
              : selectedSociete?.id
              ? formatUsers()
              : []
          }
          totalRows={
            user?.role === 1 ? totalRows : selectedSociete?.id ? totalRows : 0
          }
          loading={loading}
          error={error}
          addLink={
            user?.role == 1 ? `/utilisateurs/ajouter-utilisateur` : undefined
          }
          enableExport
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          onSearchChange={setSearchTerm}
          emptyMessage={
            user?.role === 1
              ? 'Aucun utilisateur trouvé.'
              : !selectedSociete?.id
              ? 'Veuillez sélectionner une société pour voir les utilisateurs.'
              : 'Aucun utilisateur trouvé.'
          }
        />
      </div>

      {/* Modals for user actions */}
      {showBlockModal && selectedUserId && (
        <Modal
          isVisible={showBlockModal}
          onClose={() => setShowBlockModal(false)}
        >
          <BlockUser
            userId={selectedUserId}
            accessToken={accesstoken}
            onClose={() => {
              setShowBlockModal(false);
              fetchUsers();
            }}
          />
        </Modal>
      )}

      {showUnblockModal && selectedUserId && (
        <Modal
          isVisible={showUnblockModal}
          onClose={() => setShowUnblockModal(false)}
        >
          <UnblockUser
            userId={selectedUserId}
            accessToken={accesstoken}
            onClose={() => {
              setShowUnblockModal(false);
              fetchUsers();
            }}
          />
        </Modal>
      )}

      {showDeleteModal && selectedUserId && (
        <Modal
          isVisible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        >
          <DeleteData
            route={APIURL.UTILISATEURS}
            Id={selectedUserId}
            type="Utilisateur"
            message={'vous êtes sûr de vouloir supprimer cet utilisateur?'}
            userId={selectedUserId}
            accessToken={accesstoken}
            onClose={() => {
              setShowDeleteModal(false);
              fetchUsers();
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default Page;
