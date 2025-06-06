'use client';
import { ChevronDown } from "lucide-react";
import { Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useProjet } from "../context/ProjetContext";
import Link from "next/link";
import classNames from "classnames";
import { Eye } from 'lucide-react';

export default function ProjetsDropDown() {
    const { selectedProjet, projets, selectProjet, loading, fetchProjets } = useProjet();
    const [isSelectorOpened, setIsSelectorOpened] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasFetchAttempted, setHasFetchAttempted] = useState(false); 
    const dropdownRef = useRef(null);

    // Fetch projets when the dropdown is opened
    useEffect(() => {
        if (isSelectorOpened && projets.length === 0 && !loading && !hasFetchAttempted) {
            setHasFetchAttempted(true);
            fetchProjets();
        }
    }, [isSelectorOpened, projets.length, loading, fetchProjets, hasFetchAttempted]);

    // Attempt to restore project from localStorage on component mount
    useEffect(() => {
        if (!selectedProjet) {
            const savedProject = localStorage.getItem('selectedProjet');
            if (savedProject) {
                try {
                    const parsedProject = JSON.parse(savedProject);
                    if (parsedProject && parsedProject.id) {
                        console.log("ProjetsDropDown: Restoring project from localStorage", parsedProject.id);
                        selectProjet(parsedProject);
                    }
                } catch (error) {
                    console.error("Error parsing saved project in dropdown:", error);
                }
            }
        }
    }, [selectedProjet, selectProjet]);

    // Reset fetch tracking when dropdown closes
    useEffect(() => {
        if (!isSelectorOpened) {
            const timer = setTimeout(() => {
                setHasFetchAttempted(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isSelectorOpened]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsSelectorOpened(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Handle projet selection
    const handleSelectProjet = async (projet) => {
        if (isSubmitting) return;

        // Close the dropdown immediately before doing anything else
        setIsSelectorOpened(false);
        setInputValue("");
        
        setIsSubmitting(true);
        
        // Update localStorage before context update to ensure API calls use the new project
        localStorage.setItem("selectedProjet", JSON.stringify(projet));
        
        const success = await selectProjet(projet);
        setIsSubmitting(false);
    };

    // Filter projets based on search input
    const filteredProjets = projets.filter(projet => {
        const searchableText = (projet.nom || "").toLowerCase();
        return searchableText.includes(inputValue.toLowerCase());
    });

    return (
        <div className="w-[250px] font-medium relative" ref={dropdownRef}>
            {/* Dropdown Header */}
            <div 
                className={`flex gap-2 items-center justify-between border p-2 rounded-lg cursor-pointer bg-white ${isSubmitting ? 'opacity-70' : ''}`}
                onClick={() => {
                    if (!isSubmitting) {
                        setIsSelectorOpened(!isSelectorOpened);
                    }
                }}
            >
                <span className={`px-2 ${selectedProjet ? "text-gray-800" : "text-gray-500"}`}>
                    {isSubmitting ? "Chargement..." : selectedProjet?.nom || "Sélectionner un projet"}
                </span>
                <ChevronDown 
                    size={20} 
                    className={classNames({ 'rotate-180': isSelectorOpened })} 
                />
            </div>

            {/* Dropdown List */}
            <ul className={classNames(
                "bg-white overflow-y-auto scrollbar-none transition-all duration-200 absolute w-full rounded-lg shadow-md z-50",
                { 
                    "max-h-[300px] p-2 mt-1 opacity-100 visible": isSelectorOpened, 
                    "max-h-0 opacity-0 invisible": !isSelectorOpened 
                }
            )}>
                {/* Search Input */}
                {isSelectorOpened && (
                    <div className="sticky top-0 z-10 p-2">
                        <div className="flex items-center gap-2 p-2 bg-white border rounded-lg shadow-sm">
                            <Search size={18} />
                            <input 
                                type="text" 
                                value={inputValue} 
                                onChange={(e) => setInputValue(e.target.value)} 
                                placeholder="Rechercher un projet"
                                className="w-full outline-none border-none"
                                autoFocus
                            />
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isSelectorOpened && loading && (
                    <li className="p-4 text-center !text-gray-500">
                        Chargement des projets...
                    </li>
                )}

                {/* Empty State */}
                {isSelectorOpened && !loading && filteredProjets.length === 0 && (
                    <li className="p-4 text-center !text-gray-500">
                        {inputValue ? "Aucun projet trouvé" : "Aucun projet disponible"}
                    </li>
                )}

                {/* Filtered List */}
                {isSelectorOpened && filteredProjets.map((projet) => (
                    <li 
                        key={projet.id} 
                        className={`p-3 mt-1 hover:bg-gray-100 hover:rounded-md cursor-pointer flex items-center ${
                            selectedProjet?.id === projet.id ? 'bg-blue-50 text-[#009FFF]' : ''
                        }`}
                        onClick={() => handleSelectProjet(projet)}
                    >
                        <span className="ml-2 truncate">
                            {projet.nom}
                        </span>
                    </li>
                ))}

                {/* Manage Projets Link */}
                {isSelectorOpened && (
                    <li className="p-2 mt-2 border-t border-gray-100">
                        <Link 
                            href="/Projets"
                            className="flex items-center justify-center gap-2 w-full text-center text-[#009FFF] hover:text-blue-800 p-2 hover:bg-blue-50 rounded-md transition-colors"
                            onClick={() => setIsSelectorOpened(false)}
                        >
                            <div className="flex items-center gap-2">
                                <span>Gérer les Projets</span>
                                <Eye className="w-4 h-4" />
                            </div>
                        </Link>
                    </li>
                )}
            </ul>
        </div>
    );
}
