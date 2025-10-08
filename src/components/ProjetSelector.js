'use client';
import { useState, useEffect } from 'react';
import { useProjet } from '@/context/ProjetContext';
import { Search } from 'lucide-react';
export default function ProjetSelector({ onSelect }) {
  const { projets, fetchProjets, selectProjet, loading } = useProjet();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch projets if not already loaded
    if (!projets || projets.length === 0) {
      fetchProjets();
    }
  }, [projets, fetchProjets]);

  // Add this useEffect to log the selected project on component mount
  useEffect(() => {
    const storedProject = localStorage.getItem('selectedProjet');
    if (storedProject) {
      console.log('Stored project found:', JSON.parse(storedProject));
    } else {
      console.log('No stored project found in localStorage');
    }
  }, []);

  // Filter projects based on search term
  const filteredProjects =
    projets?.filter(
      (projet) =>
        projet.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        projet.code?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleSelect = (project) => {
    if (!project || !project.id) {
      console.error('Invalid project selected:', project);
      setError('Projet invalide sélectionné');
      return;
    }

    setError(null);
    console.log('Selected project:', project);
    setSelectedProject(project);

    // Ensure projet_id is stored properly in context
    selectProjet(project);

    // Also store in localStorage as a backup
    localStorage.setItem('selectedProjet', JSON.stringify(project));

    if (onSelect) onSelect(project);
  };

  return (
    <div className="bg-white rounded-lg">
      {/* Search input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 !text-gray-400" />
        </div>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 !text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5"
          placeholder="Rechercher un projet..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Display error message if there is one */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 !text-red-700">
          {error}
        </div>
      )}

      {/* Projects list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : projets?.length === 0 ? (
        <div className="text-center py-8 !text-gray-500">
          Aucun projet disponible
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-8 !text-gray-500">
          Aucun projet trouvé pour {searchTerm}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto p-2">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                selectedProject?.id === project.id
                  ? 'bg-blue-50 border border-blue-300'
                  : 'border border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => handleSelect(project)}
            >
              <h3 className="font-medium">{project.nom}</h3>
              <div className="text-sm !text-gray-500 mt-1">
                <p>Code: {project.code}</p>
                <p>Adresse: {project.adresse}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
