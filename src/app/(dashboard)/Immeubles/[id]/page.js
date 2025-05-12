"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { APIURL } from "@/configs/api";
import { useAuth } from "@/context/AuthContext";
import { 
  Home,
  Pencil,
  Trash2,
  ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Link from "next/link";
import BienTable from "@/components/biens/BienTable";

export default function ImmeubleDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [immeuble, setImmeuble] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [count, setCount] = useState({
    biens: 0
  });
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [countLoading, setCountLoading] = useState(true);
  
  // Add a ref to track if we've already fetched data
  const hasInitiallyFetched = useRef(false);

  const canManageImmeuble = user?.role === 1 || user?.role === 2;

  useEffect(() => {
    // Only fetch if we haven't fetched yet or if the ID changes
    if ((!hasInitiallyFetched.current || !immeuble) && id) {
      const fetchImmeubleDetails = async () => {
        setLoading(true);
        setCountLoading(true); // Reset count loading state
        setCount({ biens: 0 }); // Reset count to 0 when loading starts
        
        try {
          const token = localStorage.getItem("accessToken");
          const response = await axios.get(`${APIURL.IMMEUBLES}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data.immeuble) {
            console.log("Full immeuble data:", response.data);
            setImmeuble(response.data.immeuble);
            
            // Skip initial count estimation from API and fetch directly
            fetchCount(id);
            
            // Fetch and store the project in localStorage to maintain context
            if (response.data.immeuble.projet_id) {
              const projectResponse = await axios.get(`${APIURL.PROJETS}/${response.data.immeuble.projet_id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              
              if (projectResponse.data.projet) {
                localStorage.setItem("selectedProjet", JSON.stringify(projectResponse.data.projet));
              }
            }
          } else {
            setError("Immeuble non trouvé");
            setCountLoading(false);
          }
        } catch (err) {
          console.error("Failed to load immeuble:", err);
          setError("Erreur lors du chargement de l'immeuble");
          setCountLoading(false);
        } finally {
          setLoading(false);
          hasInitiallyFetched.current = true; // Mark that we've fetched data
        }
      };

      fetchImmeubleDetails();
    }
  }, [id]); // Only depend on ID, not on loading or immeuble state

  // Function to fetch the actual count if not provided by the API
  const fetchCount = async (immeubleId) => {
    try {
      setCountLoading(true); // Set loading state for count
      
      const token = localStorage.getItem("accessToken");
      
      // Fetch biens count with more specific filtering
      const biensResponse = await axios.get(APIURL.BIENS, {
        headers: { Authorization: `Bearer ${token}` },
        params: { immeuble_id: immeubleId }
      });
      
      console.log("Biens response:", biensResponse.data);
      
      // Process biens data
      let biensData = [];
      if (biensResponse.data.data && Array.isArray(biensResponse.data.data)) {
        biensData = biensResponse.data.data;
      } else if (biensResponse.data.biens && Array.isArray(biensResponse.data.biens)) {
        biensData = biensResponse.data.biens;
      }
      
      // Filter biens to only include those from this immeuble
      // Make sure we're using string comparison for IDs
      const filteredBiens = biensData.filter(bien => 
        bien.immeuble_id !== null && bien.immeuble_id.toString() === immeubleId.toString()
      );
      
      let biensCount = filteredBiens.length;
      console.log(`Filtered biens: ${biensCount} of ${biensData.length} for immeuble ${immeubleId}`);
      
      // Update count with actual data
      setCount({
        biens: biensCount
      });
      
    } catch (error) {
      console.error("Error fetching count:", error);
      setCount({ biens: 0 }); // Reset on error
    } finally {
      setCountLoading(false); // End loading state for count
    }
  };

  const handleRefresh = () => {
    setRefreshFlag(prev => !prev);
  };

  const handleDeleteConfirm = async () => {
    setConfirming(true);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${APIURL.IMMEUBLES}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Immeuble supprimé avec succès");
      
      // Redirect to the bloc page if available, otherwise to the tranche or project page
      if (immeuble?.bloc_id) {
        router.push(`/Blocs/${immeuble.bloc_id}`);
      } else if (immeuble?.tranche_id) {
        router.push(`/Tranches/${immeuble.tranche_id}`);
      } else if (immeuble?.projet_id) {
        router.push(`/Projets/${immeuble.projet_id}?tab=immeubles`);
      } else {
        router.push("/Projets");
      }
    } catch (err) {
      console.error("Failed to delete immeuble:", err);
      toast.error("Erreur lors de la suppression de l'immeuble");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009FFF]"></div>
      </div>
    );
  }

  if (error || !immeuble) {
    return (
      <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-500 !text-red-700">
        <p className="font-medium">Erreur</p>
        <p>{error || "Immeuble non trouvé"}</p>
        <Link href="/Projets" className="mt-4 inline-block text-[#009FFF] hover:underline">
          Retour à la liste des projets
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* Back navigation */}
      <div className="mb-4">
        {immeuble.bloc_id ? (
          <Link 
            href={`/Blocs/${immeuble.bloc_id}`}
            className="inline-flex items-center text-[#009FFF] hover:text-blue-800"
          >
            <ArrowLeft className="mr-1" /> Retour au bloc
          </Link>
        ) : immeuble.tranche_id ? (
          <Link 
            href={`/Tranches/${immeuble.tranche_id}`}
            className="inline-flex items-center text-[#009FFF] hover:text-blue-800"
          >
            <ArrowLeft className="mr-1" /> Retour à la tranche
          </Link>
        ) : immeuble.projet_id ? (
          <Link 
            href={`/Projets/${immeuble.projet_id}?tab=immeubles`}
            className="inline-flex items-center text-[#009FFF] hover:text-blue-800"
          >
            <ArrowLeft className="mr-1" /> Retour au projet
          </Link>
        ) : (
          <Link 
            href="/Projets"
            className="inline-flex items-center text-[#009FFF] hover:text-blue-800"
          >
            <ArrowLeft className="mr-1" /> Retour aux projets
          </Link>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Immeuble Summary Card - Left Side */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="text-center p-6 border-b border-gray-200">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">
                  {immeuble.nom ? immeuble.nom.charAt(0).toUpperCase() : "I"}
                </span>
              </div>
              <h1 className="text-xl font-semibold">{immeuble.nom}</h1>
              
              {immeuble.bloc && (
                <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm mt-2">
                  Bloc: {immeuble.bloc.nom}
                </div>
              )}
            </div>

            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-1 gap-4 text-center">
                <div className="p-2">
                  <div className="flex flex-col items-center">
                    <Home className="w-6 h-6 text-blue-500 mb-1" />
                    <span className="text-xl font-medium">
                      {countLoading ? "0" : count.biens}
                    </span>
                    <span className="text-sm text-gray-500">Biens</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Détails</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Titre foncier:</span>
                  <span className="font-medium">{immeuble.titre_foncier || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre de biens:</span>
                  <span className="font-medium">{countLoading ? "0" : count.biens}</span>
                </div>
                
                {immeuble.bloc && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bloc:</span>
                    <span className="font-medium">{immeuble.bloc.nom}</span>
                  </div>
                )}
                
                {immeuble.tranche && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tranche:</span>
                    <span className="font-medium">{immeuble.tranche.nom}</span>
                  </div>
                )}
              </div>
            </div>

            {canManageImmeuble && (
              <div className="p-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <Link 
                    href={`/Immeubles/${id}/modifier`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                  >
                    <Pencil className="w-5 h-5" />
                    <span>Modifier</span>
                  </Link>
                  
                  <button 
                    onClick={() => setConfirming(true)}
                    disabled={confirming}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors disabled:bg-red-300"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Immeuble Content - Right Side */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center">
                <Home className="w-5 h-5 mr-2 text-blue-500" />
                Biens <span className="ml-1 text-xs text-gray-500">({countLoading ? "0" : count.biens})</span>
              </h2>
            </div>

            <div className="p-6">
              <div className="min-h-[400px]">
                <BienTable 
                  projetId={immeuble.projet_id} 
                  immeubleId={id} 
                  key={`biens-${refreshFlag}`} // Force refresh when needed
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {confirming && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirmation</h3>
            <p className="mb-6">Êtes-vous sûr de vouloir supprimer cet immeuble ? Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
