import React from 'react';
import {
  PencilIcon,
  TrashIcon,
  HomeIcon,
  LayersIcon,
  BuildingIcon,
  BoxesIcon,
  CalendarIcon,
  FileTextIcon,
} from 'lucide-react';

export const LeftCard = ({ tranche, onEdit, onDelete, canEdit = false }) => {
  // Helper function to check if value exists and is greater than 0
  const shouldShowStat = (value) => {
    return value !== undefined && value !== null && value > 0;
  };

  // Check which stats should be shown based on project counts
  const showBiens = shouldShowStat(tranche?.projet?.nbre_biens);
  const showImmeubles = shouldShowStat(tranche?.projet?.nbre_immeubles);
  const showBlocs = shouldShowStat(tranche?.projet?.nbre_blocs);

  // Count visible stats for grid layout
  const visibleStats = [showBiens, showImmeubles, showBlocs].filter(Boolean).length;

  // Determine grid class based on number of visible stats
  const getGridClass = () => {
    switch (visibleStats) {
      case 1:
        return 'flex justify-center';
      case 2:
        return 'grid grid-cols-2 divide-x border-b';
      case 3:
        return 'grid grid-cols-3 divide-x border-b';
      default:
        return 'hidden';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
      <div
        className="relative h-40 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop)',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="bg-white p-1 rounded-full mb-2 shadow-md">
            <img
              src='https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=200&auto=format&fit=crop'
              alt={`${tranche.nom} logo`}
              className="w-20 h-20 object-cover rounded-full"
            />
          </div>
          <h1 className="text-white text-2xl font-bold text-center px-4">
            {tranche.nom}
          </h1>
        </div>
      </div>
      
      {/* Stats section - Only show if at least one stat is > 0 */}
      {visibleStats > 0 && (
        <div className={getGridClass()}>
          {showBiens && (
            <div className="flex flex-col items-center justify-center py-3 px-2">
              <HomeIcon className="text-blue-600 mb-1" size={20} />
              <div className="text-xs text-gray-600">Biens</div>
              <div className="font-bold text-sm">{tranche?.bien_count || 0}</div>
            </div>
          )}
          {showBlocs && (
            <div className="flex flex-col items-center justify-center py-3 px-2">
              <BoxesIcon className="text-orange-600 mb-1" size={20} />
              <div className="text-xs text-gray-600">Blocs</div>
              <div className="font-bold text-sm">{tranche?.bloc_count || 0}</div>
            </div>
          )}
          {showImmeubles && (
            <div className="flex flex-col items-center justify-center py-3 px-2">
              <BuildingIcon className="text-purple-600 mb-1" size={20} />
              <div className="text-xs text-gray-600">Immeubles</div>
              <div className="font-bold text-sm">{tranche?.immeuble_count || 0}</div>
            </div>
          )}
        </div>
      )}
      
      <div className="p-6 flex-grow">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Détails Tranche
          </h2>
          <p className="text-gray-600">{tranche.description}</p>
          <div className="grid grid-cols-1 gap-2 text-sm mt-6">            
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center text-gray-700">
                <CalendarIcon size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                <span>Date de lancement:</span>
              </div>
              <div className="text-gray-600 text-right">{tranche?.date_lancement || "Date non spécifiée"}</div>
            </div>
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center text-gray-700">
                <CalendarIcon size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                <span>Date livraison:</span>
              </div>
              <div className="text-gray-600 text-right">{tranche?.date_livraison || "Date non spécifiée"}</div>
            </div>
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center text-gray-700">
                <FileTextIcon size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                <span>Niveau {"d'"}étages:</span>
              </div>
              <div className="text-gray-600 text-right">{tranche?.niveau_etages || "Titre non spécifié"}</div>
            </div>
            
           
            
            {shouldShowStat(tranche?.bloc_count) && (
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center text-gray-700">
                  <BoxesIcon size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                  <span>Nombre de blocs:</span>
                </div>
                <div className="text-gray-600 text-right">{tranche.nbre_blocs}</div>
              </div>
            )}
            
            {shouldShowStat(tranche?.immeuble_count) && (
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center text-gray-700">
                  <BuildingIcon size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                  <span>Nombre {"d'"}immeubles:</span>
                </div>
                <div className="text-gray-600 text-right">{tranche.nbre_immeubles}</div>
              </div>
            )}
            
            {shouldShowStat(tranche?.bien_count) && (
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center text-gray-700">
                  <BuildingIcon size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                  <span>Nombre de bien:</span>
                </div>
                <div className="text-gray-600 text-right">{tranche.nbre_biens}</div>
              </div>
            )}
          </div>
        </div>
        
      </div>
      
      {canEdit && (
        <div className="p-6 bg-gray-50 flex justify-center gap-3">
          <button 
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <PencilIcon size={16} />
            Modifier
          </button>
          <button 
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center gap-2 hover:bg-red-700 transition"
          >
            <TrashIcon size={16} />
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
};