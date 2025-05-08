"use client";
import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { isSuperAdmin, isAdmin, isCommercial } from "@/configs/enum";
import { APIURL } from "@/configs/api";

const SocieteContext = createContext();

export const useSociete = () => {
  const context = useContext(SocieteContext);
  if (!context) {
    throw new Error("useSociete ne peut être utilisé qu'à l'intérieur de SocieteProvider.");
  }
  return context;
};

export function SocieteProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [selectedSociete, setSelectedSociete] = useState(null);
  const [societes, setSocietes] = useState([]);
  const [loading, setLoading] = useState({
    init: true,        // Initial loading state
    societes: true,    // Societes fetching
    selection: false   // Societe selection
  });
  const [initialized, setInitialized] = useState(false);

  // Initialize from localStorage on first load
  useEffect(() => {
    if (initialized) return;
    
    const storedSociete = localStorage.getItem("selectedSociete");
    if (storedSociete) {
      try {
        setSelectedSociete(JSON.parse(storedSociete));
      } catch (e) {
        console.error("Error parsing stored societe", e);
        localStorage.removeItem("selectedSociete");
      }
    }
    setInitialized(true);
    setLoading(prev => ({ ...prev, init: false }));
  }, [initialized]);

  // Clear selected societe on logout
  useEffect(() => {
    if (!authLoading && !user) {
      clearSelectedSociete();
    }
  }, [user, authLoading]);

  const fetchSocietes = async () => {
    try {
      setLoading(prev => ({ ...prev, societes: true }));
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(prev => ({ ...prev, societes: false }));
        return;
      }

      if (user && (isAdmin(user.role) || isCommercial(user.role))) {
        if (user.societe) {
          const userSociete = user.societe;
          setSocietes([userSociete]);
          
          setSelectedSociete(userSociete);
          localStorage.setItem("selectedSociete", JSON.stringify(userSociete));
        } else if (user.societe_id) {
          const userSociete = { 
            id: user.societe_id,
            nom: user.societe_nom || "Société associée",
          };
          setSocietes([userSociete]);
          setSelectedSociete(userSociete);
          localStorage.setItem("selectedSociete", JSON.stringify(userSociete));
        } else {
          toast.error("Impossible de déterminer votre société. Contactez l'administrateur.");
          setSocietes([]);
        }
      } else {
        // For superadmin, use the SOCIETES endpoint
        try {
          console.log("Fetching societes for superadmin...");
          const response = await axios.get(APIURL.GETSOCIETES, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const fetchedSocietes = response.data.societes || []; 
          console.log("Fetched societes:", fetchedSocietes); 
          setSocietes(fetchedSocietes);
          
          // Verify the selected societe still exists
          if (selectedSociete) {
            const exists = fetchedSocietes.some(s => s.id === selectedSociete.id);
            if (!exists) {
              setSelectedSociete(null);
              localStorage.removeItem("selectedSociete");
            }
          }
        } catch (error) {
          console.error("Error fetching societes for superadmin:", error);
          toast.error("Erreur lors du chargement des sociétés.");
          setSocietes([]);
        }
      }
    } catch (err) {
      console.error("Error in fetchSocietes:", err);
      toast.error("Erreur lors du chargement des sociétés.");
    } finally {
      setLoading(prev => ({ ...prev, societes: false }));
    }
  };

  useEffect(() => {
    if (user && initialized) {
      fetchSocietes();
    }
  }, [user, initialized]);

  const selectSociete = async (societe) => {
    try {
      setLoading(prev => ({ ...prev, selection: true }));
      const token = localStorage.getItem("accessToken");
      
      // If selecting a different société, clear the project first
      if (selectedSociete && selectedSociete.id !== societe.id) {
        localStorage.removeItem("selectedProjet");
      }
      
      await axios.put(
        "http://localhost:8000/api/Switch_Societes",
        { societe_id: societe.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedSociete(societe);
      localStorage.setItem("selectedSociete", JSON.stringify(societe));
      return true;
    } catch (err) {
      toast.error("Erreur lors de la sélection de la société.");
      return false;
    } finally {
      setLoading(prev => ({ ...prev, selection: false }));
    }
  };

  const clearSelectedSociete = () => {
    console.log("Clearing selected société");
    setSelectedSociete(null);
    localStorage.removeItem("selectedSociete");
  };

  const refreshSocietes = async () => {
    await fetchSocietes();
  };

  // Combined loading state
  const isLoading = loading.init || loading.societes || authLoading;

  return (
    <SocieteContext.Provider
      value={{
        selectedSociete,
        societes,
        loading: isLoading,
        selectionLoading: loading.selection,
        selectSociete,
        clearSelectedSociete,
        refreshSocietes,
      }}
    >
      {children}
    </SocieteContext.Provider>
  );
}

export default SocieteContext;