"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { APIURL } from "@/configs/api";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { ExternalLink, Receipt, Info } from "lucide-react";
import Table from "@/components/Table";

export default function BienTvaCollecte({ bienId, bien }) {
  const [tvaCollectes, setTvaCollectes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ancien, setAncien] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const [projetId, setProjetId] = useState(null);
  
  // State for TVA summary information
  const [tvaSummary, setTvaSummary] = useState({
    prix_ttc: 0,
    qp_terrain_valeur: 0,
    tva: 0,
    tva_declaree: 0,
    tva_reste: 0
  });

  useEffect(() => {
    // First, get the bien details to determine the projet_id and TVA info
    const fetchBienForProject = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const bienResponse = await axios.get(`${APIURL.BIENS}/${bienId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (bienResponse.data && bienResponse.data.bien) {
          setProjetId(bienResponse.data.bien.projet_id);
          
          const bienData = bienResponse.data.bien;
          
          // Determine which type of TVA collectes to fetch
          if (bienData.tva_collectes && bienData.tva_collectes.length > 0) {
            setAncien(0);
          } else if (bienData.tva_collectes_ancien_reservation && bienData.tva_collectes_ancien_reservation.length > 0) {
            setAncien(1);
          } else {
            setAncien(0); // Default to 0 if no info is available
          }
          
          // Set TVA summary information
          setTvaSummary({
            prix_ttc: bienData.bien_tva?.prix_ttc || 0,
            qp_terrain_valeur: bienData.bien_tva?.qp_terrain_valeur || 0,
            tva: bienData.bien_tva?.tva || 0,
            tva_declaree: bienData.tva_collectes_sum_tva_a_payer || 0,
            tva_reste: (bienData.bien_tva?.tva || 0) - (bienData.tva_collectes_sum_tva_a_payer || 0)
          });
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

  // Once we have the project ID, fetch the TVA collectes
  useEffect(() => {
    const fetchTvaDetails = async () => {
      if (!projetId || ancien === null) return;
      
      try {
        const token = localStorage.getItem("accessToken");
        
        // Use the correct URL format with projet_id
        const tvaResponse = await axios.get(`${APIURL.ROOTV1}/projets/${projetId}/get_tva_collecte_par_bien/`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { 
            page: currentPage, 
            size: rowsPerPage, 
            bien_id: bienId,
            ancien: ancien,
            search: searchTerm
          }
        });
        
        if (tvaResponse.data) {
          setTvaCollectes(tvaResponse.data.data || []);
          setTotalRows(tvaResponse.data.pagination?.totalItems || 0);
        } else {
          setTvaCollectes([]);
          setTotalRows(0);
        }
      } catch (err) {
        console.error("Error fetching TVA collectes:", err);
        setError("Impossible de charger les données TVA");
      } finally {
        setLoading(false);
      }
    };

    fetchTvaDetails();
  }, [projetId, bienId, ancien, currentPage, rowsPerPage, searchTerm]);

  // Define columns for the Table component
  const columns = [
    {
      key: "date",
      label: "Date",
      render: (row) => row.encaissement?.date_encaissement && format(new Date(row.encaissement.date_encaissement), "dd/MM/yyyy")
    },
    {
      key: "encaissement",
      label: "Encaissement",
      render: (row) => (
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            ['1','4','5','6'].includes(row.encaissement?.type_encaissement) 
              ? 'bg-green-100 !text-green-800' 
              : 'bg-red-100 !text-red-800'
          }`}>
            {row.encaissement?.montant?.toLocaleString()} DH
          </span>
        </div>
      )
    },
    {
      key: "avance_terrain",
      label: "Avance terrain",
      render: (row) => `${parseFloat(row.avance_terrain || 0).toLocaleString()} DH`
    },
    {
      key: "avance_bien_ttc",
      label: "Avance bien TTC",
      render: (row) => `${parseFloat(row.avance_bien_ttc || 0).toLocaleString()} DH`
    },
    {
      key: "avance_bien_ht",
      label: "Avance bien HT",
      render: (row) => `${parseFloat(row.avance_bien_ht || 0).toLocaleString()} DH`
    },
    {
      key: "tva_a_payer",
      label: "TVA à déclarer",
      render: (row) => (
        <span className="font-medium !text-blue-600">
          {parseFloat(row.tva_a_payer || 0).toLocaleString()} DH
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <a 
          href={`/reservations/show/${row.reservation_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <ExternalLink size={14} />
        </a>
      )
    }
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

  // Export columns definition
  const columnsExport = [
    { key: "encaissement.date_encaissement", label: "Date" },
    { key: "encaissement.montant", label: "Encaissement" },
    { key: "avance_terrain", label: "Avance terrain" },
    { key: "avance_bien_ttc", label: "Avance bien TTC" },
    { key: "avance_bien_ht", label: "Avance bien HT" },
    { key: "tva_a_payer", label: "TVA à déclarer" }
  ];

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md !text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <Info className="text-blue-500 w-5 h-5" />
              Informations TVA
            </h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <p className="text-sm !text-gray-500 mb-1">Prix vente TTC</p>
              <p className="font-medium">{tvaSummary.prix_ttc.toLocaleString()} DH</p>
            </div>
            
            <div>
              <p className="text-sm !text-gray-500 mb-1">% TVA appliqué</p>
              <p className="font-medium">20%</p>
            </div>
            
            <div>
              <p className="text-sm !text-gray-500 mb-1">QP terrain en valeur</p>
              <p className="font-medium">{tvaSummary.qp_terrain_valeur.toLocaleString()} DH</p>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm !text-blue-600 font-medium mb-1">TVA globale</p>
              <p className="font-bold !text-blue-600">{tvaSummary.tva.toLocaleString()} DH</p>
            </div>
            
            <div>
              <p className="text-sm !text-green-600 font-medium mb-1">Cumul TVA déclarée</p>
              <p className="font-bold !text-green-600">{tvaSummary.tva_declaree.toLocaleString()} DH</p>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm !text-red-600 font-medium mb-1">TVA reste à déclarer</p>
              <p className="font-bold !text-red-600">{tvaSummary.tva_reste.toLocaleString()} DH</p>
            </div>
          </div>
        </div>
      </div>

      <div className="md:col-span-2">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <Receipt className="text-blue-500 w-5 h-5" />
              {ancien === 0 || ancien === null ? 'TVA collectée' : 'Ancienne TVA collectée'}
            </h2>
          </div>

          <div className="p-6">
            <Table 
              title=""
              showSearch={false}
              data={tvaCollectes}
              columns={columns}
              totalRows={totalRows}
              loading={loading}
              emptyMessage="Aucune TVA collectée pour ce bien."
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onSearchChange={handleSearchChange}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              enableExport={tvaCollectes.length > 0}
              name_file_export="tva_collecte"
              data_to_export={tvaCollectes}
              columns_export={columnsExport}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
