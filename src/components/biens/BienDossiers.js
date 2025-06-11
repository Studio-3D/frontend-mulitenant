"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { APIURL } from "@/configs/api";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { Eye, ChevronDown, ChevronRight, Download } from "lucide-react";
import Table from "@/components/Table";
import { handleExportExcel } from "@/configs/export";
import { useRouter } from 'next/navigation';

export default function BienDossiers({ bienId }) {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const router = useRouter();
  
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
          setDossiers(response.data.data || []);
          setTotalRows(response.data.pagination?.totalItems || response.data.data.length || 0);
        } else {
          setDossiers([]);
          setTotalRows(0);
        }
      } catch (err) {
        console.error("Error fetching dossiers:", err);
        setError("Impossible de charger les dossiers");
        setDossiers([]);
        setTotalRows(0);
      } finally {
        setLoading(false);
      }
    };

    fetchDossiers();
  }, [bienId, currentPage, rowsPerPage, searchTerm]);
  
  // Helper functions to format data
  const getTypeDst = (typeId) => {
    if (!typeId || !typesDesistements[typeId]) return { title: "N/A", color: "default" };
    let color = '';
    if (typeId == 1) color = 'success';
    else if (typeId == 2) color = 'primary';
    else if (typeId == 3) color = 'info';
    return { title: toTitleCase(typesDesistements[typeId]), color };
  };

  const getTypeDstDp = (typeDpId) => {
    if (!typeDpId || !typesDesistementsProfit[typeDpId]) return { title: "N/A", color: "default" };
    let color = '';
    if (typeDpId == 1) color = 'success';
    else if (typeDpId == 2) color = 'primary';
    else if (typeDpId == 3) color = 'info';
    return { title: toTitleCase(typesDesistementsProfit[typeDpId]), color };
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

  // Check if a dossier has desistement details
  const hasDesistementDetails = (row) => {
    return row.histo?.desistement || 
           (row.desisteurs && Object.keys(row.desisteurs).length > 0) || 
           (row.au_profits && Object.keys(row.au_profits).length > 0) ||
           (row.new_aquereur_desistement && Object.keys(row.new_aquereur_desistement).length > 0);
  };

  // Toggle expanded row
  const toggleRowExpanded = (rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (perPage) => {
    setRowsPerPage(perPage);
    setCurrentPage(1);
  };

  // Handle search
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };
  const columns = [
    {
      key: "expandToggle",
      label: "",
      render: (row, idx) => {
        if (hasDesistementDetails(row)) {
          return (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleRowExpanded(row.id || idx);
              }}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              {expandedRows[row.id || idx] ? 
                <ChevronDown className="w-5 h-5 text-gray-600" /> : 
                <ChevronRight className="w-5 h-5 text-gray-600" />
              }
            </button>
          );
        }
        return null;
      }
    },
    {
      key: "date",
      label: "Date",
      render: (row) => row.histo?.date ? format(new Date(row.histo.date), "dd/MM/yyyy HH:mm") : "N/A"
    },
    {
      key: "cc",
      label: "CC",
      render: (row) => {
        if (row.histo?.reservation_id) {
          return `${row.histo?.reservation?.user?.name || ''} ${row.histo?.reservation?.user?.prenom || ''}`.trim() || "N/A";
        } else {
          return `${row.histo?.desistement?.user?.name || ''} ${row.histo?.desistement?.user?.prenom || ''}`.trim() || "N/A";
        }
      }
    },
    {
      key: "code",
      label: "Code",
      render: (row) => row.histo?.reservation?.code_reservation || "N/A"
    },
    {
      key: "acquereurs_ancien",
      label: "Acquéreurs",
      render: (row) => {
        if (row.histo?.reservation) {
          const acquereurs = row.histo.reservation.aquereurs_ancien?.length > 0 
            ? row.histo.reservation.aquereurs_ancien 
            : row.histo.reservation.aquereurs || [];
          
          return acquereurs.map((acq) => 
            `${acq.client?.nom || ''} ${acq.client?.prenom || ''} (${acq.pourcentage}%)`
          ).join(", ") || "N/A";
        } else if (row.histo?.desistement?.reservation_ancien?.aquereurs_ancien) {
          return Object.values(row.histo.desistement.reservation_ancien.aquereurs_ancien).map((acq) => 
            `${acq.client?.nom || ''} ${acq.client?.prenom || ''} (${acq.pourcentage}%)`
          ).join(", ");
        }
        return "N/A";
      }
    },
    {
      key: "ancien_bien",
      label: "Bien",
      render: (row) => {
        if (row.histo?.reservation_id) {
          return row.histo.reservation.bien?.propriete_dite_bien || "N/A";
        } else {
          return row.histo?.desistement?.bien_ancien?.propriete_dite_bien || "N/A";
        }
      }
    },
    {
      key: "montant_encaisse",
      label: "Montant Encaissé",
      render: (row) => {
        if (row.histo?.reservation) {
          const montant = row.sum_avances || row.histo.reservation?.avances_sum_montant;
          if (montant) return `${montant.toLocaleString()} DH`;
        }
        return "N/A";
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
            className="inline-flex items-center justify-center w-8 h-8 rounded-full !text-blue-600 hover:bg-blue-100 transition-colors duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye size={16} />
          </a>
        );
      }
    }
  ];

  // Define desistement table columns for the nested table
  const desistementColumns = [
    {
      key: "type_desistement",
      label: "Type Désistement",
      render: (row) => {
        if (row.histo?.desistement?.type) {
          const typeInfo = row.histo.desistement.type != 2 ? 
            getTypeDst(row.histo.desistement.type) : 
            getTypeDstDp(row.histo.desistement.type_dp);
          
          const colorClass = typeInfo.color === 'success' ? 'bg-green-100 text-green-800' :
                            typeInfo.color === 'primary' ? 'bg-blue-100 text-blue-800' :
                            typeInfo.color === 'info' ? 'bg-cyan-100 text-cyan-800' :
                            'bg-gray-100 text-gray-800';
          
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
              {typeInfo.title}
            </span>
          );
        }
        return "N/A";
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
      key: "desisteurs",
      label: "Désisteurs",
      render: (row) => {
        if (row.desisteurs && Object.keys(row.desisteurs).length > 0) {
          return (
            <div>
              {Object.values(row.desisteurs).map((desisteur, idx) => (
                <div key={idx} className="mb-1">
                  <span className="font-medium">{desisteur.client_nom || ''} {desisteur.client_prenom || ''}</span>
                  <span className="text-red-600 ml-2">({desisteur.client_percent}%)</span>
                </div>
              ))}
            </div>
          );
        }
        return "N/A";
      }
    },
    {
      key: "au_profit",
      label: "Au Profit",
      render: (row) => {
        if (row.au_profits && Object.keys(row.au_profits).length > 0) {
          return (
            <div>
              {Object.values(row.au_profits).map((profit, idx) => (
                <div key={idx} className="mb-1">
                  <span className="font-medium">{profit.client_nom || ''} {profit.client_prenom || ''}</span>
                  <span className="text-green-600 ml-2">({profit.client_percent}%)</span>
                </div>
              ))}
            </div>
          );
        }
        return "N/A";
      }
    },
    {
      key: "nouveau_acquereurs",
      label: "Nouveau Acquéreurs",
      render: (row) => {
        if (row.new_aquereur_desistement && Object.keys(row.new_aquereur_desistement).length > 0) {
          return (
            <div>
              {Object.values(row.new_aquereur_desistement).map((acq, idx) => (
                <div key={idx} className="mb-1">
                  <span className="font-medium">{acq.nv_client_nom || ''} {acq.nv_client_prenom || ''}</span>
                  <span className="text-green-600 ml-2">({acq.nv_client_percent}%)</span>
                </div>
              ))}
            </div>
          );
        }
        return "N/A";
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
        if (row.histo?.desistement?.montant_a_ajouter) {
          return `${row.histo.desistement.montant_a_ajouter.toLocaleString()} DH`;
        }
        return "N/A";
      }
    },
    {
      key: "penalite",
      label: "Pénalité",
      render: (row) => {
        if (row.penalite_montant) {
          return `${row.penalite_montant.toLocaleString()} DH`;
        }
        return "N/A";
      }
    }
  ];

  // Export columns configuration - now includes both main and desistement columns
  const columnsExport = [
    { key: "date", label: "Date" },
    { key: "cc", label: "CC" },
    { key: "code", label: "Code" },
    { key: "acquereurs_ancien", label: "Acquéreurs" },
    { key: "ancien_bien", label: "Bien" },
    { key: "montant_encaisse", label: "Montant Encaissé" },
    { key: "type_desistement", label: "Type Désistement" },
    { key: "motif", label: "Motif" },
    { key: "lien_parente", label: "Lien de Parenté" },
    { key: "desisteurs", label: "Désisteurs" },
    { key: "au_profit", label: "Au Profit" },
    { key: "nouveau_acquereurs", label: "Nouveau Acquéreurs" },
    { key: "nouveau_bien", label: "Nouveau Bien" },
    { key: "montant_ajouter", label: "Montant à ajouter" },
    { key: "penalite", label: "Pénalité" }
  ];

  // Create exportable data - combine main and desistement columns
  const exportData = dossiers.map(dossier => {
    let row = {};
    
    // Add main columns data
    columns.forEach(col => {
      if (col.key !== 'actions' && col.key !== 'expandToggle' && col.render) {
        const rendered = col.render(dossier);
        row[col.key] = typeof rendered === 'string' ? rendered : 
                      rendered?.props?.children || 'N/A';
      }
    });
    
    // Add desistement columns data
    desistementColumns.forEach(col => {
      if (col.render) {
        const rendered = col.render(dossier);
        row[col.key] = typeof rendered === 'string' ? rendered : 
                      rendered?.props?.children || 'N/A';
      }
    });
    
    return row;
  });

  // Handle export functionality
  const handleExport = () => {
    handleExportExcel(
      exportData,
      columnsExport,
      'dossiers_bien.xlsx'
    );
  };

  // Render the expanded row with optimized nested table
  const renderExpandedRow = (row, idx) => {
    const rowId = row.id || idx;
    
    if (!expandedRows[rowId] || !hasDesistementDetails(row)) {
      return null;
    }

    // Create single row data for the nested table
    const desistementData = [row];

    return (
      <div className="bg-gray-50 py-3 px-4">
        <h4 className="font-medium text-gray-700 mb-2 text-sm">Détails du désistement</h4>
        
        {/* Nested Table component for desistement details - optimized for space */}
        <div className="overflow-x-auto">
          <Table
            data={desistementData}
            columns={desistementColumns}
            showPagination={false}
            showSearch={false}
            loading={false}
            emptyMessage="Aucun détail de désistement"
          />
        </div>
      </div>
    );
  };

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
        
        {/* Actions row */}
        <div className="flex justify-end gap-2 mt-4">
          {dossiers.length > 0 && (
            <button
              onClick={handleExport}
              className="flex gap-1 items-center bg-[#009FFF] text-white font-medium rounded-lg px-3 py-1.5"
            >
              <Download className="w-5 h-5" />
              <span>Exporter</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <Table 
          title=""
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
          enableExport={false} // We handle export manually now
          renderExpandedRow={renderExpandedRow}
          onRowClick={(row, idx) => {
            if (hasDesistementDetails(row)) {
              toggleRowExpanded(row.id || idx);
            }
          }}
          rowClassName={(row) => hasDesistementDetails(row) ? "cursor-pointer" : ""}
          expandedRows={expandedRows}
        />
      </div>
    </div>
  );
}
