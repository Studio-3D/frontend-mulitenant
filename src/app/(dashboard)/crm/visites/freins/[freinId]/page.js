'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import BreadCrumb from '../../../../navigation/BreadCrumb';
import { fetchData_table_by_id } from '../../../../../../../src/configs/api-utils';
import Table from '@/components/Table';
import Link from 'next/link';
import { useAuth } from '../../../../../../context/AuthContext';
import { useParams } from 'next/navigation';
import { Eye, Check } from 'lucide-react';
import Modal from '@/components/Modal';
import Modal_Traite_Frein from './Modal_Traite_Frein';
import { useProjet } from '@/context/ProjetContext';

import useClearNomPrenomFrein from '../../../hook/useClearNomPrenomFrein';
export default function Biens_Dispo_By_frein_id() {
  useClearNomPrenomFrein();
  const router = useRouter();
  const { freinId } = useParams();
  const [nomPrenom] = useState(localStorage.getItem('nom_prenom_frein') || '');
  const [open_trait, setOpen_trait] = useState(false);
  const { selectedProjet } = useProjet();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem('accessToken');

  const entity = {
    id: freinId,
    API_URL: 'biens_by_frein',
    dataKey: 'data',
    searchFields: [],
  };
  const handleShow = (Id) => {
    window.open(`/Biens/${Id}`, '_blank');
  };

  useEffect(() => {
    fetchData_table_by_id(
      entity,
      {},
      searchTerm,
      currentPage,
      rowsPerPage,
      accesstoken,
      setLoading,
      setError,
      setData,
      setTotalRows
    );
  }, [accesstoken, currentPage, rowsPerPage, searchTerm]);

  // Simple cache et comparaison for return back en cas de changer projet
  const [oldProjetId, setOldProjetId] = useState(null);

  useEffect(() => {
    if (selectedProjet?.id && selectedProjet.id !== oldProjetId) {
      if (oldProjetId) {
        // Projet a changé

        console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet.id}`);
        router.push('/crm/visites/freins');
      }
      setOldProjetId(selectedProjet.id);
    }
  }, [selectedProjet?.id, oldProjetId, router]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1200); // Wait for 1.2s after user stops typing before updating the debounced value

    return () => clearTimeout(timer); // Clean up the timeout on each render
  }, [searchTerm]);
   function NomBienComplet(bien) {
    const noms = [];

    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);

    noms.push(bien.propriete_dite_bien);

    return noms.join(' - ');
  }
  const formatData = () => {
    return data.map((pro) => {
      return {
        id: pro.id,
        bien_propriete_dite_bien: NomBienComplet(pro.bien),
        bien_etat:
          pro.bien.etat === 'ENCOURS_DE_PROPOSITION' &&
          (user.id !== pro?.is_proposed?.user_id
            ? `Proposé par ${pro?.is_proposed?.user.name}`
            : 'Proposé par Moi-même'),
        numero: pro.bien.numero,
        niveau: pro.bien.niveau,
        type_bien: pro.bien.type_bien.type,
        orientation: pro.bien.orientation,
        bien_id: pro.bien.id,
      };
    });
  };

  // Dynamically build columns based on type
  const columns = [
    {
      key: 'bien_propriete_dite_bien',
      label: 'Bien',
      render: (row) => {
        return (
          <Link
            target="_blank"
            href={`/Biens/${row?.bien_id}`}
            className="flex items-center gap-1 text-black-500 hover:text-black-700"
          >
            <strong style={{ fontWeight: 600 }}>
              {row.bien_propriete_dite_bien}
            </strong>
            {/* Check if bien_etat is not null and render conditionally */}
            {row.bien_etat && (
              <strong style={{ marginLeft: '10px', color: 'red' }}>
                {row.bien_etat}
              </strong>
            )}
          </Link>
        );
      },
    },

    { key: 'numero', label: 'Numéro' },
    { key: 'niveau', label: 'Niveau' },
    { key: 'type_bien', label: 'Type' },

    { key: 'orientation', label: 'Orientation' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3 items-center">
          <Eye
            className="w-4 h-4 !text-blue-500 hover:text-blue-700 cursor-pointer"
            title="Voir détails"
            onClick={() => handleShow(row.bien_id)}
          />
        </div>
      ),
    },
  ];

  {
    /* Dynamic Modals Import */
  }

  //EXPORT

  const data_to_export = () => {
    return data.map((pro) => {
      return {
        id: pro.id,
        bien_propriete_dite_bien: NomBienComplet(pro.bien),
        bien_etat:
          pro.bien.etat === 'ENCOURS_DE_PROPOSITION' &&
          (user.id !== pro?.is_proposed?.user_id
            ? `Proposé par ${pro?.is_proposed?.user.name}`
            : 'Proposé par Moi-même'),
        numero: pro.bien.numero,
        niveau: pro.bien.niveau,
        type_bien: pro.bien.type_bien.type,
        orientation: pro.bien.orientation,
      };
    });
  };

  const columns_export = [
    { key: 'bien_propriete_dite_bien', label: 'Bien' },
    { key: 'numero', label: 'Numero' },
    { key: 'niveau', label: 'Niveau' },
    { key: 'type_bien', label: 'Type Bien' },
    { key: 'orientation', label: 'Orientation' },
  ];
  const showTraitement = () => {
    setOpen_trait(true);
  };
  return (
    <div className="bg-white p-4 rounded-lg shadow-md ">
      <div className=" flex items-center justify-start">
        <BreadCrumb
          baseUrl={'/crm?tab=freins'}
          step={`Biens Disponibles du Prospect ${nomPrenom}`}
        />
      </div>

      <div className="reflative">
        <Table
          showSearch={false}
          customActions={[
            {
              label: 'Traiter Frein',
              icon: <Check className="w-5 h-5" />,
              className: 'bg-green-500',
              onClick: showTraitement,
            },
          ]}
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'biens_dispo_freins_export'}
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
        />
      </div>
      {open_trait && (
        <>
          <Modal isVisible={true} onClose={() => setOpen_trait(false)}>
            <Modal_Traite_Frein
              biens={data}
              id={freinId}
              onClose={() => setOpen_trait(false)}
            />
          </Modal>
        </>
      )}
    </div>
  );
}
