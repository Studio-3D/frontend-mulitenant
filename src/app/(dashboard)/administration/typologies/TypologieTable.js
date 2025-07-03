import { useState } from 'react';
import Table from '@/components/Table';
import * as XLSX from 'xlsx';
import { Eye, Pencil, Trash2 } from "lucide-react";
import Input from "@/components/Input";

const TypologieTable = ({ 
  data = [], 
  loading = false, 
  onAction,onFilterSubmit 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tempFilters, setTempFilters] = useState({ typologie: "" }); // les champs que l'utilisateur tape
  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    onFilterSubmit && onFilterSubmit(tempFilters); 
  };
  
  const resetFilters = () => {
    const reset = { typologie: "" };
    setTempFilters(reset);
    onFilterSubmit && onFilterSubmit(reset); 
  };
  // Filter data based on search term
  const filteredData = data.filter(item => 
    item.typologie?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate paginated data
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Define table columns with render function for actions
  const columns = [
    { key: 'typologie', label: 'Typologie' },
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
            <Pencil className="w-4 h-4" />
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
    const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
      ID: item.id,
      Typologie: item.typologie
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Typologies");
    XLSX.writeFile(workbook, "typologies_export.xlsx");
  };
  
  return (
    <div>
      <Table 
        title={"Typologies"} 
        columns={columns}
        data={currentItems}
        filterComponent={
          <div className="space-y-4">
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
            >
              <Input
                type="text"
                placeholder="Typologie..."
                value={tempFilters.typologie}
                onChange={(e) => handleFilterChange("typologie", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
              
            <div className="flex items-center gap-3">
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
        addLink="/administration/typologies?action=add"
        onSearchChange={handleSearchChange}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onExport={handleExportExcel}
        enableExport={data.length > 0}


      />
      
      {/* <div className="flex justify-between mt-4">
        
        <button 
          onClick={onRefresh}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Actualiser
        </button>
      </div> */}
    </div>
  );
};

export default TypologieTable;
