"use client";

import Input from '@/components/Input'
import InputSelect from '@/components/inputSelect'
import { fetchDataByProjet, fetchDataByProjet_params } from '@/configs/api-utils';
import React, { useState,useEffect } from 'react'
import SelectInput from '../SelectInput';
import { BIEN_ETATS ,ORIENTATIONS} from '../bien-utils';
import { Grid } from '@mui/material';
import { useProjet } from '@/context/ProjetContext';


const BienFilter = ({ tempFilters, handleFilterChange, resetFilters, applyFilters, loading_T,trancheId,blocId,immeubleId }) => {
  const { selectedProjet } = useProjet();
  const [typeBiens, setTypeBiens] = useState([]);
  const [vues, setVues] = useState([]);
  const [typologies, setTyplogies] = useState([]);
  const [immeubles, setImmeubles] = useState([]);
  const [blocs, setBlocs] = useState([]);
  const [tranches, setTranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedProjet.nbre_tranches !== 0 && !trancheId && !blocId && !immeubleId && tranches.length === 0) {
      fetchDataByProjet_params('tranches', setTranches, setLoading);
    }
    if (selectedProjet.nbre_blocs !== 0 && !blocId && !immeubleId) {
      if (trancheId && blocs.length === 0) {
        fetchDataByProjet_params('blocs', setBlocs,setLoading, { tranche_id: trancheId });
      } else if (blocs.length === 0) {
        fetchDataByProjet_params('blocs', setBlocs,setLoading);
      }
    }
    if (selectedProjet.nbre_immeubles !== 0 && !immeubleId) {
      if (blocId && immeubles.length === 0) {
        fetchDataByProjet_params('immeubles', setImmeubles,setLoading, { bloc_id: blocId });
      } else if (trancheId && immeubles.length === 0) {
        fetchDataByProjet_params('immeubles', setImmeubles,setLoading, { tranche_id: trancheId });
      } else if (immeubles.length === 0) {
        fetchDataByProjet_params('immeubles', setImmeubles,setLoading);
      }
    }
  
    if (typeBiens.length === 0) {
      fetchDataByProjet_params('typeBiens', setTypeBiens,setLoading);
    }
    if (vues.length === 0) {
      fetchDataByProjet_params('vues', setVues,setLoading);
    }
    if (typologies.length === 0) {
      fetchDataByProjet_params('typologies', setTyplogies,setLoading);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    trancheId, 
    blocId, 
    immeubleId, 
    
  ]);

  return (
    <div className="space-y-4 p-4 rounded-lg">
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <Input
          label="Propriété dite bien"
          name="propriete_dite_bien"
          value={tempFilters.propriete_dite_bien}
          onChange={(e) => handleFilterChange("propriete_dite_bien", e.target.value)}
        />
        <Input
          label="Numéro"
          name="num"
          value={tempFilters.num}
          onChange={(e) => handleFilterChange("num", e.target.value)}
        />

        {selectedProjet.nbre_tranches !== 0 && !trancheId && !blocId && !immeubleId && (
          <InputSelect
            label="Tranche"
            options={tranches.map(t => ({ label: t.nom, value: t.nom }))}
            value={tempFilters.tranche}
            onChange={(value) => handleFilterChange("tranche" ,value?.value || null)}
          />
        )}

        {selectedProjet.nbre_blocs !== 0 && !blocId && !immeubleId && (
          <InputSelect
            label="Bloc"
            options={blocs.map(b => ({ label: b.nom, value: b.nom }))}
            value={tempFilters.bloc}
            onChange={(value) => handleFilterChange("bloc" ,value?.value || null)}
          />
        )}

        {selectedProjet.nbre_immeubles !== 0 && !immeubleId && (
          <InputSelect
            label="Immeuble"
            options={immeubles.map(i => ({ label: i.nom, value: i.nom }))}
            value={tempFilters.immeuble}
            onChange={(value) => handleFilterChange("immeuble" ,value?.value || null)}
          />
        )}

        <InputSelect
          label="Type"
          options={typeBiens.map(t => ({ label: t.type, value: t.id }))}
          value={tempFilters.type_id}
          onChange={(value) => handleFilterChange("type_id", value?.value || null)}
        />

        <InputSelect
          label="Vue"
          options={vues.map(v => ({ label: v.vue, value: v.vue }))}
          value={tempFilters.vue}
          onChange={(value) => handleFilterChange("vue" ,value?.value || null)}
        />

        <InputSelect
          label="Typologie"
          options={typologies.map(t => ({ label: t.typologie, value: t.typologie }))}
          value={tempFilters.typologie}
          onChange={(value) => handleFilterChange("typologie" ,value?.value || null)}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700">État</label>
          
        <SelectInput
          name="etat"
          value={tempFilters.etat}
          options={Object.entries(BIEN_ETATS).map(([key, val]) => ({
            label: val.label,
            value: key,
          }))}
          onChange={(value) => handleFilterChange("etat", value)}
        />
        </div>

        
        <SelectInput
          label='Orientation'
          name="orientation"
          value={tempFilters.orientation}
          options={Object.entries(ORIENTATIONS).map(([key, val]) => ({
            label: val.label,
            value: val.code,
          }))}
          onChange={(value) => handleFilterChange("orientation", value)}
        />

        {/* <InputSelect
          label="Niveau"
          options={etages.map(e => ({ label: e.value ,value?.value || null: e.value }))}
          value={tempFilters.niveau}
          onChange={(value) => handleFilterChange("niveau" ,value?.value || null)}
        /> */}

      <div className="flex space-x-2">
  {/* Prix Min */}
  <div className="w-1/2">
    <label htmlFor="prix_min" className="block text-sm font-medium text-gray-700 mb-1">
      Prix Min
    </label>
    <Input
      id="prix_min"
      name="prix_min"
      type="number"
      value={tempFilters.prix_min || ''}
      onChange={(e) => handleFilterChange("prix_min", e.target.value)}
      className="w-full text-sm" // prend tout l’espace disponible
    />
  </div>

  {/* Prix Max */}
  <div className="w-1/2">
    <label htmlFor="prix_max" className="block text-sm font-medium text-gray-700 mb-1">
      Prix Max
    </label>
    <Input
      id="prix_max"
      name="prix_max"
      type="number"
      value={tempFilters.prix_max || ''}
      onChange={(e) => handleFilterChange("prix_max", e.target.value)}
      className="w-full text-sm" // prend tout l’espace disponible
    />
  </div>
</div>

{/* Superficie Min/Max */}
<div className="flex space-x-2 ">
  {/* Superficie Min */}
  <div className="w-1/2">
    <label htmlFor="superficie_min" className="block text-sm font-medium text-gray-700 mb-1">
      Superficie Min
    </label>
    <Input
      id="superficie_min"
      name="superficie_min"
      type="number"
      value={tempFilters.superficie_min || ''}
      onChange={(e) => handleFilterChange("superficie_min", e.target.value)}
      className="w-full text-sm" // prend tout l’espace disponible
    />
  </div>

  {/* Superficie Max */}
  <div className="w-1/2">
    <label htmlFor="superficie_max" className="block text-sm font-medium text-gray-700 mb-1">
      Superficie Max
    </label>
    <Input
      id="superficie_max"
      name="superficie_max"
      type="number"
      value={tempFilters.superficie_max || ''}
      onChange={(e) => handleFilterChange("superficie_max", e.target.value)}
      className="w-full text-sm" // prend tout l’espace disponible
    />
  </div>
</div>

      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={resetFilters}
          className="px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
        >
          Réinitialiser
        </button>
        <button
          type="button"
          onClick={applyFilters}
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Appliquer les filtres
        </button>
      </div>
    </div>
  )
}

export default BienFilter
