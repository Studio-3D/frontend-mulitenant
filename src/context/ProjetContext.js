"use client";
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import { useSociete } from './SocieteContext';
import { useAuth } from './AuthContext';
import { usePathname, useRouter } from 'next/navigation'; // Import navigation hooks

// Create context
const ProjetContext = createContext();

// Context hook
export const useProjet = () => {
  const context = useContext(ProjetContext);
  if (!context) {
    throw new Error('useProjet must be used within a ProjetProvider');
  }
  return context;
};

// Provider component
export function ProjetProvider({ children }) {
  const [projets, setProjets] = useState([]);
  const [selectedProjet, setSelectedProjet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { selectedSociete } = useSociete();
  const { user } = useAuth();
  const pathname = usePathname(); // Get current URL path
  const router = useRouter();  // Get router for navigation

  // Fetch all projects for the selected société
  const fetchProjets = useCallback(async () => {
    if (!selectedSociete) {
      console.log('No société selected, cannot fetch projects');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(APIURL.PROJETS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const fetchedProjets = response.data.projets || [];
      setProjets(fetchedProjets);
      
      // Restore selected project from localStorage if exists
      const savedProjet = localStorage.getItem('selectedProjet');
      if (savedProjet) {
        try {
          const parsedProjet = JSON.parse(savedProjet);
          setSelectedProjet(parsedProjet);
        } catch (err) {
          console.error('Error parsing saved projet:', err);
          localStorage.removeItem('selectedProjet');
        }
      }
    } catch (err) {
      console.error('Error fetching projets:', err);
      setError('Failed to load projets');
    } finally {
      setLoading(false);
    }
  }, [selectedSociete]);

  // Effect to fetch projects when société changes
  useEffect(() => {
    if (selectedSociete) {
      // Reset selected project when société changes
      clearSelectedProjet();
      
      // Fetch projects for the new société
      fetchProjets();
    } else {
      // Clear projects when no société is selected
      setProjets([]);
      setSelectedProjet(null);
    }
  }, [selectedSociete, fetchProjets]);

  // Clear selected project when user logs out
  useEffect(() => {
    if (!user) {
      clearSelectedProjet();
    }
  }, [user]);

  // Select a project
  const selectProjet = (projet) => {
    if (!projet || !projet.id) {
      console.error("Attempting to select invalid project:", projet);
      return false;
    }
    
    console.log("Setting selected project in context:", projet.id);
    setSelectedProjet(projet);
    
    // Store in localStorage for persistence
    localStorage.setItem('selectedProjet', JSON.stringify(projet));
    
    // Check if we're on a project detail page and update the URL if needed
    if (pathname) {
      // Match the pattern /Projets/{id} to detect project detail pages
      const projectMatch = pathname.match(/^\/Projets\/(\d+)(\/.*)?$/);
      
      if (projectMatch) {
        const currentProjectId = projectMatch[1];
        const trailingPath = projectMatch[2] || '';
        
        if (currentProjectId !== projet.id.toString()) {
          // Construct new URL with the new project ID but keep any trailing path
          const newPath = `/Projets/${projet.id}${trailingPath}`;
          
          // Use the router to update the URL without a full page refresh
          router.push(newPath, {scroll: false});
          
          console.log(`Updated URL from project ${currentProjectId} to ${projet.id}`);
        }
      }
    }
    
    return true;
  };

  // Effect to load selected project from localStorage on initialization
  useEffect(() => {
    const savedProjet = localStorage.getItem('selectedProjet');
    if (savedProjet) {
      try {
        const parsedProjet = JSON.parse(savedProjet);
        if (parsedProjet && parsedProjet.id) {
          console.log("Loaded project from localStorage:", parsedProjet.id);
          setSelectedProjet(parsedProjet);
        }
      } catch (err) {
        console.error('Error parsing saved projet:', err);
        localStorage.removeItem('selectedProjet');
      }
    }
  }, []);

  // Clear selected project
  const clearSelectedProjet = () => {
    setSelectedProjet(null);
    localStorage.removeItem('selectedProjet');
    console.log("Selected project cleared");
  };

  return (
    <ProjetContext.Provider
      value={{
        projets,
        selectedProjet,
        loading,
        error,
        fetchProjets,
        selectProjet,
        clearSelectedProjet
      }}
    >
      {children}
    </ProjetContext.Provider>
  );
}

export default ProjetContext;