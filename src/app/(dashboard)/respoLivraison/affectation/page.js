"use client";

import React, { useState, useEffect } from "react";
import ReservationTable from "../../ventes/reservations/ReservationTable";
import { useSearchParams } from "next/navigation";
import { Filter, Users, Loader2, RefreshCw } from "lucide-react";
import axios from "axios";
import { APIURL } from "@/configs/api";
import { useAuth } from "@/context/AuthContext";
import { useProjet } from '@/context/ProjetContext';

export default function AffectationPage() {
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const accesstoken = token || localStorage.getItem("accessToken");
  const { selectedProjet } = useProjet();
  
  // États pour les statistiques
  const [statistics, setStatistics] = useState({
    validated: 0,
    assigned: 0,
    toAssign: 0,
    loading: true
  });

  // Fonction pour récupérer les statistiques
  const fetchStatistics = async () => {
    try {
      if (!selectedProjet?.id) {
        console.log("Aucun projet sélectionné");
        return;
      }

      setStatistics(prev => ({ ...prev, loading: true }));
      
      // Récupérer toutes les réservations validées (statut = 1) pour le projet sélectionné
      const response = await axios.get(
        `${APIURL.ROOTV1}/projets/${selectedProjet.id}/reservations`, 
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
          params: {
            statut: 1, // Seulement les réservations validées
            size: 1000 // Récupérer un grand nombre pour compter
          }
        }
      );

      const reservations = response.data.data || [];
      
      // Calculer les statistiques
      const validated = reservations.length;
      const assigned = reservations.filter(res => res.notaire_id !== null && res.notaire_id !== undefined).length;
      const toAssign = reservations.filter(res => res.notaire_id === null || res.notaire_id === undefined).length;

      setStatistics({
        validated,
        assigned,
        toAssign,
        loading: false
      });
      
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
      setStatistics(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (accesstoken && selectedProjet?.id) {
      fetchStatistics();
    }
  }, [accesstoken, selectedProjet]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Affectations</h1>
          <p className="text-gray-600">
            Affectation des notaires aux réservations
          
          </p>
        </div>
        
       
      </div>

      {!selectedProjet?.id && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-800">Sélectionnez un projet</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Veuillez sélectionner un projet depuis le sélecteur en haut pour voir les statistiques d{"'"}affectation.
              </p>
            </div>
          </div>
        </div>
      )}

    
      {/* Statistiques */}
      {selectedProjet?.id && (
        <>
          {/* Réservations par statut */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Réservations validées */}
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-500">Réservations validées</div>
                  <div className="text-2xl font-bold text-green-600">
                    {statistics.loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      statistics.validated
                    )}
                  </div>
                </div>
                
              </div>
              {!statistics.loading && (
                <div className="mt-2 text-xs text-gray-500">
                  Toutes les réservations approuvées
                </div>
              )}
            </div>

            {/* Réservations affectées */}
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-500">Réservations affectées</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {statistics.loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      statistics.assigned
                    )}
                  </div>
                </div>
               
              </div>
              {!statistics.loading && statistics.validated > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-blue-600">
                    {Math.round((statistics.assigned / statistics.validated) * 100)}% des validées
                  </span>
                </div>
              )}
            </div>

            {/* À affecter */}
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-500">À affecter</div>
                  <div className="text-2xl font-bold text-amber-600">
                    {statistics.loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      statistics.toAssign
                    )}
                  </div>
                </div>
               
              </div>
              {!statistics.loading && (
                <div className="mt-2 text-xs text-gray-500">
                  {statistics.toAssign > 0 ? (
                    <span className="text-amber-600">
                      {Math.round((statistics.toAssign / statistics.validated) * 100)}% des validées
                    </span>
                  ) : (
                    <span className="text-green-600">Toutes affectées ✓</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Barre de progression */}
          {!statistics.loading && statistics.validated > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progression de l{"'"}affectation</span>
                <span>{statistics.assigned}/{statistics.validated}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(statistics.assigned / statistics.validated) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Composant ReservationTable */}
      <div className="bg-white rounded-lg shadow">
        <ReservationTable 
          searchParams={searchParams}
          // Passer un filtre pour n'afficher que les réservations non affectées si la case est cochée
        
        />
      </div>
    </div>
  );
}