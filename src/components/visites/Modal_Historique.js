'use client';
import React, { useState, useEffect, useRef } from 'react';

import { ChevronDownIcon, ChevronUpIcon, XIcon } from 'lucide-react';
import LoadingSpin from '@/components/LoadingSpin';

import {
  VISITE_INTERETS,
  VISITE_STATUT,
  getFullOrientation,
  getModePaiementLabel,
  getRelance_label,
} from '../../../src/configs/enum';
import { APIURL } from '@/configs/api';
import axios from 'axios';
const Modal_Historique = ({ onClose, rows, loading_histo }) => {
  const [entityNames, setEntityNames] = useState({});
  const accessToken = localStorage.getItem('accessToken');

  // Extract all unique IDs for sources, partners, and banks from history
  useEffect(() => {
    if (!rows.length) return;

    const allSources = new Set();
    const allPartenaires = new Set();
    const allBanques = new Set();

    rows.forEach((row) => {
      if (!row.historique_modification) return;

      try {
        const historique = JSON.parse(row.historique_modification);

        // Check prospect changes (source & partenaire)
        if (historique.prospect) {
          if (historique.prospect.source?.new) {
            allSources.add(historique.prospect.source.new);
          }
          if (historique.prospect.partenaire_id?.new) {
            allPartenaires.add(historique.prospect.partenaire_id.new);
          }
        }

        // Check reservation changes (banque)
        if (historique.reservation?.banque_id?.new) {
          allBanques.add(historique.reservation.banque_id.new);
        }
      } catch (e) {
        console.error('Failed to parse historique:', e);
      }
    });

    // Fetch all unique entities at once
    const fetchAllEntities = async () => {
      const newEntityNames = { ...entityNames };

      // Fetch sources
      for (const id of allSources) {
        if (!newEntityNames[`source_${id}`]) {
          const name = await fetchEntityName('source', id);
          newEntityNames[`source_${id}`] = name;
        }
      }

      // Fetch partenaires
      for (const id of allPartenaires) {
        if (!newEntityNames[`partenaire_${id}`]) {
          const name = await fetchEntityName('partenaire', id);
          newEntityNames[`partenaire_${id}`] = name;
        }
      }

      // Fetch banques
      for (const id of allBanques) {
        if (!newEntityNames[`banque_${id}`]) {
          const name = await fetchEntityName('banque', id);
          newEntityNames[`banque_${id}`] = name;
        }
      }

      setEntityNames(newEntityNames);
    };

    fetchAllEntities();
  }, [rows]);

  // Unified fetch function (unchanged)
  const fetchEntityName = async (type, id) => {
    if (!id) return null;

    const cacheKey = `${type}_${id}`;
    if (entityNames[cacheKey]) return entityNames[cacheKey];

    try {
      let endpoint, dataPath;
      switch (type) {
        case 'source':
          endpoint = `${APIURL.SOURCES}/${id}`;
          dataPath = 'source.source';
          break;
        case 'banque':
          endpoint = `${APIURL.BANQUES}/${id}`;
          dataPath = 'banque.nom';
          break;
        case 'partenaire':
          endpoint = `${APIURL.PARTENAIRES}/${id}`;
          dataPath = 'partenaire.nom';
          break;
        default:
          return null;
      }

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const name = dataPath
        .split('.')
        .reduce((obj, key) => obj?.[key], response.data);
      return name;
    } catch (error) {
      console.error(`Error fetching ${type} name:`, error);
      return null;
    }
  };

  // EntityName component now just reads from cache (no API calls)
  const EntityName = ({ type, id }) => {
    const cacheKey = `${type}_${id}`;
    const name = entityNames[cacheKey];

    if (name === undefined)
      return <span className="text-gray-400">Chargement...</span>;
    if (!name) return <span className="text-gray-400">Inconnu</span>;
    return <span>{name}</span>;
  };
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

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return null;
    const date = new Date(dateTimeString);
    return date.toLocaleString('fr-FR');
  };

  const Row = ({ row }) => {
    const [open, setOpen] = useState(false);
    const isExpandable = !row.action.includes('SUPPRESSION');

    // Parse historique_modification if it exists
    const historiqueModification = row.historique_modification
      ? JSON.parse(row.historique_modification)
      : null;
    // Filter out the fields we don't want to display
    const filteredChanges = historiqueModification
      ? Object.entries(historiqueModification).filter(
          ([key]) => !['interet', 'statut', 'bien_id'].includes(key)
        )
      : [];

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
            {getInteretBadge(row?.interet)}
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
                    {/* Creation et modification */}
                    {row.interet == '3' ? (
                      <table className="w-full text-sm border-collapse">
                        <thead style={{ background: '#bcf7ff' }}>
                          <tr>
                            {/* First render Frein fields that are not null */}
                            {[
                              {
                                key: 'fr_tranches',
                                label: 'Tranches',
                                value: row.fr_tranches,
                              },
                              {
                                key: 'fr_etages',
                                label: 'Etages',
                                value: row.fr_etages
                                  ? row.fr_etages
                                      .split(',')
                                      .map((e) => e.trim())
                                      .join(', ')
                                  : null,
                              },
                              {
                                key: 'fr_orientations',
                                label: 'Orientations',
                                value: row.fr_orientations
                                  ? row.fr_orientations
                                      .split(',')
                                      .map(getFullOrientation)
                                      .join(', ')
                                  : null,
                              },
                              {
                                key: 'fr_typologies',
                                label: 'Typologies',
                                value: row.fr_typologies,
                              },
                              {
                                key: 'fr_vues',
                                label: 'Vues',
                                value: row.fr_vues,
                              },
                              {
                                key: 'prix',
                                label: 'Prix',
                                value:
                                  row.prix_min && row.prix_max
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
                                    : null,
                              },
                              {
                                key: 'superficie',
                                label: 'Superficie',
                                value:
                                  row.sup_min && row.sup_max
                                    ? `Superficie entre ${row.sup_min} m² et ${row.sup_max} m²`
                                    : row.sup_min
                                    ? `Superficie à partir de ${row.sup_min} m²`
                                    : row.sup_max
                                    ? `Superficie jusqu'à ${row.sup_max} m²`
                                    : null,
                              },
                              {
                                key: 'avance',
                                label: 'Avance',
                                value: row.avance,
                              },
                              {
                                key: 'fr_autre',
                                label: 'Autre',
                                value: row.fr_autre,
                              },
                            ]
                              .filter(
                                (item) =>
                                  item.value !== null &&
                                  item.value !== undefined &&
                                  item.value !== ''
                              )
                              .map(({ key, label }) => (
                                <th
                                  key={key}
                                  className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700"
                                >
                                  {label}
                                </th>
                              ))}

                            {/* Then render historique_modification fields (excluding interet, statut, bien_id, notifications, and freins) */}
                            {historiqueModification &&
                              filteredChanges.map(([key]) => (
                                <th
                                  key={`histo_${key}`}
                                  className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700"
                                >
                                  {key === 'prospect' && 'Prospect'}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            {/* First render Frein values */}
                            {[
                              { key: 'fr_tranches', value: row.fr_tranches },
                             { key: 'fr_etages', value: row.fr_etages ? row.fr_etages.split(',').map(e => e.trim()).join(', ') : null },
                              {
                                key: 'fr_orientations',
                                value: row.fr_orientations
                                  ? row.fr_orientations
                                      .split(',')
                                      .map(getFullOrientation)
                                      .join(', ')
                                  : null,
                              },
                              {
                                key: 'fr_typologies',
                                value: row.fr_typologies,
                              },
                              { key: 'fr_vues', value: row.fr_vues },
                              {
                                key: 'prix',
                                value:
                                  row.prix_min && row.prix_max
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
                                    : null,
                              },
                              {
                                key: 'superficie',
                                value:
                                  row.sup_min && row.sup_max
                                    ? `Superficie entre ${row.sup_min} m² et ${row.sup_max} m²`
                                    : row.sup_min
                                    ? `Superficie à partir de ${row.sup_min} m²`
                                    : row.sup_max
                                    ? `Superficie jusqu'à ${row.sup_max} m²`
                                    : null,
                              },
                              { key: 'avance', value: row.avance },
                              { key: 'fr_autre', value: row.fr_autre },
                            ]
                              .filter(
                                (item) =>
                                  item.value !== null &&
                                  item.value !== undefined &&
                                  item.value !== ''
                              )
                              .map(({ key, value }) => (
                                <td
                                  key={key}
                                  className="text-center px-3 py-2 border-b border-gray-200"
                                >
                                  {value || '-'}
                                </td>
                              ))}

                            {/* Then render historique_modification values */}
                            {historiqueModification &&
                              filteredChanges.map(([key, value]) => {
                                const renderProspectField = (
                                  field,
                                  changes
                                ) => {
                                  if (
                                    !changes ||
                                    changes.new === undefined ||
                                    changes.new === null
                                  )
                                    return null;

                                  const FieldName = ({ children }) => (
                                    <span className="font-bold">
                                      {children}
                                    </span>
                                  );

                                  if (field === 'notifie') {
                                    return (
                                      <div className="text-center">
                                        <FieldName>notifié</FieldName>:{' '}
                                        {changes.new == 1 ? 'Oui' : 'Non'}
                                      </div>
                                    );
                                  } else if (field === 'source') {
                                    return (
                                      <div className="text-center">
                                        <EntityName
                                          type="source"
                                          id={changes.new}
                                        />{' '}
                                      </div>
                                    );
                                  } else if (field === 'partenaire_id') {
                                    return (
                                      <div className="text-center">
                                        <FieldName>Partenaire</FieldName>:{' '}
                                        <EntityName
                                          type="partenaire"
                                          id={changes.new}
                                        />
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className="text-center">
                                      <FieldName>{field}</FieldName>:{' '}
                                      {changes.new}
                                    </div>
                                  );
                                };

                                let displayContent;

                                if (key === 'prospect') {
                                  displayContent =
                                    value && typeof value === 'object' ? (
                                      <div className="flex flex-col items-center justify-center gap-1">
                                        {Object.entries(value)
                                          .map(([field, changes]) =>
                                            renderProspectField(field, changes)
                                          )
                                          .filter(Boolean)}
                                      </div>
                                    ) : (
                                      <div className="text-center">
                                        (no data)
                                      </div>
                                    );
                                }

                                return (
                                  <td
                                    key={key}
                                    className="px-3 py-2 border-b border-gray-200"
                                  >
                                    {displayContent || (
                                      <div className="text-center"></div>
                                    )}
                                  </td>
                                );
                              })}
                          </tr>
                        </tbody>
                      </table>
                    ) : historiqueModification ? (
                      <table className="w-full text-sm border-collapse">
                        {/* interet 1 ou 2 and has historique modifier en cas de Modifier */}
                        <thead style={{ background: '#bcf7ff' }}>
                          <tr>
                            {filteredChanges.map(([key]) => (
                              <th
                                 key={`frein_${key}`}
                                className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700"
                              >
                                {key == 'date_relance' && 'Date Relance'}
                                {key == 'mode_relance' && 'Mode Relance'}
                                {key == 'rdv' && 'Rendez-vous'}
                                {key == 'prospect' && 'Prospect'}
                                {key == 'reservation' &&
                                  'Code réservation'}{' '}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            {filteredChanges.map(([key, value]) => {
                              const renderProspectField = (field, changes) => {
                                if (
                                  !changes ||
                                  changes.new === undefined ||
                                  changes.new === null
                                )
                                  return null;

                                const FieldName = ({ children }) => (
                                  <span className="font-bold">{children}</span>
                                );

                                if (field === 'notifie') {
                                  return (
                                    <div className="text-center">
                                      <FieldName>notifié</FieldName>:{' '}
                                      {changes.new == 1 ? 'Oui' : 'Non'}
                                    </div>
                                  );
                                } else if (field === 'source') {
                                  return (
                                    <div className="text-center">
                                      <FieldName>Source</FieldName>:{' '}
                                      <EntityName
                                        type="source"
                                        id={changes.new}
                                      />{' '}
                                    </div>
                                  );
                                } else if (field === 'partenaire_id') {
                                  return (
                                    <div className="text-center">
                                      <EntityName
                                        type="partenaire"
                                        id={changes.new}
                                      />{' '}
                                    </div>
                                  );
                                }
                                return (
                                  <div className="text-center">
                                    <FieldName>{field}</FieldName>:{' '}
                                    {changes.new}
                                  </div>
                                );
                              };

                              const renderReservationField = (
                                field,
                                changes
                              ) => {
                                if (
                                  !changes ||
                                  changes.new === undefined ||
                                  changes.new === null
                                )
                                  return null;

                                const FieldName = ({ children }) => (
                                  <span className="font-bold">{children}</span>
                                );

                                if (field === 'banque_id') {
                                  return (
                                    <div className="text-center">
                                      <FieldName>Banque</FieldName>:{' '}
                                      <EntityName
                                        type="banque"
                                        id={changes.new}
                                      />{' '}
                                    </div>
                                  );
                                } else if (field === 'mode_financement') {
                                  return (
                                    <div className="text-center">
                                      <FieldName>Mode financement</FieldName>:{' '}
                                      {changes.new == 1
                                        ? 'Comptant'
                                        : changes.new == 2
                                        ? 'Crédit'
                                        : 'Indécis'}
                                    </div>
                                  );
                                } else if (field === 'mode_paiement') {
                                  return (
                                    <div className="text-center">
                                      <FieldName>Mode paiement</FieldName>:{' '}
                                      {getModePaiementLabel(changes.new)}
                                    </div>
                                  );
                                } else if (
                                  field === 'date_reservation' ||
                                  field === 'date_reglement' ||
                                  field === 'date_encaissement'
                                ) {
                                  return (
                                    <div className="text-center">
                                      <FieldName>
                                        {field.replace('_', ' ')}
                                      </FieldName>
                                      : {formatDate(changes.new)}
                                    </div>
                                  );
                                }
                                return (
                                  <div className="text-center">
                                    <FieldName>
                                      {field.replace('_', ' ')}
                                    </FieldName>
                                    : {changes.new}
                                  </div>
                                );
                              };

                              let displayContent;

                              if (key === 'date_relance') {
                                displayContent = (
                                  <div className="text-center">
                                    {formatDate(value.new)}
                                  </div>
                                );
                              } else if (key === 'mode_relance') {
                                displayContent = (
                                  <div className="text-center">
                                    {getRelance_label(value.new)}
                                  </div>
                                );
                              } else if (key === 'rdv') {
                                displayContent = (
                                  <div className="text-center">
                                    {formatDateTime(value.new)}
                                  </div>
                                );
                              } else if (key === 'prospect') {
                                displayContent =
                                  value && typeof value === 'object' ? (
                                    <div className="flex flex-col items-center justify-center gap-1">
                                      {Object.entries(value)
                                        .map(([field, changes]) =>
                                          renderProspectField(field, changes)
                                        )
                                        .filter(Boolean)}
                                    </div>
                                  ) : (
                                    <div className="text-center">(no data)</div>
                                  );
                              } else if (key === 'reservation') {
                                displayContent =
                                  value && typeof value === 'object' ? (
                                    <div className="flex flex-col items-center justify-center gap-1">
                                      {Object.entries(value)
                                        .map(([field, changes]) =>
                                          renderReservationField(field, changes)
                                        )
                                        .filter(Boolean)}
                                    </div>
                                  ) : (
                                    <div className="text-center">(no data)</div>
                                  );
                              }

                              return (
                                <td
                                  key={key}
                                  className="px-3 py-2 border-b border-gray-200"
                                >
                                  {displayContent || (
                                    <div className="text-center"></div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      <>
                        {(row.interet == '1' || row.interet == '2') &&
                          row.statut != 2 && (
                            <table className="w-full text-sm border-collapse">
                              {/* Création */}
                              <thead style={{ background: '#bcf7ff' }}>
                                <tr>
                                  <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                                    Mode Relance
                                  </th>
                                  <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                                    Date de Relance
                                  </th>
                                  {row.interet == '1' && (
                                    <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                                      RDV
                                    </th>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="bg-white">
                                  <td className="text-center px-3 py-2 border-b border-gray-200">
                                    {getRelance_label(row.mode_rel) || null}
                                  </td>
                                  <td className="text-center px-3 py-2 border-b border-gray-200">
                                    {row.date_rel || null}
                                  </td>
                                  {row.interet == '1' && (
                                    <td className="text-center px-3 py-2 border-b border-gray-200">
                                      {row.rdv || null}
                                    </td>
                                  )}
                                </tr>
                              </tbody>
                            </table>
                          )}
                      </>
                    )}
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
                  <Row
                    key={`${row.id || `row-${index}`}-${row.action}-${
                      row.date
                    }`}
                    row={row}
                  />
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
