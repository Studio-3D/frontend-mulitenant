"use client";

import DeleteData from "@/components/DeleteData";
import Modal from "@/components/Modal";
import Table from "@/components/Table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Edit, Trash2, Eye } from "lucide-react";
import axios from "axios";
import Select from 'react-select';
import { APIURL, ENDPOINTS } from "@/configs/api";
import { fetchData_table_by_projet } from "@/configs/api-utils";
import { isAdmin, isSuperAdmin, MODE_PAIEMENT } from "@/configs/enum";
import { useAuth } from "@/context/AuthContext";
import SelectInput from "@/components/SelectInput";
import Input from "@/components/Input";
import format from 'date-fns/format'
import Link from 'next/link'
import { useProjet } from "@/context/ProjetContext";
import InputSelect from "@/components/inputSelect";



const EncaissementTable = ({dataClient_id, bien_id}) => {
  const [encaissements, setEncaissements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const accessToken = localStorage.getItem("accessToken");
  const [clients, setClients] = useState([]);
  const [biens, setBiens] = useState([]);
  const { selectedProjet } = useProjet();

  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem("accessToken");
  const router = useRouter();
  const [filters, setFilters] = useState({
  code_reservation: "",
  bienId: "",
  clientId: "",
  montant: "",
  type_encaissement: "",
  de: "",
  a: "",
});
const [tempFilters, setTempFilters] = useState({ ...filters });
const [clientss] = useState([
    { id: '1', nom: 'nabila',prenom:'nono' },
    { id: '2', nom: 'nawal',prenom:'fofo' },
    
  ])
const handleFilterChange = (field, value) => {
  setTempFilters((prev) => ({ ...prev, [field]: value }));
};

const applyFilters = () => {
  setFilters(tempFilters);
  // Ici, tu peux déclencher ton fetch ou filtrer localement
};

const resetFilters = () => {
  const reset = {
    code_reservation: "",
    bienId: "",
    clientId: "",
    montant: "",
    type_encaissement: "",
    de: "",
    a: "",
  };
  setFilters(reset);
  setTempFilters(reset);
};
  const entity = {
    API_URL: "encaissements",
    dataKey: "data",
    name: "Encaissement",
    searchFields: [''],
  };

  
const fetchBiens = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${APIURL.ROOT}/v1/projets/${selectedProjet?.id}/biens/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const { data } = response;
      setBiens(data.biens);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

 const fetchClients = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${APIURL.ROOT}/v1/projets/${selectedProjet?.id}/clients/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const { data } = response;
      setClients(data.clients);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }; 

    function handleShow(Id) {
      router.push(`/sav/encaissements/show/${Id}`);
    }

    const handleFilterToggle = (isOpen) => {
      if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
    };

  useEffect(() => { 
    fetchBiens()
    fetchClients()
    fetchData_table_by_projet(
        entity,
        filters,       
        searchTerm,
        currentPage,
        rowsPerPage,
        accesstoken,
        setLoading,
        setError,
        setEncaissements,
        setTotalRows
      );
    }, [searchTerm, currentPage, rowsPerPage, accesstoken,filters]);
    
   
const typeEncaissementMap = {
  '1': { label: 'Avances', color: 'bg-green-100 !text-green-800' },
  '2': { label: 'Restitution', color: 'bg-red-100 !text-red-800' },
  '3': { label: 'Remboursement', color: 'bg-yellow-100 !text-yellow-800' },
  '4': { label: 'Décharge Reliquat', color: 'bg-blue-100 !text-blue-800' },
  '5': { label: 'Déblocage Crédit', color: 'bg-purple-100 text-purple-800' },
  '6': { label: 'Pénalité', color: 'bg-pink-100 text-pink-800' },
};

const getTypeEncaissementBadge = (type) => {
  const info = typeEncaissementMap[type];
  if (!info) return null;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.color}`}>
      {info.label}
    </span>
  );
};

  
  const columns = [
  {
    key: "code_reservation",
    label: "Code Réservation",
    render: (row) => (
      <Link
        target="_blank"
        href={'/reservations/show/' + row.reservation_id}
      >
        <strong>{row.reservations.code_reservation}</strong>
      </Link>
    ),
  },
  {
    key: "bien",
    label: "Bien",
    render: (row) =>
      !bien_id && (
        <Link
          target="_blank"
          href={'/biens/show/' + row.reservations.bien_id}
        >
          <strong style={{ fontWeight: 600 }}>{row.reservations.bien.propriete_dite_bien}</strong>
        </Link>
      ),
  },
  {
    key: "client",
    label: "Client",
    render: (row) =>
      !dataClient_id && (
        <>
          {row.reservations.aquereurs.length > 0
            ? Object.keys(row.reservations.aquereurs).map((key) => (
                <Link
                  key={key}
                  target="_blank"
                  href={'/clients/show/' + row.reservations.aquereurs[key].client.id}
                >
                  <strong>
                    {row.reservations.aquereurs[key].client.nom} {row.reservations.aquereurs[key].client.prenom}
                  </strong>
                  <br />
                </Link>
              ))
            : row.reservations.aquereurs_ancien &&
              Object.keys(row.reservations.aquereurs_ancien).map((key) => (
                <Link
                  key={key}
                  target="_blank"
                  href={'/clients/show/' + row.reservations.aquereurs_ancien[key].client.id}
                >
                  <strong>
                    {row.reservations.aquereurs_ancien[key].client.nom} {row.reservations.aquereurs_ancien[key].client.prenom}
                  </strong>
                  <br />
                </Link>
              ))}
        </>
      ),
  },
  {
  key: "type_encaissement",
  label: "Type Encaissement",
  render: (row) => getTypeEncaissementBadge(row.type_encaissement),
},

  {
    key: "montant",
    label: "Montant",
    render: (row) => {
      const isPositive = ['1', '4', '5', '6'].includes(row.type_encaissement);
      const sign = row.type_encaissement === '1' ? '+' : row.type_encaissement === '2' ? '-' : row.type_encaissement === '3' ? '-' : row.type_encaissement === '4' ? '+' : row.type_encaissement === '5' ? '+' : row.type_encaissement === '6' ? '+' : '';
      return (
        <span style={{ color: isPositive ? 'green' : 'red' }}>
          {sign}
          {row.montant} DH
        </span>
      );
    },
  },
   {
    key: "date_encaissement",
    label: "Date Encaissement",
    render: (row) => format(new Date(row.date_encaissement), 'dd/MM/yyyy'),
  },
  {
    key: "num_remise",
    label: "N° Encaissement",
    render: (row) =>
      row.type_encaissement === '1'
        ? row.avance?.last_statut.num_remise
        : row.type_encaissement === '6'
        ? row.penalite?.last_statut.num_remise
        : null,
  },
 
  {
    key: "actions",
    label: "Actions",
    render: (row) => (
      <div className="flex gap-3 items-center">
        
        <Eye
          className="w-4 h-4 !text-blue-500 hover:text-blue-700 cursor-pointer"
          onClick={() => handleShow(row.type_encaissement, row.reservation_id, row.remboursement?.desistement_id, row.penalite?.desistement_id)}
        />
      </div>
    ),
  },
];

  
 const formatData = () => {
  return encaissements; // ou sortedData si vous avez trié/filtré vos données
};
const rows = formatData();

  

   const data_to_export = () => {
    return encaissements.map((item) => {
      // Extraire les noms des acquéreurs et les séparer par "/"
      const acquereursNames = item?.reservations.aquereurs
        ? item.reservations.aquereurs
            .map((acq) => acq.client?.nom+' '+acq.client?.prenom || "")
            .join(" / ") // Sépare les noms par "/"
        : "";

        const acquereursCin = item?.reservations.aquereurs
        ? item.reservations.aquereurs
            .map((acq) => acq.client?.cin|| "")
            .join(" / ") // Sépare les noms par "/"
        : "";

        const acquereursTele = item?.reservations.aquereurs
        ? item.reservations.aquereurs
            .map((acq) => acq.client?.telephone_num1|| "")
            .join(" / ") // Sépare les noms par "/"
        : "";
  
      return {
      cc: item?.avance.user.name+' '+item.avance.user.prenom || "",
      bien: item.reservations.bien.propriete_dite_bien || "",
      prix: item.reservations.prix || "",
      avance: item.montant.toLocaleString() + ' DH',
      mode_paiement: MODE_PAIEMENT[item.avance.statut]?.label ,
      banque: item.avance?.banque?.nom || "",
      num_pai: item.avance.numero_paiement || "",
      date_reg:item.date_reglement != null ? format(new Date(item.date_reglement), 'dd/MM/yyyy') : null,
      num_rem:item.type_encaissement == '1'
      ? item.avance?.last_statut.num_remise
      : item.type_encaissement == '6'
      ? item.penalite?.last_statut.num_remise
      : null,
      date_encaissement:item.date_encaissement != null ? format(new Date(item.date_encaissement), 'dd/MM/yyyy') : null,
      type_enc:item.type_encaissement == '1'
                          ? 'Avances'
                          : item.type_encaissement == '2'
                          ? 'Restitution'
                          : item.type_encaissement == '3'
                          ? 'Remboursement'
                          : item.type_encaissement == '4'
                          ? 'Décharge Reliquat'
                          : item.type_encaissement == '5'
                          ? 'Déblocage Crédit'
                          : item.type_encaissement == '6'
                          ? 'Pénalité'
                          : item.type_encaissement == '1'
                          ? 'Avances'
                          : item.type_encaissementt == '2'
                          ? 'Restitution'
                          : item.type_encaissement == '3'
                          ? 'Remboursement'
                          : item.type_encaissement == '4'
                          ? 'Décharge Reliquat'
                          : item.type_encaissement == '5'
                          ? 'Déblocage Crédit'
                          : item.type_encaissement == '6'
                          ? 'Pénalité'
                          : null,
      code_res: item.reservations.code_reservation || "",
      date_res: item.reservations.date_reservation?format(new Date(item.reservations.date_reservation), 'dd/MM/yyyy'):'' ,
      aq_names: acquereursNames || "",
      aq_cin: acquereursCin || "",
      aq_tele: acquereursTele || "",



    };
  });
};

  const columns_export = [
    { key: 'code_res', label: 'Code reservation' },
    { key: 'date_res', label: 'Date reservation' },
    { key: 'num_rem', label: 'N° Remise' },
    { key: 'date_encaissement', label: 'Date Encaiss' },
    { key: 'bien', label: 'Bien' },
    { key: 'prix', label: 'Prix de vente' },
    { key: 'avance', label: 'Avance' },
    { key: 'type_enc', label: 'Type Encaiss' },
    { key: 'cc', label: 'CC' },
    { key: 'banque', label: 'Banque' },
    { key: 'mode_paiement', label: 'Mode paiement' },
    { key: 'num_pai', label: 'Num paiement' },
    { key: 'date_reg', label: 'Date Reglement' },
    { key: 'aq_names', label: 'Nom client' },
    { key: 'aq_cin', label: 'Cin client' },
    { key: 'aq_tele', label: 'Tele client' },
  ]

 
  


 
  
  return (
    <>
      <Table
        data_to_export={data_to_export()}
        columns_export={columns_export}
        name_file_export={"encaissement_export"}
        columns={columns}
        onFilterToggle={handleFilterToggle}
        data={formatData()}
        filterComponent={
          <div className="space-y-4 p-4 rounded-lg shadow-md">
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <Input
          type="text"
          placeholder="Code Réservation"
          value={tempFilters.code_reservation}
          onChange={e => handleFilterChange('code_reservation', e.target.value)}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
        />

        
      <InputSelect
        label="Client"
        name="cienId"
        onChange={(selected) => handleFilterChange("clientId", selected?.value || null)}
        options={clients.map(s => ({
          value: s.id,
          label: s.nom + ' ' + s.prenom
        }))}
        placeholder="Choisir un client..."
        isLoading={loading}
      />
      <InputSelect
        label="Bien"
        name="bienId"
        onChange={(selected) => handleFilterChange("bienId", selected?.value || null)}
        options={biens.map(s => ({
          value: s.id,
          label: s.propriete_dite_bien
        }))}
        placeholder="Choisir un bien..."
        isLoading={loading}
      />


        <Input
          type="text"
          placeholder="Montant"
          value={tempFilters.montant}
          onChange={e => handleFilterChange('montant', e.target.value)}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
        />

        {/* Select natif stylisé */}
        <select
          value={tempFilters.type_encaissement}
          onChange={e => handleFilterChange('type_encaissement', e.target.value)}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm bg-white"
        >
          <option value="">Type Encaissement</option>
          <option value="1">Avances</option>
          <option value="2">Restitution</option>
          <option value="3">Remboursements</option>
          <option value="4">Décharge Reliquat</option>
          <option value="5">Déblocage Crédit</option>
          <option value="6">Pénalités</option>
        </select>

        <input
          type="date"
          placeholder="De"
          onFocus={(e) => (e.target.type = "de")}
          onBlur={(e) => e.target.type = e.target.value ? "de" : "text"}
          value={tempFilters.de}
          onChange={(e) => handleFilterChange("de", e.target.value)}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
        /> 

        <input
          type="date"
          placeholder="A"
          onFocus={(e) => (e.target.type = "a")}
          onBlur={(e) => e.target.type = e.target.value ? "a" : "text"}
          value={tempFilters.a}
          onChange={(e) => handleFilterChange("a", e.target.value)}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
        /> 
      </div>

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
        totalRows={totalRows}
        loading={loading}
        error={error}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        enableExport={true}
        
      />

      
    </>
  );
};

export default EncaissementTable;
