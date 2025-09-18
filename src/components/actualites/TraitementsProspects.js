import { getProspectStatusColor, getProspectStatusLabel } from '@/configs/enum';
import React, { useState } from 'react';

export default function TraitementsProspect({
  traitements_prospects = [],
  nb = 0,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = traitements_prospects.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(traitements_prospects.length / itemsPerPage);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full flex flex-col">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <div className="text-lg font-semibold">Traitements des Prospects</div>
        <div className="text-lg font-bold text-indigo-600">{nb}</div>
      </div>

      <div className="px-6 pt-4 pb-2 flex-1">
        <div className="flex justify-between mb-4 text-sm font-medium border-b pb-2">
          <div>Nom Complet</div>
          <div>Statut</div>
        </div>

        <div className="space-y-4">
          {currentItems.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="flex-1">
                <div className="font-medium">
                  {`${item.nom || 'Non reconnu'} ${
                    item.prenom || 'Non reconnu'
                  }`}
                </div>
              </div>

              <span
                className={`px-2 py-1 rounded text-sm font-semibold ${getProspectStatusColor(
                  getProspectStatusLabel(item.last_statut?.statut || '')
                )}`}
              >
                {getProspectStatusLabel(item.last_statut?.statut || '')}
              </span>
            </div>
          ))}

          {traitements_prospects.length === 0 && (
            <div className="text-center py-4 !text-gray-500">
              Aucun Traitements
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {traitements_prospects.length > itemsPerPage && (
        <div className="mt-auto px-6 py-4 border-t">
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Précédent
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => paginate(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
