"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { APIURL } from "@/configs/api";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { ExternalLink } from "lucide-react";
import Table from "@/components/Table";

export default function BienDossiers({ bienId }) {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Types and helper functions for formatting data
  const [typesDesistements, setTypesDesistements] = useState({});
  const [typesDesistementsProfit, setTypesDesistementsProfit] = useState({});
  const [motifsDesistements, setMotifsDesistements] = useState({});
  const [liensParentes, setLiensParentes] = useState({});
  
  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`http://127.0.0.1:8000/api/Enums_desistements`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
          setTypesDesistements(response.data.type_desistements || {});
          setTypesDesistementsProfit(response.data.type_desistements_profit || {});
          setMotifsDesistements(response.data.motif_desistements || {});
          setLiensParentes(response.data.lien_parentes || {});
        }
      } catch (err) {
        console.error("Error fetching enums:", err);
      }
    };
    
    fetchEnums();
  }, []);

  useEffect(() => {
    const fetchDossiers = async () => {
      if (!bienId) {
        setLoading(false);
        return;
      }
      
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${APIURL.ROOTV1}/get_dossiers_by_bien/${bienId}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: currentPage,
            size: rowsPerPage,
            search: searchTerm
          }
        });

        if (response.data && response.data.data) {
          setDossiers(response.data.data);
          setTotalRows(response.data.pagination?.totalItems || response.data.data.length);
        } else {
          setDossiers([]);
          setTotalRows(0);
        }
      } catch (err) {
        console.error("Error fetching dossiers:", err);
        setError("Impossible de charger les dossiers");
      } finally {
        setLoading(false);
      }
    };

    fetchDossiers();
  }, [bienId, currentPage, rowsPerPage, searchTerm]);

  // Helper functions to format data
  const getTypeDst = (typeId) => {
    if (!typeId || !typesDesistements[typeId]) return "N/A";
    return toTitleCase(typesDesistements[typeId]);
  };

  const getTypeDstDp = (typeDpId) => {
    if (!typeDpId || !typesDesistementsProfit[typeDpId]) return "N/A";
    return toTitleCase(typesDesistementsProfit[typeDpId]);
  };

  const getMotifTxt = (motifId) => {
    if (!motifId || !motifsDesistements[motifId]) return "N/A";
    return toTitleCase(motifsDesistements[motifId]);
  };

  const getLienParente = (lienId) => {
    if (!lienId || !liensParentes[lienId]) return "N/A";
    return toTitleCase(liensParentes[lienId]);
  };

  const toTitleCase = (str) => {
    if (!str) return '';
    const lcStr = str.replace(/_/g, ' ').toLowerCase();
    return lcStr.replace(/(?:^|\s)\w/g, function (match) {
      return match.toUpperCase();
    });
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (perPage) => {
    setRowsPerPage(perPage);
    setCurrentPage(1); // Reset to first page
  };

  // Handle search
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page
  };

  // Define columns for the Table component
  const columns = [
    {
      key: "date",
      label: "Date",
      render: (row) => row.histo?.date && format(new Date(row.histo.date), "dd/MM/yyyy HH:mm")
    },
    {
      key: "cc",
      label: "CC",
      render: (row) => {
        if (row.histo?.reservation_id) {
          return row.histo?.reservation?.user?.name + ' ' + row.histo?.reservation?.user?.prenom || "N/A";
        } else {
          return row.histo?.desistement?.user?.name + ' ' + row.histo?.desistement?.user?.prenom || "N/A";
        }
      }
    },
    {
      key: "code",
      label: "Code",
      render: (row) => row.histo?.reservation?.code_reservation || "N/A"
    },
    {
      key: "type_desistement",
      label: "Type Désistement",
      render: (row) => {
        if (!row.histo?.desistement) return "N/A";
        
        if (row.histo.desistement.type != 2) {
          return getTypeDst(row.histo.desistement.type);
        } else {
          return getTypeDstDp(row.histo.desistement.type_dp);
        }
      }
    },
    {
      key: "motif",
      label: "Motif",
      render: (row) => row.histo?.desistement ? getMotifTxt(row.histo.desistement.motif) : "N/A"
    },
    {
      key: "lien_parente",
      label: "Lien de Parenté",
      render: (row) => row.histo?.desistement ? getLienParente(row.histo.desistement.lien_parente) : "N/A"
    },
    {
      key: "acquereurs",
      label: "Ancien Aquéreurs/Aquéreurs",
      render: (row) => {
        if (row.histo?.reservation) {
          if (row.histo.reservation.aquereurs_ancien && row.histo.reservation.aquereurs_ancien.length > 0) {
            return row.histo.reservation.aquereurs_ancien.map((acq) => 
              `${acq.client?.nom || ''} ${acq.client?.prenom || ''} (${acq.pourcentage}%)`
            ).join(", ");
          } else if (row.histo.reservation.aquereurs) {
            return row.histo.reservation.aquereurs.map((acq) => 
              `${acq.client?.nom || ''} ${acq.client?.prenom || ''} (${acq.pourcentage}%)`
            ).join(", ");
          }
        } else if (row.histo?.desistement?.reservation_ancien?.aquereurs_ancien) {
          return Object.values(row.histo.desistement.reservation_ancien.aquereurs_ancien).map((acq) => 
            `${acq.client?.nom || ''} ${acq.client?.prenom || ''} (${acq.pourcentage}%)`
          ).join(", ");
        }
        return "N/A";
      }
    },
    {
      key: "desisteurs",
      label: "Désisteurs",
      render: (row) => {
        if (!row.desisteurs) return "N/A";
        return Object.values(row.desisteurs).map((desisteur) => 
          `${desisteur.client_nom || ''} ${desisteur.client_prenom || ''} (${desisteur.client_percent}%)`
        ).join(", ");
      }
    },
    {
      key: "au_profit",
      label: "Au Profit",
      render: (row) => {
        if (!row.au_profits) return "N/A";
        return Object.values(row.au_profits).map((profit) => 
          `${profit.client_nom || ''} ${profit.client_prenom || ''} (${profit.client_percent}%)`
        ).join(", ");
      }
    },
    {
      key: "nouveau_acquereurs",
      label: "Nouveau Aquéreurs",
      render: (row) => {
        if (!row.new_aquereur_desistement) return "N/A";
        return Object.values(row.new_aquereur_desistement).map((acq) => 
          `${acq.nv_client_nom || ''} ${acq.nv_client_prenom || ''} (${acq.nv_client_percent}%)`
        ).join(", ");
      }
    },
    {
      key: "bien",
      label: "Ancien Bien/Bien",
      render: (row) => {
        if (row.histo?.reservation_id) {
          return row.histo.reservation.bien?.propriete_dite_bien || "N/A";
        } else {
          return row.histo?.desistement?.bien_ancien?.propriete_dite_bien || "N/A";
        }
      }
    },
    {
      key: "nouveau_bien",
      label: "Nouveau Bien",
      render: (row) => row.bien_new_propriete || "N/A"
    },
    {
      key: "montant_ajouter",
      label: "Montant à ajouter",
      render: (row) => {
        if (!row.histo?.desistement?.montant_a_ajouter) return "N/A";
        return `${row.histo.desistement.montant_a_ajouter.toLocaleString()} DH`;
      }
    },
    {
      key: "penalite",
      label: "Pénalité",
      render: (row) => {
        if (!row.penalite_montant) return "N/A";
        return `${row.penalite_montant.toLocaleString()} DH`;
      }
    },
    {
      key: "montant_encaisse",
      label: "Montant Encaissé",
      render: (row) => {
        let montant = null;
        if (row.histo?.reservation) {
          montant = row.sum_avances || row.histo.reservation?.avances_sum_montant;
        }
        if (!montant) return "N/A";
        return `${montant.toLocaleString()} DH`;
      }
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => {
        if (!row.histo?.reservation_id) return null;
        return (
          <a 
            href={`/reservations/show/${row.histo.reservation_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <ExternalLink size={14} />
          </a>
        );
      }
    }
  ];

  // Export columns configuration
  const columnsExport = [
    { key: "date", label: "Date" },
    { key: "cc", label: "CC" },
    { key: "code", label: "Code Réservation" },
    { key: "type_desistement", label: "Type Désistement" },
    { key: "motif", label: "Motif" },
    { key: "lien_parente", label: "Lien de Parenté" },
    { key: "acquereurs", label: "Acquereurs" },
    { key: "desisteurs", label: "Désisteurs" },
    { key: "au_profit", label: "Au Profit" },
    { key: "nouveau_acquereurs", label: "Nouveaux Acquereurs" },
    { key: "bien", label: "Bien" },
    { key: "nouveau_bien", label: "Nouveau Bien" },
    { key: "montant_ajouter", label: "Montant à Ajouter" },
    { key: "penalite", label: "Pénalité" },
    { key: "montant_encaisse", label: "Montant Encaissé" }
  ];

  // Create exportable data for the Table component
  const exportData = dossiers.map(dossier => {
    let row = {};
    columns.forEach(col => {
      if (col.key !== 'actions' && col.render) {
        row[col.key] = col.render(dossier);
      }
    });
    return row;
  });

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md !text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-medium">Historique des dossiers</h2>
      </div>
      
      <div className="p-6">
        <Table 
          data={dossiers}
          columns={columns}
          totalRows={totalRows}
          loading={loading}
          emptyMessage="Aucun dossier trouvé pour ce bien."
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onSearchChange={handleSearchChange}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          enableExport={dossiers.length > 0}
          name_file_export="dossiers_bien"
          data_to_export={exportData}
          columns_export={columnsExport}
        />
      </div>
    </div>
  );
}
