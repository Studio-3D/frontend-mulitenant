'use client';
import { ChevronDown, Search, Eye } from "lucide-react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useProjet } from "../context/ProjetContext";
import Link from "next/link";
import classNames from "classnames";

export default function ProjetsDropDown() {
    const { selectedProjet, projets, selectProjet, loading, fetchProjets, isCacheValid, clearSelectedProjet, isInitialized } = useProjet();
    const [isSelectorOpened, setIsSelectorOpened] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // ==================== EFFECTS ====================
    useEffect(() => {
        if (isSelectorOpened && !isCacheValid()) {
            fetchProjets();
        }
    }, [isSelectorOpened, fetchProjets, isCacheValid]);

    useEffect(() => {
        if (!isSelectorOpened) {
            const timer = setTimeout(() => setInputValue(""), 300);
            return () => clearTimeout(timer);
        }
    }, [isSelectorOpened]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsSelectorOpened(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isSelectorOpened && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 150);
        }
    }, [isSelectorOpened]);

    // ==================== EVENT HANDLERS ====================
    const handleSelectProjet = useCallback(async (projet) => {
        if (isSubmitting) return;

        setIsSelectorOpened(false);
        setInputValue("");
        setIsSubmitting(true);
        
        try {
            await selectProjet(projet);
        } catch (error) {
            // Handle selection error silently
        } finally {
            setIsSubmitting(false);
        }
    }, [isSubmitting, selectProjet]);

    const toggleDropdown = useCallback(() => {
        if (!isSubmitting) {
            setIsSelectorOpened(prev => !prev);
        }
    }, [isSubmitting]);

    const handleSearchChange = useCallback((e) => {
        setInputValue(e.target.value);
    }, []);

    const handleManageProjectsClick = useCallback(() => {
        setIsSelectorOpened(false);
    }, []);

    // ==================== MEMOIZED VALUES ====================
    const filteredProjets = useMemo(() => {
        if (!inputValue) return projets;
        
        const searchTerm = inputValue.toLowerCase();
        return projets.filter(projet => 
            (projet.nom || "").toLowerCase().includes(searchTerm)
        );
    }, [projets, inputValue]);

    const dropdownContent = useMemo(() => {
        if (loading) {
            return (
                <li className="p-4 text-center text-gray-500">
                    Chargement des projets...
                </li>
            );
        }

        if (filteredProjets.length === 0) {
            return (
                <li className="p-4 text-center text-gray-500">
                    {inputValue ? "Aucun projet trouvé" : "Aucun projet disponible"}
                </li>
            );
        }

        return (
            <>
                {/* Projects List */}
                {filteredProjets.map((projet) => (
                    <li 
                        key={projet.id} 
                        className={`p-3 mt-1 hover:bg-gray-100 hover:rounded-md cursor-pointer flex items-center transition-colors ${
                            selectedProjet?.id === projet.id ? 'bg-blue-50 text-[#009FFF] font-medium' : ''
                        }`}
                        onClick={() => handleSelectProjet(projet)}
                    >
                        <span className="ml-2 truncate flex-1">
                            {projet.nom}
                        </span>
                        {selectedProjet?.id === projet.id && (
                            <div className="w-2 h-2 bg-[#009FFF] rounded-full ml-2"></div>
                        )}
                    </li>
                ))}

                {/* Manage Projects Link */}
                <li className="p-2 mt-2 border-t border-gray-100">
                    <Link 
                        href="/Projets"
                        className="flex items-center justify-center gap-2 w-full text-center text-[#009FFF] hover:text-blue-800 p-2 hover:bg-blue-50 rounded-md transition-colors"
                        onClick={handleManageProjectsClick}
                    >
                        <div className="flex items-center gap-2">
                            <span>Gérer les Projets</span>
                            <Eye className="w-4 h-4" />
                        </div>
                    </Link>
                </li>
            </>
        );
    }, [loading, filteredProjets, inputValue, selectedProjet, handleSelectProjet, handleManageProjectsClick]);

    // Show loading state until initialization is complete
    if (!isInitialized) {
        return (
            <div className="w-[250px] font-medium relative">
                <div className="flex gap-2 items-center justify-between border border-gray-300 p-2 rounded-lg bg-gray-100">
                    <span className="px-2 truncate flex-1 text-gray-500">
                        Initialisation...
                    </span>
                    <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
                </div>
            </div>
        );
    }

    // ==================== RENDER ====================
    return (
        <div className="w-[250px] font-medium relative" ref={dropdownRef}>
            {/* Dropdown Header */}
            <div 
                className={`flex gap-2 items-center justify-between border border-gray-300 p-2 rounded-lg cursor-pointer bg-white transition-all duration-200 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:border-gray-400 hover:shadow-sm'
                } ${isSelectorOpened ? 'border-blue-300 shadow-sm' : ''}`}
                onClick={toggleDropdown}
            >
                <span className={`px-2 truncate flex-1 ${selectedProjet ? "text-gray-800" : "text-gray-500"}`}>
                    {isSubmitting ? "Chargement..." : selectedProjet?.nom || "Sélectionner un projet"}
                </span>
                <ChevronDown 
                    size={20} 
                    className={classNames('transition-transform duration-200 text-gray-500 flex-shrink-0', { 
                        'rotate-180': isSelectorOpened 
                    })} 
                />
            </div>

            {/* Dropdown List */}
            <ul className={classNames(
                "bg-white overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 transition-all duration-200 absolute w-full rounded-lg shadow-lg z-50 border border-gray-200",
                { 
                    "max-h-[300px] py-2 opacity-100 visible mt-1": isSelectorOpened, 
                    "max-h-0 opacity-0 invisible": !isSelectorOpened 
                }
            )}>
                {/* Search Input */}
                {isSelectorOpened && (
                    <div className="sticky top-0 z-50 px-2 pb-2 bg-white">
                        <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                            <Search size={18} className="text-gray-400 flex-shrink-0" />
                            <input 
                                ref={searchInputRef}
                                type="text" 
                                value={inputValue} 
                                onChange={handleSearchChange}
                                placeholder="Rechercher un projet"
                                className="w-full outline-none border-none bg-transparent placeholder-gray-400 text-sm"
                            />
                        </div>
                    </div>
                )}

                {/* Content Area */}
                {isSelectorOpened && dropdownContent}
            </ul>
        </div>
    );
}