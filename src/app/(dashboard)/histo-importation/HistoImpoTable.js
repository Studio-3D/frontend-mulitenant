"use client";

import DeleteData from "@/components/DeleteData";
import Modal from "@/components/Modal";
import Table from "@/components/Table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { APIURL, ENDPOINTS, RESOURCE_URL } from "@/configs/api";
import { fetchData_table_by_projet } from "@/configs/api-utils";
import { isAdmin, isAgentAdministratif, isRespoLivraison, isSuperAdmin } from "@/configs/enum";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/Input";
import { useProjet } from "@/context/ProjetContext";
import ProjetDialog from "@/components/ProjetDialog";
import { format } from "date-fns";
import { Trash2, File, Eye, Download } from "lucide-react";
import SelectInput from "@/components/SelectInput";
import Link from "next/link";

const HistoImpoTable = () => {
  const [histoImportations, sethistoImportations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const accessToken = localStorage.getItem("accessToken");
  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem("accessToken");
  const router = useRouter();
  const [filters, setFilters] = useState({
    date: "",
    statut: "",
  });

  const [tempFilters, setTempFilters] = useState({ ...filters });
  const { selectedProjet, projets, fetchProjets } = useProjet();
  const [showProjetModal, setShowProjetModal] = useState(false);

  const entity = {
    API_URL: "histo_importation",
    dataKey: "data",
    name: "histo_importation",
    searchFields: ["nom"],
  };

 // Helper function to get line counts from message_echou JSON
const getLineCounts = (messageEchou, ligneEchou, dataLength) => {
  const defaultCounts = {
    totalLines: dataLength || 0,
    successLines: null,
    failedLines: ligneEchou !== null && ligneEchou !== undefined ? ligneEchou : null,
  };

  if (!messageEchou) return defaultCounts;

  try {
    // Check if messageEchou is a string that might be JSON
    if (typeof messageEchou === 'string') {
      // Check if it looks like JSON (starts with { or [)
      if (messageEchou.trim().startsWith('{') || messageEchou.trim().startsWith('[')) {
        const parsed = JSON.parse(messageEchou);
        return {
          totalLines: parsed.total_lignes || dataLength || 0,
          successLines: parsed.lignes_reussies !== undefined ? parsed.lignes_reussies : null,
          failedLines: parsed.lignes_echouees !== undefined ? parsed.lignes_echouees : (ligneEchou !== null ? ligneEchou : null),
        };
      } else {
        // It's a plain error message, not JSON
        console.warn('messageEchou is not valid JSON, using default values:', messageEchou);
        return defaultCounts;
      }
    } else if (typeof messageEchou === 'object') {
      // It's already an object
      return {
        totalLines: messageEchou.total_lignes || dataLength || 0,
        successLines: messageEchou.lignes_reussies !== undefined ? messageEchou.lignes_reussies : null,
        failedLines: messageEchou.lignes_echouees !== undefined ? messageEchou.lignes_echouees : (ligneEchou !== null ? ligneEchou : null),
      };
    }
    
    return defaultCounts;
  } catch (e) {
    console.error('Error parsing message_echou:', e);
    console.log('Raw messageEchou value:', messageEchou);
    return defaultCounts;
  }
};

  // Check if a project is selected
  useEffect(() => {
    if (!selectedProjet && !showProjetModal) {
      fetchProjets();
      setShowProjetModal(true);
    }
  }, [selectedProjet, showProjetModal, fetchProjets]);

  const statut = {
    0: { code: 0, label: 'En Attente', color: 'bg-gray-100 text-gray-800' },
    1: { code: 1, label: 'En Cours', color: 'bg-yellow-100 text-yellow-800' },
    2: { code: 2, label: 'Importé', color: 'bg-green-100 text-green-800' },
    3: { code: 3, label: 'Échoué', color: 'bg-red-100 text-red-800' },
  };

  const getStatutBadge = (statutValue) => {
    const info = statut[statutValue];
    if (!info) return null;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.color}`}>
        {info.label}
      </span>
    );
  };

  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters();
  };

  const handleFileClick = (file, type) => {
    let folderName;
    if (type == '1') {
      folderName = 'Edit_fichier_en_masse';
    } else if (type == '0') {
      folderName = 'Import_fichier';
    } else if (type == '2') {
      folderName = 'Edit_titre_foncier';
    } else if (type == '3') {
      folderName = 'Import_prospects';
    
    } else {
      folderName = 'Import_fichier';
    }

    window.open(
      `${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user.societe?.id}/${folderName}/${file}`,
      '_blank'
    );
  };

  useEffect(() => {
    fetchData_table_by_projet(
      entity,
      filters,
      searchTerm,
      currentPage,
      rowsPerPage,
      accesstoken,
      setLoading,
      setError,
      sethistoImportations,
      setTotalRows
    );
  }, [searchTerm, currentPage, rowsPerPage, accesstoken, filters, selectedProjet]);

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
  };

  const resetFilters = () => {
    const reset = {
      date: "",
      statut: "",
    };
    setFilters(reset);
    setTempFilters(reset);
  };

  const columns = [
    {
      key: 'date',
      label: 'Date',
      render: (row) => format(new Date(row.created_at), 'dd/MM/yyyy HH:mm'),
    },
    {
      key: 'fichier',
      label: 'Fichier',
      render: (row) => (
        <span
          className="text-sm hover:text-blue-600 cursor-pointer"
          onClick={() => handleFileClick(row.fichier, row.type)}
        >
          {row.fichier}
        </span>
      ),
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (row) => getStatutBadge(row.statut),
    },
   {
  key: 'ligne_total',
  label: 'Total Lignes',
  render: (row) => {
    const dataLength = row.data?.length || 0;
    const counts = getLineCounts(row.message_echou, row.ligne_echou, dataLength);
    return counts.totalLines !== null && counts.totalLines !== 0 ? counts.totalLines : '-';
  },
},
{
  key: 'ligne_reussie',
  label: 'Lignes Réussies',
  render: (row) => {
    const dataLength = row.data?.length || 0;
    const counts = getLineCounts(row.message_echou, row.ligne_echou, dataLength);
    
    // Calculate based on status and available data
    if (counts.successLines !== null && counts.successLines !== undefined) {
      return counts.successLines;
    }
    
    if (row.statut === 2 || row.statut === '2') {
      // Import successful - all lines processed
      return dataLength;
    }
    
    if ((row.statut === 3 || row.statut === '3') && counts.failedLines !== null) {
      // Failed import with known failed lines
      const successCount = counts.totalLines - counts.failedLines;
      return successCount >= 0 ? successCount : '-';
    }
    
    return '-';
  },
},
{
  key: 'ligne_echou',
  label: 'Lignes Échouées',
  render: (row) => {
    const dataLength = row.data?.length || 0;
    const counts = getLineCounts(row.message_echou, row.ligne_echou, dataLength);
    
    // Calculate based on status and available data
    if (counts.failedLines !== null && counts.failedLines !== undefined) {
      return counts.failedLines;
    }
    
    if (row.statut === 2 || row.statut === '2') {
      // Import successful - no failed lines
      return 0;
    }
    
    if (row.statut === 3 || row.statut === '3') {
      // Failed import - calculate based on data
      const ligneEchouee = row.ligne_echou ? Number(row.ligne_echou) : null;
      if (ligneEchouee && ligneEchouee > 0) {
        return dataLength - (ligneEchouee - 1);
      }
      return dataLength;
    }
    
    return '-';
  },
},
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2 items-center">
          <button
            title="Télécharger le fichier"
            onClick={() => handleFileClick(row.fichier, row.type)}
            className="text-blue-500 hover:text-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <Link
            href={`/histo-importation/${row.id}`}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
            title="Voir les détails"
          >
            <Eye className="w-4 h-4" />
          </Link>

          {row.statut == 0 && (isAdmin(user?.role) || isSuperAdmin(user?.role)|| isAgentAdministratif(user?.role) || isRespoLivraison(user?.role)) && (
            <button
              className="text-red-500 hover:text-red-700 transition-colors"
              onClick={() => {
                setSelectedId(row.id);
                setShowDeleteModal(true);
              }}
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const formatData = () => {
    return histoImportations.map(file => ({
      ...file,
      id: file.id,
      created_at: file.created_at,
      fichier: file.fichier,
      statut: file.statut,
    }));
  };

  const selectedhistoImportation = histoImportations.find((histoimportation) => histoimportation.id === selectedId);

  const handleProjectSelected = () => {
    setShowProjetModal(false);
    setCurrentPage(1);

    if (selectedProjet) {
      fetchData_table_by_projet(
        entity,
        filters,
        searchTerm,
        currentPage,
        rowsPerPage,
        accesstoken,
        setLoading,
        setError,
        sethistoImportations,
        setTotalRows
      );
    }
  };

  return (
    <>
      <ProjetDialog
        open={showProjetModal}
        onClose={() => setShowProjetModal(false)}
        projets={projets}
        onSelect={handleProjectSelected}
      />

      <div className="relative bg-white shadow-md rounded-lg px-4 py-4">
        <Table
          title={"Historique Imports"}
          name_file_export={"histoImportation_export"}
          columns={columns}
          onFilterToggle={handleFilterToggle}
          data={formatData()}
          filterComponent={
            <div className="space-y-4 p-4 rounded-lg">
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
              >
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    placeholder="Date"
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) => e.target.type = e.target.value ? "date" : "text"}
                    value={tempFilters.date}
                    onChange={(e) => handleFilterChange("date", e.target.value)}
                    className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                  />
                </div>

                <SelectInput
                  label={"Statut"}
                  name="statut"
                  placeholder="Sélectionnez un statut"
                  options={[
                    { label: 'En Attente', value: '0' },
                    { label: 'En Cours', value: '1' },
                    { label: 'Importé', value: '2' },
                    { label: 'Échoué', value: '3' }
                  ]}
                  value={tempFilters.statut}
                  onChange={(value) => handleFilterChange('statut', value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
                >
                  Réinitialiser
                </button>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Appliquer les filtres
                </button>
              </div>
            </div>
          }
          totalRows={totalRows}
          loading={loading}
          error={error}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          onSearchChange={setSearchTerm}
          showSearch={false}
        />
      </div>

      {showDeleteModal && selectedId && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.HISTOIMPORTATION}
            Id={selectedId}
            type="HistoImportation"
            message={
              selectedhistoImportation && selectedhistoImportation.reclamations && selectedhistoImportation.reclamations.length > 0
                ? `Attention : la suppression de cet historique entraînera également la suppression de tous les réclamations associés. Êtes-vous sûr de vouloir le supprimer ?`
                : `Êtes-vous sûr de vouloir supprimer cet fichier à importer ?`
            }
            accessToken={accesstoken}
            onClose={() => {
              setShowDeleteModal(false);
              fetchData_table_by_projet(
                entity,
                filters,
                searchTerm,
                currentPage,
                rowsPerPage,
                accesstoken,
                setLoading,
                setError,
                sethistoImportations,
                setTotalRows
              );
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default HistoImpoTable;