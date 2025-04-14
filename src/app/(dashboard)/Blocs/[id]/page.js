"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { APIURL } from "@/configs/api";
import { useAuth } from "@/context/AuthContext";
import { 
  MdApartment, 
  MdHome,
  MdEdit,
  MdDelete,
  MdArrowBack
} from "react-icons/md";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Link from "next/link";
import BienTable from "@/components/biens/BienTable";
import ImmeubleTable from "@/components/immeubles/ImmeubleTable";

export default function BlocDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [bloc, setBloc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get("tab") || "immeubles";
  });
  const [confirming, setConfirming] = useState(false);
  const [counts, setCounts] = useState({
    immeubles: 0,
    biens: 0
  });
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [countsLoading, setCountsLoading] = useState(true);
  
  // Add a ref to track if we've already fetched data
  const hasInitiallyFetched = useRef(false);

  const canManageBloc = user?.role === 1 || user?.role === 2;

  useEffect(() => {
    // Only fetch if we haven't fetched yet or if the ID changes
    if ((!hasInitiallyFetched.current || !bloc) && id) {
      const fetchBlocDetails = async () => {
        setLoading(true);
        setCountsLoading(true); // Reset counts loading state
        setCounts({ immeubles: 0, biens: 0 }); // Reset counts to 0 when loading starts
        
        try {
          const token = localStorage.getItem("accessToken");
          const response = await axios.get(`${APIURL.BLOCS}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data.bloc) {
            console.log("Full bloc data:", response.data);
            setBloc(response.data.bloc);
            
            // Fetch actual counts directly without setting initial values
            fetchCounts(id, response.data.bloc.projet_id);
            
            // Fetch and store the project in localStorage to maintain context
            if (response.data.bloc.projet_id) {
              const projectResponse = await axios.get(`${APIURL.PROJETS}/${response.data.bloc.projet_id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              
              if (projectResponse.data.projet) {
                localStorage.setItem("selectedProjet", JSON.stringify(projectResponse.data.projet));
              }
            }
          } else {
            setError("Bloc non trouvé");
            setCountsLoading(false);
          }
        } catch (err) {
          console.error("Failed to load bloc:", err);
          setError("Erreur lors du chargement du bloc");
          setCountsLoading(false);
        } finally {
          setLoading(false);
          hasInitiallyFetched.current = true; // Mark that we've fetched data
        }
      };

      fetchBlocDetails();
    }
  }, [id]); // Only depend on ID, not on loading or bloc state

  // Function to fetch the actual counts if not provided by the API
  const fetchCounts = async (blocId, projetId) => {
    try {
      setCountsLoading(true); // Set loading state for counts
      
      const token = localStorage.getItem("accessToken");
      
      // Fetch immeubles count
      const immeublesResponse = await axios.get(APIURL.IMMEUBLES, {
        headers: { Authorization: `Bearer ${token}` },
        params: { bloc_id: blocId }
      });
      
      console.log("Immeubles response:", immeublesResponse.data);
      
      // Fetch biens count
      const biensResponse = await axios.get(APIURL.BIENS, {
        headers: { Authorization: `Bearer ${token}` },
        params: { bloc_id: blocId }
      });
      
      // Process immeubles data
      let immeublesData = [];
      if (immeublesResponse.data.data && Array.isArray(immeublesResponse.data.data)) {
        immeublesData = immeublesResponse.data.data;
      } else if (immeublesResponse.data.immeubles && Array.isArray(immeublesResponse.data.immeubles)) {
        immeublesData = immeublesResponse.data.immeubles;
      }
      
      // Filter immeubles to only include those from this bloc
      const filteredImmeubles = immeublesData.filter(immeuble => 
        immeuble.bloc_id && immeuble.bloc_id.toString() === blocId.toString()
      );
      
      let immeublesCount = filteredImmeubles.length;
      console.log(`Filtered immeubles: ${immeublesCount} of ${immeublesData.length} for bloc ${blocId}`);
      
      // Process biens data
      let biensData = [];
      if (biensResponse.data.data && Array.isArray(biensResponse.data.data)) {
        biensData = biensResponse.data.data;
      } else if (biensResponse.data.biens && Array.isArray(biensResponse.data.biens)) {
        biensData = biensResponse.data.biens;
      }
      
      // Filter biens to only include those from this bloc or its immeubles
      const immeubleIds = filteredImmeubles.map(imm => imm.id.toString());
      const filteredBiens = biensData.filter(bien => {
        // Directly has bloc_id
        if (bien.bloc_id && bien.bloc_id.toString() === blocId.toString()) {
          return true;
        }
        
        // Has immeuble_id that's in our filtered immeubles
        return bien.immeuble_id && immeubleIds.includes(bien.immeuble_id.toString());
      });
      
      let biensCount = filteredBiens.length;
      console.log(`Filtered biens: ${biensCount} of ${biensData.length} for bloc ${blocId}`);
      
      // Update counts with actual data
      const newCounts = {
        immeubles: immeublesCount,
        biens: biensCount
      };
      
      console.log("Final filtered counts:", newCounts);
      setCounts(newCounts);
      
    } catch (error) {
      console.error("Error fetching counts:", error);
      setCounts({ immeubles: 0, biens: 0 }); // Reset on error
    } finally {
      setCountsLoading(false); // End loading state for counts
    }
  };

  // Update tab handling to reset the view when switching tabs
  const handleTabClick = (tab) => {
    // Clear any previous search or filters when changing tabs
    setActiveTab(tab);
    
    // Update URL with the new tab
    const url = new URL(window.location);
    url.searchParams.set("tab", tab);
    window.history.pushState({}, "", url);
    
    // Force a refresh of the tab content
    setRefreshFlag(prev => !prev);
  };

  const handleDeleteConfirm = async () => {
    setConfirming(true);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${APIURL.BLOCS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Bloc supprimé avec succès");
      
      // Redirect to the tranche page if available, otherwise to the project page
      if (bloc?.tranche_id) {
        router.push(`/Tranches/${bloc.tranche_id}`);
      } else if (bloc?.projet_id) {
        router.push(`/Projets/${bloc.projet_id}?tab=blocs`);
      } else {
        router.push("/Projets");
      }
    } catch (err) {
      console.error("Failed to delete bloc:", err);
      toast.error("Erreur lors de la suppression du bloc");
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

  if (error || !bloc) {
    return (
      <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-500 !text-red-700">
        <p className="font-medium">Erreur</p>
        <p>{error || "Bloc non trouvé"}</p>
        <Link href="/Projets" className="mt-4 inline-block text-[#009FFF] hover:underline">
          Retour à la liste des projets
        </Link>
      </div>
    );
  }

  // Define tabs for this view - only immeubles and biens
  const tabs = [
    { id: "immeubles", label: "Immeubles", icon: <MdApartment className="w-5 h-5"/> },
    { id: "biens", label: "Biens", icon: <MdHome className="w-5 h-5"/> }
  ];

  return (
    <div className="container mx-auto">
      {/* Back navigation */}
      <div className="mb-4">
        {bloc.tranche_id ? (
          <Link 
            href={`/Tranches/${bloc.tranche_id}`}
            className="inline-flex items-center text-[#009FFF] hover:text-blue-800"
          >
            <MdArrowBack className="mr-1" /> Retour à la tranche
          </Link>
        ) : bloc.projet_id ? (
          <Link 
            href={`/Projets/${bloc.projet_id}?tab=blocs`}
            className="inline-flex items-center text-[#009FFF] hover:text-blue-800"
          >
            <MdArrowBack className="mr-1" /> Retour au projet
          </Link>
        ) : (
          <Link 
            href="/Projets"
            className="inline-flex items-center text-[#009FFF] hover:text-blue-800"
          >
            <MdArrowBack className="mr-1" /> Retour aux projets
          </Link>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Bloc Summary Card - Left Side */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="text-center p-6 border-b border-gray-200">
              <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">
                  {bloc.nom ? bloc.nom.charAt(0).toUpperCase() : "B"}
                </span>
              </div>
              <h1 className="text-xl font-semibold">{bloc.nom}</h1>
              
              {bloc.tranche && (
                <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm mt-2">
                  Tranche: {bloc.tranche.nom}
                </div>
              )}
            </div>

            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-2">
                  <div className="flex flex-col items-center">
                    <MdApartment className="w-6 h-6 text-red-500 mb-1" />
                    <span className="text-xl font-medium">
                      {countsLoading ? "0" : counts.immeubles}
                    </span>
                    <span className="text-sm text-gray-500">Immeubles</span>
                  </div>
                </div>
                
                <div className="p-2">
                  <div className="flex flex-col items-center">
                    <MdHome className="w-6 h-6 text-blue-500 mb-1" />
                    <span className="text-xl font-medium">
                      {countsLoading ? "0" : counts.biens}
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
                  <span className="font-medium">{bloc.titre_foncier || 'N/A'}</span>
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

            {canManageBloc && (
              <div className="p-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <Link 
                    href={`/Blocs/${id}/modifier`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                  >
                    <MdEdit className="w-5 h-5" />
                    <span>Modifier</span>
                  </Link>
                  
                  <button 
                    onClick={() => setConfirming(true)}
                    disabled={confirming}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors disabled:bg-red-300"
                  >
                    <MdDelete className="w-5 h-5" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bloc Content - Right Side */}
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
                    {tab.id === "immeubles" && <span className="ml-1 text-xs">({countsLoading ? "0" : counts.immeubles})</span>}
                    {tab.id === "biens" && <span className="ml-1 text-xs">({countsLoading ? "0" : counts.biens})</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {activeTab === "immeubles" && (
                <div className="min-h-[400px]">
                  <h3 className="text-lg font-medium mb-4">Immeubles</h3>
                  <ImmeubleTable 
                    projetId={bloc.projet_id} 
                    blocId={id} 
                    key={`immeubles-${refreshFlag}`} // Force refresh when tab changes
                  />
                </div>
              )}

              {activeTab === "biens" && (
                <div className="min-h-[400px]">
                  <h3 className="text-lg font-medium mb-4">Biens</h3>
                  <BienTable 
                    projetId={bloc.projet_id} 
                    blocId={id} 
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
            <p className="mb-6">Êtes-vous sûr de vouloir supprimer ce bloc ? Cette action est irréversible.</p>
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
