'use client';

import React, { useEffect, useState } from 'react';
import Table from '@/components/Table';
import { useAuth } from '../../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchData_table_by_id } from '../../../../../../src/configs/api-utils';
import format from 'date-fns/format';
import { Eye } from 'lucide-react';

// Importez les nouvelles fonctions
import {
  getStatusLabelByType,
  getStatusColorByType,
  Statuts_Prospect,
  Statuts_Client,
} from '../../../../../../src/configs/enum';

// Vous pouvez garder cette fonction pour la rétrocompatibilité
// ou l'adapter pour utiliser le type_source
const getStatusLabel = (rawStatus, typeSource = 'prospect') => {
  return getStatusLabelByType(rawStatus, typeSource);
};

import SelectInput from '@/components/SelectInput';
import Input from '@/components/Input';
import Link from 'next/link';

const HistoriquesTable = ({ id, refreshTrigger = 0, type }) => {
  const [historiques, setHistoriques] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { token } = useAuth();
  const accesstoken = token || localStorage.getItem('accessToken');

  const [filters, setFilters] = useState({
    date_traitement: '',
    rdv: '',
    statut: '',
    date_rappel: '',
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };
  const resetFilters = () => {
    const reset = Object.fromEntries(
      Object.keys(filters).map((key) => [key, ''])
    );
    setFilters(reset);
    setTempFilters(reset);
  };
  const applyFilters = () => {
    setFilters(tempFilters);
  };

  const router = useRouter();
  const entity = {
    id: id,
    API_URL:
      type === 'client' ? 'historiques_clients' : 'historiques_prospects',
    dataKey: 'historiques',
    name: 'historique',
    searchFields: ['date_traitement', 'statut', 'rappel'],
  };

  useEffect(() => {
    fetchData_table_by_id(
      entity,
      filters,
      searchTerm,
      currentPage,
      rowsPerPage,
      accesstoken,
      setLoading,
      setError,
      setHistoriques,
      setTotalRows
    );
  }, [
    accesstoken,
    currentPage,
    rowsPerPage,
    searchTerm,
    filters,
    refreshTrigger,
  ]);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

 
  
  // Format users data for table display - MIS À JOUR
  const formatData = () => {
    return historiques.map((pro) => {
      // Utilisez le type_source pour obtenir le bon label
      const statusLabel = getStatusLabelByType(pro.statut, pro.type_source);

      return {
        id: pro.id,
        type_source: pro.type_source, // Ajoutez cette colonne si vous voulez l'afficher
        date_traitement: pro.date_traitement,
        statut: statusLabel,
        statut_raw: pro.statut, // Gardez la valeur brute pour le filtrage
        rdv: pro.rdv ? format(new Date(pro.rdv), 'dd/MM/yyyy H:m') : '',
        rappel: pro.date_rappel
          ? format(new Date(pro.date_rappel), 'dd/MM/yyyy ')
          : '',
        commentaire: pro.commentaire || '',
        user_traite: pro.user
          ? `${pro.user.name || ''} ${pro.user.prenom || ''}`.trim()
          : '',
        // Note: pour les statuts client, le champ peut être différent
        visite_id: pro.visite?.origin_id || pro.visite_id,
        appel_id: pro.appel_id,
        desistement_id: pro?.desistement_id,
        // Ajoutez les autres champs spécifiques aux clients si nécessaire
        reservation: pro?.reservation,
        avance: pro?.avance,
      };
    });
  };

  // Fonction pour obtenir la couleur en fonction du type
  const getStatusColor = (statut, typeSource) => {
    return getStatusColorByType(statut, typeSource);
  };

  {
    /*
      key: 'client_info',
      label: 'Info Client',
      render: (row) => {
        // Ne pas afficher pour les prospects avec statut 1 ou 5
        if (
          row.type_source == 'client' &&
          (row.statut_raw == '1' || row.statut_raw == '5')
        ) {
          return '';
        }

        // Afficher uniquement pour les clients
        if (row.type_source == 'prospect') return '';

        return (
          <div className="text-xs space-y-1">
            {row?.reservation?.code_reservation && (
              <div className="font-medium">
                Réservations: {row.reservation.code_reservation}
                {row.type_source}
              </div>
            )}
            {row?.avance?.montant && <div>Avance: {row.avance.montant} DH</div>}
          </div>
        );
      },
    */
  }
  // Table columns configuration - MIS À JOUR
  const columns = [
    {
      key: 'date_traitement',
      label: 'Date Traitement',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>{row.date_traitement}</span>
          {/*row.type_source && (
          <span className="text-xs px-2 py-1 bg-gray-100 rounded">
            {row.type_source === 'prospect' ? 'Prospect' : 'Client'}
          </span>
        )*/}
        </div>
      ),
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (row) => {
        if (!row.statut_raw) return '';

        return (
          <span
            className={`px-2 py-1 rounded text-sm font-semibold ${getStatusColor(
              row.statut_raw,
              row.type_source
            )}`}
          >
            {row.statut}
          </span>
        );
      },
    },
    { key: 'rdv', label: 'Rendez Vous' },
    { key: 'rappel', label: 'Date Rappel' },
    { key: 'user_traite', label: 'Traité par' },
    { key: 'commentaire', label: 'Commentaire' },
    // Colonne info client (conditionnelle)

   {
  key: 'actions',
  label: 'Actions',
  render: (row) => (
    <div className="flex gap-3 items-center">
      {row.type_source === 'prospect' ? (
        <>
          {row.visite_id != null && (
            <Link
              href={`/crm/visites/${row.visite_id}`}
              title="Voir Visite"
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Eye className="w-4 h-4 text-blue-500 hover:text-blue-700" />
            </Link>
          )}
          {row.appel_id != null && (
            <Link
              href={`/crm/appels/${row.appel_id}`}
              title="Voir Appel"
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Eye className="w-4 h-4 text-green-500 hover:text-green-700" />
            </Link>
          )}
        </>
      ) : (
        <>
          {row.desistement_id != null ? (
            <Link
              href={`/ventes/desistements/show/${row.desistement_id}`}
              title="Voir Désistement"
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Eye className="w-4 h-4 text-green-500 hover:text-green-700" />
            </Link>
          ) : (
            row?.reservation?.id && (
              <Link
                href={`/ventes/reservations/${row.reservation.id}`}
                title="Détail Réservation"
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Eye className="w-4 h-4 text-green-500 hover:text-green-700" />
              </Link>
            )
          )}
        </>
      )}
    </div>
  ),
}
  ];

  // Fonction pour combiner les options de statut
  const getCombinedStatusOptions = () => {
    // Options pour les prospects - préfixer avec 'P_'
    const prospectOptions = Object.values(Statuts_Prospect).map((data) => ({
      value: `P_${data.id}`, // Préfixe pour prospect
      label: `${data.label}`,
      group: 'Prospect',
      rawValue: data.id, // Garder la valeur originale pour l'envoi au backend
      type: 'prospect',
    }));

    // Options pour les clients - préfixer avec 'C_'
    const clientOptions = Object.values(Statuts_Client).map((data) => ({
      value: `C_${data.id}`, // Préfixe pour client
      label: `${data.label}`,
      group: 'Client',
      rawValue: data.id, // Garder la valeur originale pour l'envoi au backend
      type: 'client',
    }));

    return [...prospectOptions, ...clientOptions];
  };

  // EXPORT - MIS À JOUR pour correspondre exactement au tableau
  const data_to_export = () => {
    return historiques.map((pro) => {
      // Récupérer le label du statut comme dans formatData()
      const statusLabel = getStatusLabelByType(pro.statut, pro.type_source);

      // Formater les dates comme dans formatData()
      const rdvFormatted = pro.rdv
        ? format(new Date(pro.rdv), 'dd/MM/yyyy H:m')
        : '';
      const rappelFormatted = pro.date_rappel
        ? format(new Date(pro.date_rappel), 'dd/MM/yyyy')
        : '';

      // Formater l'utilisateur comme dans formatData()
      const userTraite = pro.user
        ? `${pro.user.name || ''} ${pro.user.prenom || ''}`.trim()
        : '';

      // Créer l'objet d'export avec les mêmes données que le tableau
      const exportData = {
        'Date Traitement': pro.date_traitement,
        Type: pro.type_source === 'prospect' ? 'Prospect' : 'Client',
        Statut: statusLabel,
        'Rendez-vous': rdvFormatted,
        'Date Rappel': rappelFormatted,
        'Traité par': userTraite,
        Commentaire: pro.commentaire || '',
      };

      // Ajouter les informations spécifiques aux clients seulement si c'est un client
      // Note: Votre condition dans formatData() pour la colonne info client
      exportData['Code Réservation'] = pro.reservation?.code_reservation || '';
      exportData['Avance'] = pro.avance?.montant
        ? `${pro.avance.montant} DH`
        : '';

      return exportData;
    });
  };

  // Colonnes d'export correspondantes
  const columns_export = [
    { key: 'Date Traitement', label: 'Date Traitement' },
    { key: 'Type', label: 'Type' },
    { key: 'Statut', label: 'Statut' },
    { key: 'Rendez-vous', label: 'Rendez-vous' },
    { key: 'Date Rappel', label: 'Date Rappel' },
    { key: 'Traité par', label: 'Traité par' },
    { key: 'Commentaire', label: 'Commentaire' },

    { key: 'Code Réservation', label: 'Code Réservation' },
    { key: 'Avance', label: 'Avance' },
  ];
  return (
    <>
      <div className="reflative">
        <Table
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'historiques_propects_export'}
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
          showSearch={false}
          filterComponent={
            <div className="space-y-4 p-4 rounded-lg ">
              <div
                className="grid gap-5"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                }}
              >
                {/* Champs de recherche */}
                <Input
                  type="date"
                  label="Date Traitement"
                  value={tempFilters.date_traitement}
                  onChange={(e) =>
                    handleFilterChange('date_traitement', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />

                <Input
                  type="date"
                  label="Rendez Vous"
                  value={tempFilters.rdv}
                  onChange={(e) => handleFilterChange('rdv', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />

                <Input
                  type="date"
                  label="Date Rappel"
                  value={tempFilters.date_rappel}
                  onChange={(e) =>
                    handleFilterChange('date_rappel', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />

                <SelectInput
                  label={'Statut'}
                  value={tempFilters.statut}
                  onChange={(value) => handleFilterChange('statut', value)}
                  options={getCombinedStatusOptions()} // Utilisez les options combinées
                  placeholder="Choisir un Statut"
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
        />
      </div>
    </>
  );
};

export default HistoriquesTable;
