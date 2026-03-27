'use client';

import { useState, useEffect, Fragment } from 'react';
import { Filter, Search, Plus, Download, Upload, Settings, Menu, X, Edit3 } from 'lucide-react';
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
  enableMassEdit = false,
  onMassEdit = () => {},
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
  customActions = []

}) => {
  const [showModal, setShowModal] = useState(null);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showActionsDialog, setShowActionsDialog] = useState(false);

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

  // Check if there are any actions
  const hasActions = addLink || enableExport || enableImport || enableMassEdit || enableConfig || (customActions && customActions.length > 0) || extraActions;

  // Render action buttons for desktop (horizontal, no wrap)
  const renderDesktopActions = () => {
    return (
      <div className="flex flex-nowrap gap-2 items-center">
        {extraActions}
        
        {addLink && (
          typeof addLink === 'string' ? (
            <Link
              href={addLink}
              className="flex gap-1 items-center bg-green-600 text-white font-medium rounded-lg px-3 py-1.5 whitespace-nowrap hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Ajouter</span>
            </Link>
          ) : (
            <Link
              href={addLink.pathname || '#'}
              onClick={addLink.onClick}
              className="flex gap-1 items-center bg-green-600 text-white font-medium rounded-lg px-3 py-1.5 whitespace-nowrap hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Ajouter</span>
            </Link>
          )
        )}
        
        {enableExport && (
          <button
            className="flex gap-1 items-center bg-[#009FFF] text-white font-medium rounded-lg px-3 py-1.5 whitespace-nowrap hover:bg-[#0088e0] transition-colors"
            onClick={handleExport}
          >
            <Download className="w-5 h-5" />
            <span>Exporter</span>
          </button>
        )}
        
        {enableImport && (
          <button
            className="flex gap-1 items-center bg-[#231651] text-white font-medium rounded-lg px-3 py-1.5 whitespace-nowrap hover:bg-[#1a1040] transition-colors"
            onClick={onImportClick}
          >
            <Upload className="w-5 h-5" />
            <span>Importer</span>
          </button>
        )}
        
        {enableMassEdit && (
          <button
            className="flex gap-1 items-center bg-orange-500 text-white font-medium rounded-lg px-3 py-1.5 whitespace-nowrap hover:bg-orange-600 transition-colors"
            onClick={onMassEdit}
          >
            <Edit3 className="w-5 h-5" />
            <span>Modifier en masse</span>
          </button>
        )}
        
        {customActions.map((action, index) => (
          <button
            key={index}
            className={`flex gap-1 items-center ${action.className || 'bg-gray-500'} text-white font-medium rounded-lg px-3 py-1.5 whitespace-nowrap hover:opacity-90 transition-colors`}
            onClick={action.onClick}
          >
            {action.icon || <Plus className="w-5 h-5" />}
            <span>{action.label}</span>
          </button>
        ))}
        
        {enableConfig && (
          <button
            className="flex gap-1 items-center bg-blue-700 text-white font-medium rounded-lg px-3 py-1.5 whitespace-nowrap hover:bg-blue-800 transition-colors"
            onClick={onConfigClick}
          >
            <Settings className="w-5 h-5" />
            <span>Configuration</span>
          </button>
        )}
      </div>
    );
  };

  // Render action buttons for mobile dialog (horizontal with wrap)
  const renderMobileActions = () => {
    return (
      <div className="flex flex-row flex-wrap justify-center gap-3">
        {extraActions}
        
        {addLink && (
          typeof addLink === 'string' ? (
            <Link
              href={addLink}
              className="flex gap-2 items-center bg-green-600 text-white font-medium rounded-lg px-4 py-2 whitespace-nowrap hover:bg-green-700 transition-colors"
              onClick={() => setShowActionsDialog(false)}
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </Link>
          ) : (
            <Link
              href={addLink.pathname || '#'}
              onClick={(e) => {
                if (addLink.onClick) addLink.onClick(e);
                setShowActionsDialog(false);
              }}
              className="flex gap-2 items-center bg-green-600 text-white font-medium rounded-lg px-4 py-2 whitespace-nowrap hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </Link>
          )
        )}
        
        {enableExport && (
          <button
            className="flex gap-2 items-center bg-[#009FFF] text-white font-medium rounded-lg px-4 py-2 whitespace-nowrap hover:bg-[#0088e0] transition-colors"
            onClick={() => {
              handleExport();
              setShowActionsDialog(false);
            }}
          >
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        )}
        
        {enableImport && (
          <button
            className="flex gap-2 items-center bg-[#231651] text-white font-medium rounded-lg px-4 py-2 whitespace-nowrap hover:bg-[#1a1040] transition-colors"
            onClick={() => {
              onImportClick();
              setShowActionsDialog(false);
            }}
          >
            <Upload className="w-4 h-4" />
            <span>Importer</span>
          </button>
        )}
        
        {enableMassEdit && (
          <button
            className="flex gap-2 items-center bg-orange-500 text-white font-medium rounded-lg px-4 py-2 whitespace-nowrap hover:bg-orange-600 transition-colors"
            onClick={() => {
              onMassEdit();
              setShowActionsDialog(false);
            }}
          >
            <Edit3 className="w-4 h-4" />
            <span>Modifier en masse</span>
          </button>
        )}
        
        {customActions.map((action, index) => (
          <button
            key={index}
            className={`flex gap-2 items-center ${action.className || 'bg-gray-500'} text-white font-medium rounded-lg px-4 py-2 whitespace-nowrap hover:opacity-90 transition-colors`}
            onClick={() => {
              action.onClick();
              setShowActionsDialog(false);
            }}
          >
            {action.icon || <Plus className="w-4 h-4" />}
            <span>{action.label}</span>
          </button>
        ))}
        
        {enableConfig && (
          <button
            className="flex gap-2 items-center bg-blue-700 text-white font-medium rounded-lg px-4 py-2 whitespace-nowrap hover:bg-blue-800 transition-colors"
            onClick={() => {
              onConfigClick();
              setShowActionsDialog(false);
            }}
          >
            <Settings className="w-4 h-4" />
            <span>Configuration</span>
          </button>
        )}
      </div>
    );
  };

  // Actions Dialog Component for Mobile
  const ActionsDialog = () => {
    if (!showActionsDialog) return null;
    
    return (
      <>
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setShowActionsDialog(false)}
        />
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-700">Actions</h3>
              <button
                onClick={() => setShowActionsDialog(false)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              {renderMobileActions()}
            </div>
          </div>
        </div>
      </>
    );
  };

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
              className={`border rounded-lg p-1.5 cursor-pointer flex items-center shrink-0 ${
                showFilter ? 'bg-[#009FFF] text-white' : 'border-gray-300 bg-transparent hover:bg-gray-100'
              }`}
              onClick={toggleFilter}
            >
              <Filter className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {showSearch && (
            <div className="flex-1 sm:flex-none flex items-center border border-gray-300 rounded-lg p-1.5 bg-transparent gap-2 w-full sm:w-[300px]">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-gray-500" />
              <input
                className="bg-transparent outline-none !text-gray-600 w-full text-sm sm:text-base"
                type="text"
                placeholder="Rechercher..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                aria-label="Rechercher"
              />
            </div>
          )}
        </div>

        {/* Desktop Actions - Horizontal row, no wrapping */}
        <div className="hidden sm:block overflow-x-auto">
          {renderDesktopActions()}
        </div>

        {/* Mobile Actions Button */}
        {hasActions && (
          <div className="sm:hidden">
            <button
              className="flex gap-2 items-center bg-[#009FFF] text-white font-medium rounded-lg px-4 py-2 hover:bg-[#0088e0] transition-colors"
              onClick={() => setShowActionsDialog(true)}
            >
              <Menu className="w-5 h-5" />
              <span>Actions</span>
            </button>
          </div>
        )}
      </div>

      {/* Actions Dialog for Mobile */}
      <ActionsDialog />

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
          <table className="w-full border-collapse min-w-[600px]">
            <thead className="sticky top-0">
              <tr className="bg-[#009FFF] text-white">
                {columns.map((column) => (
                  <th key={column.key || column.label} className={`py-3 px-2 text-left text-sm sm:text-base ${showPagination ? '' : 'text-sm'}`}>
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
                        className={`hover:bg-gray-50 transition-colors ${rowClassName(row)} ${onRowClick ? 'cursor-pointer' : ''}`}
                        onClick={() => onRowClick && onRowClick(row, index)}
                      >
                        {columns.map((column) => (
                          <td key={`${rowId}-${column.key}`} className={`py-3 sm:py-4 px-2 border-b text-sm sm:text-base ${showPagination ? '' : 'py-2 text-sm'}`}>
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
        <div className="flex flex-col sm:flex-row gap-4 justify-end mt-4">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="text-gray-600 text-sm sm:text-base">Lignes par page:</span>
            <select
              className="border px-2 py-1 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#009FFF]"
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
            >
              {[10, 20, 30, 50].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 items-center justify-center sm:justify-start">
            <button
              disabled={currentPage === 1}
              onClick={handlePreviousPage}
              className="border px-3 py-1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors text-sm sm:text-base"
            >
              Préc
            </button>
            <span className="text-sm sm:text-base">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={handleNextPage}
              className="border px-3 py-1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors text-sm sm:text-base"
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