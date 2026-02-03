"use client";

import React, { useEffect, useState } from "react";
import Table from "@/components/Table";
import {
  Edit,
  ThumbsDown,
  ThumbsUp,
  Clock,
  Eye,
  X,
  Trash2,
  PencilLine,
  Send,
  Pencil,
  UserPlus,
} from "lucide-react";
import Modal from "@/components/Modal";
import DeleteData from "@/components/DeleteData";
import { useAuth } from "../../../../context/AuthContext";
import { APIURL, ENDPOINTS } from "../../../../configs/api";
import { useRouter } from "next/navigation";
import { formatDate, formatDateTime } from "../../../../utils/dateUtils";
import { isAdmin, isCommercial,  isRespoLivraison, isSuperAdmin } from "../../../../configs/enum";
import {  fetchData_table_by_projet } from "../../../../configs/api-utils";
import Link from "next/link";
import Input from "@/components/Input";
import axios from 'axios';


import { MODE_FINANCE } from "../../../../configs/enum";
import Modal_Valider_Reservation from "./Modal_Valider_Reservation";

import Modal_Rejeter_Reservation from "./Modal_Rejeter_Reservation";

import Modal_Affecte from "./Modal_Affecte";

import Modal_show_info from "./Modal_show_info";
import DateRangePicker from "@/components/DateRangePicker";

