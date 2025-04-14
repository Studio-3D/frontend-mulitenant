"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { APIURL } from "@/configs/api";
import { useAuth } from "@/context/AuthContext";
import { useProjet } from "@/context/ProjetContext";
import { 
  MdStorage, 
  MdOutlineViewInAr, 
  MdApartment, 
  MdHome,
  MdEdit,
  MdDelete
} from "react-icons/md";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Link from "next/link";
import BienTable from "@/components/biens/BienTable";
import TrancheTable from "@/components/tranches/TrancheTable";
import BlocTable from "@/components/blocs/BlocTable";
import ImmeubleTable from "@/components/immeubles/ImmeubleTable";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { selectProjet } = useProjet();
  const [projet, setProjet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get("tab") || "biens";
  });
  const [confirming, setConfirming] = useState(false);
  const [hasSetProjet, setHasSetProjet] = useState(false);

  const canManageProjet = user?.role === 1 || user?.role === 2;

  useEffect(() => {
    if (projet && !loading) return;
    
    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${APIURL.PROJETS}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.projet) {
          setProjet(response.data.projet);
          
          if (!hasSetProjet) {
            selectProjet(response.data.projet);
            setHasSetProjet(true);
          }
        } else {
          setError("Projet non trouvé");
        }
      } catch (err) {
        console.error("Failed to load project:", err);
        setError("Erreur lors du chargement du projet");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectDetails();
    }
  }, [id, hasSetProjet]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    const url = new URL(window.location);
    url.searchParams.set("tab", tab);
    window.history.pushState({}, "", url);
  };

  const handleDeleteConfirm = async () => {
    setConfirming(true);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${APIURL.PROJETS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Projet supprimé avec succès");
      router.push("/Projets");
    } catch (err) {
      console.error("Failed to delete project:", err);
      toast.error("Erreur lors de la suppression du projet");
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

  if (error || !projet) {
    return (
      <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-500 !text-red-700">
        <p className="font-medium">Erreur</p>
        <p>{error || "Projet non trouvé"}</p>
        <Link href="/Projets" className="mt-4 inline-block text-[#009FFF] hover:underline">
          Retour à la liste des projets
        </Link>
      </div>
    );
  }

  const showTrancheTab = projet.nbre_tranches > 0;
  const showBlocTab = projet.nbre_blocs > 0;
  const showImmeubleTab = projet.nbre_immeubles > 0;

  const tabs = [];
  if (showTrancheTab) tabs.push({ id: "tranches", label: "Tranches", icon: <MdStorage className="w-5 h-5"/> });
  if (showBlocTab) tabs.push({ id: "blocs", label: "Blocs", icon: <MdOutlineViewInAr className="w-5 h-5"/> });
  if (showImmeubleTab) tabs.push({ id: "immeubles", label: "Immeubles", icon: <MdApartment className="w-5 h-5"/> });
  tabs.push({ id: "biens", label: "Biens", icon: <MdHome className="w-5 h-5"/> });

  return (
    <div className="container mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Project Summary Card - Left Side */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="text-center p-6 border-b border-gray-200">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#009FFF]">
                  {projet.nom ? projet.nom.charAt(0).toUpperCase() : "P"}
                </span>
              </div>
              <h1 className="text-xl font-semibold">{projet.nom}</h1>
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm mt-2">
                {projet.code}
              </div>
            </div>

            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                {showTrancheTab && (
                  <div className="p-2">
                    <div className="flex flex-col items-center">
                      <MdStorage className="w-6 h-6 text-green-500 mb-1" />
                      <span className="text-xl font-medium">{projet.tranche_count || 0}</span>
                      <span className="text-sm text-gray-500">Tranches</span>
                    </div>
                  </div>
                )}

                {showBlocTab && (
                  <div className="p-2">
                    <div className="flex flex-col items-center">
                      <MdOutlineViewInAr className="w-6 h-6 text-orange-500 mb-1" />
                      <span className="text-xl font-medium">{projet.bloc_count || 0}</span>
                      <span className="text-sm text-gray-500">Blocs</span>
                    </div>
                  </div>
                )}

                {showImmeubleTab && (
                  <div className="p-2">
                    <div className="flex flex-col items-center">
                      <MdApartment className="w-6 h-6 text-red-500 mb-1" />
                      <span className="text-xl font-medium">{projet.immeuble_count || 0}</span>
                      <span className="text-sm text-gray-500">Immeubles</span>
                    </div>
                  </div>
                )}

                <div className="p-2">
                  <div className="flex flex-col items-center">
                    <MdHome className="w-6 h-6 text-blue-500 mb-1" />
                    <span className="text-xl font-medium">{projet.bien_count || 0}</span>
                    <span className="text-sm text-gray-500">Biens</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Détails</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Adresse:</span>
                  <span className="font-medium">{projet.adresse}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Date autorisation:</span>
                  <span className="font-medium">
                    {projet.date_autorisation_construction && 
                      format(new Date(projet.date_autorisation_construction), 'dd/MM/yyyy')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Date permis habiter:</span>
                  <span className="font-medium">
                    {projet.date_permis_habiter && 
                      format(new Date(projet.date_permis_habiter), 'dd/MM/yyyy')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Titre foncier:</span>
                  <span className="font-medium">{projet.titre_foncier || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Surface terrain:</span>
                  <span className="font-medium">{projet.surface_terrain} m²</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Prix acquisition:</span>
                  <span className="font-medium">{projet.prix_acquisition} Dhs</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Limite annulation:</span>
                  <span className="font-medium">{projet.limite_annulation_reservation} jours</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Prolongation réservation:</span>
                  <span className="font-medium">{projet.prolongation_reservation || 'N/A'} jours</span>
                </div>
                
                {showTrancheTab && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre de tranches:</span>
                    <span className="font-medium">{projet.nbre_tranches}</span>
                  </div>
                )}
                
                {showBlocTab && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre de blocs:</span>
                    <span className="font-medium">{projet.nbre_blocs}</span>
                  </div>
                )}
                
                {showImmeubleTab && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre d'immeubles:</span>
                    <span className="font-medium">{projet.nbre_immeubles}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre de biens:</span>
                  <span className="font-medium">{projet.nbre_biens}</span>
                </div>
              </div>
            </div>

            {(user?.role <= 2 && projet.user_projet?.length > 0) && (
              <div className="p-6 border-t border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Utilisateurs avec accès</h2>
                <div className="space-y-2">
                  {projet.user_projet.map((assignment) => (
                    <div key={assignment.id} className="flex items-center p-2 bg-gray-50 rounded-md">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-blue-700">
                          {assignment.user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span>
                        {assignment.user?.name} {assignment.user?.prenom}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {canManageProjet && (
              <div className="p-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <Link 
                    href={`/Projets/${id}/modifier`}
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

        {/* Project Content - Right Side */}
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
                    {tab.id === "tranches" && <span className="ml-1 text-xs">({projet.tranche_count || 0})</span>}
                    {tab.id === "blocs" && <span className="ml-1 text-xs">({projet.bloc_count || 0})</span>}
                    {tab.id === "immeubles" && <span className="ml-1 text-xs">({projet.immeuble_count || 0})</span>}
                    {tab.id === "biens" && <span className="ml-1 text-xs">({projet.bien_count || 0})</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {activeTab === "tranches" && (
                <div className="min-h-[400px]">
                  <h3 className="text-lg font-medium mb-4">Tranches</h3>
                  <TrancheTable projetId={id} />
                </div>
              )}

              {activeTab === "blocs" && (
                <div className="min-h-[400px]">
                  <h3 className="text-lg font-medium mb-4">Blocs</h3>
                  <BlocTable projetId={id} />
                </div>
              )}

              {activeTab === "immeubles" && (
                <div className="min-h-[400px]">
                  <h3 className="text-lg font-medium mb-4">Immeubles</h3>
                  <ImmeubleTable projetId={id} />
                </div>
              )}

              {activeTab === "biens" && (
                <div className="min-h-[400px]">
                  <h3 className="text-lg font-medium mb-4">Biens</h3>
                  <BienTable projetId={id} />
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
            <p className="mb-6">Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.</p>
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
