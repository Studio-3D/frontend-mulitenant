"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import BienForm from "@/components/biens/BienForm";
import { useRouter } from "next/navigation";
import axios from "axios";
import { APIURL } from "@/configs/api";

export default function AddBienPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projetId = searchParams.get("projet");
  const blocId = searchParams.get("bloc");
  const immeubleId = searchParams.get("immeuble");
  const [loading, setLoading] = useState(true);
  const [projet, setProjet] = useState(null);

  // Only admins and super admins can add biens
  const canCreateBien = user?.role === 1 || user?.role === 2;

  // Redirect if user doesn't have permission
  useEffect(() => {
    if (user && !canCreateBien) {
      router.push("/Projets");
    }
  }, [user, canCreateBien, router]);

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

  if (!canCreateBien) {
    return (
      <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-500 text-red-700">
        <p className="font-medium">Accès refusé</p>
        <p>Vous n'avez pas les droits nécessaires pour ajouter un bien.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Ajouter un bien</h1>
        {projet && (
          <p className="text-gray-500">
            Projet: <span className="font-medium">{projet.nom}</span>
          </p>
        )}
      </div>
      
      <BienForm projetId={projetId} blocId={blocId} immeubleId={immeubleId} />
    </div>
  );
}
