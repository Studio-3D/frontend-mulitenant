'use client';
import React, { useState, useMemo } from 'react';
import { ChevronDownIcon, ChevronUpIcon, XIcon } from 'lucide-react';
import LoadingSpin from '@/components/LoadingSpin';

import {
  VISITE_INTERETS,
  VISITE_STATUT,
  getFullOrientation,
} from '../../../src/configs/enum';
const Modal_Historique = ({ onClose, rows, loading_histo }) => {
  const getInteretBadge = (interest) => {
    const interetInfo = VISITE_INTERETS[interest];
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${interetInfo.color}`}
      >
        {interetInfo.label}
      </span>
    );
  };
  const getStatutBadge = (statut) => {
    const statut_info = VISITE_STATUT[statut];
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statut_info.color}`}
      >
        {statut_info.label}
      </span>
    );
  };

  const Row = ({ row }) => {
    const [open, setOpen] = useState(false);
    const isExpandable = !row.action.includes('SUPPRESSION');

    const toggleExpand = () => isExpandable && setOpen(!open);

    return (
      <>
        <tr className="border-b hover:bg-gray-50 transition-colors duration-150">
          <td className="px-4 py-3 text-center">
            {isExpandable && (
              <button
                aria-label={open ? 'collapse row' : 'expand row'}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
                onClick={toggleExpand}
              >
                {open ? (
                  <ChevronUpIcon size={18} className="text-gray-600" />
                ) : (
                  <ChevronDownIcon size={18} className="text-gray-600" />
                )}
              </button>
            )}
          </td>
          <td className="px-4 py-3 text-center font-medium">{row.action}</td>
          <td className="px-4 py-3 text-center">{row.cc}</td>
          <td className="px-4 py-3 text-center">{row.date}</td>
          <td className="px-4 py-3 text-center">
            {getInteretBadge(row.interet)}
          </td>
          <td className="px-4 py-3 text-center">{row.bien}</td>
          <td className="px-4 py-3 text-center">
            {row.statut && <>{getStatutBadge(row.statut)}</>}
          </td>
        </tr>

        {isExpandable && (
          <tr className="border-b">
            <td colSpan={7} className="p-0 bg-gray-50">
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  open ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="p-4">
                  <h6 className="text-md font-semibold mb-3 !text-gray-700 flex items-center">
                    <span className="w-1.5 h-5 bg-blue-600 rounded-sm mr-2"></span>
                    Détails supplémentaires
                  </h6>
                  <div className="overflow-hidden">
                    <table className="w-full text-sm border-collapse">
                      <thead style={{background:'#bcf7ff'}}>
                        <tr>
                          {row.interet == '3' ? (
                            <>
                              <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                                Freins
                              </th>
                              <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                                Tranches
                              </th>
                              <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                                Etages
                              </th>
                              <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                                Orientations
                              </th>
                              <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                                Typologies
                              </th>
                              <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                                Vues
                              </th>
                              <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                                Prix
                              </th>
                              <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                                Superficie
                              </th>
                              <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                                Avance
                              </th>
                            </>
                          ) : (
                            <>
                              <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                                Mode Relance
                              </th>
                              <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                                Date de Relance
                              </th>
                              {row.interet === '1' && (
                                <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                                  RDV
                                </th>
                              )}
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          {row.interet == '3' ? (
                            <>
                              <td className="text-center px-3 py-2 border-b border-gray-200">
                                {[
                                  { key: 'fr_tranches', label: 'TRANCHE' },
                                  { key: 'fr_etages', label: 'ETAGE' },
                                  {
                                    key: 'fr_orientations',
                                    label: 'ORIENTATION',
                                  },
                                  { key: 'fr_typologies', label: 'TYPOLOGIE' },
                                  { key: 'fr_vues', label: 'VUE' },
                                  {
                                    key: ['prix_min', 'prix_max'],
                                    label: 'PRIX',
                                    condition: (row) =>
                                      (row.prix_min != '' &&
                                        row.prix_min != null) ||
                                      (row.prix_max != '' &&
                                        row.prix_max != null),
                                  },
                                  {
                                    key: ['sup_min', 'sup_max'],
                                    label: 'SUPERFICIE',
                                    condition: (row) =>
                                      (row.sup_min != '' &&
                                        row.sup_min != null) ||
                                      (row.sup_max != '' &&
                                        row.sup_max != null),
                                  },
                                  { key: 'avance', label: 'AVANCE' },
                                ]
                                  .filter(({ key, condition }) => {
                                    if (condition) return condition(row);
                                    if (Array.isArray(key))
                                      return key.some((k) => row[k] != '');
                                    return row[key] != '';
                                  })
                                  .map(({ label }) => label)
                                  .join(', ')}
                              </td>
                              <td className="text-center px-3 py-2 border-b border-gray-200">
                                {row.fr_tranches || null}
                              </td>
                              <td className="text-center px-3 py-2 border-b border-gray-200">
                                {row.fr_etages || null}
                              </td>
                              <td className="text-center px-3 py-2 border-b border-gray-200">
                                {row.fr_orientations
                                  ? row.fr_orientations
                                      .split(',')
                                      .map(getFullOrientation)
                                      .join(', ')
                                  : null}
                              </td>
                              <td className="text-center px-3 py-2 border-b border-gray-200">
                                {row.fr_typologies || null}
                              </td>
                              <td className="text-center px-3 py-2 border-b border-gray-200">
                                {row.fr_vues || null}
                              </td>
                              <td className="text-center px-3 py-2 border-b border-gray-200">
                                {row.prix_min && row.prix_max
                                  ? `Prix entre ${row.prix_min.toLocaleString(
                                      'fr-MA'
                                    )} DH et ${row.prix_max.toLocaleString(
                                      'fr-MA'
                                    )} DH`
                                  : row.prix_min
                                  ? `Prix à partir de ${row.prix_min.toLocaleString(
                                      'fr-MA'
                                    )} DH`
                                  : row.prix_max
                                  ? `Prix jusqu'à ${row.prix_max.toLocaleString(
                                      'fr-MA'
                                    )} DH`
                                  : null}
                              </td>
                              <td className="text-center px-3 py-2 border-b border-gray-200">
                                {row.sup_min && row.sup_max
                                  ? `Superficie entre ${row.sup_min} m² et ${row.sup_max} m²`
                                  : row.sup_min
                                  ? `Superficie à partir de ${row.sup_min} m²`
                                  : row.sup_max
                                  ? `Superficie jusqu'à ${row.sup_max} m²`
                                  : null}
                              </td>
                              <td className="text-center px-3 py-2 border-b border-gray-200">
                                {row.avance || null}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="text-center px-3 py-2 border-b border-gray-200">
                                {row.mode_rel || null}
                              </td>
                              <td className="text-center px-3 py-2 border-b border-gray-200">
                                {row.date_rel || null}
                              </td>
                              {row.interet == '1' && (
                                <td className="text-center px-3 py-2 border-b border-gray-200">
                                  {row.rdv || null}
                                </td>
                              )}
                            </>
                          )}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        )}
      </>
    );
  };

  if (loading_histo) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <LoadingSpin />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Historique</h1>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 rounded-full p-1 transition-colors duration-200"
            aria-label="Fermer"
          >
            <XIcon size={24} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr className="bg-gray-900/80">
                  <th scope="col" className="px-4 py-3 w-12"></th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Etape
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                  >
                    CC
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Intérêt
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium text-white  uppercase tracking-wider"
                  >
                    Bien
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((row, index) => (
                  <Row key={`${row.id || index}-${row.action}`} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal_Historique;
