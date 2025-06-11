'use client';
import { ChevronDown } from "lucide-react";
import { Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSociete } from "../context/SocieteContext";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import classNames from "classnames";
import { Eye } from 'lucide-react';

export default function SocieteDropDown() {
  const { selectedSociete, societes, selectSociete, loading } = useSociete();
  const { user } = useAuth();
  const [isSelectorOpened, setIsSelectorOpened] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef(null);

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

  const handleSelectSociete = async (societe) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    await selectSociete(societe);
    setIsSubmitting(false);
    setIsSelectorOpened(false);
    setInputValue("");
  };

  const filteredSocietes = societes.filter(societe => {
    const searchableText = (societe.nom || societe.raison_sociale || "").toLowerCase();
    return searchableText.includes(inputValue.toLowerCase());
  });

  return (
    <div className="w-[250px] font-medium relative" ref={dropdownRef}>
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
        <ChevronDown 
          size={20} 
          className={classNames({ 'rotate-180': isSelectorOpened })} 
        />
      </div>

      <ul className={classNames(
        "bg-white overflow-y-auto scrollbar-none transition-all duration-200 absolute w-full rounded-lg shadow-md z-50",
        { "max-h-[300px] pr-2": isSelectorOpened, "max-h-0": !isSelectorOpened }
      )}>
        {isSelectorOpened && (
          <div className="sticky top-0 bg-white py-4 px-2">
            <div className="flex items-center gap-2 p-2 bg-white border rounded-lg shadow-sm">
              <Search size={18} />
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

        {isSelectorOpened && loading && (
          <li className="p-4 text-center !text-gray-500">
            Chargement des sociétés...
          </li>
        )}

        {isSelectorOpened && !loading && filteredSocietes.length === 0 && (
          <li className="p-4 text-center !text-gray-500">
            Aucune société trouvée
          </li>
        )}

        {isSelectorOpened && filteredSocietes.map((societe) => (
          <li 
            key={societe.id} 
            className={`p-2 mt-1 ml-2 hover:bg-gray-100 hover:rounded-md cursor-pointer flex items-center ${
              selectedSociete?.id === societe.id ? 'bg-blue-50 ml-2 !text-blue-500 rounded-md' : ''
            }`}
            onClick={() => handleSelectSociete(societe)}
          >
            <span className="ml-2 truncate">
              {societe.nom || societe.raison_sociale}
            </span>
          </li>
        ))}

        {isSelectorOpened && user?.role === 1 && (
          <li className="p-2 mt-2 border-t border-gray-100">
            <Link 
              href="/Societes"
              className="flex items-center justify-center gap-2 w-full text-center !text-blue-500 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-md transition-colors"
              onClick={() => setIsSelectorOpened(false)}
            >
              <div className="flex items-center gap-2">
                <span>Gérer les sociétés</span>
                <Eye className="w-4 h-4" />
              </div>
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}