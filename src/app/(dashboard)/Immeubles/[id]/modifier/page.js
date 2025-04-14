"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ImmeubleForm from "@/components/immeubles/ImmeubleForm";
import { useRouter } from "next/navigation";
import axios from "axios";
import { APIURL } from "@/configs/api";

export default function EditImmeublePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [immeuble, setImmeuble] = useState(null);
  const [error, setError] = useState(null);

  // Only admins and super admins can edit immeubles
  const canEditImmeuble = user?.role === 1 || user?.role === 2;

  // Redirect if user doesn't have permission
  useEffect(() => {
    if (user && !canEditImmeuble) {
      router.push("/Projets");
    }
  }, [user, canEditImmeuble, router]);

  // Fetch immeuble data
  useEffect(() => {
    const fetchImmeubleDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${APIURL.IMMEUBLES}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.immeuble) {
          setImmeuble(response.data.immeuble);
          
          // Fetch project details and store in localStorage
          if (response.data.immeuble.projet_id) {
            const projetResponse = await axios.get(`${APIURL.PROJETS}/${response.data.immeuble.projet_id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            if (projetResponse.data.projet) {
              localStorage.setItem("selectedProjet", JSON.stringify(projetResponse.data.projet));
            }
          }
        } else {
          setError("Immeuble non trouvé");
        }
      } catch (err) {
        console.error("Failed to load immeuble:", err);
        setError("Erreur lors du chargement de l'immeuble");
      } finally {
        setLoading(false);
      }
    };

    fetchImmeubleDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-500 text-red-700">
        <p className="font-medium">Erreur</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!canEditImmeuble) {
    return (
      <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-500 text-red-700">
        <p className="font-medium">Accès refusé</p>
        <p>Vous n'avez pas les droits nécessaires pour modifier un immeuble.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Modifier l'immeuble</h1>
        {immeuble && (
          <p className="text-gray-500">
            Immeuble: <span className="font-medium">{immeuble.nom}</span>
            {immeuble.bloc && (
              <span> - Bloc: <span className="font-medium">{immeuble.bloc.nom}</span></span>
            )}
          </p>
        )}
      </div>
      
      <ImmeubleForm id={id} projetId={immeuble?.projet_id} blocId={immeuble?.bloc_id} />
    </div>
  );
}
