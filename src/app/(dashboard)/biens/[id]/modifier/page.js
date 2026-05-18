"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import BienForm from "@/components/biens/BienForm";
import axios from "axios";
import { APIURL } from "@/configs/api";
import toast from "react-hot-toast";
import Link from "next/link";
import LoadingSpin from '@/components/LoadingSpin';

export default function EditBienPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bien, setBien] = useState(null);
  const [error, setError] = useState(null);

  // Only admins and super admins can edit biens
  const canEditBien = user?.role === 1 || user?.role === 2|| user?.role === 10;

  // Fetch bien details
  useEffect(() => {
    const fetchBien = async () => {
      if (!id) {
        setError("ID du bien non spécifié");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${APIURL.BIENS}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data.bien) {
          setBien(response.data.bien);
          
          // If the bien belongs to a project, fetch and set that project in localStorage
          if (response.data.bien.projet_id) {
            const projectResponse = await axios.get(`${APIURL.PROJETS}/${response.data.bien.projet_id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (projectResponse.data && projectResponse.data.projet) {
              localStorage.setItem("selectedProjet", JSON.stringify(projectResponse.data.projet));
            }
          }
        } else {
          setError("Bien non trouvé");
        }
      } catch (err) {
        console.error("Error fetching bien:", err);
        setError(err.response?.data?.message || "Erreur lors du chargement du bien");
        toast.error("Impossible de charger les détails du bien");
      } finally {
        setLoading(false);
      }
    };

    if (canEditBien) {
      fetchBien();
    } else {
      setLoading(false);
    }
  }, [id, canEditBien]);

  // Redirect if user doesn't have permission
  useEffect(() => {
    if (user && !canEditBien) {
      toast.error("Vous n'avez pas les droits pour modifier un bien");
      router.push("/biens");
    }
  }, [user, canEditBien, router]);

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
        <Link href="/biens" className="text-blue-500 hover:underline mt-2 inline-block">
          Retour à la liste des biens
        </Link>
      </div>
    );
  }

  if (!canEditBien) {
    return (
      <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-500 !text-red-700">
        <p className="font-medium">Accès refusé</p>
        <p>Vous {'n\''}avez pas les droits nécessaires pour modifier un bien.</p>
      </div>
    );
  }

  return (
    
      <BienForm id={id} projetId={bien?.projet_id} />
  );
}
