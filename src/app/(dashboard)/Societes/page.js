'use client';

import { useState, useEffect } from "react";
import Table from '@/components/Table';
import axios from "axios";
import Modal from '@/components/Modal';
import AfficherSociete from "./AfficherSociete";
import { FaRegEye, FaUserEdit } from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { APIURL, RESOURCE_URL } from '../../../configs/api';
import DeleteData from '@/components/DeleteData';
import Link from "next/link";

export default function Societes() {
  const [societes, setSocietes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Add searchTerm state
  const [selectedSocieteId, setSelectedSocieteId] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [showSociete, setShowSociete] = useState(false);

  const accesstoken = localStorage.getItem('accessToken');
  // Fetch sociétés function
  const fetchSocietes = async () => {
    try {
      const response = await axios.get(APIURL.SOCIETES, {
        headers: { Authorization: `Bearer ${accesstoken}` }
      });

      setSocietes(response.data.societes || []);
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
  }, []);

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
        raison_sociale: societe.raison_sociale || 'N/A',
        contact:
          societe.nom_contact && societe.prenom_contact
            ? `${societe.nom_contact} ${societe.prenom_contact}`
            : societe.nom_contact || societe.prenom_contact || 'N/A',
        email: societe.email || 'N/A',
        telephone: societe.tel || 'N/A',
        adresse: societe.adresse || 'N/A',
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
            <FaRegEye className="w-4 h-4 text-blue-500 hover:text-blue-700" 
            onClick={()=>
              {
                setSelectedSocieteId(row.id); // Set the selected société ID
                setShowSociete(true); // Open the modal
              }
            }/>
          <Link href={`/Societes/${row.id}/edit`}>
            <FaUserEdit className="w-4 h-4 text-green-500 hover:text-green-700"/>
          </Link>
          <RiDeleteBin6Line
            className="w-4 h-4 text-red-500 hover:text-red-700"
            onClick={() => {
              setSelectedSocieteId(row.id); // Set the selected société ID
              setShowDelete(true); // Open the modal
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Table */}
      <Table 
        columns={columns}
        data={formatSocietesForTable()}
        totalRows={societes.length}
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
          onClose={() => setShowDelete(false)}
          onDeleteSuccess={handleDeleteSuccess}
        />
      </Modal>
    )}
    </div>
  );
}
