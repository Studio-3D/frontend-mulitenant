"use client";
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import { useSociete } from './SocieteContext';
import { useAuth } from './AuthContext';
import { usePathname, useRouter } from 'next/navigation';

const ProjetContext = createContext();

export const useProjet = () => {
  const context = useContext(ProjetContext);
  if (!context) {
    throw new Error('useProjet must be used within a ProjetProvider');
  }
  return context;
};

export function ProjetProvider({ children }) {
  const [projets, setProjets] = useState([]);
  const [selectedProjet, setSelectedProjet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { selectedSociete } = useSociete();
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);
  const [projetLoadAttempted, setProjetLoadAttempted] = useState(false);



  useEffect(() => {
  
    try {
      console.log("INITIAL MOUNT: Checking localStorage for selected project");
      const savedProjetString = localStorage.getItem('selectedProjet');
      
      if (savedProjetString) {
        try {
          const parsedProjet = JSON.parse(savedProjetString);
          if (parsedProjet && parsedProjet.id) {
            console.log("INITIAL MOUNT: Found project in localStorage, ID:", parsedProjet.id);
            setSelectedProjet(parsedProjet);
          }
        } catch (err) {
          console.error('Error parsing saved projet during initialization:', err);
        
        }
      } else {
        console.log("INITIAL MOUNT: No project found in localStorage");
      }
    } catch (err) {
      console.error("Error during initial project load:", err);
    } finally {
      setProjetLoadAttempted(true);
    }
  }, []);


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
      
    
      if (!selectedProjet) {
        const savedProjet = localStorage.getItem('selectedProjet');
        if (savedProjet) {
          try {
            const parsedProjet = JSON.parse(savedProjet);
            if (parsedProjet && parsedProjet.id) {
            
              const projectExists = fetchedProjets.some(p => p.id === parsedProjet.id);
              
              if (projectExists) {
                console.log("FETCH: Restoring project from localStorage", parsedProjet.id);
                setSelectedProjet(parsedProjet);
              } else {
                console.log("FETCH: Saved project not found in current projects list");
              }
            }
          } catch (err) {
            console.error('Error parsing saved projet during fetch:', err);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching projets:', err);
      setError('Failed to load projets');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [selectedSociete, selectedProjet]);


  useEffect(() => {
    if (selectedSociete && projetLoadAttempted) {
    
      const previousSocieteId = localStorage.getItem('previousSocieteId');
      
    
      if (previousSocieteId && previousSocieteId !== selectedSociete.id.toString()) {
        console.log("Société changed from", previousSocieteId, "to", selectedSociete.id, "clearing selected project");
        clearSelectedProjet();
      }
      
    
      localStorage.setItem('previousSocieteId', selectedSociete.id.toString());
      
    
      fetchProjets();
    }
  }, [selectedSociete, fetchProjets, projetLoadAttempted]);


  useEffect(() => {
    if (!user && initialized) {
      clearSelectedProjet();
    }
  }, [user, initialized]);


  const selectProjet = useCallback((projet) => {
    if (!projet || !projet.id) {
      console.error("Attempting to select invalid project:", projet);
      return false;
    }
    
    console.log("Explicitly selecting project:", projet.id);
    
  
    localStorage.setItem('selectedProjet', JSON.stringify(projet));
    
  
    setSelectedProjet(projet);
    
  
    if (pathname) {
      const projectMatch = pathname.match(/^\/Projets\/(\d+)(\/.*)?$/);
      
      if (projectMatch) {
        const currentProjectId = projectMatch[1];
        const trailingPath = projectMatch[2] || '';
        
        if (currentProjectId !== projet.id.toString()) {
          const newPath = `/Projets/${projet.id}${trailingPath}`;
          router.push(newPath, {scroll: false});
        }
      }
    }
    
    return true;
  }, [pathname, router]);


  const clearSelectedProjet = useCallback(() => {
    console.log("Explicitly clearing selected project");
    setSelectedProjet(null);
    localStorage.removeItem('selectedProjet');
  }, []);



  useEffect(() => {
  
    if (initialized && projetLoadAttempted && !selectedProjet) {
      const savedProjet = localStorage.getItem('selectedProjet');
      if (savedProjet) {
        try {
          const parsedProjet = JSON.parse(savedProjet);
          if (parsedProjet && parsedProjet.id) {
            console.log("POST-INIT: Restoring project from localStorage as fallback", parsedProjet.id);
            setSelectedProjet(parsedProjet);
          }
        } catch (err) {
          console.error('Error parsing saved projet during post-init:', err);
        }
      }
    }
  }, [initialized, projetLoadAttempted, selectedProjet]);

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