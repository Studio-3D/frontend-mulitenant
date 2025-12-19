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
  const [loadingEntities, setLoadingEntities] = useState(false); // Add this
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
       // In the useEffect that collects entities:
if (historique.prospect) {
  if (historique.prospect.source?.new) {
    allSources.add(String(historique.prospect.source.new));
  }
  if (historique.prospect.source?.old) {
    allSources.add(String(historique.prospect.source.old));
  }
  if (historique.prospect.partenaire_id?.new) {
    allPartenaires.add(String(historique.prospect.partenaire_id.new));
  }
  if (historique.prospect.partenaire_id?.old) {
    allPartenaires.add(String(historique.prospect.partenaire_id.old));
  }
}

// Same for banque:
if (historique.reservation?.banque_id?.new) {
  allBanques.add(String(historique.reservation.banque_id.new));
}
if (historique.reservation?.banque_id?.old) {
  allBanques.add(String(historique.reservation.banque_id.old));
}
      } catch (e) {
        console.error('Failed to parse historique:', e);
      }
    });

    // Fetch all unique entities at once
    const fetchAllEntities = async () => {
      setLoadingEntities(true); // Start loading

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
      setLoadingEntities(false); // End loading

    };

    fetchAllEntities();
  }, [rows]);

  // Unified fetch function (unchanged)
  const fetchEntityName = async (type, id) => {
    if (!id) return null;
  
    const normalizedId = String(id);
    const cacheKey = `${type}_${normalizedId}`;
    
    if (entityNames[cacheKey]) return entityNames[cacheKey];
  
    try {
      let endpoint, dataPath;
      switch (type) {
        case 'source':
          endpoint = `${APIURL.SOURCES}/${normalizedId}`;
          dataPath = 'source.source';  // This returns the source name
          break;
        case 'banque':
          endpoint = `${APIURL.BANQUES}/${normalizedId}`;
          dataPath = 'banque.nom';  // This returns the banque name
          break;
        case 'partenaire':
          endpoint = `${APIURL.PARTENAIRES}/${normalizedId}`;
          dataPath = 'partenaire.description';  // CHANGED: Use 'description' not 'nom'
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
    if (!id) return null;
    const normalizedId = String(id);
    const cacheKey = `${type}_${normalizedId}`;
    const name = entityNames[cacheKey];
  
    // Show loading spinner if entities are still loading
    if (loadingEntities && name === undefined) {
      return <span className="text-gray-400">Chargement...</span>;
    }
    
    if (name === undefined) {
      return <span className="text-gray-400">Non chargé</span>;
    }
    
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

 const Row = ({ row, allRows, currentIndex }) => {
  const [open, setOpen] = useState(false);
  const isExpandable = !row.action.includes('SUPPRESSION');
  const isPerdu = row.interet == '3';
  
  // Parse historique_modification if it exists
  const historiqueModification = row.historique_modification
    ? JSON.parse(row.historique_modification)
    : null;

  // Get frein data from current row
  const getCurrentFreinData = () => {
    if (!isPerdu) return null;
    
    return {
      fr_tranches: row.fr_tranches,
      fr_etages: row.fr_etages,
      fr_orientations: row.fr_orientations,
      fr_typologies: row.fr_typologies,
      fr_vues: row.fr_vues,
      prix_min: row.prix_min,
      prix_max: row.prix_max,
      sup_min: row.sup_min,
      sup_max: row.sup_max,
      avance: row.avance,
      fr_autre: row.fr_autre
    };
  };

  // Find the NEXT Perdu row (chronologically later - looking forward in array)
  // Because rows are sorted by date DESC (most recent first)
  const findNextPerduRow = () => {
    // On cherche le prochain Perdu APRES le row actuel (dans le futur chronologique)
    // Puisque l'array est trié du plus récent au plus ancien,
    // on cherche vers la fin de l'array (indices plus grands)
    for (let i = currentIndex + 1; i < allRows.length; i++) {
      const nextRow = allRows[i];
      if (nextRow.interet == '3') {
        return {
          fr_tranches: nextRow.fr_tranches,
          fr_etages: nextRow.fr_etages,
          fr_orientations: nextRow.fr_orientations,
          fr_typologies: nextRow.fr_typologies,
          fr_vues: nextRow.fr_vues,
          prix_min: nextRow.prix_min,
          prix_max: nextRow.prix_max,
          sup_min: nextRow.sup_min,
          sup_max: nextRow.sup_max,
          avance: nextRow.avance,
          fr_autre: nextRow.fr_autre
        };
      }
    }
    return null;
  };

  const currentFreinData = getCurrentFreinData();
  const nextPerduData = findNextPerduRow();
  
  // Afficher la comparaison SEULEMENT si:
  // 1. Le row actuel est Perdu
  // 2. ET il y a un Perdu CHRONOLOGIQUEMENT APRÈS (plus ancien)
  const shouldShowComparison = isPerdu && nextPerduData;
  
  // Afficher les données actuelles SEULEMENT si:
  // 1. Le row actuel est Perdu
  // 2. ET il n'y a PAS de Perdu après (c'est le plus ancien)
  const shouldShowCurrentFrein = isPerdu && !shouldShowComparison;

  // Condition pour afficher la section détails
  const shouldShowDetails = isPerdu || 
                          historiqueModification?.prospect != null ||
                          historiqueModification?.frein != null;

  const toggleExpand = () => isExpandable && setOpen(!open);

  return (
    <>
      <tr className="border-b hover:bg-gray-50 transition-colors duration-150">
        <td className="px-4 py-3 text-center">
          {isExpandable && shouldShowDetails && (
            <button onClick={toggleExpand}>
              {open ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
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
        <td className="px-4 py-3 text-center">
          {row.mode_rel && <>{getRelance_label(row.mode_rel) || null}</>}
        </td>
        <td className="px-4 py-3 text-center">
          {row.date_rel && <>{row.date_rel}</>}
        </td>
        <td className="px-4 py-3 text-center">
          {row.rdv && <>{row.rdv}</>}
        </td>
      </tr>
      {isExpandable && shouldShowDetails && open && (
        <tr className="border-b">
          <td colSpan={10} className="p-0 bg-gray-50">
            <div className="p-4">
              <h6 className="text-md font-semibold mb-3 !text-gray-700 flex items-center">
                <span className="w-1.5 h-5 bg-blue-600 rounded-sm mr-2"></span>
                Détails supplémentaires
              </h6>
              <div className="overflow-hidden">
                {/* Show frein comparison table for successive Perdu */}
                {shouldShowComparison && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3 text-blue-700">
                      Modifications Frein (Comparaison avec visite Perdu suivante)
                    </h4>
                    <table className="w-full text-sm border-collapse">
                      <thead style={{ background: '#e6f7ff' }}>
                        <tr>
                          <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                            Champ
                          </th>
                          <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                            Ancienne valeur (Visite Perdu précédente)
                          </th>
                          <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                            Nouvelle valeur (Visite actuelle)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Tranches - Compare: tg01 (old from next row) vs tg01,tg02 (new from current row) */}
                        <tr className="bg-white">
                          <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                            Tranches
                          </td>
                          <td className="text-center px-3 py-2 border-b border-gray-200 text-red-500">
                            {nextPerduData.fr_tranches || '-'}
                          </td>
                          <td className="text-center px-3 py-2 border-b border-gray-200 text-green-600 font-medium">
                            {currentFreinData.fr_tranches || '-'}
                          </td>
                        </tr>
                        
                        {/* Etages - Compare: 0 (old from next row) vs 0,2 (new from current row) */}
                        <tr className="bg-white">
                          <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                            Etages
                          </td>
                          <td className="text-center px-3 py-2 border-b border-gray-200 text-red-500">
                            {nextPerduData.fr_etages 
                              ? nextPerduData.fr_etages.split(',').map(e => e.trim()).join(', ')
                              : '-'}
                          </td>
                          <td className="text-center px-3 py-2 border-b border-gray-200 text-green-600 font-medium">
                            {currentFreinData.fr_etages 
                              ? currentFreinData.fr_etages.split(',').map(e => e.trim()).join(', ')
                              : '-'}
                          </td>
                        </tr>
                        
                        {/* Orientations - Compare: - (old from next row) vs E,S (new from current row) */}
                        <tr className="bg-white">
                          <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                            Orientations
                          </td>
                          <td className="text-center px-3 py-2 border-b border-gray-200 text-red-500">
                            {nextPerduData.fr_orientations 
                              ? nextPerduData.fr_orientations.split(',').map(getFullOrientation).join(', ')
                              : '-'}
                          </td>
                          <td className="text-center px-3 py-2 border-b border-gray-200 text-green-600 font-medium">
                            {currentFreinData.fr_orientations 
                              ? currentFreinData.fr_orientations.split(',').map(getFullOrientation).join(', ')
                              : '-'}
                          </td>
                        </tr>
                        
                        {/* Typologies */}
                        {(currentFreinData.fr_typologies || nextPerduData.fr_typologies) && (
                          <tr className="bg-white">
                            <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                              Typologies
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200 text-red-500">
                              {nextPerduData.fr_typologies || '-'}
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200 text-green-600 font-medium">
                              {currentFreinData.fr_typologies || '-'}
                            </td>
                          </tr>
                        )}
                        
                        {/* Vues */}
                        {(currentFreinData.fr_vues || nextPerduData.fr_vues) && (
                          <tr className="bg-white">
                            <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                              Vues
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200 text-red-500">
                              {nextPerduData.fr_vues || '-'}
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200 text-green-600 font-medium">
                              {currentFreinData.fr_vues || '-'}
                            </td>
                          </tr>
                        )}
                        
                        {/* Prix Min */}
                        {(currentFreinData.prix_min || nextPerduData.prix_min) && (
                          <tr className="bg-white">
                            <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                              Prix Min
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200 text-red-500">
                              {nextPerduData.prix_min ? `${nextPerduData.prix_min} DH` : '-'}
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200 text-green-600 font-medium">
                              {currentFreinData.prix_min ? `${currentFreinData.prix_min} DH` : '-'}
                            </td>
                          </tr>
                        )}
                        
                        {/* Prix Max */}
                        {(currentFreinData.prix_max || nextPerduData.prix_max) && (
                          <tr className="bg-white">
                            <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                              Prix Max
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200 text-red-500">
                              {nextPerduData.prix_max ? `${nextPerduData.prix_max} DH` : '-'}
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200 text-green-600 font-medium">
                              {currentFreinData.prix_max ? `${currentFreinData.prix_max} DH` : '-'}
                            </td>
                          </tr>
                        )}
                        
                        {/* Superficie Min */}
                        {(currentFreinData.sup_min || nextPerduData.sup_min) && (
                          <tr className="bg-white">
                            <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                              Superficie Min
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200 text-red-500">
                              {nextPerduData.sup_min ? `${nextPerduData.sup_min} m²` : '-'}
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200 text-green-600 font-medium">
                              {currentFreinData.sup_min ? `${currentFreinData.sup_min} m²` : '-'}
                            </td>
                          </tr>
                        )}
                        
                        {/* Superficie Max */}
                        {(currentFreinData.sup_max || nextPerduData.sup_max) && (
                          <tr className="bg-white">
                            <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                              Superficie Max
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200 text-red-500">
                              {nextPerduData.sup_max ? `${nextPerduData.sup_max} m²` : '-'}
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200 text-green-600 font-medium">
                              {currentFreinData.sup_max ? `${currentFreinData.sup_max} m²` : '-'}
                            </td>
                          </tr>
                        )}
                        
                        {/* Avance - Compare: - (old from next row) vs 20000 (new from current row) */}
                        <tr className="bg-white">
                          <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                            Avance
                          </td>
                          <td className="text-center px-3 py-2 border-b border-gray-200 text-red-500">
                            {nextPerduData.avance ? `${nextPerduData.avance} DH` : '-'}
                          </td>
                          <td className="text-center px-3 py-2 border-b border-gray-200 text-green-600 font-medium">
                            {currentFreinData.avance ? `${currentFreinData.avance} DH` : '-'}
                          </td>
                        </tr>
                        
                        {/* Autre */}
                        {(currentFreinData.fr_autre || nextPerduData.fr_autre) && (
                          <tr className="bg-white">
                            <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                              Autre
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200 text-red-500">
                              {nextPerduData.fr_autre || '-'}
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200 text-green-600 font-medium">
                              {currentFreinData.fr_autre || '-'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Show current frein data (when no next Perdu to compare with) */}
                {shouldShowCurrentFrein && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3 text-blue-700">
                      Données Frein (Visite actuelle)
                    </h4>
                    <table className="w-full text-sm border-collapse">
                      <thead style={{ background: '#e6f7ff' }}>
                        <tr>
                          <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                            Champ
                          </th>
                          <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                            Valeur
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Tranches */}
                        {currentFreinData.fr_tranches && (
                          <tr className="bg-white">
                            <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                              Tranches
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200">
                              {currentFreinData.fr_tranches}
                            </td>
                          </tr>
                        )}
                        
                        {/* Etages */}
                        {currentFreinData.fr_etages && (
                          <tr className="bg-white">
                            <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                              Etages
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200">
                              {currentFreinData.fr_etages.split(',').map(e => e.trim()).join(', ')}
                            </td>
                          </tr>
                        )}
                        
                        {/* Orientations */}
                        {currentFreinData.fr_orientations && (
                          <tr className="bg-white">
                            <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                              Orientations
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200">
                              {currentFreinData.fr_orientations.split(',').map(getFullOrientation).join(', ')}
                            </td>
                          </tr>
                        )}
                        
                        {/* Typologies */}
                        {currentFreinData.fr_typologies && (
                          <tr className="bg-white">
                            <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                              Typologies
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200">
                              {currentFreinData.fr_typologies}
                            </td>
                          </tr>
                        )}
                        
                        {/* Vues */}
                        {currentFreinData.fr_vues && (
                          <tr className="bg-white">
                            <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                              Vues
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200">
                              {currentFreinData.fr_vues}
                            </td>
                          </tr>
                        )}
                        
                        {/* Prix Min */}
                        {currentFreinData.prix_min && (
                          <tr className="bg-white">
                            <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                              Prix Min
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200">
                              {currentFreinData.prix_min} DH
                            </td>
                          </tr>
                        )}
                        
                        {/* Prix Max */}
                        {currentFreinData.prix_max && (
                          <tr className="bg-white">
                            <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                              Prix Max
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200">
                              {currentFreinData.prix_max} DH
                            </td>
                          </tr>
                        )}
                        
                        {/* Superficie Min */}
                        {currentFreinData.sup_min && (
                          <tr className="bg-white">
                            <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                              Superficie Min
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200">
                              {currentFreinData.sup_min} m²
                            </td>
                          </tr>
                        )}
                        
                        {/* Superficie Max */}
                        {currentFreinData.sup_max && (
                          <tr className="bg-white">
                            <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                              Superficie Max
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200">
                              {currentFreinData.sup_max} m²
                            </td>
                          </tr>
                        )}
                        
                        {/* Avance */}
                        {currentFreinData.avance && (
                          <tr className="bg-white">
                            <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                              Avance
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200">
                              {currentFreinData.avance} DH
                            </td>
                          </tr>
                        )}
                        
                        {/* Autre */}
                        {currentFreinData.fr_autre && (
                          <tr className="bg-white">
                            <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                              Autre
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200">
                              {currentFreinData.fr_autre}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Show prospect changes from historique_modification */}
                {historiqueModification?.prospect && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3 text-blue-700">
                      Modifications Prospect
                    </h4>
                    <table className="w-full text-sm border-collapse">
                      <thead style={{ background: '#e6f7ff' }}>
                        <tr>
                          <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                            Champ
                          </th>
                          <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                            Ancienne valeur
                          </th>
                          <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                            Nouvelle valeur
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(historiqueModification.prospect).map(([field, changes]) => {
                          if (!changes || (changes.new === undefined && changes.old === undefined))
                            return null;

                          const getFieldLabel = (field) => {
                            const labels = {
                              cin: 'CIN',
                              email: 'Email',
                              nom: 'Nom',
                              prenom: 'Prénom',
                              telephone: 'Téléphone',
                              telephone_num2: 'Téléphone 2',
                              ville: 'Ville',
                              notifie: 'Notifié',
                              source: 'Source',
                              partenaire_id: 'Partenaire',
                            };
                            return labels[field] || field;
                          };

                          return (
                            <tr key={field} className="bg-white">
                              <td className="text-center px-3 py-2 border-b border-gray-200 font-medium">
                                {getFieldLabel(field)}
                              </td>
                              <td className="text-center px-3 py-2 border-b border-gray-200 text-red-500">
                                {field === 'notifie' ? (
                                  changes.old == 1 ? 'Oui' : changes.old == 0 ? 'Non' : ''
                                ) : field === 'source' ? (
                                  changes.old ? (
                                    <EntityName type="source" id={changes.old} />
                                  ) : ''
                                ) : field === 'partenaire_id' ? (
                                  changes.old ? (
                                    <EntityName type="partenaire" id={changes.old} />
                                  ) : ''
                                ) : changes.old !== undefined && changes.old !== null ? (
                                  changes.old
                                ) : ''}
                              </td>
                              <td className="text-center px-3 py-2 border-b border-gray-200 text-green-600 font-medium">
                                {field === 'notifie' ? (
                                  changes.new == 1 ? 'Oui' : 'Non'
                                ) : field === 'source' ? (
                                  changes.new ? (
                                    <EntityName type="source" id={changes.new} />
                                  ) : ''
                                ) : field === 'partenaire_id' ? (
                                  changes.new ? (
                                    <EntityName type="partenaire" id={changes.new} />
                                  ) : ''
                                ) : changes.new !== undefined && changes.new !== null ? (
                                  changes.new
                                ) : ''}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Show other changes from historique_modification */}
{/* Show commentaire changes from historique_modification */}
{historiqueModification?.commentaire && (
  <div className="mb-6">
    <h4 className="text-lg font-semibold mb-3 text-blue-700">
      Commentaire
    </h4>
    <div className="flex items-center space-x-4">
      <div className="flex-1">
        <div className="text-sm text-gray-500 mb-1">Ancien:</div>
        <div className="px-3 py-2 bg-red-50 border border-red-200 rounded text-red-700 min-h-[40px]">
          {historiqueModification.commentaire.old || ''}
        </div>
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-500 mb-1">Nouveau:</div>
        <div className="px-3 py-2 bg-green-50 border border-green-200 rounded text-green-700 font-medium min-h-[40px]">
          {historiqueModification.commentaire.new || ''}
        </div>
      </div>
    </div>
  </div>
)}
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
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Mode Relance
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Date Relance
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Rendez Vous
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
  {rows.map((row, index) => (
    <Row
      key={`${row.id || `row-${index}`}-${row.action}-${row.date}`}
      row={row}
      allRows={rows}
      currentIndex={index}
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
