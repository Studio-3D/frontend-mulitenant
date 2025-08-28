import React from 'react';
import {
  PencilIcon,
  TrashIcon,
  HomeIcon,
  BuildingIcon,
  BoxesIcon,
  MapPinIcon,
  CalendarIcon,
  FileTextIcon,
  SquareIcon,
  DollarSignIcon,
  ClockIcon,
} from 'lucide-react';

export const LeftCard = ({ bloc, onEdit, onDelete, canEdit = false }) => {
  // Helper function to check if value exists and is greater than 0
  const shouldShowStat = (value) => {
    return value !== undefined && value !== null && value > 0;
  };

  // Count visible stats for grid layout
  const visibleStats = [
    shouldShowStat(bloc?.nbre_biens),
    shouldShowStat(bloc?.nbre_immeubles)
  ].filter(Boolean).length;

  // Determine grid class based on number of visible stats
  const gridClass = visibleStats > 0 ? `grid grid-cols-${visibleStats} divide-x border-b` : 'hidden';

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
              alt={`${bloc.nom} logo`}
              className="w-20 h-20 object-cover rounded-full"
            />
          </div>
          <h1 className="text-white text-2xl font-bold text-center px-4">
            {bloc.nom}
          </h1>
        </div>
      </div>
      
      {/* Stats section - Only show if at least one stat is > 0 */}
      {visibleStats > 0 && (
        <div className={gridClass}>
          {shouldShowStat(bloc?.nbre_biens) && (
            <div className="flex flex-col items-center justify-center py-3 px-2">
              <HomeIcon className="text-blue-600 mb-1" size={20} />
              <div className="text-xs text-gray-600">Biens</div>
              <div className="font-bold text-sm">{bloc?.bien_count}</div>
            </div>
          )}
          {shouldShowStat(bloc?.nbre_immeubles) && (
            <div className="flex flex-col items-center justify-center py-3 px-2">
              <BuildingIcon className="text-purple-600 mb-1" size={20} />
              <div className="text-xs text-gray-600">Immeubles</div>
              <div className="font-bold text-sm">{bloc?.immeuble_count}</div>
            </div>
          )}
        </div>
      )}
      
      <div className="p-6 flex-grow">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Détails du bloc
          </h2>
          <p className="text-gray-600">{bloc.description}</p>
          <div className="grid grid-cols-1 gap-2 text-sm mt-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center text-gray-700">
                <MapPinIcon size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                <span>Adresse:</span>
              </div>
              <div className="text-gray-600 text-right">
                {bloc?.adresse || "Adresse non spécifiée"}
              </div>
            </div>
            
            
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center text-gray-700">
                <FileTextIcon size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                <span>Titre foncier:</span>
              </div>
              <div className="text-gray-600 text-right">{bloc?.titre_foncier || "Titre non spécifié"}</div>
            </div>

            {shouldShowStat(bloc?.nbre_immeubles) && (
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center text-gray-700">
                  <BuildingIcon size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                  <span>Nombre d'immeubles:</span>
                </div>
                <div className="text-gray-600 text-right">{bloc.nbre_immeubles}</div>
              </div>
            )}
            
            {shouldShowStat(bloc?.nbre_biens) && (
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center text-gray-700">
                  <HomeIcon size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                  <span>Nombre de biens:</span>
                </div>
                <div className="text-gray-600 text-right">{bloc.nbre_biens}</div>
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