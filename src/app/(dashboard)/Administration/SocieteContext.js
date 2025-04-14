"use client";
import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const SocieteContext = createContext();

export const useSociete = () => {
  const context = useContext(SocieteContext);
  if (!context) {
    throw new Error("useSociete must be used within a SocieteProvider");
  }
  return context;
};

export function SocieteProvider({ children }) {
  const [selectedSociete, setSelectedSociete] = useState(null);
  const [societes, setSocietes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract the fetch function so it can be reused later.
  const fetchSocietes = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:8000/api/get_societes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSocietes(response.data.societes || []);

      // Only set selected société if there is one saved
      const savedSociete = localStorage.getItem("selectedSociete");
      if (savedSociete) {
        try {
          setSelectedSociete(JSON.parse(savedSociete));
        } catch (err) {
          console.error("Error parsing saved société:", err);
          localStorage.removeItem("selectedSociete");
          setSelectedSociete(null);
        }
      } else {
        setSelectedSociete(null); // Ensure no société is selected at first login
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching sociétés:", err);
      setError("Failed to load sociétés");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocietes();
  }, []);

  const selectSociete = async (societe) => {
    try {
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
      console.error("Error switching société:", err);
      setError("Failed to switch société");
      return false;
    }
  };

  const clearSelectedSociete = () => {
    setSelectedSociete(null);
    localStorage.removeItem("selectedSociete");
  };

  // Expose a refresh function to re-fetch the sociétés.
  const refreshSocietes = async () => {
    setLoading(true);
    await fetchSocietes();
  };

  return (
    <SocieteContext.Provider
      value={{
        selectedSociete,
        societes,
        loading,
        error,
        selectSociete,
        clearSelectedSociete,
        refreshSocietes, // now available for consumers
      }}
    >
      {children}
    </SocieteContext.Provider>
  );
}

export default SocieteContext;
