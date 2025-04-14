'use client';
import { BiChevronDown } from "react-icons/bi";
import { AiOutlineSearch } from "react-icons/ai";
import { useState, useEffect, useRef } from "react";
import { useSociete } from "../context/SocieteContext";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import classNames from "classnames";
import { FaRegEye } from 'react-icons/fa';

export default function SocieteDropDown() {
    const { selectedSociete, societes, selectSociete, loading, clearSelectedSociete } = useSociete();
    const { user } = useAuth();
    const [isSelectorOpened, setIsSelectorOpened] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dropdownRef = useRef(null);

    // Load société from localStorage on mount
    useEffect(() => {
        const storedSociete = localStorage.getItem("selectedSociete");
        if (storedSociete) {
            selectSociete(JSON.parse(storedSociete));
        }
    }, []);

    // Save société to localStorage when changed
    useEffect(() => {
        if (selectedSociete) {
            localStorage.setItem("selectedSociete", JSON.stringify(selectedSociete));
        }
    }, [selectedSociete]);

    // Clear société only when the user logs out
    useEffect(() => {
        if (!user) {
            localStorage.removeItem("selectedSociete");
            clearSelectedSociete();
        }
    }, [user]);

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
    
    // Handle société selection
    const handleSelectSociete = async (societe) => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        const success = await selectSociete(societe);
        setIsSubmitting(false);

        if (success) {
            setIsSelectorOpened(false);
            setInputValue("");
            localStorage.setItem("selectedSociete", JSON.stringify(societe));
        }
    };

    // Filter sociétés based on search input
    const filteredSocietes = societes.filter(societe => {
        const searchableText = (societe.nom || societe.raison_sociale || "").toLowerCase();
        return searchableText.includes(inputValue.toLowerCase());
    });

    return (
        <div className="w-[250px] font-medium relative" ref={dropdownRef}>
            {/* Dropdown Header */}
            <div 
                className={`flex gap-2 items-center justify-between border p-2 rounded-lg cursor-pointer bg-white ${isSubmitting ? 'opacity-70' : ''}`}
                onClick={() => !isSubmitting && setIsSelectorOpened(!isSelectorOpened)}
            >
                <span className={`px-2 ${selectedSociete ? "text-gray-800" : "text-gray-500"}`}>
                    {isSubmitting 
                        ? "Chargement..." 
                        : selectedSociete?.id 
                            ? selectedSociete.nom || selectedSociete.raison_sociale 
                            : "Sélectionner une société"}
                </span>
                <BiChevronDown 
                    size={20} 
                    className={classNames({ 'rotate-180': isSelectorOpened })} 
                />
            </div>

            {/* Dropdown List */}
            <ul className={classNames(
                "bg-white overflow-y-auto scrollbar-none transition-all duration-200 absolute w-full rounded-lg shadow-md z-50",
                { "max-h-[300px] pr-2": isSelectorOpened, "max-h-0": !isSelectorOpened }
            )}>
                {/* Search Input */}
                {isSelectorOpened && (
                    <div className="sticky top-0  bg-white py-4 px-2">
                        <div className="flex items-center gap-2 p-2 bg-white border rounded-lg shadow-sm">
                            <AiOutlineSearch size={18} />
                            <input 
                                type="text" 
                                value={inputValue} 
                                onChange={(e) => setInputValue(e.target.value)} 
                                placeholder="Rechercher une société"
                                className="w-full outline-none border-none"
                                autoFocus
                            />
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isSelectorOpened && loading && (
                    <li className="p-4 text-center text-gray-500">
                        Chargement des sociétés...
                    </li>
                )}

                {/* Empty State */}
                {isSelectorOpened && !loading && filteredSocietes.length === 0 && (
                    <li className="p-4 text-center text-gray-500">
                        Aucune société trouvée
                    </li>
                )}

                {/* Filtered List */}
                {isSelectorOpened && filteredSocietes.map((societe) => (
                    <li 
                        key={societe.id} 
                        className={`p-2 mt-1 hover:bg-gray-100 hover:rounded-md cursor-pointer flex items-center ${
                            selectedSociete?.id === societe.id ? 'bg-blue-50 ml-2 text-blue-500 rounded-md' : ''
                        }`}
                        onClick={() => handleSelectSociete(societe)}
                    >
                        <span className="ml-2 truncate">
                            {societe.nom || societe.raison_sociale}
                        </span>
                    </li>
                ))}

                {/* Manage Societes Link */}
                {isSelectorOpened && user?.role === 1 && (
                    <li className="p-2 mt-2 border-t border-gray-100 ">
                        <Link 
                            href="/Societes"
                            className="flex items-center justify-center gap-2 w-full text-center text-blue-500 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-md transition-colors"
                            onClick={() => setIsSelectorOpened(false)}
                        >
                            <div className="flex items-center gap-2">
                                <span>Gérer les sociétés</span>
                                <FaRegEye className="w-4 h-4" />
                            </div>
                        </Link>
                    </li>
                )}
            </ul>
        </div>
    );
}