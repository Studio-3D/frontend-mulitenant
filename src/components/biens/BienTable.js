"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import Table from '@/components/Table';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from "@/context/AuthContext";
import { Eye, Pencil, Trash2 } from "lucide-react";
import BienFilter from './BienFilter';
import { fetchData_table_by_projet, fetchDataByProjet_params } from '@/configs/api-utils';
import Modal from '../Modal';
import DeleteData from '../DeleteData';
import { BIEN_ETATS, decryptBienEtat, getEtatLabel, rowBienBackgroundColors } from '../bien-utils';
import { Box, CircularProgress, Grid, MenuItem, Paper, Select, Typography } from '@mui/material';
import BienImport from './BienImport';

export default function BienTable({ projetId, immeubleId, blocId, trancheId }) {
  const [biens, setBiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const accessToken = localStorage.getItem("accessToken");
  const [totalRows, setTotalRows] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [stats, setStats] = useState([]);
  const [types, setTypes] = useState([]);
  const [loadingType, setLoadingType] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [type_id, settype_id] = useState(null);

  const router = useRouter();
  const { user } = useAuth();
  const [filters, setFilters] = useState({propriete_dite_bien: '',
      immeuble:'',
      bloc:'',
      tranche:'',
      type_id:'',
      vue:'',
      typologie:'',
      etat:'',
      orientation:'',
      niveau:'',
      prix_min:'',
      prix_max:'',
      superficie_min:'',
      superficie_max:'',
    });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters); // C'est ici que fetchUsers va être déclenché
  };
  const resetFilters = () => {
    const reset = {
      propriete_dite_bien: '',
      num:'',
      immeuble:'',
      bloc:'',
      tranche:'',
      type_id:'',
      vue:'',
      typologie:'',
      etat:'',
      orientation:'',
      niveau:'',
      prix_min:'',
      prix_max:'',
      superficie_min:'',
      superficie_max:'',
    };
    setFilters(reset);
    setTempFilters(reset);
  };


   const fetchTypes = async () => {
    try {
      setActiveTab("tous"); // Onglet par défaut : "Tous"
      fetchTotalStats();
       await fetchDataByProjet_params('typeBiens', setTypes, setLoadingType);
      setTypes(current => [{id: 'tous', type: 'Tous',prenom: ''},...current]);

    } catch (error) {
      console.error("Erreur lors de la récupération des types :", error);
    }
  };

  useEffect(() => {
    fetchTypes()
  }, []);


  useEffect(() => {
    fetchTotalStats();

  }, [ filters]);



