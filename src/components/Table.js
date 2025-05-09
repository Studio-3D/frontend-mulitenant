'use client';

import { useState, useEffect } from 'react';
import { CiFilter, CiSearch } from 'react-icons/ci';
import { IoAddOutline } from 'react-icons/io5';
import { MdImportExport } from 'react-icons/md';
import Link from 'next/link';
import Modal from './Modal';
import { handleExportExcel } from '../../src/configs/export';
import Modal_Import from './Modal_Import';

const Table = ({
  onFilterToggle = () => {},
  title,
  name_file_export,
  data_to_export,
  columns_export,
  columns,
  data,
  totalRows = 0,
  addLink,
  loading,
  error,
  emptyMessage = "Aucune donnée trouvée",
  onPageChange = () => {},
  onRowsPerPageChange,
  onSearchChange = () => {},
  currentPage = 1,
  rowsPerPage = 10,
  onAddClick,
  onExport = null,
  enableExport = false,
  enableImport = false,
  filterComponent = null, // New prop for custom filter component
}) => {
  const [showModal, setShowModal] = useState(null);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showModal_Import, setShowModal_Import] = useState(false);

  const toggleFilter = () => {
    const newState = !showFilter;
    setShowFilter(newState);
    onFilterToggle(newState); // <--- Appelle le parent
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearchTerm);
      onPageChange(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchTerm, onSearchChange, onPageChange]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = Number(e.target.value);
    onRowsPerPageChange(newRowsPerPage);
  };

  const handleExport = () => {
    handleExportExcel(
      data_to_export,
      columns_export,
      name_file_export + '.xlsx'
    );
  };

  // Safe calculation of total pages
  const totalPages = Math.max(
    1,
    Math.ceil(totalRows / Math.max(1, rowsPerPage))
  );

  return (
    <div className="mx-auto px-6 py-4 mt-2 mb-4 bg-white rounded-lg shadow-md">
      {title && (
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
      )}

      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {filterComponent && (
            <button
              className={`border rounded-lg p-1.5 cursor-pointer flex items-center ${
                showFilter ? 'bg-[#009FFF] text-white' : 'border-gray-300 bg-transparent'
              }`}
              onClick={toggleFilter}
              >
              <CiFilter className="w-6 h-6" />
            </button>
          )}

          <div className="flex-1 sm:flex-none flex items-center border border-gray-300 rounded-lg p-1.5 bg-transparent gap-2 w-full sm:w-[300px]">
            <CiSearch className="w-6 h-6" />
            <input
              className="bg-transparent outline-none text-gray-600 w-full"
              type="text"
              placeholder="Rechercher..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              aria-label="Rechercher"
            />
          </div>
        </div>

        <div className="flex gap-2 items-center">
          {addLink && (
            <Link
              href={addLink}
              className="flex gap-1 items-center bg-green-600 text-white font-medium rounded-lg px-3 py-1.5"
            >
              <IoAddOutline className="w-5 h-5" />
              <span>Ajouter</span>
            </Link>
          )}
         
          {enableExport && (
            <button
              className="flex gap-1 items-center bg-[#009FFF] text-white font-medium rounded-lg px-3 py-1.5"
              onClick={handleExport}
            >
              <MdImportExport className="w-5 h-5" />
              <span>Exporter</span>
            </button>
          )}
          {enableImport && (
            <button
              className="flex gap-1 items-center bg-[#231651] text-white font-medium rounded-lg px-3 py-1.5"
              onClick={() => setShowModal_Import(true)}
            >
              <MdImportExport className="w-5 h-5" />
              <span>Importer</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter row - appears above the table */}
      {showFilter && filterComponent && (
        <div className="w-full pt-4">
          {filterComponent}
        </div>
      )}

      {/* Table */}
      <div className="overflow-auto mt-4 h-[72vh]">
        {error ? (
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#009FFF] text-white">
                {columns.map((column) => (
                  <th key={column.key} className="py-3 px-2 text-left w-[15.3%]">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(rowsPerPage)].map((_, i) => (
                  <tr key={i}>
                    {columns.map((_, j) => (
                      <td key={j} className="py-3 px-2 border-b">
                        <div className="h-4 bg-gray-300 animate-pulse rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-4 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td key={column.key} className="py-4 px-2 border-b">
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex gap-4 justify-end mt-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Lignes par page:</span>
          <select
            className="border px-2 py-1 rounded-lg"
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
          >
            {[10, 20, 30].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <button
            disabled={currentPage === 1}
            onClick={handlePreviousPage}
            className="border px-3 py-1 rounded-lg disabled:opacity-50"
          >
            Préc
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={handleNextPage}
            className="border px-3 py-1 rounded-lg disabled:opacity-50"
          >
            Suiv
          </button>
        </div>
      </div>

      {/* Dynamic Modals */}
      {showModal && (
        <Modal isVisible={true} onClose={() => setShowModal(null)}>
          {showModal}
        </Modal>
      )}
      {showModal_Import && (
        <Modal isVisible={true} onClose={() => setShowModal_Import(false)}>
          <Modal_Import
            title='Prospects'
            route='upload_excel_prospect'
            localstorage='load_data_prospect'
            onClose={() => setShowModal_Import(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default Table;