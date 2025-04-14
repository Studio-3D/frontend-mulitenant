"use client";
import { useState, useEffect } from 'react';
import { useProjet } from '../context/ProjetContext';
import Link from 'next/link';
import { FiEye, FiEdit, FiHome } from 'react-icons/fi';

export default function ProjectsList() {
  const { projets, loading, error, selectedProjet, selectProjet } = useProjet();
  const [filteredProjets, setFilteredProjets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (projets) {
      setFilteredProjets(
        projets.filter(projet => 
          projet.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          projet.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          projet.adresse.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [projets, searchTerm]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p className="font-bold">Erreur</p>
        <p>{error}</p>
      </div>
    );
  }

  if (projets.length === 0) {
    return (
      <div className="text-center py-10">
        <FiHome className="mx-auto text-gray-400 text-5xl mb-4" />
        <h3 className="text-xl font-medium text-gray-500">Aucun projet disponible</h3>
        <p className="text-gray-400 mt-2">Commencez par créer un nouveau projet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher un projet..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjets.map(projet => (
          <div 
            key={projet.id} 
            className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${
              selectedProjet?.id === projet.id ? 'border-l-blue-500' : 'border-l-gray-200'
            }`}
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{projet.nom}</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                  {projet.type_projet?.type || 'Non défini'}
                </span>
              </div>
              
              <div className="text-sm text-gray-500 mb-4">
                <p className="mb-1"><span className="font-medium">Code:</span> {projet.code}</p>
                <p className="mb-1"><span className="font-medium">Adresse:</span> {projet.adresse}</p>
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                <span className="inline-flex items-center mr-3">
                  <span className="mr-1 font-medium">Tranches:</span> {projet.nbre_tranches || 0}
                </span>
                <span className="inline-flex items-center mr-3">
                  <span className="mr-1 font-medium">Blocs:</span> {projet.nbre_blocs || 0}
                </span>
                <span className="inline-flex items-center">
                  <span className="mr-1 font-medium">Biens:</span> {projet.nbre_biens || 0}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 px-5 py-3 flex justify-between">
              <button
                onClick={() => selectProjet(projet)}
                className={`text-sm ${selectedProjet?.id === projet.id 
                  ? 'text-gray-400 cursor-default' 
                  : 'text-[#009FFF] hover:text-blue-800'}`}
                disabled={selectedProjet?.id === projet.id}
              >
                {selectedProjet?.id === projet.id ? 'Projet sélectionné' : 'Sélectionner'}
              </button>
              
              <div className="flex space-x-3">
                <Link href={`/Projets/${projet.id}`} className="text-gray-600 hover:text-[#009FFF]">
                  <FiEye size={18} />
                </Link>
                <Link href={`/Projets/edit/${projet.id}`} className="text-gray-600 hover:text-[#009FFF]">
                  <FiEdit size={18} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
