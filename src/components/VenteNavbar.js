"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  User,
  Users,
  Repeat,
  Menu,
  ChevronDown,
  ChevronUp,
  Check,
  CircleX,
  Clock,
  Euro,
  Handshake,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Pusher from "pusher-js";
import FetchNotifMenuVente from "@/configs/fetch_notif_menu_vente";

const VenteNavbar = () => {
  const { user } = useAuth();
  const userRole = user?.role;
  const router = useRouter();
  const navRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const pathname = usePathname();

  // Pusher and notification states
  const pusher_key_NotifMenu =
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY_NOTIF_MENU;
  const [param, setParam] = useState(0);
  const [param_2, setParam_2] = useState(0);
  const projetId =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("selectedProjet"))?.id
      : null;

  // Notification counts
  const [nb_dst_att_valide, set_nb_dst_att_valide] = useState(0);
  const [nb_pen_att_valide, set_nb_pen_att_valide] = useState(0);
  const [nb_att_valid_reservation, set_nb_att_valid_reservation] = useState(0);
  const [nb_att_valid_avances, set_nb_att_valid_avances] = useState(0);
  const [nb_echeances, set_nb_echeances] = useState(0);
  const [nb_demande_pre_remb, set_nb_demande_pre_remb] = useState(0);

  // Calculate totals
  const nb_att_validation_total =
    Number(nb_att_valid_reservation) +
    Number(nb_att_valid_avances) +
    Number(nb_dst_att_valide) +
    Number(nb_pen_att_valide);

  const nb_total_relances = Number(nb_echeances);

  const fetchDataNotiMon = async (nb) => {
    if (param_2 === 0) {
      await FetchNotifMenuVente(
        nb,
        projetId,
        userRole,
        set_nb_demande_pre_remb,
        set_nb_dst_att_valide,
        set_nb_pen_att_valide,
        set_nb_att_valid_reservation,
        set_nb_att_valid_avances,
        set_nb_echeances
      );
    }
  };

  useEffect(() => {
    pusher_function();
    if (param === 0) {
      fetchDataNotiMon(param);
    }
  }, [param]);

  const pusher_function = async () => {
    const pusher = new Pusher(`${pusher_key_NotifMenu}`, {
      cluster: "eu",
      encrypted: true,
    });

    const channel = pusher.subscribe("NotifMenu");
    channel.bind("App\\Events\\NotifMenuEvent", (data) => {
      fetchDataNotiMon(data.NotifMenuId);
      setParam(data.NotifMenuId);
      setParam_2(1);
    });

    return () => {
      channel.unbind("App\\Events\\NotifMenuEvent");
      pusher.unsubscribe("NotifMenu");
    };
  };

  // Close submenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenSubmenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSubmenu = (menu) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  // Click handlers
  const handleDesistementClick = () => {
    localStorage.setItem("etat_dst", "1");
  };

  const handlePenaliteClick = () => {
    localStorage.setItem("etat_penalite", "1");
  };

  const handle_dst_att_validation_Click = (e) => {
    e.preventDefault();
    if (userRole <= 2) {
      localStorage.setItem("etat_dst", "5");
    } else {
      localStorage.setItem("etat_dst", "0");
    }
    router.push("/ventes/desistements/attente_encours");
  };

  const handle_res_att_validation_Click = (e) => {
    e.preventDefault();
    localStorage.setItem("etat_res", "3");
    router.push("/ventes/validations/reservations");
  };

  const handle_res_rejet_Click = (e) => {
    e.preventDefault();
    localStorage.setItem("etat_res", "2");
    router.push("/ventes/rejets/reservations");
  };

  const handle_av_rejets_Click = (e) => {
    e.preventDefault();
    localStorage.setItem("etat_av", "2");
    router.push("/ventes/rejets/avances");
  };
  const handle_av_att_validation_Click = (e) => {
    e.preventDefault();
    localStorage.setItem("etat_av", "3");
    router.push("/ventes/validations/avances");
  };

  const handle_penalites_att_validation_Click = (e) => {
    e.preventDefault();
    if (userRole <= 2) {
      localStorage.setItem("etat_penalite", "5");
    } else {
      localStorage.setItem("etat_penalite", "0");
    }
    router.push("/ventes/desistements/penalites/attente_encours");
  };

  const handle_dst_rejet_Click = (e) => {
    e.preventDefault();
    localStorage.setItem("etat_dst", "2");
    router.push("/ventes/desistements/rejets");
  };

  const handle_penalites_rejet_Click = (e) => {
    e.preventDefault();
    localStorage.setItem("etat_penalite", "2");
    router.push("/ventes/desistements/penalites/rejets");
  };

  const handle_relances_echeances_Click = (e) => {
    localStorage.setItem("etat_av", "99");
    router.push("/ventes/echeances");
  };

  const navItems = [
    {
      name: "Reservations",
      path: "/ventes/reservations",
      icon: <User className="w-5 h-5" />,
    },
    {
      name: "Clients",
      path: "/ventes/clients",
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: "Désistements",
      path: "/ventes/desistements",
      icon: <Repeat className="w-5 h-5" />,
      onClick: handleDesistementClick,
    },
    {
      name: "Penalités",
      path: "/ventes/desistements/penalites",
      icon: <Euro className="w-5 h-5" />,
      onClick: handlePenaliteClick,
    },
    {
      name: "Remboursements",
      icon: <Handshake className="w-5 h-5" />,
      subItems:
        userRole <= 2
          ? [
              {
                name: "Aprés Vente",
                path: "/ventes/remboursements/apres_ventes",
              },
              {
                name: "Attente Accusé du chèque",
                path: "/ventes/remboursements/att_accuse_cheque",
              },
              {
                name: "Attente Décaissement",
                path: "/ventes/remboursements/att_decaissement",
              },
              {
                name: "Liste des Accusés",
                path: "/ventes/remboursements/accuses",
              },
              {
                name: "Dossiers Transférés",
                path: "/ventes/remboursements/dossiers_transferes",
              },
            ]
          : [
              {
                name: "Aprés Vente",
                path: "/ventes/remboursements/apres_ventes",
              },
              {
                name: "Attente Accusé du chèque",
                path: "/ventes/remboursements/att_accuse_cheque",
              },
              {
                name: "Accusé du chèque Traité",
                path: "/ventes/remboursements/accuses_cheque_traite",
              },
              {
                name: "Dossiers Transférés",
                path: "/ventes/remboursements/dossiers_transferes",
              },
            ],
    },
    {
      name: userRole <= 2 ? "Validation" : "En cours",
      icon: <Check className="w-5 h-5" />,
      badge: nb_att_validation_total,
      subItems: [
        {
          name: "Désistements",
          path: "/ventes/desistements/attente_encours",
          badge: nb_dst_att_valide,
          onClick: handle_dst_att_validation_Click,
        },
        {
          name: "Pénalités",
          path: "/ventes/desistements/penalites/attente_encours",
          badge: nb_pen_att_valide,
          onClick: handle_penalites_att_validation_Click,
        },
        {
          name: "Réservations",
          path: "/ventes/validations/reservations",
          badge: nb_att_valid_reservation,
          onClick: handle_res_att_validation_Click,
        },
        {
          name: "Avances",
          path: "/ventes/validations/avances",
          badge: nb_att_valid_avances,
          onClick: handle_av_att_validation_Click,
        },
      ],
    },
    {
      name: "Rejet",
      icon: <CircleX className="w-5 h-5" />,
      subItems: [
        {
          name: "Désistements",
          path: "/ventes/desistements/rejets",
          onClick: handle_dst_rejet_Click,
        },
        {
          name: "Pénalités",
          path: "/ventes/desistements/penalites/rejets",
          onClick: handle_penalites_rejet_Click,
        },
        {
          name: "Réservations",
          path: "/ventes/rejets/reservations",
          onClick: handle_res_rejet_Click,
        },
        {
          name: "Avances",
          path: "/ventes/rejets/avances",
          onClick: handle_av_rejets_Click,
        },
      ],
    },
    {
      name: "Echéances",
      path: "/ventes/echeances",
      icon: <Euro className="w-5 h-5" />,
      onClick: handle_relances_echeances_Click,
    },
  ];

  const isActive = (path) => pathname === path;
  const isParentActive = (subItems) => {
    return subItems?.some((subItem) => pathname.startsWith(subItem.path));
  };

  const getActiveSubmenuName = (subItems) => {
    const activeItem = subItems?.find((subItem) =>
      pathname.startsWith(subItem.path)
    );
    return activeItem?.name || null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4" ref={navRef}>
      <button
        className="block md:hidden !text-gray-700 focus:outline-none"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Menu className="w-6 h-6" />
      </button>

      <nav
        className={`flex flex-col gap-4 md:flex-row ${
          menuOpen ? "block" : "hidden md:flex"
        }`}
      >
        {navItems.map((item) => {
          const activeSubmenuName = getActiveSubmenuName(item.subItems);

          return (
            <div key={item.name} className="relative flex-1">
              <Link
                href={item.path || "#"}
                onClick={(e) => {
                  if (item.onClick) item.onClick();
                  if (item.subItems) {
                    e.preventDefault();
                    toggleSubmenu(item.name);
                  }
                }}
                className={`flex items-center gap-2 px-1 py-3 rounded-md transition-colors ${
                  isActive(item.path) || isParentActive(item.subItems)
                    ? "bg-[#1ab394] text-white font-normal"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                <span className="whitespace-nowrap">
                  {item.name}
                  {activeSubmenuName && (
                    <span className="ml-2 text-xs opacity-75">
                      ({activeSubmenuName})
                    </span>
                  )}
                </span>
                {item.badge && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.subItems && (
                  <span className="ml-auto">
                    {openSubmenu === item.name ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                )}
              </Link>
              {item.subItems && openSubmenu === item.name && (
                <div className="absolute left-0 top-full bg-white shadow-md rounded-md mt-2 w-full z-10">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.path}
                      onClick={(e) => subItem.onClick?.(e)}
                      className={`flex items-center justify-between px-4 py-2 m-1 !text-gray-700 hover:bg-gray-100 hover:rounded-md ${
                        isActive(subItem.path) ? "bg-blue-50 rounded-md" : ""
                      }`}
                    >
                      <span>{subItem.name}</span>
                      {subItem.badge && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
                          {subItem.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default VenteNavbar;
