"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { APIURL } from "@/configs/api";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { ExternalLink, Eye } from "lucide-react";
import Table from "@/components/Table";

export default function BienEncaissements({ bienId }) {
  const [encaissements, setEncaissements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [projetId, setProjetId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // First, get the bien details to determine the projet_id
    const fetchBienForProject = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const bienResponse = await axios.get(`${APIURL.BIENS}/${bienId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (bienResponse.data && bienResponse.data.bien) {
          setProjetId(bienResponse.data.bien.projet_id);
        }
      } catch (err) {
        console.error("Error fetching bien details:", err);
        setError("Impossible de déterminer le projet pour ce bien");
        setLoading(false);
      }
    };

    if (bienId) {
      fetchBienForProject();
    }
  }, [bienId]);

  // Once we have the project ID, fetch the encaissements
  useEffect(() => {
    const fetchEncaissements = async () => {
      if (!projetId) return;
      
      try {
        const token = localStorage.getItem("accessToken");
        // Use the correct URL format with projet_id
        const response = await axios.get(`${APIURL.ROOTV1}/projets/${projetId}/encaissements/`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { 
            page: currentPage, 
            size: rowsPerPage, 
            bien_id: bienId,
            search: searchTerm
          }
        });

        if (response.data) {
          setEncaissements(response.data.data || []);
          setTotalRows(response.data.pagination?.totalItems || 0);
        } else {
          setEncaissements([]);
          setTotalRows(0);
        }
      } catch (err) {
        console.error("Error fetching encaissements:", err);
        setError("Impossible de charger les encaissements");
        setEncaissements([]);
        setTotalRows(0);
      } finally {
        setLoading(false);
      }
    };

    fetchEncaissements();
  }, [projetId, bienId, currentPage, rowsPerPage, searchTerm]);

  // Helper to get badge color based on type
  const getTypeColor = (type) => {
    switch (type) {
      case '1': return "bg-green-100 !text-green-800"; // Avances
      case '2': return "bg-red-100 !text-red-800"; // Restitution
      case '3': return "bg-red-100 !text-red-800"; // Remboursement
      case '4': return "bg-purple-100 text-purple-800"; // Décharge Reliquat
      case '5': return "bg-blue-100 !text-blue-800"; // Déblocage Crédit
      case '6': return "bg-yellow-100 !text-yellow-800"; // Pénalité
      default: return "bg-gray-100 !text-gray-800";
    }
  };

  // Helper to get type name
  const getTypeName = (type) => {
    switch (type) {
      case '1': return "Avance";
      case '2': return "Restitution";
      case '3': return "Remboursement";
      case '4': return "Décharge Reliquat";
      case '5': return "Déblocage Crédit";
      case '6': return "Pénalité";
      default: return "Inconnu";
    }
  };

  // Define columns for the Table component
  const columns = [
    {
      key: "code_reservation",
      label: "Code réservation",
      render: (row) => row.reservations?.code_reservation || 'N/A'
    },
    {
      key: "client",
      label: "Client",
      render: (row) => {
        if (!row.reservations || !row.reservations.aquereurs) {
          return 'N/A';
        }
        return row.reservations.aquereurs.map((acq, i) => (
          <div key={i} className="mb-1">
            {acq.client?.nom} {acq.client?.prenom} 
            <span className="text-blue-500 text-xs ml-1">({acq.pourcentage}%)</span>
          </div>
        )).reduce((prev, curr) => [prev, <br key={`br-${Math.random()}`}/>, curr], []);
      }
    },
    {
      key: "type",
      label: "Type encaissement",
      render: (row) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getTypeColor(row.type_encaissement)}`}>
          {getTypeName(row.type_encaissement)}
        </span>
      )
    },
    {
      key: "montant",
      label: "Montant",
      render: (row) => (
        <span className={`font-semibold ${['1','4','5','6'].includes(row.type_encaissement) ? 'text-green-600' : 'text-red-600'}`}>
          {['1','4','5','6'].includes(row.type_encaissement) ? '+' : '-'} 
          {row.montant?.toLocaleString()} DH
        </span>
      )
    },
    {
      key: "num_remise",
      label: "N° remise",
      render: (row) => {
        if (row.type_encaissement === '1' && row.avance?.last_statut)
          return row.avance.last_statut.num_remise;
        if (row.type_encaissement === '6' && row.penalite?.last_statut)
          return row.penalite.last_statut.num_remise;
        return 'N/A';
      }
    },
    {
      key: "date_encaissement",
      label: "Date encaissement",
      render: (row) => format(new Date(row.date_encaissement), "dd/MM/yyyy")
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <a 
          href={`/reservations/show/${row.reservation_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-8 h-8 rounded-full !text-blue-600 hover:bg-blue-100 transition-colors duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <Eye size={16} />
        </a>
      )
    }
  ];

  // Export columns definition
  const columnsExport = [
    { key: "reservations.code_reservation", label: "Code réservation" },
    { key: "client", label: "Client" },
    { key: "type_encaissement", label: "Type encaissement" },
    { key: "montant", label: "Montant" },
    { key: "num_remise", label: "N° remise" },
    { key: "date_encaissement", label: "Date encaissement" }
  ];

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
        <h2 className="text-lg font-medium">Encaissements</h2>
      </div>
      
      <div className="p-6">
        <Table 
          title=""
          data={encaissements}
          columns={columns}
          totalRows={totalRows}
          loading={loading}
          emptyMessage="Aucun encaissement trouvé pour ce bien."
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onSearchChange={handleSearchChange}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          enableExport={encaissements.length > 0}
          name_file_export="encaissements"
          data_to_export={encaissements}
          columns_export={columnsExport}
        />
      </div>

      {encaissements.length > 0 && (
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end">
            <div className="bg-gray-50 px-3 py-2 rounded-md">
              <p className="text-sm font-medium !text-gray-900">
                Total: {encaissements
                  .reduce((acc, curr) => {
                    const amount = curr.montant || 0;
                    if (['1','4','5','6'].includes(curr.type_encaissement)) {
                      return acc + amount;
                    } else {
                      return acc - amount;
                    }
                  }, 0)
                  .toLocaleString()} DH
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
