import { useState, useEffect, useMemo } from 'react';
import Table from '@/components/Table';
import * as XLSX from 'xlsx';
import { Eye, Edit, Trash2 } from "lucide-react";
import { format } from 'date-fns';
import Input from "@/components/Input";

const ObjectifTable = ({ 
  data = [], 
  loading = false, 
  onAction,onFilterSubmit ,
  
  canAddObjectifs = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [tempFilters, setTempFilters] = useState({date: "",commercial:"" }); // les champs que l'utilisateur tape
  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    onFilterSubmit && onFilterSubmit(tempFilters); 
  };
  
  const resetFilters = () => {
    const reset = { date: "",commercial:""  };
    setTempFilters(reset);
    onFilterSubmit && onFilterSubmit(reset); 
  };
  // Filter data based on search term
  const filteredData = data.filter(item => {
    const userName = item.user ? `${item.user.name} ${item.user.prenom}`.toLowerCase() : '';
    const date = item.created_at ? format(new Date(item.created_at), 'dd/MM/yyyy').toLowerCase() : '';
    return searchTerm === '' || 
           userName.includes(searchTerm.toLowerCase()) ||
           date.includes(searchTerm.toLowerCase());
  });

  // Apply sorting
  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        // Handle sorting based on field type
        if (sortConfig.key === 'date') {
          const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
          const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
          return sortConfig.direction === 'asc' 
            ? dateA - dateB 
            : dateB - dateA;
        } else if (sortConfig.key === 'user') {
          const nameA = a.user ? `${a.user.name} ${a.user.prenom}`.toLowerCase() : '';
          const nameB = b.user ? `${b.user.name} ${b.user.prenom}`.toLowerCase() : '';
          return sortConfig.direction === 'asc'
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        } else {
          // For other fields (metrics), compare the semaine value as a simple example
          const valueA = a[sortConfig.key]?.semaine || 0;
          const valueB = b[sortConfig.key]?.semaine || 0;
          return sortConfig.direction === 'asc' ? valueA - valueB : valueB - valueA;
        }
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  // Calculate paginated data
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  // Format objectifs for display
  const formattedObjectifs = currentItems.map(obj => ({
    id: obj.id,
    date: obj.created_at ? format(new Date(obj.created_at), 'dd/MM/yyyy') : 'N/A',
    user: obj.user ? `${obj.user.name} ${obj.user.prenom}` : 'N/A',
    visites: obj.visites ? 
      `S: ${obj.visites.semaine} | J: ${obj.visites.jours} | M: ${obj.visites.mois}` : 
      'N/A',
    appels: obj.appels ? 
      `S: ${obj.appels.semaine} | J: ${obj.appels.jours} | M: ${obj.appels.mois}` : 
      'N/A',
    reservations: obj.reservations ? 
      `S: ${obj.reservations.semaine} | J: ${obj.reservations.jours} | M: ${obj.reservations.mois}` : 
      'N/A',
  }));

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Define table columns with action buttons
  const columns = [
    { 
      key: 'date', 
      label: 'Date',
      sortable: true,
      onSort: () => requestSort('date')
    },
    { 
      key: 'user', 
      label: 'Commercial',
      sortable: true,
      onSort: () => requestSort('user')
    },
    { 
      key: 'visites', 
      label: 'Visites',
      sortable: true,
      onSort: () => requestSort('visites')
    },
    { 
      key: 'appels', 
      label: 'Appels',
      sortable: true,
      onSort: () => requestSort('appels')
    },
    { 
      key: 'reservations', 
      label: 'Réservations',
      sortable: true,
      onSort: () => requestSort('reservations')
    },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-4 items-center">
          
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => onAction && onAction('edit', row.id)}
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={() => onAction && onAction('delete', row)}
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // Handle search
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newSize) => {
    setRowsPerPage(newSize);
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  // Export to Excel function
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.map(obj => ({
      'ID': obj.id,
      'Date': obj.created_at ? format(new Date(obj.created_at), 'dd/MM/yyyy') : 'N/A',
      'Commercial': obj.user ? `${obj.user.name} ${obj.user.prenom}` : 'N/A',
      'Visites Jours': obj.visites?.jours || 0,
      'Visites Semaine': obj.visites?.semaine || 0,
      'Visites Mois': obj.visites?.mois || 0,
      'Appels Jours': obj.appels?.jours || 0,
      'Appels Semaine': obj.appels?.semaine || 0,
      'Appels Mois': obj.appels?.mois || 0,
      'Réservations Jours': obj.reservations?.jours || 0,
      'Réservations Semaine': obj.reservations?.semaine || 0,
      'Réservations Mois': obj.reservations?.mois || 0
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Objectifs");
    XLSX.writeFile(workbook, "objectifs_export.xlsx");
  };
  
  return (
    <div>
      <Table 
        columns={columns}
        data={formattedObjectifs}
        filterComponent={
          <div className="space-y-4 ">
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
            >
              <Input
                type="text"
                placeholder="commercial..."
                value={tempFilters.commercial}
                onChange={(e) => handleFilterChange("commercial", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
              <input
                type="text"
                placeholder="Date..."
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => e.target.type = e.target.value ? "date" : "text"}
                value={tempFilters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              /> 
              
            <div className="flex  gap-3 items-center">
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
        
          </div>
        }
        totalRows={filteredData.length}
        loading={loading}
        addLink={canAddObjectifs ? "/administration/objectifs?action=add" : undefined}
        onSearchChange={handleSearchChange}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onExport={handleExportExcel}
        enableExport={data.length > 0}
        sortConfig={sortConfig}

      />
      

    </div>
  );
};

export default ObjectifTable;
