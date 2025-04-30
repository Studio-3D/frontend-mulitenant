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
      setSelectedSociete(null);
      localStorage.removeItem("selectedSociete");
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

      // Check user role to determine how to get societes
      if (user && (isAdmin(user.role) || isCommercial(user.role))) {
        // For admin or commercial users, check if user data includes societe info
        if (user.societe) {
          // If user object already has societe information, use it
          const userSociete = user.societe;
          setSocietes([userSociete]);
          
          // Automatically select the single societe
          setSelectedSociete(userSociete);
          localStorage.setItem("selectedSociete", JSON.stringify(userSociete));
        } else if (user.societe_id) {
          // If we only have the ID, we need to create a minimal societe object
          const userSociete = { 
            id: user.societe_id,
            nom: user.societe_nom || "Société associée",
            // Add any other required fields
          };
          setSocietes([userSociete]);
          setSelectedSociete(userSociete);
          localStorage.setItem("selectedSociete", JSON.stringify(userSociete));
        } else {
          // If we can't determine the societe, show an error
          toast.error("Impossible de déterminer votre société. Contactez l'administrateur.");
          setSocietes([]);
        }
      } else {
        // For superadmin, use the SOCIETES endpoint
        try {
          const response = await axios.get(APIURL.SOCIETES, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const fetchedSocietes = response.data.societes || [];
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