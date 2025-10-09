"use client";

import React, { useEffect, useState } from "react";
import Table from "@/components/Table";
import { ThumbsDown, ThumbsUp, Clock, Eye, X } from "lucide-react";
import Modal from "@/components/Modal";
import { useAuth } from "../../../../../context/AuthContext";

import { useRouter } from "next/navigation";
import format from "date-fns/format";
import { isAdmin, isSuperAdmin } from "../../../../../configs/enum";
import { fetchData_table_by_id } from "../../../../../configs/api-utils";
import Link from "next/link";
import Input from "@/components/Input";
import { MODE_FINANCE } from "../../../../../configs/enum";
import Modal_Valider_Reservation from "../../../ventes/reservations/Modal_Valider_Reservation";
import Modal_Rejeter_Reservation from "../../../ventes/reservations/Modal_Rejeter_Reservation";
import Modal_show_info from "../../../ventes/reservations/Modal_show_info";
import LoadingSpin from "@/components/LoadingSpin";
import VenteNavbar from "@/components/VenteNavbar";
import DateRangePicker from "@/components/DateRangePicker";
import { useProjet } from '@/context/ProjetContext';

const PageTraitement_Validation_rejets = () => {
  const { selectedProjet  } = useProjet();
  const etat_res =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("etat_res"))
      : null;
  const { user, token } = useAuth();
  const userRole = user?.role;
  const accessToken =
    token ||
    (typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null);

  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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

  // API configuration
  const entity = {
    id: selectedProjet.id + "/" + etat_res,
    API_URL: "reservations_by_etat",
    dataKey: "data",
    searchFields: [""],
  };

  // Fetch data effect
  useEffect(() => {
    fetchData_table_by_id(
      entity,
      filters,
      searchTerm,
      currentPage,
      rowsPerPage,
      accessToken,
      setLoading,
      setError,
      setData,
      setTotalRows
    );
  }, [accessToken, currentPage, rowsPerPage, searchTerm, filters,selectedProjet]);

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    //Implementing the setInterval method
    const interval = setInterval(() => {
      if (localStorage.getItem("load_data_reservation") == 1) {
        fetchData_table_by_id(
          entity,
          {},
          searchTerm,
          currentPage,
          rowsPerPage,
          accessToken,
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
  }, [accessToken, currentPage, rowsPerPage, searchTerm]);

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

  function NomBienComplet(bien) {
    const noms = [];

    if (bien?.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien?.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien?.immeuble?.nom) noms.push(bien.immeuble.nom);

    if (bien?.propriete_dite_bien) noms.push(bien.propriete_dite_bien);

    return noms.join(" - ");
  }

  const handleShow = (resId) => {
    router.push(`/ventes/reservations/${resId}`);
  };

  const formatData = () => {
    return data.map((pro) => {
      return {
        id: pro.id,
        code_reservation: pro.code_reservation,
        cc: pro.user?.name + " " + pro.user?.prenom,
        user_id: pro.user?.id,
        date_reservation: pro.date_reservation,
        aquereurs: pro.aquereurs,
        bien_id: pro.bien_id,
        bien: pro.bien,
        propriete_dite_bien: pro.bien?.propriete_dite_bien,
        prix: pro.prix,
        avances_sum_montant: pro.avances_sum_montant,
        statut: pro.statut,
        data_res: pro,
        fadwa: pro.statut,
      };
    });
  };

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
            {row.date_reservation
              ? format(new Date(row.date_reservation), "dd/MM/yyyy ", {
                  timeZone: "UTC",
                })
              : ""}
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
    ...(isSuperAdmin(userRole) ||
      (isAdmin(userRole)
        ? [
            {
              key: "actions",
              label: "Actions",
              render: (row) => {
                return (
                  <div className="flex gap-3 items-center">
                    <Eye
                      className="w-4 h-4 !text-blue-500 hover:text-blue-700 cursor-pointer"
                      title="Voir détails"
                      onClick={() => handleShow(row.id)}
                    />

                    {etat_res == 3 &&
                    (isSuperAdmin(userRole) || isAdmin(userRole)) ? (
                      <>
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
                              row.data_res.user.name +
                                " " +
                                row.data_res.user.prenom,
                              row.data_res.aquereurs,
                              row.data_res.date_reservation,
                              row.data_res.prix,
                              row.avances_sum_montant
                            )
                          }
                        />

                        <ThumbsDown
                          className="w-4 h-4 !text-red-500 hover:text-red-700 cursor-pointer"
                          title="Refuser"
                          onClick={() =>
                            handle_rejeter(row.id, row.code_reservation)
                          }
                        />
                      </>
                    ) : etat_res == 2 ? (
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
                    ) : null}
                  </div>
                );
              },
            },
          ]
        : [])),
    ,
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
          ? format(new Date(item.date_reservation), "dd/MM/yyyy")
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
            ? format(
                new Date(item.last_statut.date_validation),
                "dd/MM/yyyy kk:mm"
              )
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

  const handle_show_comment_rejete = (code, msg) => {
    set_txt_info("La Réservation " + code + " est rejetée en raison de " + msg);
    setOpen_info(true);
  };

  if (loading) return <LoadingSpin />;

  return (
    <>
      <VenteNavbar />
      <div className="relative bg-white shadow-md rounded-lg p-4">
        <p className="text-lg font-semibold mb-4">
          Réservation{" "}
          {etat_res == 3 ? "En Attente" : etat_res == 2 ? "Rejetée" : null}
        </p>

        <Table
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
          enableExport={true}
          enableImport={false}
          showSearch={false}
          addLink={false}
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
                  placeholder="Code Réservation"
                  value={tempFilters.code_reservation}
                  onChange={(e) =>
                    handleFilterChange("code_reservation", e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />

                <Input
                  type="text"
                  placeholder="Bien"
                  value={tempFilters.bien}
                  onChange={(e) => handleFilterChange("bien", e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="text"
                  placeholder="Responsable"
                  value={tempFilters.cc}
                  onChange={(e) => handleFilterChange("cc", e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <DateRangePicker
                  startName="date_start"
                  endName="date_fin"
                  startValue={tempFilters.date_start}
                  endValue={tempFilters.date_fin}
                  onChange={handleFilterChange}
                  placeholder="Choisir une Date"
                  label="Date"
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

      {open_v_reservation && (
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
            closeParentModal={() => setOpen_v_reservation(false)}
          />
        </Modal>
      )}
      {open_r && (
        <Modal isVisible={true} onClose={() => setOpen_r(false)}>
          <Modal_Rejeter_Reservation
            code_reservation={code_reservation}
            id={ID}
            onClose={() => setOpen_r(false)}
          />
        </Modal>
      )}
      {open_info && (
        <Modal isVisible={true} onClose={() => setOpen_info(false)}>
          <Modal_show_info
            dst_id={dst_id}
            text={txt_info}
            statut_dst={statut_dst}
            onClose={() => setOpen_info(false)}
          />
        </Modal>
      )}
    </>
  );
};

export default PageTraitement_Validation_rejets;