import { useProjet } from '@/context/ProjetContext';
const ReservationTable = ({ dataClient, user_id,searchParams }) => {
  const { user, token } = useAuth();
  const userRole = user?.role;
  const accesstoken = token || localStorage.getItem("accessToken");
  const { selectedProjet  } = useProjet();
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [ID, setID] = useState(0);
  // validation /rejet
  const [first_num_recu, set_first_num_recu] = useState(null);
  const [first_av_statut, set_first_av_statut] = useState(null);
  const [av_id, setav_id] = useState(0);
  const [open_v_reservation, setOpen_v_reservation] = useState(false);
  const [open_r, setOpen_r] = useState(false);
    const [notaires, setNotaires] = useState([]);
    const [old_notaire_id, setNoraire_id] = useState(null);
    const [open_affecte, setOpen_affecte] = useState(false);
  const [code_reservation, setCode_reservation] = useState(null);
  const [dst_id, set_dst_id] = useState(null);
  const [statut_dst, setStatut_des] = useState(0);
  const [cc, setCC] = useState(null);
  const [aquereurs, setAquereurs] = useState([]);
  const [date_res, setDate_res] = useState(null);
  const [prix, setPrix] = useState(null);
  const [avance, setAvance] = useState(null);

  const [open_info, setOpen_info] = useState(false);
  const [txt_info, set_txt_info] = useState(null);

  const [filters, setFilters] = useState({
    code_reservation: "",
    date_start: "",
    date_end: "",
    bien: "",
    client: "",
    cc: "",
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };
  const resetFilters = () => {
    const reset = Object.fromEntries(
      Object.keys(filters).map((key) => [key, ""])
    );
    setFilters(reset);
    setTempFilters(reset);
  };
  const applyFilters = () => {
    setFilters(tempFilters);
  };
  const entity = {
    API_URL: "reservations",
    dataKey: "data",
    searchFields: [],
  };

  useEffect(() => {
       // Only fetch data if we're NOT in form mode (no action parameter)
    const action = searchParams?.get('action');
    if (action == 'add' || action == 'edit') {
      console.log('Skipping API call - in form mode');
      return;
    }

    const params_url = dataClient ? { client_id: dataClient?.id } : {};
    const combinedFilters = {
      ...(user_id ? { user_id } : {}),
      ...filters,
      ...params_url,
    };
    fetchData_table_by_projet(
      entity,
      combinedFilters,
      searchTerm,
      currentPage,
      rowsPerPage,
      accesstoken,
      setLoading,
      setError,
      setData,
      setTotalRows
    );
  }, [searchParams,accesstoken, currentPage, rowsPerPage, searchTerm, filters,selectedProjet]);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

    const fetchNotaires = async () => {
      await axios
        .get(`${APIURL.ROOTV1}/notaires`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })
        .then((res) => {
          setNotaires(res.data.notaires);
        })
        .catch(() => {});
    };
  
  useEffect(() => {
    if(isSuperAdmin(userRole) ||
            isAdmin(userRole) ||
            isRespoLivraison(userRole)){
    fetchNotaires();
            }
  }, []);

  function NomBienComplet(bien) {
    const noms = [];

    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);

    noms.push(bien.propriete_dite_bien);

    return noms.join(" - ");
  }
  useEffect(() => {
    //Implementing the setInterval method
    const interval = setInterval(() => {
      if (localStorage.getItem("load_data_reservation") == 1) {
        fetchData_table_by_projet(
          entity,
          {},
          searchTerm,
          currentPage,
          rowsPerPage,
          accesstoken,
          setLoading,
          setError,
          setData,
          setTotalRows
        );
        localStorage.removeItem("load_data_reservation");
      }
    }, 1000);

    //Clearing the interval
    return () => clearInterval(interval);
  }, [accesstoken, currentPage, rowsPerPage, searchTerm,selectedProjet]);

  function handleEdit(resId) {
    router.push(`${ENDPOINTS.RESERVATIONS}?id=${resId}&action=edit`);
  }



  const handleDesiste = (res_id, desistement_id, statut_dstt, msg_rejete) => {
    if (desistement_id == null) {
      //aucun desistement
      router.push(`/ventes/desistements/ajouter_desistement/${res_id}`);
    } else {
      set_dst_id(desistement_id);
      if (statut_dstt == 0) {
        //attend validation
        setStatut_des(0);
        set_txt_info("Le Désistement est en Attente de validation");
      } else {
        setStatut_des(2);
        set_txt_info("Le Désistement est rejeté en raison  de " + msg_rejete);
      }
      setOpen_info(true);
    }
  };

  const formatData = () => {
    return data.map((pro) => {
      return {
        id: pro.id,
        code_reservation: pro.code_reservation,
        cc: pro.user.name + " " + pro.user.prenom,
        user_id: pro.user.id,
        date_reservation: pro.date_reservation,
        aquereurs: pro.aquereurs,
        bien_id: pro.bien_id,
        bien: pro.bien,
        propriete_dite_bien: pro.bien?.propriete_dite_bien,
        prix: pro.prix,
        avances_sum_montant: pro.avances_sum_montant,
        statut: pro.statut,
        notaire_id:pro?.notaire_id,
        data_res: pro,
      };
    });
  };

  /*
      key: 'nomComplet',
      label: 'Nom Complet',
      render: (row) => {
        return row.data_res?.aquereurs
          ? Object.keys(row.data_res.aquereurs).map((key) => (
              <div key={key}>
                {' '}
                {/* Added a keyed wrapper (React requires keys in lists) 
                <Link
                  target="_blank"
                  href={`/ventes/clients/${row.data_res.aquereurs[key].client.id}`}
                >
                  <strong>
                    {row.data_res.aquereurs[key].client.nom}{' '}
                    {row.data_res.aquereurs[key].client.prenom}
                  </strong>
                </Link>
              </div>
            ))
          : null; // Return `null` instead of empty string for cleaner React rendering
      },
    */
  // Dynamically build columns based on type
  const columns = [
    {
      key: "cc",
      label: "Responsable",
      render: (row) => {
        return isSuperAdmin(userRole) || isAdmin(userRole) ? (
          <>
            {row.data_res.user && (
              <>
                <Link
                  target="_blank"
                  href={"/Utilisateurs/afficher-utilisateur/" + row.user_id}
                >
                  <strong style={{ fontWeight: 600 }}>{row.cc}</strong>
                </Link>
              </>
            )}
          </>
        ) : (
          row.cc
        );
      },
    },

    {
      key: "date_reservation",
      label: "Date",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>
            {row.date_reservation ? formatDate(row.date_reservation) : ""}
          </span>
        </div>
      ),
    },
    { key: "code_reservation", label: "Code" },
    {
      key: "propriete_dite_bien",
      label: "Bien",
      render: (row) => (
        <Link target="_blank" href={`/Biens/${row.bien_id}`}>
          <strong style={{ fontWeight: 600 }}>
            {NomBienComplet(row.bien)}
          </strong>
        </Link>
      ),
    },
    {
      key: "prix",
      label: "Prix",
      render: (row) => (
        <b style={{ color: "blue" }}>
          {row.prix ? `${row.prix.toLocaleString()} DH` : ""}
        </b>
      ),
    },
    {
      key: "avance",
      label: "Avance",
      render: (row) => (
        <b style={{ color: "green" }}>
          {row.avances_sum_montant
            ? `${row.avances_sum_montant.toLocaleString()} DH`
            : ""}
        </b>
      ),
    },
    {
      key: "reste",
      label: "Reste",
      render: (row) => (
        <b style={{ color: "red" }}>
          {row.prix - row.avances_sum_montant
            ? (row.prix - row.avances_sum_montant).toLocaleString() + " DH"
            : ""}{" "}
        </b>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-3 items-center">
          
           <Link
                      href={`/ventes/reservations/${row.id}`}
                      className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
          

            {(isSuperAdmin(userRole) ||
            isAdmin(userRole) ||
            isCommercial(userRole)) && (
              <>
              {(isSuperAdmin(userRole) || isAdmin(userRole)) && row.data_res.contrat_vente == null && (
                <PencilLine
                  className="w-4 h-4 text-yellow-500 hover:text-yellow-700 cursor-pointer"
                  title="Modifier"
                  onClick={() => handleEdit(row.id)}
                />
              )}
                {row.statut == 3 ? (
                <>
                  {isSuperAdmin(userRole) || isAdmin(userRole) ? (
                    <>
                      {/* Approve Button */}
                      <ThumbsUp
                        className="w-4 h-4 !text-green-500 hover:text-green-700 cursor-pointer"
                        title="Valider"
                        onClick={() =>
                          handle_valider(
                            row.id,
                            row.code_reservation,
                            row.data_res.first_avance?.num_recu,
                            row.data_res.first_avance?.id,
                            row.data_res.first_avance?.statut,
                            row.data_res.user.name + " " + row.data_res.user.prenom,
                            row.data_res.aquereurs,
                            row.data_res.date_reservation,
                            row.data_res.prix,
                            row.first_avance?.montant
                          )
                        }
                      />

                      {/* Reject Button */}
                      <ThumbsDown
                        className="w-4 h-4 !text-red-500 hover:text-red-700 cursor-pointer"
                        title="Refuser"
                        onClick={() => handle_rejeter(row.id, row.code_reservation)}
                      />
                      <Trash2
                        className="w-4 h-4 !text-red-500 hover:text-red-700 cursor-pointer"
                        onClick={() => {
                          setSelectedId(row.id);
                          setShowDeleteModal(true);
                        }}
                        title="Supprimer"
                      />
                    </>
                  ) : (
                    <Clock
                      className="w-4 h-4 !text-gray-500 hover:text-gray-700 cursor-pointer"
                      title="En Attente de Validation"
                      onClick={() => handle_show_info_2(row.code_reservation)}
                    />
                  )}
                </>
                ) : row.statut == 2 ? (
                  <Eye
                    className="w-4 h-4 !text-red-500 hover:text-red-700 cursor-pointer"
                    title="Détail du Rejet"
                    onClick={() =>
                      handle_show_comment_rejete(
                        row.code_reservation,
                        row.data_res.last_statut?.commentaire
                      )
                    }
                  />
                ) : row.statut == 1 && row.data_res.first_avance?.statut == 3 ? (
                  <Clock
                    className="w-4 h-4 !text-yellow-500 hover:text-yellow-700 cursor-pointer"
                    title="Première avance en attente de validation"
                    onClick={() => handle_show_info(row.code_reservation)}
                  />
                ) : null}

                {row.statut == 1 && row.avances_sum_montant>0 && (
                      <X
                        className={`w-4 h-4 cursor-pointer ${
                          row.data_res.desistement_att_validation_rejete?.statut == 0
                            ? "text-orange-500 hover:text-orange-700"
                            : row.data_res.desistement_att_validation_rejete?.statut ==
                              2
                            ? "text-red-500 hover:text-red-700"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        title={
                          row.data_res.desistement_att_validation_rejete?.statut == 0
                            ? "désistement en attente"
                            : row.data_res.desistement_att_validation_rejete?.statut ==
                              2
                            ? "Désistement rejeté"
                            : "Désister la réservation"
                        }
                        onClick={() =>
                          row.data_res.desistement_att_validation_rejete != null
                            ? handleDesiste(
                                row.id,
                                row.data_res.desistement_att_validation_rejete?.id,
                                row.data_res.desistement_att_validation_rejete?.statut,
                                row.data_res.desistement_att_validation_rejete
                                  ?.commentaire_rejete
                              )
                            : handleDesiste(row.id, null, null, null)
                        }
                      />
                )}
              </>
            )}
        
           {(isSuperAdmin(userRole) ||
            isAdmin(userRole) ||
            isRespoLivraison(userRole)) &&
            row.statut == 1 && 
            row.avances_sum_montant > 0 && 
            notaires?.length > 0 && (
              <>
                {row.notaire_id ? (
                  // If notaire already assigned, show Pencil icon for modification
                  <Pencil
                    className="w-4 h-4 !text-orange-500 hover:text-orange-700 cursor-pointer"
                    title="Modifier le notaire"
                    onClick={() => handle_affecte(row.id, row.code_reservation, row.notaire_id)}
                  />
                ) : (
                  // If no notaire assigned, show UserPlus icon for affectation
                  <UserPlus 
                    className="w-4 h-4 !text-green-500 hover:text-green-700 cursor-pointer"
                    title="Affecter un notaire"
                    onClick={() => handle_affecte(row.id, row.code_reservation, null)}
                  />
                )}
              </>
          )}
        </div>
      ),
    },
  ];

  const data_to_export = () => {
    return data.map((item) => {
      const acquereursNames = item?.aquereurs
        ? item.aquereurs
            .map(
              (acq) => (acq.client?.nom + " " + acq.client?.prenom).trim() || ""
            )
            .filter((name) => name)
            .join(" / ")
        : "";

      const acquereursCin = item?.aquereurs
        ? item.aquereurs
            .map((acq) => acq.client?.cin || "")
            .filter((cin) => cin)
            .join(" / ")
        : "";

      const acquereursTele = item?.aquereurs
        ? item.aquereurs
            .map((acq) => acq.client?.telephone_num1 || "")
            .filter((tele) => tele)
            .join(" / ")
        : "";

      return {
        code_reservation: item.code_reservation || "",
        date_reservation: item.date_reservation
          ? formatDate(item.date_reservation)
          : "",
        bien: item.bien?.propriete_dite_bien || "",
        prix: item.prix ? `${item.prix.toLocaleString()} DH` : "",
        avance: item.avances_sum_montant
          ? `${item.avances_sum_montant.toLocaleString()} DH`
          : "",
        Reste:
          item.prix && item.avances_sum_montant
            ? `${(item.prix - item.avances_sum_montant).toLocaleString()} DH`
            : "",
        date_validation:
          item.last_statut?.statut == 1 && item.last_statut?.date_validation
            ? formatDateTime(item.last_statut.date_validation)
            : "",
        responsable_validation:
          item.last_statut?.statut == 1 && item.last_statut?.user
            ? `${item.last_statut.user.name || ""} ${
                item.last_statut.user.name || ""
              }`.trim()
            : "",
        nb_acquereurs: item.nb_acquereurs || "",
        mode_financement: MODE_FINANCE[item.mode_financement]?.label || "",
        prix_remise: item.prix_remise || "",
        prix_forfetaire: item.prix_forfetaire || "",
        noms_acquereurs: acquereursNames,
        cins_acquereurs: acquereursCin,
        tele_acquereurs: acquereursTele,
      };
    });
  };

  const columns_export = [
    { key: "code_reservation", label: "Code reservation" },
    { key: "date_reservation", label: "Date reservation" },
    { key: "bien", label: "Bien" },
    { key: "prix", label: "Prix" },
    { key: "avance", label: "Avance" },
    { key: "Reste", label: "Reste" },
    { key: "date_validation", label: "Date validation" },
    { key: "responsable_validation", label: "Responsable validation" },
    { key: "nb_acquereurs", label: "Nbrs acquereurs" },
    { key: "mode_financement", label: "Mode financement" },
    { key: "prix_remise", label: "Prix remise" },
    { key: "prix_forfetaire", label: "Prix forfetaire" },
    { key: "noms_acquereurs", label: "Nom client" },
    { key: "cins_acquereurs", label: "Cin client" },
    { key: "tele_acquereurs", label: "Tele client" },
  ];

  const handle_valider = (
    Id,
    code,
    num_recu,
    av_id,
    av_statut,
    cc,
    aquereurs,
    date_res,
    prix,
    avance
  ) => {
    setOpen_v_reservation(!open_v_reservation);
    setID(Id);
    setCode_reservation(code);
    set_first_num_recu(num_recu);
    set_first_av_statut(av_statut);
    setav_id(av_id);
    setCC(cc);
    setAquereurs(aquereurs);
    setDate_res(date_res);
    setPrix(prix);
    setAvance(avance);
  };

  const handle_rejeter = (Id, code) => {
    setOpen_r(!open_r);
    setID(Id);
    setCode_reservation(code);
  };

  
   const handle_affecte = (Id, code,old_notaire_id) => {
    setOpen_affecte(!open_affecte);
    setID(Id);
    setCode_reservation(code);
    setNoraire_id(old_notaire_id)
  };
  const handle_show_info_2 = (code) => {
    set_txt_info("La Réservation " + code + " est  en attente de validation !");
    setOpen_info(true);
  };

  const handle_show_comment_rejete = (code, msg) => {
    set_txt_info(
      "La Réservation " + code + " est rejetée en raison  de " + msg
    );
    setOpen_info(true);
  };

  const handle_show_info = (code) => {
    set_txt_info(
      "Premier avance du Réservation " + code + " en attente de validation !"
    );
    setOpen_info(true);
  };

  function getAddLinkForReservation() {
    if (dataClient) {
      return {
        pathname: `${ENDPOINTS.RESERVATIONS}?action=add`,
        onClick: () => {
          localStorage.setItem(
            "selectedClient_show_client",
            JSON.stringify(dataClient?.id)
          );
        },
      };
    }
    return `${ENDPOINTS.RESERVATIONS}?action=add`;
  }
  return (
    <>
      <div className="reflative bg-white rounded-lg p-4">
        <Table
          title={user_id ? "Liste des Ventes" : ""}
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={"reservations_export"}
          columns={columns}
          data={formatData()}
          totalRows={totalRows}
          loading={loading}
          error={error}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          onSearchChange={setSearchTerm}
          enableExport={formatData().length>0}
          enableImport={false}
          showSearch={false}
          addLink={
            (isSuperAdmin(user?.role) ||
              isAdmin(user?.role) ||
              isCommercial(user?.role)) &&
            !user_id
              ? getAddLinkForReservation()
              : undefined
          }
          filterComponent={
            <div className="space-y-4 p-4 rounded-lg ">
              <div
                className="grid gap-5"
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                }}
              >
                <Input
                  type="text"
                  label="Code Réservation"
                  value={tempFilters.code_reservation}
                  onChange={(e) =>
                    handleFilterChange("code_reservation", e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />

                <Input
                  type="text"
                  label="Bien"
                  value={tempFilters.bien}
                  onChange={(e) => handleFilterChange("bien", e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                {/*<Input
                  type="text"
                  label="Client"
                  value={tempFilters.client}
                  onChange={(e) => handleFilterChange('client', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />*/}
                <Input
                  type="text"
                  label="Responsable"
                  value={tempFilters.cc}
                  onChange={(e) => handleFilterChange("cc", e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <DateRangePicker
                  startName="date_start"
                  endName="date_end"
                  startValue={tempFilters.date_start}
                  endValue={tempFilters.date_end}
                  onChange={handleFilterChange}
                  label="Choisir une Date"
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
        />
      </div>
      {showDeleteModal && selectedId && (
        <Modal
          isVisible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        >
          <DeleteData
            route={APIURL.RESERVATIONS}
            Id={selectedId}
            message={"Etes-vous sûr de vouloir supprimer cete Réservation ?"}
            accessToken={accesstoken}
            onClose={() => {
              setShowDeleteModal(false);
              fetchData_table_by_projet(
                entity,
                {},
                searchTerm,
                currentPage,
                rowsPerPage,
                accesstoken,
                setLoading,
                setError,
                setData,
                setTotalRows
              );
            }}
          />
        </Modal>
      )}
      {open_v_reservation && (
        <>
          <Modal isVisible={true} onClose={() => setOpen_v_reservation(false)}>
            <Modal_Valider_Reservation
              prix={prix}
              avance={avance}
              aquereurs={aquereurs}
              date_res={date_res}
              commercial={cc}
              code_reservation={code_reservation}
              first_av_statut={first_av_statut}
              first_num_recu={first_num_recu}
              id={ID}
              av_id={av_id}
              onClose={() => setOpen_v_reservation(false)}
              closeParentModal={() => setOpen_v_reservation(false)} // Add this prop
            />
          </Modal>
        </>
      )}
       {open_affecte && (
        <>
          <Modal isVisible={true} onClose={() => setOpen_r(false)}>
            <Modal_Affecte
            old_notaire_id={old_notaire_id}
              code_reservation={code_reservation}
              id={ID}
              notaires={notaires}
              onClose={() => setOpen_affecte(false)}
            />
          </Modal>
        </>
      )}
      {open_r && (
        <>
          <Modal isVisible={true} onClose={() => setOpen_r(false)}>
            <Modal_Rejeter_Reservation
              code_reservation={code_reservation}
              id={ID}
              onClose={() => setOpen_r(false)}
            />
          </Modal>
        </>
      )}
      {open_info && (
        <>
          <Modal isVisible={true} onClose={() => setOpen_info(false)}>
            <Modal_show_info
              dst_id={dst_id}
              text={txt_info}
              statut_dst={statut_dst}
              onClose={() => setOpen_info(false)}
            />
          </Modal>
        </>
      )}
    </>
  );
};

export default ReservationTable;