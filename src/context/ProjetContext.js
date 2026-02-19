"use client";
import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
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
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { selectedSociete } = useSociete();
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  // Cache system
  const cacheTimestampRef = useRef(0);
  const currentSocieteIdRef = useRef(null);
  const fetchInProgressRef = useRef(false);
  const CACHE_DURATION = 60 * 60 * 1000;

  // Track previous user state to detect actual logout
  const previousUserRef = useRef(null);

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    const initializeProject = async () => {
      // Always restore project from localStorage on page reload
      const savedProjetString = localStorage.getItem('selectedProjet');
      if (savedProjetString) {
        try {
          const parsedProjet = JSON.parse(savedProjetString);
          if (parsedProjet?.id) {
            setSelectedProjet(parsedProjet);
          }
        } catch (err) {
          // Silent fail
        }
      }
      
      // Store initial user state
      previousUserRef.current = user;
      setIsInitialized(true);
    };

    initializeProject();
  }, []); // No dependencies - run only once on mount

  // ==================== DETECT LOGOUT ====================
  useEffect(() => {
    if (!isInitialized) return;

    // Check if this is an actual logout (user went from valid to null)
    const wasUserLoggedIn = previousUserRef.current !== null;
    const isUserLoggedOut = user === null;
    
    if (wasUserLoggedIn && isUserLoggedOut) {
      console.log("Detected logout - clearing project selection");
      setSelectedProjet(null);
      localStorage.removeItem('selectedProjet');
      cacheTimestampRef.current = 0;
      currentSocieteIdRef.current = null;
    }

    // Update previous user reference
    previousUserRef.current = user;
  }, [user, isInitialized]);

  // ==================== CACHE VALIDATION ====================
  const isCacheValid = useCallback(() => {
    if (!selectedSociete) return false;
    
    const now = Date.now();
    return (
      currentSocieteIdRef.current === selectedSociete.id &&
      now - cacheTimestampRef.current < CACHE_DURATION &&
      projets.length > 0
    );
  }, [selectedSociete, projets.length]);

  // ==================== PROJECT SELECTION ====================
  const selectProjet = useCallback((projet) => {
    if (!projet?.id) return false;
    
    if (selectedProjet?.id === projet.id) {
      return true;
    }
    
    localStorage.setItem('selectedProjet', JSON.stringify(projet));
    setSelectedProjet(projet);
    
    if (pathname?.startsWith('/projets/')) {
      const projectMatch = pathname.match(/^\/projets\/(\d+)(\/.*)?$/);
      if (projectMatch) {
        const currentProjectId = projectMatch[1];
        const trailingPath = projectMatch[2] || '';
        
        if (currentProjectId !== projet.id.toString()) {
          const newPath = `/projets/${projet.id}${trailingPath}`;
          router.push(newPath, {scroll: false});
        }
      }
    }
    
    return true;
  }, [pathname, router, selectedProjet]);

  const clearSelectedProjet = useCallback(() => {
    setSelectedProjet(null);
    localStorage.removeItem('selectedProjet');
  }, []);

  // ==================== PROJECTS FETCHING ====================
  const fetchProjets = useCallback(async (forceRefresh = false) => {
    if (!selectedSociete) return;

    if (!forceRefresh && isCacheValid()) return;
    if (fetchInProgressRef.current) return;

    setLoading(true);
    setError(null);
    fetchInProgressRef.current = true;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(APIURL.PROJETS, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      
      const fetchedProjets = response.data.projets || [];
      setProjets(fetchedProjets);
      cacheTimestampRef.current = Date.now();
      currentSocieteIdRef.current = selectedSociete.id;

      // Restore selected project with fresh data if it exists
      const savedProjetString = localStorage.getItem('selectedProjet');
      if (savedProjetString) {
        try {
          const savedProjet = JSON.parse(savedProjetString);
          if (savedProjet?.id) {
            const projectExists = fetchedProjets.some(p => p.id === savedProjet.id);
            
            if (projectExists) {
              const freshProjet = fetchedProjets.find(p => p.id === savedProjet.id);
              if (!selectedProjet || selectedProjet.id !== freshProjet.id) {
                setSelectedProjet(freshProjet);
                localStorage.setItem('selectedProjet', JSON.stringify(freshProjet));
              }
            }
          }
        } catch (err) {
          // Silent fail
        }
      }

    } catch (err) {
      setError('Failed to load projets');
      cacheTimestampRef.current = 0;
    } finally {
      setLoading(false);
      fetchInProgressRef.current = false;
    }
  }, [selectedSociete, selectedProjet, isCacheValid]);

  // ==================== SOCIETE CHANGE HANDLER ====================
  useEffect(() => {
    if (selectedSociete && isInitialized) {
      const previousSocieteId = localStorage.getItem('previousSocieteId');
      
      if (previousSocieteId && previousSocieteId !== selectedSociete.id.toString()) {
        cacheTimestampRef.current = 0;
        currentSocieteIdRef.current = null;
        clearSelectedProjet();
      }
      
      localStorage.setItem('previousSocieteId', selectedSociete.id.toString());
      
      if (!isCacheValid()) {
        fetchProjets();
      }
    }
  }, [selectedSociete, fetchProjets, isInitialized, isCacheValid, clearSelectedProjet]);

  // ==================== PROJECT MANAGEMENT ====================
  const removeProjet = useCallback((projetId) => {
    setProjets(prev => {
      const updated = prev.filter(p => p.id !== projetId);
      if (updated.length !== prev.length) {
        cacheTimestampRef.current = Date.now();
      }
      return updated;
    });
    
    if (selectedProjet?.id === projetId) {
      clearSelectedProjet();
    }
  }, [selectedProjet, clearSelectedProjet]);

  const addProjet = useCallback((newProjet) => {
    setProjets(prev => {
      if (!prev.some(p => p.id === newProjet.id)) {
        cacheTimestampRef.current = Date.now();
        return [...prev, newProjet];
      }
      return prev;
    });
    
    selectProjet(newProjet);
  }, [selectProjet]);

  // ==================== CACHE CONTROL ====================
  const invalidateCache = useCallback(() => {
    cacheTimestampRef.current = 0;
    currentSocieteIdRef.current = null;
  }, []);

  const refreshProjets = useCallback(() => {
    fetchProjets(true);
  }, [fetchProjets]);

  // ==================== PROVIDER VALUE ====================
  const value = {
    projets,
    selectedProjet,
    loading,
    error,
    fetchProjets,
    selectProjet,
    clearSelectedProjet,
    removeProjet,
    addProjet,
    refreshProjets,
    invalidateCache,
    isCacheValid,
    isInitialized
  };

  return (
    <ProjetContext.Provider value={value}>
      {children}
    </ProjetContext.Provider>
  );
}

export default ProjetContext;