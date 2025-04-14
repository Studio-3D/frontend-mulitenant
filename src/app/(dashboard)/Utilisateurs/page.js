'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Table from '@/components/Table';
import Link from 'next/link';
import { FaRegEye, FaUserEdit, FaUserSlash } from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { BiSolidUser } from 'react-icons/bi';
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
      };

      if (user?.role !== 1 && selectedSociete?.id) {
        params.societe_id = selectedSociete.id;
      }

      const response = await axios.get(APIURL.UTILISATEURS, {
        headers: { Authorization: `Bearer ${accesstoken}` },
        params,
      });
      console.log('Response:', response.data);

      if (response.data?.users) {
        let filteredUsers = response.data.users;

        // Client-side filtering
        if (searchTerm) {
          filteredUsers = response.data.users.filter((user) => {
            const searchText = searchTerm.toLowerCase();
            const fullName = `${user.name || ''} ${
              user.prenom || ''
            }`.toLowerCase();
            const email = user.email?.toLowerCase() || '';
            const phone = (user.phone || '').toLowerCase();
            const role = getRoleText(user.role).toLowerCase();
            const status = (user.is_actif ? '1' : '2').toLowerCase();

            return (
              fullName.includes(searchText) ||
              email.includes(searchText) ||
              phone.includes(searchText) ||
              role.includes(searchText) ||
              status.includes(searchText)
            );
          });
        }

        setUsers(filteredUsers);
        setTotalRows(
          response.data.pagination?.totalItems || filteredUsers.length
        );
      } else {
        setError('Aucun utilisateur trouvé');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
      if (err.response?.status === 401) {
        router.push('/connexion');
        toast.error('Session expirée, veuillez vous reconnecter.');
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
    router,
  ]);

  // Fetch users when pagination or search changes
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
      default:
        return 'Utilisateur';
    }
  };

  // Format users data for table display
  const formatUsers = () => {
    return users.map((user) => ({
      id: user.id,
      avatar: user.photo
        ? `${RESOURCE_URL.DOCS}/${user.societe?.raison_sociale_concatene}_${user.societe?.id}/users/${user.photo}`
        : '/default-avatar.png',
      nomComplet: `${user.name || ''} ${user.prenom || ''}`.trim(),
      email: user.email,
      telephone: user.phone || 'Non spécifié',
      role: getRoleText(user.role),
      date: new Date(user.created_at).toLocaleDateString(),
      status: user.is_actif ? 'Actif' : 'Inactif',
    }));
  };

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
          'Admin': 'bg-purple-100 text-purple-600',
          'Commercial': 'bg-yellow-100 text-yellow-600',
          'Utilisateur': 'bg-gray-100 text-gray-600',
        };

        return (
          <span
            className={`px-2 py-1 rounded text-sm font-semibold ${
              roleColors[row.role] || 'bg-gray-100 text-gray-600'
            }`}
          >
            {row.role}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Statut',
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-sm font-semibold ${
            row.status === 'Actif'
              ? 'bg-green-100 text-green-600'
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
        <div className="flex gap-3 items-center">
          <Link href={`/Utilisateurs/afficher-utilisateur/${row.id}`}>
            <FaRegEye
              className="w-4 h-4 text-blue-500 hover:text-blue-700 cursor-pointer"
              title="Voir détails"
            />
          </Link>
          <Link href={`/Utilisateurs/afficher-utilisateur/${row.id}?edit=true`}>
            <FaUserEdit 
              className="w-4 h-4 text-yellow-500 hover:text-yellow-700 cursor-pointer"
              title="Modifier"
            />
          </Link>
          {row.status === 'Actif' ? (
            <BiSolidUser
              className="w-4 h-4 text-green-500 hover:text-green-700 cursor-pointer"
              onClick={() => {
                setSelectedUserId(row.id);
                setShowBlockModal(true);
              }}
              title="Bloquer utilisateur"
            />
          ) : (
            <FaUserSlash
              className="w-4 h-4 text-red-500 hover:text-red-700 cursor-pointer"
              onClick={() => {
                setSelectedUserId(row.id);
                setShowUnblockModal(true);
              }}
              title="Débloquer utilisateur"
            />
          )}
          <RiDeleteBin6Line
            className="w-4 h-4 text-red-500 hover:text-red-700 cursor-pointer"
            onClick={() => {
              setSelectedUserId(row.id);
              setShowDeleteModal(true);
            }}
            title="Supprimer utilisateur"
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="relative">
      <Table
        columns={columns}
        data={selectedSociete?.id ? formatUsers() : []}
        totalRows={selectedSociete?.id ? totalRows : 0}
        loading={loading}
        error={error}
        // add 
        addLink={`/Utilisateurs/ajouter-utilisateur?societe_id=${selectedSociete?.id}`}
        enableExport
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        addUserLink="/Utilisateurs/ajouter-utilisateur"
        emptyMessage={
          !selectedSociete?.id
            ? "Veuillez sélectionner une société pour voir les utilisateurs."
            : "Aucun utilisateur trouvé."
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
              fetchUsers(currentPage, rowsPerPage, searchTerm);
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
              fetchUsers(currentPage, rowsPerPage, searchTerm);
            }}
          />
        </Modal>
      )}

      {showDeleteModal && selectedUserId && (
        <Modal isVisible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.UTILISATEURS}
            Id={selectedUserId}
            message={"vous êtes sûr de vouloir supprimer cet utilisateur?"}

            userId={selectedUserId}
            accessToken={accesstoken}
            onClose={() => {
              setShowDeleteModal(false);
              fetchUsers(currentPage, rowsPerPage, searchTerm);
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default Page;