"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import TrancheForm from "@/components/tranches/TrancheForm";
import { useRouter } from "next/navigation";
import axios from "axios";
import { APIURL } from "@/configs/api";
import LoadingSpin from '@/components/LoadingSpin';

export default function AddTranchePage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projetId = searchParams.get("projet");
  const [loading, setLoading] = useState(true);
  const [projet, setProjet] = useState(null);

  // Only admins and super admins can add tranches
  const canCreateTranche = user?.role === 1 || user?.role === 2|| user?.role === 10;

  // Redirect if user doesn't have permission
  useEffect(() => {
    if (user && !canCreateTranche) {
      router.push("/projets");
    }
  }, [user, canCreateTranche, router]);

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
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin /> 
      </div>
    );
  }

  if (!canCreateTranche) {
    return (
      <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-500 !text-red-700">
        <p className="font-medium">Accès refusé</p>
        <p>Vous n{"'"}avez pas les droits nécessaires pour ajouter une tranche.</p>
      </div>
    );
  }

  return (
    
      <TrancheForm projetId={projet}  />
  );
}
