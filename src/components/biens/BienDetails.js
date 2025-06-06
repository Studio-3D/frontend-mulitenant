"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { APIURL } from "@/configs/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Pencil, ArrowLeft, Building, Home, MapPin, Tag, Euro, FileText, AlignLeft, Files, CreditCard, Receipt, Image } from "lucide-react";
import { getEtatLabel, getFullOrientation } from "@/configs/enum";
import BienSuperficies from "./BienSuperficies";
import BienComposition from "./BienComposition";
import BienDescriptionGenerator from "./BienDescriptionGenerator";
import BienDossiers from "./BienDossiers";
import BienEncaissements from "./BienEncaissements";
import BienTvaCollecte from "./BienTvaCollecte";
import BienMedia from "./BienMedia";

export default function BienDetails({ id }) {
  const [bien, setBien] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("superficies");
  const [bienDescription, setBienDescription] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  // Only admins and super admins can edit properties
  const canEditBien = user?.role === 1 || user?.role === 2;

  useEffect(() => {
    const fetchBienDetails = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${APIURL.BIENS}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data.bien) {
          setBien(response.data.bien);
          setBienDescription(response.data.bien.description || "");
          
          // If the property belongs to a project, store the project in localStorage
          if (response.data.bien.projet_id) {
            try {
              const projectResponse = await axios.get(
                `${APIURL.PROJETS}/${response.data.bien.projet_id}`, 
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              if (projectResponse.data && projectResponse.data.projet) {
                localStorage.setItem(
                  "selectedProjet", 
                  JSON.stringify(projectResponse.data.projet)
                );
              }
            } catch (err) {
              console.error("Error fetching project details:", err);
            }
          }
        } else {
          setError("Bien non trouvé");
        }
      } catch (err) {
        console.error("Error fetching bien details:", err);
        setError(err.response?.data?.message || "Erreur lors du chargement du bien");
      } finally {
        setLoading(false);
      }
    };

    fetchBienDetails();
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
      <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-500 !text-red-700">
        <p className="font-medium">Erreur</p>
        <p>{error}</p>
        <Link href="/Biens" className="text-blue-500 hover:underline mt-2 inline-block">
          Retour à la liste des biens
        </Link>
      </div>
    );
  }

  // Format price with thousand separators
  const formatPrice = (price) => {
    return price ? price.toLocaleString('fr-FR') + ' Dhs' : 'N/A';
  };

  // Get the status badge with proper formatting
  const getStatusBadge = (etat) => {
    const statusClasses = {
      disponible: "bg-green-100 !text-green-800 border border-green-300",
      reserve: "bg-blue-100 !text-blue-800 border border-blue-300",
      vendu: "bg-purple-100 text-purple-800 border border-purple-300",
    };
    
    return (
      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${statusClasses[etat] || "bg-gray-100 !text-gray-800"}`}>
        {getEtatLabel(etat)}
      </span>
    );
  };

  // Define tabs with description - ADD media tab
  const tabs = [
    { id: "superficies", label: "Superficies", icon: <MapPin className="w-4 h-4" /> },
    { id: "composition", label: "Composition", icon: <Home className="w-4 h-4" /> },
    { id: "media", label: "Médias", icon: <Image className="w-4 h-4" /> },
    { id: "dossiers", label: "Dossiers", icon: <Files className="w-4 h-4" /> },
    { id: "encaissements", label: "Encaissements", icon: <CreditCard className="w-4 h-4" /> },
    { id: "tva_collecte", label: "TVA Collecté", icon: <Receipt className="w-4 h-4" /> },
  ];
  
  // Render the appropriate content for the active tab - ADD media case
  const renderTabContent = () => {
    switch (activeTab) {
      case "superficies":
        return <BienSuperficies bien={bien} />;
      case "composition":
        return <BienComposition bien={bien} />;
      case "media":
        return <BienMedia bienId={id} />;
      case "dossiers":
        return <BienDossiers bienId={id} />;
      case "encaissements":
        return <BienEncaissements bienId={id} />;
      case "tva_collecte":
        return <BienTvaCollecte bienId={id} bien={bien} />;
      default:
        return <BienSuperficies bien={bien} />;
    }
  };
  
  // Removed renderDescriptionTab function as it's no longer needed
  
  // Helper function to render avatar with icon
  const renderIconAvatar = (icon, bgColor = "bg-blue-100") => (
    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${bgColor} !text-blue-600 mr-3 flex-shrink-0`}>
      {icon}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with actions and banner background */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link 
              href={bien.projet_id ? `/Projets/${bien.projet_id}` : "/Biens"}
              className="text-white hover:text-blue-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{bien.propriete_dite_bien}</h1>
              <p className="text-blue-100">
                {[
                  bien.projet?.nom,
                  bien.tranche?.nom,
                  bien.bloc?.nom,
                  bien.immeuble?.nom
                ]
                .filter(Boolean)
                .join(" • ")}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* État actuel badge */}
            {getStatusBadge(bien.etat)}
            
            {/* Partager button */}
            {canEditBien && (
              <BienDescriptionGenerator 
                bien={bien} 
                onDescriptionSaved={(desc) => setBienDescription(desc)}
                buttonText="Partager"
              />
            )}
            
            {/* Modifier button */}
            {canEditBien && (
              <Link 
                href={`/Biens/${id}/modifier`} 
                className="flex items-center gap-2 px-4 py-2 bg-white !text-blue-700 rounded-md hover:bg-blue-50"
              >
                <Pencil className="w-4 h-4" />
                Modifier
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* General info section */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="border-b border-blue-500 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-lg font-medium !text-blue-700">Informations générales</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic information */}
            <div className="flex items-start gap-3">
              {renderIconAvatar(<Home className="w-5 h-5" />, "bg-indigo-100")}
              <div>
                <h3 className="text-sm font-medium !text-gray-500">Numéro</h3>
                <p className="mt-1 font-semibold">{bien.numero || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              {renderIconAvatar(<Building className="w-5 h-5" />, "bg-purple-100")}
              <div>
                <h3 className="text-sm font-medium !text-gray-500">Type de bien</h3>
                <p className="mt-1 font-semibold">{bien.type?.type || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              {renderIconAvatar(<Tag className="w-5 h-5" />, "bg-teal-100")}
              <div>
                <h3 className="text-sm font-medium !text-gray-500">Typologie</h3>
                <p className="mt-1 font-semibold">{bien.typologie?.typologie || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              {renderIconAvatar(<MapPin className="w-5 h-5" />, "bg-amber-100")}
              <div>
                <h3 className="text-sm font-medium !text-gray-500">Niveau</h3>
                <p className="mt-1 font-semibold">{bien.niveau !== null ? bien.niveau : 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              {renderIconAvatar(<Euro className="w-5 h-5" />, "bg-green-200")}
              <div>
                <h3 className="text-sm font-medium !text-gray-500">Prix</h3>
                <p className="mt-1 font-semibold !text-green-600">{formatPrice(bien.prix)}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              {renderIconAvatar(
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>, 
                "bg-pink-100"
              )}
              <div>
                <h3 className="text-sm font-medium !text-gray-500">Orientation</h3>
                <p className="mt-1 font-semibold">{bien.orientation ? getFullOrientation(bien.orientation) : 'N/A'}</p>
              </div>
            </div>
            
            {/* Prix unitaire */}
            <div className="flex items-start gap-3">
              {renderIconAvatar(<Euro className="w-5 h-5" />, "bg-purple-100")}
              <div>
                <h3 className="text-sm font-medium !text-gray-500">Prix unitaire</h3>
                <p className="mt-1 font-semibold text-purple-600">{formatPrice(bien.prix_unitaire)}</p>
              </div>
            </div>
            
            {/* Avance minimale */}
            <div className="flex items-start gap-3">
              {renderIconAvatar(<Euro className="w-5 h-5" />, "bg-amber-100")}
              <div>
                <h3 className="text-sm font-medium !text-gray-500">Avance minimale</h3>
                <p className="mt-1 font-semibold text-amber-700">{formatPrice(bien.avance_minimale)}</p>
              </div>
            </div>
            
            {/* Nombre de façades */}
            <div className="flex items-start gap-3">
              {renderIconAvatar(
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>,
                "bg-blue-100"
              )}
              <div>
                <h3 className="text-sm font-medium !text-gray-500">Nombre de façades</h3>
                <p className="mt-1 font-semibold">{bien.nbre_facades || 'N/A'}</p>
              </div>
            </div>
            
            {/* Vue */}
            {bien.vue && (
              <div className="flex items-start gap-3">
                {renderIconAvatar(
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M15 3h6v6" />
                    <path d="M10 14 21 3" />
                    <path d="M19 10v11H3V5h11" />
                  </svg>,
                  "bg-cyan-100"
                )}
                <div>
                  <h3 className="text-sm font-medium !text-gray-500">Vue</h3>
                  <p className="mt-1 font-semibold">{bien.vue.vue}</p>
                </div>
              </div>
            )}
            
            {bien.titre_foncier && (
              <div className="flex items-start gap-3">
                {renderIconAvatar(
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M7 9h10" />
                    <path d="M7 13h10" />
                    <path d="M7 17h4" />
                  </svg>,
                  "bg-orange-100"
                )}
                <div>
                  <h3 className="text-sm font-medium !text-gray-500">Titre foncier</h3>
                  <p className="mt-1 font-semibold">{bien.titre_foncier}</p>
                </div>
              </div>
            )}
            
            {/* Conventionné */}
            <div className="flex items-start gap-3">
              {renderIconAvatar(
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>,
                bien.conventionne ? "bg-green-200" : "bg-red-200"
              )}
              <div>
                <h3 className="text-sm font-medium !text-gray-500">Conventionné</h3>
                <p className={`mt-1 font-semibold ${bien.conventionne ? "text-green-600" : "text-red-500"}`}>
                  {bien.conventionne ? 'Oui' : 'Non'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description section */}
      <div className="mt-8 border-t border-blue-200 pt-6 col-span-1 md:col-span-2 lg:col-span-3">
        <h3 className="text-lg font-medium mb-4 !text-blue-700 flex items-center">
          <AlignLeft className="mr-2 w-5 h-5" />
          Description
        </h3>
        
        <div className="bg-white p-4 rounded-md border border-gray-100">
          {bienDescription ? (
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{bienDescription}</p>
            </div>
          ) : (
            <div className="text-center py-4 !text-gray-500">
              <p>Aucune description disponible pour ce bien.</p>
              {canEditBien && (
                <p className="mt-2 text-sm">
                  Utilisez le bouton "Partager" pour créer une description.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tab navigation for other content */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 font-medium text-sm border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-500 !text-blue-600 bg-blue-50"
                    : "border-transparent !text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
