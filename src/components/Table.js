'use client';

import { useState, useEffect, Fragment } from 'react';
import { Filter, Search, Plus, Download, Upload, Settings } from 'lucide-react';
import Link from 'next/link';
import Modal from './Modal';
import { handleExportExcel } from '../../src/configs/export';


const Table = ({
  onFilterToggle = () => {},
  title,
  name_file_export = 'export',
  data_to_export = [],
  columns_export = [],
  columns = [],
  data = [],
  totalRows = 0,
  addLink,
  loading = false,
  error = null,
  emptyMessage = "Aucune donnée trouvée",
  onPageChange = () => {},
  onRowsPerPageChange = () => {},
  onSearchChange = () => {},
  currentPage = 1,
  rowsPerPage = 10,
  onAddClick,
  onExport = null,
  enableExport = false,
  enableImport = false,
  enableConfig = false,
  filterComponent = null,
  renderExpandedRow = null,
  onRowClick = null,
  rowClassName = () => "",
  expandedRows = {},
  showPagination = true,
  showSearch = true,
  compact = false, 
  onImportClick = () => {},
  onConfigClick = () => {},
  extraActions = null,

}) => {
  const [showModal, setShowModal] = useState(null);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showModal_Import, setShowModal_Import] = useState(false);

  const toggleFilter = () => {
    const newState = !showFilter;
    setShowFilter(newState);
    onFilterToggle(newState);
  };
  
  useEffect(() => {
    if (!showSearch) return;
    
    const timer = setTimeout(() => {
      onSearchChange(localSearchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchTerm, onSearchChange, showSearch]);

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
    if (onExport) {
      onExport();
    } else {
      handleExportExcel(
        data_to_export,
        columns_export,
        `${name_file_export}.xlsx`
      );
    }
  };

  // Safe calculation of total pages
  const totalPages = Math.max(
    1,
    Math.ceil(totalRows / Math.max(1, rowsPerPage))
  );

  return (
    <div className="mb-4 rounded-lg">
      {title && (
        <h2 className="text-xl font-semibold !text-gray-700 mb-5">{title}</h2>
      )}

      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {filterComponent && (
            <button
              className={`border rounded-lg p-1.5 cursor-pointer flex items-center ${
                showFilter ? 'bg-[#009FFF] text-white' : 'border-gray-300 bg-transparent'
              }`}
              onClick={toggleFilter}
            >
              <Filter className="w-6 h-6" />
            </button>
          )}

          {showSearch && (
            <div className="flex-1 sm:flex-none flex items-center border border-gray-300 rounded-lg p-1.5 bg-transparent gap-2 w-full sm:w-[300px]">
              <Search className="w-6 h-6" />
              <input
                className="bg-transparent outline-none !text-gray-600 w-full"
                type="text"
                placeholder="Rechercher..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                aria-label="Rechercher"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 items-center">
          {/* extraActions is used for tables with special actions */}
          {extraActions}
          {addLink && (
            typeof addLink === 'string' ? (
              <Link
                href={addLink}
                className="flex gap-1 items-center bg-green-600 text-white font-medium rounded-lg px-3 py-1.5"
              >
                <Plus className="w-5 h-5" />
                <span>Ajouter</span>
              </Link>
            ) : (
              <Link
                href={addLink.pathname || '#'}
                onClick={addLink.onClick}
                className="flex gap-1 items-center bg-green-600 text-white font-medium rounded-lg px-3 py-1.5"
              >
                <Plus className="w-5 h-5" />
                <span>Ajouter</span>
              </Link>
            )
          )}
          {enableExport && (
            <button
              className="flex gap-1 items-center bg-[#009FFF] text-white font-medium rounded-lg px-3 py-1.5"
              onClick={handleExport}
            >
              <Download className="w-5 h-5" />
              <span>Exporter</span>
            </button>
          )}
          {enableImport && (
            <button
              className="flex gap-1 items-center bg-[#231651] text-white font-medium rounded-lg px-3 py-1.5"
              onClick={onImportClick}
            >
              <Upload className="w-5 h-5" />
              <span>Importer</span>
            </button>
          )}
          {enableConfig && (
            <button
              className="flex gap-1 items-center bg-orange-300 text-white font-medium rounded-lg px-3 py-1.5 hover:bg-orange-100 transition"
              onClick={onConfigClick}
            >
              <Settings className="w-5 h-5" />
              <span>Configuration</span>
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

      {/* Table - adjust height based on context */}
      <div className={`overflow-auto mt-4 ${showPagination ? 'h-[72vh]' : 'max-h-96'}`}>
        {error ? (
          <div className="text-center !text-red-500 py-4">{error}</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#009FFF] text-white">
                {columns.map((column) => (
                  <th key={column.key || column.label} className={`py-3 px-2 text-left ${showPagination ? '' : 'text-sm'}`}>
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
              ) : !Array.isArray(data) || data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-4 text-center !text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, index) => {
                  const rowId = row.id || index;
                  const isExpanded = expandedRows[rowId];
                  
                  return (
                    <Fragment key={rowId}>
                      <tr 
                        className={`hover:bg-gray-50 ${rowClassName(row)} ${onRowClick ? 'cursor-pointer' : ''}`}
                        onClick={() => onRowClick && onRowClick(row, index)}
                      >
                        {columns.map((column) => (
                          <td key={`${rowId}-${column.key}`} className={`py-4 px-2 border-b ${showPagination ? '' : 'py-2 text-sm'}`}>
                            {column.render ? column.render(row, index) : row[column.key]}
                          </td>
                        ))}
                      </tr>
                      {isExpanded && renderExpandedRow && (
                        <tr>
                          <td colSpan={columns.length} className="p-0 border-b">
                            {renderExpandedRow(row, index)}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {showPagination && (
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
      )}

      {/* Dynamic Modals */}
      {showModal && (
        <Modal isVisible={true} onClose={() => setShowModal(null)}>
          {showModal}
        </Modal>
      )}
    </div>
  );
};

export default Table;