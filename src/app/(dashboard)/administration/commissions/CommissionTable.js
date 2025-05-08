import { useState } from "react";
import Table from "@/components/Table";
import * as XLSX from "xlsx";
import { FaRegEye, FaEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import Input from "@/components/Input";

const CommissionTable = ({
  data = [],
  loading = false,
  onAction,onFilterSubmit
  
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tempFilters, setTempFilters] = useState({ nature_travaux: "",cout:"",date_validation:"" }); // les champs que l'utilisateur tape
  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    onFilterSubmit && onFilterSubmit(tempFilters); 
  };
  
  const resetFilters = () => {
    const reset = { nature_travaux: "",cout:"",date_validation:""  };
    setTempFilters(reset);
    onFilterSubmit && onFilterSubmit(reset); 
  };
  // Filter data based on search term
  const filteredData = data.filter((item) =>
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate paginated data
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Define table columns with action buttons
  const columns = [
    { key: "Date", label: "Date" },
    { key: "Responsable", label: "Responsable" },
    { key: "Montant", label: "Montant" },
    { key: "Mode Paiement", label: "Mode Paiement" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-4 items-center">
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => onAction && onAction("edit", row.id)}
            title="Modifier"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={() => onAction && onAction("delete", row)}
            title="Supprimer"
          >
            <RiDeleteBin6Line className="w-4 h-4" />
          </button>
        </div>
      ),
    },
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
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        ID: item.id,
        Description: item.description,
        Remise: item.remise || "0",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Commissions");
    XLSX.writeFile(workbook, "commissions_export.xlsx");
  };

  return (
    <div>
      <Table
        columns={columns}
        data={currentItems}
        totalRows={filteredData.length}
        filterComponent={
          <div className="space-y-4 p-4 rounded-lg shadow-md">
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
            >
              <Input
                type="text"
                placeholder="Nature travaux ..."
                value={tempFilters.nature_travaux}
                onChange={(e) => handleFilterChange("nature_travaux", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
              <Input
                type="number"
                placeholder="cout..."
                value={tempFilters.cout}
                onChange={(e) => handleFilterChange("cout", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
              <input
                type="text"
                placeholder="Date"
                onFocus={(e) => (e.target.type = "date_validation")}
                onBlur={(e) => e.target.type = e.target.value ? "date_validation" : "text"}
                value={tempFilters.date_validation}
                onChange={(e) => handleFilterChange("date_validation", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              /> 
              
              
            </div>
        
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
        loading={loading}
        addUserLink="/administration/commissions?action=add"
        onSearchChange={handleSearchChange}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onExport={handleExportExcel}
        enableExport={true}
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

export default CommissionTable;