const fetchStatsByType = (typeId) => {
  setLoadingType(true);
  
  setStats([]); // Réinitialise les statistiques
  let params = { ...filters }; // Commence avec les valeurs de filtre, si disponibles

  if (projetId) {
    params = { ...params, projet_id: projetId }; // Ajoute `projetId` aux paramètres
  } else if (trancheId) {
    params = { ...params, tranche_id: trancheId }; // Ajoute `trancheId` aux paramètres
  } else if (blocId) {
    params = { ...params, bloc_id: blocId }; // Ajoute `blocId` aux paramètres
  } else if (immeubleId) {
    params = { ...params, immeuble_id: immeubleId }; // Ajoute `immeubleId` aux paramètres
  }
  axios
    .get(`${APIURL.ROOTV1}/getEtatBien_ByType/${projetId}/${typeId}/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params
    })
    .then((response) => {
      setLoadingType(false);
      const apiData = response.data.data; // Données brutes de l'API
      const totalItem = response.data.total; // Données brutes de l'API
      const allEtats = Object.keys(BIEN_ETATS);

      const transformedStats = allEtats.map((etat) => {
      const matchedData = apiData[etat] || {}; // Si l'état est absent, retourne un objet vide
      const total = matchedData?.total || 0;
      const label = BIEN_ETATS[etat]?.label || "Inconnu";
      const color = rowBienBackgroundColors[decryptBienEtat(etat)] || "#CCCCCC";

      return {
        label,
        value: total,
        total: totalItem,
        color,
      };
    });

    setStats(transformedStats);
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des données :", error);
          setLoadingType(false);
        });
    };

    const fetchTotalStats = () => {
      let params = { ...filters }; // Commence avec les valeurs de filtre, si disponibles

      if (projetId) {
        params = { ...params, projet_id: projetId }; // Ajoute `projetId` aux paramètres
      } else if (trancheId) {
        params = { ...params, tranche_id: trancheId }; // Ajoute `trancheId` aux paramètres
      } else if (blocId) {
        params = { ...params, bloc_id: blocId }; // Ajoute `blocId` aux paramètres
      } else if (immeubleId) {
        params = { ...params, immeuble_id: immeubleId }; // Ajoute `immeubleId` aux paramètres
      }else if(type_id){
        params = { ...params, type_id: type_id }; // Ajoute `type_id` aux paramètres
      }

      setLoadingType(true);
      setStats([]); // Réinitialise les statistiques

      axios
        .get(`${APIURL.ROOTV1}/getTotalsStatistique/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params, // Passe les paramètres dynamiques
        })
        .then((response) => {
          setLoadingType(false);
          const apiData = response.data.data; // Traite les données de l'API
          const total1 = response.data.total; // Données brutes de l'API

          const allEtats = Object.keys(BIEN_ETATS);

          const transformedStats = allEtats.map((etat) => {
          const matchedData = apiData[etat] || {}; // Si l'état est absent, retourne un objet vide
          const total = matchedData?.total || 0;
          const label = BIEN_ETATS[etat]?.label || "Inconnu";
          const color = rowBienBackgroundColors[decryptBienEtat(etat)] || "#CCCCCC";

          return {
            label,
            value: total,
            total: total1,
            color,
          };
        });

        setStats(transformedStats);
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des statistiques globales :", error);
          setLoadingType(false);
        });
    };




  const handleTypeClick = (typeId) => {
    setActiveTab(typeId); // Met à jour l'onglet actif
    if (typeId === "tous") {
      settype_id(null); // Réinitialise l'ID du type sélectionné
      // Charge les statistiques globales
      fetchTotalStats();
    } else {
      settype_id(typeId);
      console.log("Type ID sélectionné :", typeId);
       // Met à jour l'ID du type sélectionné
      // Charge les statistiques pour un type spécifique
      fetchStatsByType(typeId);
    }
  };




  const Statistiques = ({ data }) => (
    <Grid container spacing={1}>
      {data.map((stat, index) => (
        <Grid item xs={4} sm={2} key={index}> {/* Ajustez les colonnes */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              p: 1, // Réduit le padding
              height: "80px", // Taille plus petite
              border: "1px solid #ddd",
              borderRadius: 1,
              backgroundColor: stat.color,
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", // Légère ombre
            }}
          >
            <Typography sx={{ fontSize: "0.7rem", fontWeight: "bold" }}> {/* Petite police */}
              {stat.label}
            </Typography>
            <Typography sx={{ fontSize: "0.8rem" }}> {/* Ajustez ici aussi */}
              {stat.value} / {stat.total}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );



   const handleFilterToggle = (isOpen) => {
      if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
    };

 
  // Define table columns with action buttons
  const columns = [
    { key: 'propriete_dite_bien', label: 'Désignation' },
    { key: 'numero', label: 'Numéro' },
    { key: 'niveau', label: 'Niveau' },
    { key: 'type', label: 'Type' },
    { key: 'prix', label: 'Prix (Dhs)' },
    {
        key: 'etat',
        label: 'État',
        render: (row) => {
          const label = getEtatLabel(row.etat);
          const color = rowBienBackgroundColors[decryptBienEtat(row.etat)];
          return (
            <span
              className="text-xs font-medium px-2.5 py-0.5 rounded"
              style={{ backgroundColor: color }}
            >
              {label}
            </span>
          );
        }
      },    
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => {
        // Check user permissions for managing biens
        const canManageBiens = user?.role === 1 || user?.role === 2; // Superadmin or Admin
        
        return (
          <div className="flex gap-4 items-center">
            {canManageBiens && (
              <>
               <button
                  className="text-teal-500 hover:text-teal-700"
                  //onClick={() => handleAction('view', row.id)}
                  title="Voir"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  className="text-blue-500 hover:text-blue-700"
                  onClick={() => handleAction('edit', row.id)}
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
        );
      }
    }
  ];

  const entity = {
   API_URL: "biens",
   dataKey: "data",
   name: "bien",
   searchFields: ['propriete_dite_bien', 'numero'],
 };
 
  const loadData = () => {
  const filtersToUse = {
    ...filters,
    ...(projetId ? { projet_id: projetId } : {}),
    ...(trancheId ? { tranche_id: trancheId } : {}),
    ...(blocId ? { bloc_id: blocId } : {}),
    ...(immeubleId ? { immeuble_id: immeubleId } : {}),
  };

  fetchData_table_by_projet(
    entity,
    filtersToUse,
    searchTerm,
    currentPage,
    rowsPerPage,
    accessToken,
    setLoading,
    setError,
    setBiens,
    setTotalRows
  );
};

useEffect(() => {
  loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchTerm,
  accessToken,
  projetId,
  trancheId,
  blocId,
  immeubleId,
  filters,
  currentPage,    
  rowsPerPage     
]);

  const handlePageChange = (page) => {
  setCurrentPage(page);
};

const handleRowsPerPageChange = (rows) => {
  setRowsPerPage(rows);
  setCurrentPage(1); // Reset to first page when changing rows per page

};

  // Format biens data for table
  const formattedBiens = biens
    .filter(bien => 
      searchTerm === '' || 
      bien.propriete_dite_bien?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bien.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bien.immeuble?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(bien => ({
      id: bien.id,
      propriete_dite_bien: bien.propriete_dite_bien || 'Sans nom',
      numero: bien.numero || '',
      niveau: bien.niveau?.toString() || '',
      immeuble_nom: bien.immeuble?.nom || '',
      prix: bien.prix?.toLocaleString('fr-FR') || '0',
      etat: bien.etat ,
      type: bien?.type_bien?.type 
    }));

  // Calculate paginated data
  const paginatedData = formattedBiens.slice(
    (currentPage - 1) * rowsPerPage, 
    currentPage * rowsPerPage
  );

  // Handle search
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };


  // Handle rows per page change
  

const data_to_export = () => {
    return formattedBiens.map((bien) => ({
      Désignation: bien.propriete_dite_bien,
      Numéro: bien.numero,
      Niveau: bien.niveau,
      Immeuble: bien?.immeuble_nom,
      tranche: bien?.tranche?.nom,
      bloc: bien?.bloc?.nom,
      type: bien?.type_bien?.type,
      Prix: bien.prix,
      État: bien.etat
    }));
  };  

  const columns_export = [
  { key: "Désignation", label: "Désignation" },
  { key: "Numéro", label: "Numéro" },
  { key: "Niveau", label: "Niveau" },
  { key: "Immeuble", label: "Immeuble" },
  { key: "tranche", label: "Tranche" },
  { key: "bloc", label: "Bloc" },
  { key: "type", label: "Type bien" },
  { key: "Prix", label: "Prix" },
  { key: "État", label: "État" },
];

const handleImportClick = () => {
    setShowImportModal(true)  // ouvrir la modale d'import
  }
  // Handle table row actions
  const handleAction = (action, id) => {
    switch (action) {
      case 'edit':
        router.push(`/Biens/${id}/modifier`);
        break;
      
      default:
        console.log(`Action ${action} for bien ${id}`);
    }
  };

  

  // Check user permissions for managing biens
  const canManageBiens = user?.role === 1 || user?.role === 2; // Superadmin or Admin
  
  // Create URL for add button with appropriate query params
  const addButtonUrl = canManageBiens 
    ? `/Biens/ajouter?projet=${projetId}${blocId ? `&bloc=${blocId}` : ''}${immeubleId ? `&immeuble=${immeubleId}` : ''}${trancheId ? `&tranche=${trancheId}` : ''}`
    : "";

  return (
    <div>
       <Box sx={{ display: 'flex', p: 2 }}>
<Box sx={{ width: 'auto', pr: 2,marginTop:3 }}>
  {types.length === 0 ? (
    <CircularProgress />
  ) : (
    <Paper>
      <Select
        value={activeTab}
        onChange={(e) => handleTypeClick(e.target.value)}
        size="small"
        sx={{ width: '120px', height: '32px', textAlign: 'center',
          backgroundColor: '#e0f7fa', // Couleur de fond
          color: '#00796b', // Couleur du texte
          border: '1px solid #00796b', // Bordure
          '&:hover': {
            backgroundColor: '#b2dfdb', // Couleur de fond au survol
          },


         }}
      >
        {types.map(({ id, type }) => (
          <MenuItem key={id} value={id}>
            {type}
          </MenuItem>
        ))}
      </Select>
    </Paper>
  )}
</Box>
<Box sx={{ width: '100%', pl: 3,mt:3 }}>
  {loadingType ? (
   'Chargement de données...'
  ) : stats?.length > 0 ? (
    <Statistiques data={stats} />
  ) : (
    "Aucune donnée disponible pour ce Projet."
  )}
</Box>
</Box>
    <Table 
      columns={columns}
      totalRows={totalRows}
      loading={loading}
      filterComponent={
        <BienFilter
          tempFilters={tempFilters}
          handleFilterChange={handleFilterChange}
          resetFilters={resetFilters}
          applyFilters={applyFilters}
          loading_T={loading}
          trancheId={trancheId}
          blocId={blocId}
          immeubleId={immeubleId}
        />
      }
      error={error}
      addLink={addButtonUrl}
      onSearchChange={handleSearchChange}
      currentPage={currentPage}
      rowsPerPage={rowsPerPage}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
      enableExport={formattedBiens.length > 0}
      onFilterToggle={handleFilterToggle}
      data_to_export={data_to_export()}
      columns_export={columns_export}
      name_file_export={"bien_export"}
      data={paginatedData}
      enableSearch={false}
      enableImport={true}
      onImportClick={handleImportClick}
    />
    {showDeleteModal && selectedId && (
      <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
        <DeleteData
          route={APIURL.BIENS}
          Id={selectedId}
          type="Bien"
          message={`Êtes-vous sûr de vouloir supprimer ce bien ?`
          }
          accessToken={accessToken}
          onClose={() => {
            setShowDeleteModal(false);
            loadData(); // Recharge les données après suppression

          }}
        />
      </Modal>
    )}
     <BienImport
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        projetId={projetId}
        trancheId={trancheId}
        blocId={blocId}
        immeubleId={immeubleId}
      />
  </div>
    
  );
}
