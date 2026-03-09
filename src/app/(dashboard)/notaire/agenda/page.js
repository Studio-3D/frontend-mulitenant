"use client";

import { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { 
  Plus, 
  X, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Save,
  CalendarDays,
  Clock4,
  Trash2,
  AlertTriangle,
  Info,
  Edit2
} from "lucide-react";
import { APIURL } from "@/configs/api";
import SelectInput from '@/components/SelectInput';
import Pusher from "pusher-js";
import { isNotaire, isRespoLivraison } from "@/configs/enum";
import MenuNotaires from "../MenuNotaires";
import { useAuth } from "@/context/AuthContext";
import { useProjet } from "@/context/ProjetContext";

const AgendaCreneaux = () => {
    const { selectedProjet } = useProjet();
  
  const { user} = useAuth();
  const userRole = user?.role;
  const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY_PROP_Rdv;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newCreneau, setNewCreneau] = useState({
    date_debut: "",
    date_fin: "",
    type: ""
  });
  const [editingCreneau, setEditingCreneau] = useState({
    id: "",
    date_debut: "",
    date_fin: "",
    type: ""
  });
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [calendarApi, setCalendarApi] = useState(null);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const calendarRef = useRef(null);
  const now = new Date();

    // États pour les notaires
    const [notaires, setNotaires] = useState([]);
    const [loadingNotaires, setLoadingNotaires] = useState(false);
    const [selectedNotaireId, setSelectedNotaireId] = useState(null);
    const [selectedNotaireName, setSelectedNotaireName] = useState("");
  // Types de rendez-vous pour notaire immobilier avec correspondance valeur => libellé
  const typeOptions = [
    {/* value: "3", label: "Réunion préalable" */},
    { value: "4", label: "Bloqué" }
  ];

  // Fonction pour obtenir le libellé du type
  const getTypeLabel = (typeValue) => {
    const option = typeOptions.find(opt => opt.value === String(typeValue));
    return option ? option.label : "Non spécifié";
  };

    // Récupérer le token
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  };

  // Formater la date pour input datetime-local
  const formatDateTimeForInput = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Arrondir aux 30 minutes
  const roundTo30Minutes = (date) => {
    const roundedDate = new Date(date);
    const minutes = roundedDate.getMinutes();
    
    if (minutes === 0 || minutes === 30) {
      return roundedDate;
    }
    
    if (minutes < 30) {
      roundedDate.setMinutes(30, 0, 0);
    } else {
      roundedDate.setHours(roundedDate.getHours() + 1);
      roundedDate.setMinutes(0, 0, 0);
    }
    
    return roundedDate;
  };

  // Vérifier si c'est dimanche
  const isSunday = (date) => {
    return date.getDay() === 0;
  };

  // Obtenir la date de début minimale
  const getMinDateTime = () => {
    const nowPlus15 = new Date(now.getTime() + 15 * 60000);
    const roundedDate = roundTo30Minutes(nowPlus15);
    return formatDateTimeForInput(roundedDate);
  };

  // Calculer l'heure maximum pour le début
  const getMaxStartTime = () => {
    if (!newCreneau.date_debut) return "";
    const dateStr = newCreneau.date_debut.split('T')[0];
    return `${dateStr}T16:30`;
  };

  // Calculer l'heure minimum pour la fin
  const getMinEndTime = () => {
    if (!newCreneau.date_debut) return "";
    const startDate = new Date(newCreneau.date_debut);
    const minDate = new Date(startDate);
    minDate.setMinutes(startDate.getMinutes() + 30);
    return formatDateTimeForInput(minDate);
  };

  // Calculer l'heure maximum pour la fin
  const getMaxEndTime = () => {
    if (!newCreneau.date_debut) return "";
    const startDate = new Date(newCreneau.date_debut);
    const maxDate = new Date(startDate);
    maxDate.setHours(17, 0, 0, 0);
    return formatDateTimeForInput(maxDate);
  };

  // Récupérer les créneaux
