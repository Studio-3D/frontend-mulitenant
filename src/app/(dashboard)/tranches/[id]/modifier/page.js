"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import TrancheForm from "@/components/tranches/TrancheForm";
import { useRouter } from "next/navigation";
import axios from "axios";
import { APIURL } from "@/configs/api";
import LoadingSpin from '@/components/LoadingSpin';

export default function EditTranchePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tranche, setTranche] = useState(null);
  const [error, setError] = useState(null);

  // Only admins and super admins can edit tranches
  const canEditTranche = user?.role === 1 || user?.role === 2|| user?.role === 10;

  // Redirect if user doesn't have permission
  useEffect(() => {
    if (user && !canEditTranche) {
      router.push("/projets");
    }
  }, [user, canEditTranche, router]);

  // Fetch tranche data
  useEffect(() => {
    const fetchTrancheDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${APIURL.TRANCHES}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.tranche) {
          setTranche(response.data.tranche);
          
          // Fetch project details and store in localStorage
          if (response.data.tranche.projet_id) {
            const projetResponse = await axios.get(`${APIURL.PROJETS}/${response.data.tranche.projet_id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            if (projetResponse.data.projet) {
              localStorage.setItem("selectedProjet", JSON.stringify(projetResponse.data.projet));
            }
          }
        } else {
          setError("Tranche non trouvée");
        }
      } catch (err) {
        console.error("Failed to load tranche:", err);
        setError("Erreur lors du chargement de la tranche");
      } finally {
        setLoading(false);
      }
    };

    fetchTrancheDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin /> 
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-500 !text-red-700">
        <p className="font-medium">Erreur</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!canEditTranche) {
    return (
      <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-500 !text-red-700">
        <p className="font-medium">Accès refusé</p>
        <p>Vous {"n'"} avez pas les droits nécessaires pour modifier une tranche.</p>
      </div>
    );
  }

  return (
    
      <TrancheForm id={id} projetId={tranche?.projet_id} />
  );
}
