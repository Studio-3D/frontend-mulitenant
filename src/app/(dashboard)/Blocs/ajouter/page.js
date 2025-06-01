"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import BlocForm from "@/components/blocs/BlocForm";
import { useRouter } from "next/navigation";
import axios from "axios";
import { APIURL } from "@/configs/api";

export default function AddBlocPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projetId = searchParams.get("projet");
  const trancheId = searchParams.get("tranche");
  const [loading, setLoading] = useState(true);
  const [projet, setProjet] = useState(null);

  // Only admins and super admins can add blocs
  const canCreateBloc = user?.role === 1 || user?.role === 2;

  // Redirect if user doesn't have permission
  useEffect(() => {
    if (user && !canCreateBloc) {
      router.push("/Projets");
    }
  }, [user, canCreateBloc, router]);

  // If projetId is provided, fetch project details to store in localStorage
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projetId) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${APIURL.PROJETS}/${projetId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.projet) {
          setProjet(response.data.projet);
          // Store project in localStorage for component use
          localStorage.setItem("selectedProjet", JSON.stringify(response.data.projet));
        }
      } catch (err) {
        console.error("Failed to load project:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projetId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!canCreateBloc) {
    return (
      <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-500 text-red-700">
        <p className="font-medium">Accès refusé</p>
        <p>Vous n'avez pas les droits nécessaires pour ajouter un bloc.</p>
      </div>
    );
  }

  return (
    
      <BlocForm projetId={projetId} trancheId={trancheId} />
  );
}
