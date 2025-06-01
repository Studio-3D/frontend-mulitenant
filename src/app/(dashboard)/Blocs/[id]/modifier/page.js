"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import BlocForm from "@/components/blocs/BlocForm";
import { useRouter } from "next/navigation";
import axios from "axios";
import { APIURL } from "@/configs/api";

export default function EditBlocPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bloc, setBloc] = useState(null);
  const [error, setError] = useState(null);

  // Only admins and super admins can edit blocs
  const canEditBloc = user?.role === 1 || user?.role === 2;

  // Redirect if user doesn't have permission
  useEffect(() => {
    if (user && !canEditBloc) {
      router.push("/Projets");
    }
  }, [user, canEditBloc, router]);

  // Fetch bloc data
  useEffect(() => {
    const fetchBlocDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${APIURL.BLOCS}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.bloc) {
          setBloc(response.data.bloc);
          
          // Fetch project details and store in localStorage
          if (response.data.bloc.projet_id) {
            const projetResponse = await axios.get(`${APIURL.PROJETS}/${response.data.bloc.projet_id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            if (projetResponse.data.projet) {
              localStorage.setItem("selectedProjet", JSON.stringify(projetResponse.data.projet));
            }
          }
        } else {
          setError("Bloc non trouvé");
        }
      } catch (err) {
        console.error("Failed to load bloc:", err);
        setError("Erreur lors du chargement du bloc");
      } finally {
        setLoading(false);
      }
    };

    fetchBlocDetails();
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

  if (!canEditBloc) {
    return (
      <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-500 text-red-700">
        <p className="font-medium">Accès refusé</p>
        <p>Vous n'avez pas les droits nécessaires pour modifier un bloc.</p>
      </div>
    );
  }

  return (
    
      <BlocForm id={id} projetId={bloc?.projet_id} trancheId={bloc?.tranche_id} />
  );
}
