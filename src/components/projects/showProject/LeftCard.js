import React from 'react';
import {
  PencilIcon,
  TrashIcon,
  HomeIcon,
  LayersIcon,
  BuildingIcon,
  BoxesIcon,
  MapPinIcon,
  CalendarIcon,
  FileTextIcon,
  SquareIcon,
  DollarSignIcon,
  ClockIcon,
} from 'lucide-react';

export const LeftCard = ({ project }) => {
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
          <div className="bg-white p-3 rounded-full mb-2 shadow-md">
            <img
              src='https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=200&auto=format&fit=crop'
              alt={`${project.nom} logo`}
              className="w-20 h-20 object-cover rounded-full"
            />
          </div>
          <h1 className="text-white text-2xl font-bold text-center px-4">
            {project.nom}
          </h1>
        </div>
      </div>
      
      {/* Stats section */}
      <div className="grid grid-cols-4 divide-x border-b">
        <div className="flex flex-col items-center justify-center py-3 px-2">
          <HomeIcon className="text-blue-600 mb-1" size={20} />
          <div className="text-xs text-gray-600">Biens</div>
          <div className="font-bold text-sm">{project?.nbre_biens || 0}</div>
        </div>
        <div className="flex flex-col items-center justify-center py-3 px-2">
          <LayersIcon className="text-green-600 mb-1" size={20} />
          <div className="text-xs text-gray-600">Tranches</div>
          <div className="font-bold text-sm">
            {project?.nbre_tranches || 0}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-3 px-2">
          <BuildingIcon className="text-purple-600 mb-1" size={20} />
          <div className="text-xs text-gray-600">Immeubles</div>
          <div className="font-bold text-sm">
            {project?.nbre_immeubles || 0}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-3 px-2">
          <BoxesIcon className="text-orange-600 mb-1" size={20} />
          <div className="text-xs text-gray-600">Blocs</div>
          <div className="font-bold text-sm">{project?.nbre_blocs || 0}</div>
        </div>
      </div>
      
      <div className="p-6 flex-grow">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Détails du projet
          </h2>
          <p className="text-gray-600">{project.description}</p>
          <div className="grid grid-cols-1 gap-2 text-sm mt-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center text-gray-700">
                <MapPinIcon size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                <span>Adresse:</span>
              </div>
              <div className="text-gray-600 text-right">
                {project?.adresse || "Adresse non spécifiée"}
              </div>
            </div>
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center text-gray-700">
                <CalendarIcon size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                <span>Date d'autorisation:</span>
              </div>
              <div className="text-gray-600 text-right">{project?.date_autorisation_construction || "Date non spécifiée"}</div>
            </div>
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center text-gray-700">
                <CalendarIcon size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                <span>Date permis d'habiter:</span>
              </div>
              <div className="text-gray-600 text-right">{project?.date_permis_habiter || "Date non spécifiée"}</div>
            </div>
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center text-gray-700">
                <FileTextIcon size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                <span>Titre foncier:</span>
              </div>
              <div className="text-gray-600 text-right">{project?.titre_foncier || "Titre non spécifié"}</div>
            </div>
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center text-gray-700">
                <SquareIcon size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                <span>Surface terrain:</span>
              </div>
              <div className="text-gray-600 text-right">{project?.surface_terrain + ' m²' || "Surface non spécifiée"}</div>
            </div>
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center text-gray-700">
                <DollarSignIcon size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                <span>Prix d'acquisition:</span>
              </div>
              <div className="text-gray-600 text-right">{project?.prix_acquisition + ' Dhs' || "Prix non spécifié"}</div>
            </div>
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center text-gray-700">
                <ClockIcon size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                <span>Limite annulation:</span>
              </div>
              <div className="text-gray-600 text-right">{project?.limite_annulation_reservation || "Date non spécifiée"}</div>
            </div>
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center text-gray-700">
                <ClockIcon size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                <span>Prolongation réservation:</span>
              </div>
              <div className="text-gray-600 text-right">{project?.prolongation_reservation || "Durée non spécifiée"}</div>
            </div>
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center text-gray-700">
                <LayersIcon size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                <span>Nombre de tranches:</span>
              </div>
              <div className="text-gray-600 text-right">
                {project.counts?.tranche || 3}
              </div>
            </div>
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center text-gray-700">
                <BoxesIcon size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                <span>Nombre de blocs:</span>
              </div>
              <div className="text-gray-600 text-right">
                {project?.nbre_blocs || 2}
              </div>
            </div>
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center text-gray-700">
                <BuildingIcon size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                <span>Nombre d'immeubles:</span>
              </div>
              <div className="text-gray-600 text-right">
                {project.counts?.immeuble || 5}
              </div>
            </div>
          </div>
        </div>
        
      <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">
            Utilisateurs
          </h2>
          <ul className="list-disc list-inside">
            {project?.user_projet?.length > 0 ? (
              project.user_projet.map((up) => (
                <li key={up.id} className="text-gray-600">
                  {up.user?.prenom} {up.user?.name}
                </li>
              ))
            ) : (
              <li className="text-gray-600">Aucun utilisateur trouvé</li>
            )}
          </ul>
        </div>
      </div>
      
      <div className="p-6 bg-gray-50 flex justify-center gap-3">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 hover:bg-blue-700 transition">
          <PencilIcon size={16} />
          Modifier
        </button>
        <button className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center gap-2 hover:bg-red-700 transition">
          <TrashIcon size={16} />
          Supprimer
        </button>
      </div>
    </div>
  );
};