// Récupérer les créneaux avec paramètre pour respo livraison
const fetchCreneaux = async (start, end, notaireParam = null) => {
  try {
    const token = getToken();
    if (!token) {
      setError("Non authentifié. Veuillez vous reconnecter.");
      setLoading(false);
      return [];
    }

    // Construire les paramètres de requête
    const params = {
      start: start.getTime(),
      end: end.getTime()
    };

    // Ajouter notaire_id seulement pour respo livraison
    if (isRespoLivraison(userRole)) {
      if (notaireParam === null || notaireParam === 'tous') {
        params.notaire_id = 'tous';
      } else {
        params.notaire_id = notaireParam;
      }
    }

    const response = await axios.get(`${APIURL.ROOTV1}/creaneau_occupes_by_user_id`, {
      params: params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const creneaux = response.data.creneaux || [];
    
    // Transformer en événements FullCalendar
    const formattedEvents = creneaux.map(creneau => {
      const startDate = new Date(creneau.debut);
      const isPast = startDate <= now;
      const typeLabel = getTypeLabel(creneau.type);
      
      // Pour respo livraison, ajouter le nom du notaire dans le titre
      let title = '';
      
      if (isPast) {
        title = "Passé";
      } else if (creneau.disponible) {
        title = "Disponible";
      } else {
        title = typeLabel || "Occupé";
      }
      
      if (isRespoLivraison(userRole) && creneau.user_id) {
        // Utiliser user_name et user_prenom du backend si disponibles
        if (creneau.user_name || creneau.user_prenom) {
          const nomComplet = `${creneau.user_name || ''} ${creneau.user_prenom || ''}`.trim();
          if (nomComplet) {
            title = `${title} - ${nomComplet}`;
          }
        } else {
          // Fallback: chercher dans la liste locale
          const notaire = notaires.find(n => n.id == creneau.user_id);
          if (notaire) {
            title = `${title} - ${notaire.name} ${notaire.prenom}`;
          } else {
            title = `${title} - Notaire ${creneau.user_id}`;
          }
        }
      }
      
      return {
        id: creneau.id,
        title: title,
        start: creneau.debut,
        end: creneau.fin,
        color: isPast ? "#6B7280" : (creneau.disponible ? "#10B981" : "#EF4444"),
        textColor: isPast ? "#9CA3AF" : (creneau.disponible ? "#065F46" : "white"),
        extendedProps: {
          disponible: creneau.disponible,
          isPast: isPast,
          debut: creneau.debut,
          fin: creneau.fin,
          type: creneau.type || "",
          typeLabel: typeLabel,
          notaireId: creneau.user_id,
          notaireName: creneau.user_name,
          notairePrenom: creneau.user_prenom
        }
      };
    });

    setEvents(formattedEvents);
    setError(null);
    return formattedEvents;
  } catch (error) {
    console.error("Erreur lors du chargement des créneaux:", error);
    setError(error.response?.data?.error || "Impossible de charger les créneaux");
    return [];
  } finally {
    setLoading(false);
  }
};

// Fonction pour rafraîchir le calendrier
const refreshCalendar = async () => {
  if (calendarRef.current) {
    const calendarApi = calendarRef.current.getApi();
    const view = calendarApi.view;
    
    let notaireParam = null;
    if (isRespoLivraison(userRole)) {
      if (selectedNotaireId === null || selectedNotaireId === 'tous') {
        notaireParam = 'tous';
      } else {
        notaireParam = selectedNotaireId;
      }
    }
    
    fetchCreneaux(view.activeStart, view.activeEnd, notaireParam);
  }
};
   // Fonction pour charger les notaires
  const fetchNotaires = async () => {
    if (isRespoLivraison(userRole)) {    
      setLoadingNotaires(true);
      try {
        const response = await axios.get(`${APIURL.ROOTV1}/projets/${selectedProjet?.id} /notaires`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        setNotaires(response.data.notaires || []);
      } catch (error) {
        console.error("Erreur chargement notaires:", error);
      } finally {
        setLoadingNotaires(false);
      }
    }
  };

    useEffect(() => {
      fetchNotaires();
    }, [userRole]);

     // Sélectionner un notaire
 // Sélectionner un notaire
// Mettez à jour votre handleSelectNotaire pour gérer le null
const handleSelectNotaire = (notaireId, notaireNom = "") => {
  setSelectedNotaireId(notaireId);
  
  // Si notaireNom est vide, on utilise le nom par défaut
  if (notaireNom) {
    setSelectedNotaireName(notaireNom);
  } else {
    // Si null est passé, c'est "Tous les notaires"
    if (notaireId === null) {
      setSelectedNotaireName('Tous les notaires');
    } else if (notaireId) {
      // Chercher le nom dans la liste des notaires
      const notaire = notaires.find(n => n.id === notaireId);
      if (notaire) {
        setSelectedNotaireName(`${notaire.name} ${notaire.prenom}`);
      } else {
        setSelectedNotaireName(`Notaire ${notaireId}`);
      }
    }
  }
  
  // Rafraîchir le calendrier avec les nouveaux paramètres
  if (calendarRef.current) {
    const calendarApi = calendarRef.current.getApi();
    const view = calendarApi.view;
    
    // Si notaireId est null, c'est "tous"
    if (notaireId === null) {
      fetchCreneaux(view.activeStart, view.activeEnd, 'tous');
    } else {
      fetchCreneaux(view.activeStart, view.activeEnd, notaireId);
    }
  }
};

 const pusher_function = () => {
 if (!pusherKey) {
        console.error("Pusher key is missing");
        return;
      }
  
      console.log("Initializing Pusher with key:", pusherKey);
      
      const pusher = new Pusher(pusherKey, {
        cluster: "eu",
        forceTLS: true,
        authEndpoint: `${APIURL.ROOT}/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        },
      });
  
      const channel = pusher.subscribe("creneau-updates");
  
      console.log("Subscribing to creneau-updates channel...");
      channel.bind("Rendez_vous_Prop", (data) => {
      
        const view = calendarApi.view;
        refreshCalendar({
          start: view.activeStart,
          end: view.activeEnd,
          timeZone: view.calendar.getOption("timeZone"),
        });
      });
  
      // Debugging connection state
      pusher.connection.bind("state_change", (states) => {
        console.log("Pusher connection state changed:", states);
      });
  
      return () => {
        console.log("Cleaning up Pusher...");
        channel.unbind_all();
        channel.unsubscribe();
        pusher.disconnect();
      };
   };
   // Initialiser Pusher pour les mises à jour en temps réel
    useEffect(() => {
     pusher_function()
    }, [calendarApi, pusherKey]);
  
  // Charger les créneaux au montage
// Charger les créneaux au montage ou quand le notaire sélectionné change
useEffect(() => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  if (isNotaire(userRole)) {
    // Notaire : toujours ses propres créneaux
    fetchCreneaux(start, end);
  } else if (isRespoLivraison(userRole)) {
    // Respo livraison
    // Par défaut, utiliser null qui correspond à "Tous les notaires"
    if (selectedNotaireId === null || selectedNotaireId === 'tous') {
      fetchCreneaux(start, end, 'tous');
      if (selectedNotaireId === null) {
        setSelectedNotaireName('Tous les notaires');
      }
    } else {
      fetchCreneaux(start, end, selectedNotaireId);
    }
  }
}, [userRole, selectedNotaireId,selectedProjet]);
  // Handler pour le clic sur une date du calendrier
// Handler pour le clic sur une date du calendrier
const handleDateClick = (clickInfo) => {
  const clickedDate = clickInfo.date;
  
  // Vérifier si c'est dimanche
  if (isSunday(clickedDate)) {
    setError("Le dimanche n'est pas disponible pour les rendez-vous");
    return;
  }
  
  // Vérifier si la date n'est pas dans le passé
  if (clickedDate < now) {
    setError("Impossible de sélectionner une date passée");
    return;
  }
  
  // Arrondir aux 30 minutes
  const roundedDate = roundTo30Minutes(clickedDate);
  
  // Si l'heure arrondie est avant 9h, mettre à 9h
  if (roundedDate.getHours() < 9) {
    roundedDate.setHours(9, 0, 0, 0);
  }
  
  // Si l'heure arrondie est après 16h30, ne pas permettre
  if (roundedDate.getHours() > 16 || (roundedDate.getHours() === 16 && roundedDate.getMinutes() > 30)) {
    setError("Dernier créneau disponible à 16h30");
    return;
  }
  
  // Utiliser l'heure exacte cliquée (arrondie)
  const startTime = new Date(roundedDate);
  const endTime = new Date(startTime);
  endTime.setMinutes(startTime.getMinutes() + 30); // CHANGEMENT: 30 minutes au lieu de 1 heure
  
  // Vérifier que ça ne dépasse pas 17h
  if (endTime.getHours() > 17 || (endTime.getHours() === 17 && endTime.getMinutes() > 0)) {
    setError("L'horaire sélectionné dépasse 17h");
    return;
  }
  
  // Vérifier si le créneau est disponible (pas de conflit)
  const eventsOnSameDay = events.filter(event => {
    const eventStart = new Date(event.start);
    return eventStart.toDateString() === startTime.toDateString();
  });
  
  const hasConflict = eventsOnSameDay.some(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    
    // Logique de conflit
    return (
      (startTime >= eventStart && startTime < eventEnd) || // Début pendant un événement
      (endTime > eventStart && endTime <= eventEnd) ||     // Fin pendant un événement
      (startTime <= eventStart && endTime >= eventEnd)     // Couvre complètement un événement
    );
  });
  
  if (hasConflict) {
    setError("Ce créneau n'est pas disponible. Veuillez sélectionner un autre horaire.");
    return;
  }
  
  // Créer le créneau avec l'horaire exact sélectionné
  setNewCreneau({
    date_debut: formatDateTimeForInput(startTime),
    date_fin: formatDateTimeForInput(endTime),
    type: ""
  });
  
  handleDatePropose(formatDateTimeForInput(startTime), formatDateTimeForInput(endTime));
  // Feedback visuel
  clickInfo.view.calendar.addEvent({
    title: "Proposition",
    start: startTime,
    end: endTime,
    color: "#3b82f6",
    display: "background",
    extendedProps: { isProposition: true, type: 0 },
  });
  
  setShowAddModal(true);
  setError(null);
};

   // Ajoutez cette fonction dans votre composant
  const handleDatePropose = async (startDateTime, endDateTime) => {
    try {
      const token = getToken();
      
      const response = await axios.post(
        `${APIURL.ROOTV1}/update-agenda-by-user`,
        {
          date_debut: startDateTime,
          date_fin: endDateTime // Envoyer au format ISO
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
          
      // Rafraîchir le calendrier
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        const view = calendarApi.view;
        setTimeout(() => fetchCreneaux(view.activeStart, view.activeEnd), 100);
      }
      
      // Feedback visuel
      if (calendarApi) {
        calendarApi.addEvent({
          title: "Proposition",
          start: startDateTime,
          end: endDateTime,
          color: "#3b82f6",
          display: "background",
          extendedProps: { isProposition: true, type: 0 },
        });
      }
      
    } catch (error) {
      console.error("Erreur lors de la proposition:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError("Erreur lors de la proposition de créneau");
      }
    }
  };
  const isDayPast = (date) => {
  const day = new Date(date);
  day.setHours(23, 59, 59, 999); // Fin de la journée
  return day < now;
};
// Fonction pour vérifier si un jour est passé
const dayCellRender = (info) => {
  const el = info.el;
  const date = new Date(info.date);
  
  if (isDayPast(date)) {
    el.style.backgroundColor = '#f3f4f6';
    el.style.opacity = '0.7';
  }
};
// Handler pour le clic sur une case horaire
const handleSlotClick = (clickInfo) => {
  const clickedDate = clickInfo.date;
  
  // Vérifier si c'est dimanche
  if (isSunday(clickedDate)) {
    setError("Le dimanche n'est pas disponible pour les rendez-vous");
    return;
  }
  
  // Vérifier si la date n'est pas dans le passé
  if (clickedDate < now) {
    setError("Impossible de sélectionner une date passée");
    return;
  }
  
  // Arrondir aux 30 minutes
  const roundedDate = roundTo30Minutes(clickedDate);
  
  // Si l'heure arrondie est avant 9h, mettre à 9h
  if (roundedDate.getHours() < 9) {
    roundedDate.setHours(9, 0, 0, 0);
  }
  
  // Si l'heure arrondie est après 16h30, ne pas permettre
  if (roundedDate.getHours() > 16 || (roundedDate.getHours() === 16 && roundedDate.getMinutes() > 30)) {
    setError("Dernier créneau disponible à 16h30");
    return;
  }
  
  // Créer un créneau de 30 minutes - CHANGEMENT ICI
  const startTime = new Date(roundedDate);
  const endTime = new Date(startTime);
  endTime.setMinutes(startTime.getMinutes() + 30); // 30 minutes au lieu de 1 heure
  
  // Vérifier que ça ne dépasse pas 17h
  if (endTime.getHours() > 17 || (endTime.getHours() === 17 && endTime.getMinutes() > 0)) {
    setError("L'horaire sélectionné dépasse 17h");
    return;
  }
  
  // Vérifier si le créneau est disponible
  const eventsOnSameDay = events.filter(event => {
    const eventStart = new Date(event.start);
    return eventStart.toDateString() === startTime.toDateString();
  });
  
  const hasConflict = eventsOnSameDay.some(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    
    // Logique de conflit
    return (
      (startTime >= eventStart && startTime < eventEnd) || // Début pendant un événement
      (endTime > eventStart && endTime <= eventEnd) ||     // Fin pendant un événement
      (startTime <= eventStart && endTime >= eventEnd)     // Couvre complètement un événement
    );
  });
  
  if (hasConflict) {
    setError("Ce créneau n'est pas disponible. Veuillez sélectionner un autre horaire.");
    return;
  }
  
  setNewCreneau({
    date_debut: formatDateTimeForInput(startTime),
    date_fin: formatDateTimeForInput(endTime),
    type: ""
  });
  setShowAddModal(true);
  setError(null);
}; 

  // Handler pour le clic sur un événement
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const isPast = event.extendedProps.isPast;
    const isAvailable = event.extendedProps.disponible;
    
    if (isPast) {
      setError("Impossible de modifier ou supprimer un créneau passé");
      return;
    }
    
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      isPast: event.extendedProps.isPast,
      disponible: event.extendedProps.disponible,
      type: event.extendedProps.type || ""
    });
    console.log('avv===>',isAvailable)
    // Créneaux disponibles (verts) -> suppression directe
    if(isAvailable==undefined){
       // Ouvrir directement la modal d'ajout avec les informations du créneau
      setNewCreneau({
        date_debut: formatDateTimeForInput(new Date(event.start)),
        date_fin: formatDateTimeForInput(new Date(event.end)),
        type: event.extendedProps.type || ""
      });
      setShowAddModal(true);
    }else{
      if (isAvailable) {
        setShowDeleteModal(true);
      } 
      // Créneaux occupés (rouges) -> choix modifier/supprimer
      else {
        setShowActionModal(true);
      }
    }
   
  };

  // Handler pour le survol d'un événement
  const handleEventMouseEnter = (mouseEnterInfo) => {
    const event = mouseEnterInfo.event;
    setHoveredEvent(event);
  };

  const handleEventMouseLeave = () => {
    setHoveredEvent(null);
  };

  // Ajouter un créneau
  const handleAddCreneau = async () => {
    if (!newCreneau.date_debut || !newCreneau.date_fin || !newCreneau.type) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    const startDateTime = new Date(newCreneau.date_debut);
    const endDateTime = new Date(newCreneau.date_fin);
    
    // Vérifications
    if (startDateTime >= endDateTime) {
      setError("La date de fin doit être après la date de début");
      return;
    }
    
    if (startDateTime < now) {
      setError("Impossible de créer un créneau dans le passé");
      return;
    }
    
    if (isSunday(startDateTime)) {
      setError("Les créneaux ne sont pas disponibles le dimanche");
      return;
    }
    
    setAdding(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getToken();
      
      const formatDateTimeForAPI = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      const creneauData = {
        debut: formatDateTimeForAPI(startDateTime),
        fin: formatDateTimeForAPI(endDateTime),
        disponible: true,
        type: newCreneau.type
      };

      await axios.post(`${APIURL.ROOTV1}/storeCreneau`, creneauData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccess("Créneau ajouté avec succès");
      pusher_function()
      
      // Rafraîchir le calendrier
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        const view = calendarApi.view;
        setTimeout(() => fetchCreneaux(view.activeStart, view.activeEnd), 100);
      }
      
      // Réinitialiser
      setNewCreneau({
        date_debut: "",
        date_fin: "",
        type: ""
      });
      
      setTimeout(() => setShowAddModal(false), 1500);
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError("Erreur lors de l'ajout du créneau");
      }
    } finally {
      setAdding(false);
    }
  };

  // Mettre à jour un créneau
  const handleUpdateCreneau = async () => {
    if (!editingCreneau.date_debut || !editingCreneau.date_fin || !editingCreneau.type) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    const startDateTime = new Date(editingCreneau.date_debut);
    const endDateTime = new Date(editingCreneau.date_fin);
    
    // Vérifications
    if (startDateTime >= endDateTime) {
      setError("La date de fin doit être après la date de début");
      return;
    }
    
    if (startDateTime < now) {
      setError("Impossible de modifier un créneau dans le passé");
      return;
    }
    
    if (isSunday(startDateTime)) {
      setError("Les créneaux ne sont pas disponibles le dimanche");
      return;
    }

    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getToken();
      
      const formatDateTimeForAPI = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      const creneauData = {
        debut: formatDateTimeForAPI(startDateTime),
        fin: formatDateTimeForAPI(endDateTime),
        disponible: false,
        type: editingCreneau.type
      };

      // Utiliser la nouvelle route de mise à jour
      await axios.put(`${APIURL.ROOTV1}/update-creneau-by-user/${editingCreneau.id}`, creneauData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccess("Créneau modifié avec succès");
      pusher_function()
      // Rafraîchir le calendrier
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        const view = calendarApi.view;
        setTimeout(() => fetchCreneaux(view.activeStart, view.activeEnd), 100);
      }
      
      setTimeout(() => {
        setShowEditModal(false);
        setEditingCreneau({
          id: "",
          date_debut: "",
          date_fin: "",
          type: ""
        });
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError("Erreur lors de la modification du créneau");
      }
    } finally {
      setUpdating(false);
    }
  };

  // Supprimer un créneau
  const handleDeleteCreneau = async () => {
    if (!selectedEvent) return;
    
    setDeleting(true);
    setError(null);

    try {
      const token = getToken();
      await axios.delete(`${APIURL.ROOTV1}/creaneau_occupes_by_user_id/${selectedEvent.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("Créneau supprimé avec succès");
      pusher_function()
      // Rafraîchir le calendrier
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        const view = calendarApi.view;
        setTimeout(() => fetchCreneaux(view.activeStart, view.activeEnd), 100);
      }
      
      setShowDeleteModal(false);
      setShowActionModal(false);
      setSelectedEvent(null);
      setTimeout(() => setSuccess(null), 2000);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setError("Erreur lors de la suppression du créneau");
    } finally {
      setDeleting(false);
    }
  };

  // Render du contenu des événements avec hover
  const renderEventContent = (eventInfo) => {
  const startTime = eventInfo.timeText.split(' - ')[0];
  const isAvailable = eventInfo.event.extendedProps.disponible;
  const isPast = eventInfo.event.extendedProps.isPast;
  const typeLabel = eventInfo.event.extendedProps.typeLabel;
  
  return (
    <div className="p-1 text-xs">
      <div className="font-semibold">{startTime}</div>
      <div className={`text-xs px-1 rounded ${
        isPast ? 'bg-gray-100 text-gray-800' :
        isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isPast ? 'Passé' : 
         isAvailable ? 'Disponible' : 
         typeLabel ? ` (${typeLabel})` : 'Occupé'}
      </div>
    </div>
  );
};

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarDays className="h-8 w-8 text-blue-600" />
              Agenda des Créneaux
            </h1>
            <p className="text-gray-600 mt-1">
              Cliquez sur une date ou une case horaire disponible (du lundi au samedi, 9h-17h)
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}
      </div>

      {/* Calendrier */}
      <div className="bg-white rounded-xl shadow-lg p-4">
         {isRespoLivraison(userRole) && (
                  <MenuNotaires
                    notaires={notaires}
                    selectedNotaire={selectedNotaireId}
                    onSelectNotaire={handleSelectNotaire}
                    loading={loadingNotaires}
                  />
                )}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay"
            }}
            height="auto"
            allDaySlot={false}
            slotDuration="00:30:00"
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
            }}
            events={events}
            eventContent={renderEventContent}
           // Désactiver les clics d'événements pour respo livraison
            eventClick={isNotaire(userRole) ? handleEventClick : null}
            eventMouseEnter={handleEventMouseEnter}
            eventMouseLeave={handleEventMouseLeave}
            // Désactiver les clics de date pour respo livraison
            dateClick={isNotaire(userRole) ? handleDateClick : null}
            // Désactiver les clics de slot pour respo livraison
            slotClick={isNotaire(userRole) ? handleSlotClick : null}
            locale="fr"
            firstDay={1}
            weekends={true}
            hiddenDays={[0]}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5, 6],
              startTime: '09:00',
              endTime: '17:00'
            }}
            slotMinTime="09:00:00"
            slotMaxTime="17:00:00"
            nowIndicator={true}
            selectable={false}
            editable={false}
            datesSet={(arg) => {
              setCalendarApi(arg.view.calendar);
            }}
             // AJOUTER CETTE CONFIGURATION POUR LES JOURS PASSÉS
          dayCellDidMount={dayCellRender}
  dayCellWillUnmount={() => {}}
          />
          </>
        )}
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <h2 className="text-lg font-bold">Ajouter un créneau</h2>
                </div>
                <button onClick={() => setShowAddModal(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date et heure de début <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={newCreneau.date_debut}
                      onChange={(e) => setNewCreneau({...newCreneau, date_debut: e.target.value})}
                      min={getMinDateTime()}
                      max={getMaxStartTime()}
                      step="1800"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date et heure de fin <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={newCreneau.date_fin}
                      onChange={(e) => setNewCreneau({...newCreneau, date_fin: e.target.value})}
                      min={getMinEndTime()}
                      max={getMaxEndTime()}
                      step="1800"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type  <span className="text-red-500 ml-1">*</span>
                  </label>
                  <SelectInput
                    placeholder="Sélectionner un type"
                    name="type"
                    label=""
                    options={typeOptions}
                    value={newCreneau.type}
                    errors={{}}
                    backendErrors={{}}
                    onChange={(value) => setNewCreneau({...newCreneau, type: value})}
                  />
                </div>
              </div>
               {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}
              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 border rounded-lg">
                  Annuler
                </button>
                <button onClick={handleAddCreneau} disabled={adding} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg">
                  {adding ? "Ajout..." : "Ajouter"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'action */}
      {showActionModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Action sur le créneau</h2>
                <button onClick={() => setShowActionModal(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setEditingCreneau({
                      id: selectedEvent.id,
                      date_debut: formatDateTimeForInput(new Date(selectedEvent.start)),
                      date_fin: formatDateTimeForInput(new Date(selectedEvent.end)),
                      type: selectedEvent.type || ""
                    });
                    setShowEditModal(true);
                  }}
                  className="flex flex-col items-center justify-center p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50"
                >
                  <Edit2 className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="font-medium text-blue-700">Modifier</span>
                </button>
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setShowDeleteModal(true);
                  }}
                  className="flex flex-col items-center justify-center p-4 border-2 border-red-500 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="h-8 w-8 text-red-600 mb-2" />
                  <span className="font-medium text-red-700">Supprimer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4 text-white rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Edit2 className="h-5 w-5" />
                  <h2 className="text-lg font-bold">Modifier le créneau</h2>
                </div>
                <button onClick={() => setShowEditModal(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date et heure de début <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={editingCreneau.date_debut}
                      onChange={(e) => setEditingCreneau({...editingCreneau, date_debut: e.target.value})}
                      min={getMinDateTime()}
                      max={getMaxStartTime()}
                      step="1800"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date et heure de fin <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={editingCreneau.date_fin}
                      onChange={(e) => setEditingCreneau({...editingCreneau, date_fin: e.target.value})}
                      min={getMinEndTime()}
                      max={getMaxEndTime()}
                      step="1800"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type<span className="text-red-500 ml-1">*</span>
                  </label>
                  <SelectInput
                    placeholder="Sélectionner un type"
                    name="type"
                    label=""
                    options={typeOptions}
                    value={editingCreneau.type}
                    errors={{}}
                    backendErrors={{}}
                    onChange={(value) => setEditingCreneau({...editingCreneau, type: value})}
                  />
                </div>
              </div>
               {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}
              

              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowEditModal(false)} className="px-5 py-2.5 border rounded-lg">
                  Annuler
                </button>
                <button onClick={handleUpdateCreneau} disabled={updating} className="px-5 py-2.5 bg-purple-600 text-white rounded-lg">
                  {updating ? "Modification..." : "Modifier"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

       {/* Modal de suppression */}
      {showDeleteModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 p-4 text-white rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <h2 className="text-lg font-bold">Supprimer le créneau</h2>
                </div>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedEvent(null);
                  }}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-4">
              {/* Avertissement si créneau passé */}
              {selectedEvent.isPast ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    <div>
                      <p className="font-medium text-red-800">Impossible de supprimer</p>
                      <p className="text-sm text-red-600 mt-1">
                        Les créneaux passés ne peuvent pas être supprimés.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      selectedEvent.disponible ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {selectedEvent.disponible ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <Clock4 className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedEvent.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(selectedEvent.start).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Heure de début</p>
                        <p className="text-lg font-bold text-gray-900">
                          {new Date(selectedEvent.start).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-gray-400">→</div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Heure de fin</p>
                        <p className="text-lg font-bold text-gray-900">
                          {new Date(selectedEvent.end).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-800">
                        Cette action est irréversible. Le créneau sera définitivement supprimé.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-xl border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedEvent(null);
                }}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={deleting}
              >
                Annuler
              </button>
              {!selectedEvent.isPast && (
                <button
                  onClick={handleDeleteCreneau}
                  disabled={deleting}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Suppression...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Supprimer le créneau</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaCreneaux;