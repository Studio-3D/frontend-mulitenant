'use client';

import { useState, useEffect } from "react";
import Table from '@/components/Table';
import axios from "axios";
import Modal from '@/components/Modal';
import AfficherSociete from "./AfficherSociete";
import { Eye, UserCog, Trash2 } from 'lucide-react';
import { APIURL, RESOURCE_URL } from '../../../configs/api';
import DeleteData from '@/components/DeleteData';
import Link from "next/link";
import Input from "@/components/Input";

export default function Societes() {
  const [societes, setSocietes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Add searchTerm state
  const [selectedSocieteId, setSelectedSocieteId] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [showSociete, setShowSociete] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    nom_contact: "",
    email: "",
    tel: "",
    prenom_contact: "",
    adresse: "",
    raison_sociale:""
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const accesstoken = localStorage.getItem('accessToken');
  // Fetch sociétés function
  const fetchSocietes = async () => {
    try {
      const params = {
        
        ...filters,
      };

      const response = await axios.get(APIURL.SOCIETES, {

        headers: { Authorization: `Bearer ${accesstoken}`,},
        params,
      });

      setSocietes(response.data.societes || []);
      setTotalRows(response.data.pagination?.totalItems || 0);

      setLoading(false);
    } catch (err) {
      console.error("API Error:", err);
      setError(`Erreur lors du chargement des sociétés: ${err.message}`);
      setLoading(false);
    }
  };

  // Fetch sociétés on component mount
  useEffect(() => {
    fetchSocietes();
  }, [filters,currentPage, rowsPerPage, searchTerm]);

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters); // C’est ici que fetchUsers va être déclenché
  };

  const resetFilters = () => {
    const reset = {
      nom_contact: "",
      email: "",
      tel: "",
      prenom_contact: "",
      adresse: "",
      raison_sociale:""    };
    setFilters(reset);
    setTempFilters(reset);
  };
   // Handle successful deletion of a société
   const handleDeleteSuccess = (deletedId) => {
    setSocietes((prevSocietes) => prevSocietes.filter(societe => societe.id !== deletedId));
};


  const formatSocietesForTable = () => {
    // Apply filtering by raison_sociale and email
    const filteredSocietes = societes.filter((societe) =>
      societe.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      societe.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filteredSocietes.map((societe) => {
      const logoUrl = societe.logo
        ? `${RESOURCE_URL.DOCS}/${societe.raison_sociale_concatene}_${societe.id}/logos/${societe.logo}`
        : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
  
      return {
        id: societe.id,
        logo: logoUrl,
        raison_sociale: societe.raison_sociale ,
        contact:
          societe.nom_contact && societe.prenom_contact
            ? `${societe.nom_contact} ${societe.prenom_contact}`
            : societe.nom_contact || societe.prenom_contact ,
        email: societe.email ,
        telephone: societe.tel ,
        adresse: societe.adresse ,
        created_at: new Date(societe.created_at).toLocaleDateString('fr-FR'),
      };
    });
  };

  const columns = [
    {
      key: 'raison_sociale',
      label: 'Raison Sociale',
      render: row => (
        <div className="flex items-center gap-3">
          <img
            src={row.logo}
            alt={row.raison_sociale}
            className="w-7 h-7 rounded-full border border-gray-300"
          />
          <span>{row.raison_sociale}</span>
        </div>
      ),
    },
    { key: "contact", label: "Contact" },
    { key: "email", label: "Email" },
    { key: "telephone", label: "Téléphone" },
    { key: "adresse", label: "Adresse" },
    { key: "created_at", label: "Date de création" },
    {
      key: 'actions',
      label: 'Actions',
      render: row => (
        <div className="flex gap-3 items-center cursor-pointer">
            <Eye className="w-4 h-4 !text-blue-500 hover:text-blue-700" 
            onClick={()=>
              {
                setSelectedSocieteId(row.id); // Set the selected société ID
                setShowSociete(true); // Open the modal
              }
            }/>
          <Link href={`/Societes/${row.id}/edit`}>
            <UserCog className="w-4 h-4 !text-green-500 hover:text-green-700"/>
          </Link>
          <Trash2
            className="w-4 h-4 !text-red-500 hover:text-red-700"
            onClick={() => {
              setSelectedSocieteId(row.id); // Set the selected société ID
              setShowDelete(true); // Open the modal
            }}
          />
        </div>
      ),
    },
  ];

   const data_to_export = () => {
    return societes.map((ste) => ({
      raison_sociale: ste.raison_sociale,
      nom_contact:ste.nom_contact,
      prenom_contact:ste.prenom_contact,
      telephone: ste.tel || "",
      date: new Date(ste.created_at).toLocaleDateString(),
      adresse:ste.adresse,
      registre_commerce:ste.registre_commerce,
      id_fiscal:ste.id_fiscal,
      capital:ste.capital,
      
    }));
  };

  const columns_export = Object.keys(data_to_export()[0] || {}).map((key) => ({
  key,
  label: key
}));

  return (
    <div className="relative bg-white shadow-md rounded-lg px-4 py-4">
      {/* Table */}
      <Table 
        data_to_export={data_to_export()}
        columns_export={columns_export}
        name_file_export={"societe_export"}
        columns={columns}
        filterComponent={
          <div className="space-y-4">
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
            >
              <Input
                type="text"
                placeholder="Raison sociale..."
                value={tempFilters.raison_sociale}
                onChange={(e) => handleFilterChange("raison_sociale", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
        
              <Input
                type="text"
                placeholder="Nom contact..."
                value={tempFilters.nom_contact}
                onChange={(e) => handleFilterChange("nom_contact", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
        
              <Input
                type="text"
                placeholder="Prénom contact..."
                value={tempFilters.prenom_contact}
                onChange={(e) => handleFilterChange("prenom_contact", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
        
              <Input
                type="text"
                placeholder="Email..."
                value={tempFilters.email}
                onChange={(e) => handleFilterChange("email", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
        
              <Input
                type="text"
                placeholder="Téléphone..."
                value={tempFilters.tel}
                onChange={(e) => handleFilterChange("tel", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
        
              <Input
                type="text"
                placeholder="Adresse..."
                value={tempFilters.adresse}
                onChange={(e) => handleFilterChange("adresse", e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
              />
            </div>
        
            {/* Boutons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={applyFilters}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Appliquer les filtres
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        }
        
        data={formatSocietesForTable()}
        totalRows={totalRows}
        currentPage={currentPage}  
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
        // add + export buttons
        addLink={"/Societes/ajouter-societe"}
        enableExport={true}
        searchFields={["raison_sociale", "email"]} // Specify filterable fields
        onSearch={setSearchTerm} // Pass searchTerm handler
        loading={loading}
        error={error}
        />
        {/* Show société modal */}
        {showSociete && selectedSocieteId && (
          <Modal isVisible={showSociete} onClose={() => setShowSociete(false)}>
            <AfficherSociete
              societeId={selectedSocieteId}
              accessToken={localStorage.getItem('accessToken')} 
              onClose={() => setShowSociete(false)}
            />
          </Modal>
        )}
        
      {/* Delete modal   */}
      {showDelete && selectedSocieteId && (
      <Modal isVisible={showDelete} onClose={() => setShowDelete(false)}>
        <DeleteData
          route={APIURL.SOCIETES}
          Id={selectedSocieteId}
          message={`Êtes-vous sûr de vouloir supprimer cette société ?`}
          societeId={selectedSocieteId}
          accessToken={localStorage.getItem('accessToken')}
          onClose={() => {
            setShowDelete(false);
            fetchSocietes(); // Refresh the list after deletion
          }}
          onDeleteSuccess={handleDeleteSuccess}
        />
      </Modal>
    )}
    </div>
  );
}
