'use client';

import React, { useState } from 'react';
import DesistementsCard from './DesistementsCard';
import RemboursementsCard from './RemboursementsCard';
import format from 'date-fns/format';

export default function VentesCard({
  reservations = [],
  nb_reservation = 0,
  avances = [],
  sumAvances = 0,
  desistements = [],
  sumPenalites = 0,
  sumMontantAAjouter = 0,
  remboursements = [],
  sumRemb = 0,
}) {
  const [activeTab, setActiveTab] = useState('reservations');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Pagination functions
  const getCurrentItems = (items) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = (items) => Math.ceil(items.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset page when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full flex flex-col">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <div className="text-lg font-semibold">
          {activeTab === 'remboursements'
            ? 'Remboursements'
            : activeTab === 'avances'
            ? 'Encaissement'
            : activeTab === 'desistements'
            ? 'Désistements'
            : activeTab === 'reservations'
            ? 'Réservations'
            : ''}
        </div>
        <div className="text-right">
          {activeTab === 'remboursements' ? (
            <div className="text-xl font-bold !text-green-600">
              {sumRemb} DH
            </div>
          ) : activeTab === 'avances' ? (
            <div className="text-xl font-bold !text-blue-600">
              {sumAvances} DH
            </div>
          ) : activeTab === 'reservations' ? (
            <div className="text-xl font-bold !text-indigo-600">
              {nb_reservation}
            </div>
          ) : activeTab === 'desistements' ? (
            <div className="flex flex-col items-end">
              <div className="text-sm font-bold !text-red-600">
                Pénalités: {sumPenalites} DH
              </div>
              <div className="text-sm font-bold !text-green-600">
                Montants à Ajouter: {sumMontantAAjouter} DH
              </div>
            </div>
          ) : (
            <div className="text-xl font-bold !text-indigo-600">0 DH</div>
          )}
        </div>
      </div>

      <div className="px-6 pt-4 pb-2">
        <div className="flex mb-4 border-b">
          <button
            onClick={() => handleTabChange('reservations')}
            className={`pb-2 px-4 ${
              activeTab === 'reservations'
                ? 'border-b-2 border-indigo-500 font-medium !text-indigo-600'
                : '!text-gray-500'
            }`}
          >
            Réservations
          </button>
          <button
            onClick={() => handleTabChange('avances')}
            className={`pb-2 px-4 ${
              activeTab === 'avances'
                ? 'border-b-2 border-blue-500 font-medium !text-blue-600'
                : '!text-gray-500'
            }`}
          >
            Encaissements
          </button>
          <button
            onClick={() => handleTabChange('desistements')}
            className={`pb-2 px-4 ${
              activeTab === 'desistements'
                ? 'border-b-2 border-red-500 font-medium !text-red-600'
                : '!text-gray-500'
            }`}
          >
            Désistements
          </button>
          <button
            onClick={() => handleTabChange('remboursements')}
            className={`pb-2 px-4 ${
              activeTab === 'remboursements'
                ? 'border-b-2 border-green-500 font-medium !text-green-600'
                : '!text-gray-500'
            }`}
          >
            Remboursements
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {activeTab === 'avances' ? (
            <>
              <div className="grid grid-cols-12 gap-4 mb-4 text-sm font-medium border-b pb-2">
                <div className="col-span-4">Code Réservation</div>
                <div className="col-span-4">Bien</div>
                <div className="col-span-2 text-center">Date</div>
                <div className="col-span-2 text-right">Montant</div>
              </div>

              <div className="space-y-4">
                {getCurrentItems(avances).map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-4 items-center"
                  >
                    <div className="col-span-4 ">
                      {item.code_reservation}
                    </div>
                    <div className="col-span-4">
                      <div className="font-medium">
                        {item.propriete_dite_bien}
                      </div>
                      <div className="text-sm !text-gray-500">
                        {item.tranche_nom ? `${item.tranche_nom}` : ''}
                        {item.bloc_nom ? `-${item.bloc_nom}` : ''}
                        {item.immeuble_nom ? `-${item.immeuble_nom}` : ''}
                      </div>
                    </div>
                    <div className="col-span-2 text-center text-sm ">
                      {item.date_reglement &&
                        format(new Date(item.date_reglement), 'dd/MM/yyyy')}
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="bg-blue-100 !text-blue-800 text-sm  px-3 py-1 rounded-full">
                        {item.montant} DH
                      </span>
                    </div>
                  </div>
                ))}

                {avances.length === 0 && (
                  <div className="text-center py-4 !text-gray-500">
                    Aucun encaissement trouvé
                  </div>
                )}
              </div>
            </>
          ) : activeTab === 'desistements' ? (
            <DesistementsCard
              desistements={desistements}
              sumPenalites={sumPenalites}
              sumMontantAAjouter={sumMontantAAjouter}
              itemsPerPage={itemsPerPage}
            />
          ) : activeTab === 'remboursements' ? (
            <RemboursementsCard
              sumRemb={sumRemb}
              remboursements={getCurrentItems(remboursements)}
            />
          ) : activeTab === 'reservations' ? (
            <>
              <div className="grid grid-cols-12 gap-4 mb-4 text-sm font-medium border-b pb-2">
                <div className="col-span-4">Code Réservation</div>
                <div className="col-span-6">Bien</div>
                <div className="col-span-2 text-center">Date Création</div>
              </div>

              <div className="space-y-4">
                {getCurrentItems(reservations).map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-4 items-center"
                  >
                    <div className="col-span-4 text-gray">
                      {item.code_reservation}
                    </div>
                    <div className="col-span-6">
                      <div className="font-medium">
                        {item.propriete_dite_bien}
                      </div>
                      <div className="text-sm !text-gray-500">
                        {item.tranche_nom ? item.tranche_nom : ''}
                        {item.bloc_nom ? `-${item.bloc_nom}` : ''}
                        {item.immeuble_nom ? `-${item.immeuble_nom}` : ''}
                      </div>
                    </div>
                    <div className="col-span-2 text-center text-sm ">
                      {item.created_at &&
                        format(new Date(item.created_at), 'dd/MM/yyyy')}
                    </div>
                  </div>
                ))}

                {reservations.length === 0 && (
                  <div className="text-center py-4 !text-gray-500">
                    Aucune réservation trouvée
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Pagination Controls for non-desistement tabs */}
        {(activeTab === 'avances' && avances.length > itemsPerPage) ||
        (activeTab === 'reservations' && reservations.length > itemsPerPage) ||
        (activeTab === 'remboursements' &&
          remboursements.length > itemsPerPage) ? (
          <div className="flex justify-center mt-4">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Précédent
              </button>

              {Array.from(
                {
                  length: totalPages(
                    activeTab === 'avances'
                      ? avances
                      : activeTab === 'reservations'
                      ? reservations
                      : remboursements
                  ),
                },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page ? 'bg-blue-500 text-white' : 'border'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  currentPage ===
                  totalPages(
                    activeTab === 'avances'
                      ? avances
                      : activeTab === 'reservations'
                      ? reservations
                      : remboursements
                  )
                }
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Suivant
              </button>
            </nav>
          </div>
        ) : null}
      </div>
    </div>
  );
}
