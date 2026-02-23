'use client';
import { useState, useEffect } from "react";
import { APIURL, RESOURCE_URL } from '../../../configs/api';
import axios from 'axios';
import { Calendar, MapPin } from "lucide-react";
import toast from "react-hot-toast";

export default function AfficherSociete({ societeId, onClose }) {
    const [societe, setSociete] = useState(null);
    const [loading, setLoading] = useState(true);
    

    useEffect(() => {
        const fetchSocieteById = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                console.error("No access token found");
                return;
            }

            try {
                const response = await axios.get(`${APIURL.SOCIETES}/${societeId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                setSociete(response.data.societe);
                console.log("Société fetched successfully:", response.data.societe);
            } catch (error) {
                console.error("Error fetching société:", error);
            } finally {
                setLoading(false);
            }
        };

        if (societeId) {
            fetchSocieteById();
        }
    }, [societeId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center w-[800px] h-[500px]">
                <p className="text-lg !text-gray-500">Chargement...</p>
            </div>
        );
    }

    if (!societe) {
        return (
            <div className="flex justify-center items-center w-[800px] h-[500px]">
                <p className="text-lg !text-red-500">Données non disponibles</p>
            </div>
        );
    }

    return (
        <div className="w-[800px] h-[500px] bg-white flex flex-col">
            {/* Header */}
            <div className="w-full h-[25%] bg-gradient-to-r from-[#74EBD5] to-[#9FACE6] px-4">
                <div className="flex items-center justify-center h-full">
                    <h1 className="text-2xl font-semibold">Détails de la Société</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex">
                {/* Left Section - Image */}
                <div className="w-[250px] h-[20vh] relative">
                    <div className="bg-white w-[220px] h-[20vh] absolute -top-20 ml-6 shadow-xl rounded-tr-[30px] rounded-bl-[30px]">
                        <img 
                            src={societe?.logo 
                                ? `${RESOURCE_URL.DOCS}/${societe.raison_sociale_concatene}_${societe.id}/logos/${societe.logo}`
                                : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
                            } 
                            alt="logo" 
                            className="w-full h-[20vh] rounded-tr-[30px] rounded-bl-[30px] object-cover" 
                        />
                    </div>
                </div>

                {/* Right Section - Data */}
                <div className="flex flex-col p-4">
                    {/* Date & Location */}
                    <div className="grid grid-cols-2 gap-4 text-lg pb-2 font-semibold">
                        <div className="flex gap-1 items-center">
                            <Calendar className="text-[#009FFF] w-6 h-6" />
                            <span>Rejoint {new Date(societe.created_at).toLocaleString("fr-FR", { month: "long", year: "numeric" })}</span>
                        </div>
                        <div className="flex gap-1 items-center">
                            <MapPin className="text-[#009FFF] w-6 h-6" />
                            <p>{societe.adresse}</p>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-6 font-normal">
                        {[
                            { label: "Raison Sociale", value: societe.raison_sociale },
                            { label: "Email", value: societe.email },
                            { label: "Nom", value: societe.nom_contact },
                            { label: "Prenom", value: societe.prenom_contact },
                            { label: "Telephone", value: societe.tel },
                            { label: "Registre commerce", value: societe.registre_commerce },
                            { label: "ID fiscal", value: societe.id_fiscal },
                            { label: "Capital", value: societe.capital }
                        ].map(({ label, value }) => (
                            <div key={label} className="flex gap-2 items-center">
                                <span className="text-[#009FFF] font-medium text-md">{label}:</span>
                                <p>{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Close Button */}
                    <div className="flex justify-center mt-16 w-full">
                        <button className="bg-[#009FFF] text-white font-medium px-4 py-2 w-full rounded-md cursor-pointer" onClick={onClose}>
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
