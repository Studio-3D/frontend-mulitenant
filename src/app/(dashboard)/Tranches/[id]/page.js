"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { APIURL } from "@/configs/api";
import { useAuth } from "@/context/AuthContext";
import { 
  Box, 
  Building, 
  Home,
  Edit,
  Trash,
  ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Link from "next/link";
import BienTable from "@/components/biens/BienTable";
import BlocTable from "@/components/blocs/BlocTable";
import ImmeubleTable from "@/components/immeubles/ImmeubleTable";

export default function TrancheDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [tranche, setTranche] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get("tab") || "blocs";
  });
  const [confirming, setConfirming] = useState(false);
  const [counts, setCounts] = useState({
    blocs: 0,
    immeubles: 0,
    biens: 0
  });
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [countsLoading, setCountsLoading] = useState(true);
  
  // Add a ref to track if we've already fetched data
  const hasInitiallyFetched = useRef(false);

  const canManageTranche = user?.role === 1 || user?.role === 2;

  useEffect(() => {
    // Only fetch if we haven't fetched yet or if the ID changes
    if ((!hasInitiallyFetched.current || !tranche) && id) {
      const fetchTrancheDetails = async () => {
        setLoading(true);
        setCountsLoading(true); // Reset counts loading state
        setCounts({ blocs: 0, immeubles: 0, biens: 0 }); // Reset counts to 0 when loading starts
        
        try {
          const token = localStorage.getItem("accessToken");
          const response = await axios.get(`${APIURL.TRANCHES}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data.tranche) {
            console.log("Full tranche data:", response.data);
            setTranche(response.data.tranche);
            
            // Fetch actual counts if they aren't provided by the API
            // But don't set initial counts from API data as they might be incorrect
            fetchCounts(id, response.data.tranche.projet_id);
            
            // Fetch and store the project in localStorage to maintain context
            if (response.data.tranche.projet_id) {
              const projectResponse = await axios.get(`${APIURL.PROJETS}/${response.data.tranche.projet_id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              
              if (projectResponse.data.projet) {
                localStorage.setItem("selectedProjet", JSON.stringify(projectResponse.data.projet));
              }
            }
          } else {
            setError("Tranche non trouvée");
            setCountsLoading(false);
          }
        } catch (err) {
          console.error("Failed to load tranche:", err);
          setError("Erreur lors du chargement de la tranche");
          setCountsLoading(false);
        } finally {
          setLoading(false);
          hasInitiallyFetched.current = true; // Mark that we've fetched data
        }
      };

      fetchTrancheDetails();
    }
  }, [id]); // Only depend on ID, not on loading or tranche state

  // Function to fetch the actual counts if not provided by the API
  const fetchCounts = async (trancheId, projetId) => {
    try {
      setCountsLoading(true); // Set loading state for counts
      
      const token = localStorage.getItem("accessToken");
      
      // Fetch blocs count
      const blocsResponse = await axios.get(APIURL.BLOCS, {
        headers: { Authorization: `Bearer ${token}` },
        params: { tranche_id: trancheId }
      });
      
      // Log the full response to understand its structure
      console.log("Blocs response:", blocsResponse.data);
      
      // Fetch immeubles count
      const immeublesResponse = await axios.get(APIURL.IMMEUBLES, {
        headers: { Authorization: `Bearer ${token}` },
        params: { tranche_id: trancheId }
      });
      
      // Fetch biens count
      const biensResponse = await axios.get(APIURL.BIENS, {
        headers: { Authorization: `Bearer ${token}` },
        params: { tranche_id: trancheId }
      });
      
      // Process blocs data - ensure we only count blocs that belong to this tranche
      let blocsData = [];
      if (blocsResponse.data.data && Array.isArray(blocsResponse.data.data)) {
        blocsData = blocsResponse.data.data;
      } else if (blocsResponse.data.blocs && Array.isArray(blocsResponse.data.blocs)) {
        blocsData = blocsResponse.data.blocs;
      }
      
      // Filter blocs to only those that belong to this tranche
      const filteredBlocs = blocsData.filter(bloc => 
        bloc.tranche_id && bloc.tranche_id.toString() === trancheId.toString()
      );
      
      let blocsCount = filteredBlocs.length;
      console.log(`Filtered blocs: ${blocsCount} of ${blocsData.length} for tranche ${trancheId}`);
      
      // Process immeubles data
      let immeublesData = [];
      if (immeublesResponse.data.data && Array.isArray(immeublesResponse.data.data)) {
        immeublesData = immeublesResponse.data.data;
      } else if (immeublesResponse.data.immeubles && Array.isArray(immeublesResponse.data.immeubles)) {
        immeublesData = immeublesResponse.data.immeubles;
      }
      
      // Filter immeubles to only include those from blocs in this tranche
      const blocIds = filteredBlocs.map(bloc => bloc.id.toString());
      const filteredImmeubles = immeublesData.filter(immeuble => 
        immeuble.bloc_id && blocIds.includes(immeuble.bloc_id.toString())
      );
      
      let immeublesCount = filteredImmeubles.length;
      console.log(`Filtered immeubles: ${immeublesCount} of ${immeublesData.length} for tranche ${trancheId}`);
      
      // Process biens data
      let biensData = [];
      if (biensResponse.data.data && Array.isArray(biensResponse.data.data)) {
        biensData = biensResponse.data.data;
      } else if (biensResponse.data.biens && Array.isArray(biensResponse.data.biens)) {
        biensData = biensResponse.data.biens;
      }
      
      // For biens, we can filter directly by tranche_id from the API, if available
      // Otherwise, filter by bloc_id or immeuble_id
      const filteredBiens = biensData.filter(bien => {
        // Directly has tranche_id
        if (bien.tranche_id && bien.tranche_id.toString() === trancheId.toString()) {
          return true;
        }
        
        // Has bloc_id that's in our filtered blocs
        if (bien.bloc_id && blocIds.includes(bien.bloc_id.toString())) {
          return true;
        }
        
        // Has immeuble_id that's in our filtered immeubles
        const immeubleIds = filteredImmeubles.map(imm => imm.id.toString());
        return bien.immeuble_id && immeubleIds.includes(bien.immeuble_id.toString());
      });
      
      let biensCount = filteredBiens.length;
      console.log(`Filtered biens: ${biensCount} of ${biensData.length} for tranche ${trancheId}`);
      
      // Update counts with actual data
      const newCounts = {
        blocs: blocsCount,
        immeubles: immeublesCount,
        biens: biensCount
      };
      
      console.log("Final filtered counts:", newCounts);
      setCounts(newCounts);
      
    } catch (error) {
      console.error("Error fetching counts:", error);
      setCounts({ blocs: 0, immeubles: 0, biens: 0 }); // Reset on error
    } finally {
      setCountsLoading(false); // End loading state for counts
    }
  };

  useEffect(() => {
    if (tranche) {
      console.log("Tranche details loaded:", tranche);
      console.log("Project ID:", tranche.projet_id);
      console.log("Tranche ID:", id);
    }
  }, [tranche, id]);

  // Update tab handling to reset the view when switching tabs
  const handleTabClick = (tab) => {
    // Clear any previous search or filters when changing tabs
    setActiveTab(tab);
    
    // Update URL with the new tab
    const url = new URL(window.location);
    url.searchParams.set("tab", tab);
    window.history.pushState({}, "", url);
    
    // Force a refresh of the tab content
    if (tab === "blocs" || tab === "immeubles" || tab === "biens") {
      // Set a unique key or refresh flag for tables to force a refetch
      setRefreshFlag(prev => !prev);
    }
  };

  const handleDeleteConfirm = async () => {
    setConfirming(true);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${APIURL.TRANCHES}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Tranche supprimée avec succès");
      if (tranche?.projet_id) {
        router.push(`/Projets/${tranche.projet_id}?tab=tranches`);
      } else {
        router.push("/Projets");
      }
    } catch (err) {
      console.error("Failed to delete tranche:", err);
      toast.error("Erreur lors de la suppression de la tranche");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !tranche) {
    return (
      <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-500 !text-red-700">
        <p className="font-medium ">Erreur</p>
        <p>{error || "Tranche non trouvée"}</p>
        <Link href="/Projets" className="mt-4 inline-block text-[#009FFF] hover:underline">
          Retour à la liste des projets
        </Link>
      </div>
    );
  }

  // Define tabs for this view
  const tabs = [
    { id: "blocs", label: "Blocs", icon: <Box className="w-5 h-5"/> },
    { id: "immeubles", label: "Immeubles", icon: <Building className="w-5 h-5"/> },
    { id: "biens", label: "Biens", icon: <Home className="w-5 h-5"/> }
  ];

  return (
    <div className="container mx-auto">
      {/* Back navigation */}
      <div className="mb-4">
        <Link 
          href={tranche.projet_id ? `/Projets/${tranche.projet_id}?tab=tranches` : "/Projets"}
          className="inline-flex items-center text-[#009FFF] hover:text-blue-800"
        >
          <ArrowLeft className="mr-1" /> Retour au projet
        </Link>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tranche Summary Card - Left Side */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="text-center p-6 border-b border-gray-200">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold !text-green-600">
                  {tranche.nom ? tranche.nom.charAt(0).toUpperCase() : "T"}
                </span>
              </div>
              <h1 className="text-xl font-semibold">{tranche.nom}</h1>
              
              {tranche.projet && (
                <div className="inline-block px-3 py-1 bg-blue-100 !text-blue-700 rounded-full text-sm mt-2">
                  {tranche.projet.nom}
                </div>
              )}
            </div>

            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-2">
                  <div className="flex flex-col items-center">
                    <Box className="w-6 h-6 text-orange-500 mb-1" />
                    <span className="text-xl font-medium">
                      {countsLoading ? "0" : counts.blocs}
                    </span>
                    <span className="text-sm !text-gray-500">Blocs</span>
                  </div>
                </div>
                
                <div className="p-2">
                  <div className="flex flex-col items-center">
                    <Building className="w-6 h-6 !text-red-500 mb-1" />
                    <span className="text-xl font-medium">
                      {countsLoading ? "0" : counts.immeubles}
                    </span>
                    <span className="text-sm !text-gray-500">Immeubles</span>
                  </div>
                </div>
                
                <div className="p-2">
                  <div className="flex flex-col items-center">
                    <Home className="w-6 h-6 !text-blue-500 mb-1" />
                    <span className="text-xl font-medium">
                      {countsLoading ? "0" : counts.biens}
                    </span>
                    <span className="text-sm !text-gray-500">Biens</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Détails</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date lancement:</span>
                  <span className="font-medium">
                    {tranche.date_lancement && 
                      format(new Date(tranche.date_lancement), 'dd/MM/yyyy')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Date livraison:</span>
                  <span className="font-medium">
                    {tranche.date_livraison && 
                      format(new Date(tranche.date_livraison), 'dd/MM/yyyy')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Niveau d'étages:</span>
                  <span className="font-medium">{tranche.niveau_etages || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre de blocs:</span>
                  <span className="font-medium">{countsLoading ? "0" : counts.blocs}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre d'immeubles:</span>
                  <span className="font-medium">{countsLoading ? "0" : counts.immeubles}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre de biens:</span>
                  <span className="font-medium">{countsLoading ? "0" : counts.biens}</span>
                </div>
              </div>
            </div>

            {canManageTranche && (
              <div className="p-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <Link 
                    href={`/Tranches/${id}/modifier`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                    <span>Modifier</span>
                  </Link>
                  
                  <button 
                    onClick={() => setConfirming(true)}
                    disabled={confirming}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors disabled:bg-red-300"
                  >
                    <Trash className="w-5 h-5" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tranche Content - Right Side */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`px-6 py-3 flex items-center gap-2 text-sm font-medium whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-b-2 border-[#009FFF] text-[#009FFF]"
                        : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => handleTabClick(tab.id)}
                  >
                    {tab.icon}
                    {tab.label}
                    {tab.id === "blocs" && <span className="ml-1 text-xs">({countsLoading ? "0" : counts.blocs})</span>}
                    {tab.id === "immeubles" && <span className="ml-1 text-xs">({countsLoading ? "0" : counts.immeubles})</span>}
                    {tab.id === "biens" && <span className="ml-1 text-xs">({countsLoading ? "0" : counts.biens})</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {activeTab === "blocs" && (
                <div className="min-h-[400px]">
                  <h3 className="text-lg font-medium mb-4">Blocs</h3>
                  <BlocTable 
                    projetId={tranche.projet_id} 
                    trancheId={id} 
                    key={`blocs-${refreshFlag}`} // Force refresh when tab changes
                  />
                </div>
              )}

              {activeTab === "immeubles" && (
                <div className="min-h-[400px]">
                  <h3 className="text-lg font-medium mb-4">Immeubles</h3>
                  <ImmeubleTable 
                    projetId={tranche.projet_id} 
                    trancheId={id} 
                    key={`immeubles-${refreshFlag}`} // Force refresh when tab changes
                  />
                </div>
              )}

              {activeTab === "biens" && (
                <div className="min-h-[400px]">
                  <h3 className="text-lg font-medium mb-4">Biens</h3>
                  <BienTable 
                    projetId={tranche.projet_id} 
                    trancheId={id} 
                    key={`biens-${refreshFlag}`} // Force refresh when tab changes
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {confirming && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirmation</h3>
            <p className="mb-6">Êtes-vous sûr de vouloir supprimer cette tranche ? Cette action est irréversible.</p>
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
