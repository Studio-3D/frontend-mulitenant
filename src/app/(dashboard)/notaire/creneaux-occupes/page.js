"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
  Info
} from "lucide-react";
import { APIURL } from "@/configs/api";
import SelectInput from '@/components/SelectInput';

const AgendaCreneaux = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newCreneau, setNewCreneau] = useState({
    date: "",
    startTime: "09:00",
    endTime: "17:00",
    duration: 60,
    numberOfSlots: 1,
    type: ""
  });
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const calendarRef = useRef(null);
  const now = new Date();

  // Format date pour l'input date
  const today = new Date().toISOString().split('T')[0];
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Types de rendez-vous pour notaire immobilier
  const typeOptions = [
    { value: "3", label: "Réunion préalable" },
    { value: "4", label: "Autres" }
  ];

  // Récupérer le token et l'URL API
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  };

  // Format time pour input time (HH:MM)
  const formatTimeForInput = (hours, minutes) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Générer les couleurs de fond selon le jour
  const getDayBackgroundColor = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Aujourd'hui
    if (date.toDateString() === today.toDateString()) {
      return 'bg-blue-50/30';
    }
    
    // Demain
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'bg-green-50/30';
    }
    
    // Passé
    if (date < today) {
      return 'bg-gray-50';
    }
    
    // Futur
    return 'bg-white';
  };

  // Générer les créneaux disponibles pour aujourd'hui
  const generateTodayAvailableSlots = useMemo(() => {
    const aujourdhui = now.toISOString().split('T')[0];
    const todayEvents = events.filter(e => e.start.startsWith(aujourdhui));
    
    // Créneaux de l'heure actuelle + 15 minutes jusqu'à 17h
    const availableSlots = [];
    const startHour = currentHour;
    const startMinute = currentMinute;
    const endHour = 17; // 17h
    
    // Arrondir l'heure de début aux 30 minutes supérieures, avec minimum +15 minutes
    let roundedMinutes, actualStartHour;
    
    // Si on est avant 16h15, on peut prendre le créneau à 16h30
    // Si on est après 16h15, le premier créneau possible est 17h00
    if (startHour < 16 || (startHour === 16 && startMinute <= 15)) {
      // On est avant 16h15, on peut prendre 16h30
      roundedMinutes = 30;
      actualStartHour = 16;
    } else {
      // On est après 16h15, pas de créneau disponible aujourd'hui
      return [];
    }
    
    // Vérifier les créneaux occupés
    const occupiedSlots = todayEvents
      .filter(e => !e.extendedProps.disponible || new Date(e.start) <= now)
      .map(e => ({
        start: new Date(e.start),
        end: new Date(e.end)
      }));

    // Générer les créneaux de l'heure actuelle arrondie jusqu'à 17h
    for (let hour = actualStartHour; hour < endHour; hour++) {
      // Pour la première heure, commencer à l'heure arrondie
      let minuteStart = (hour === actualStartHour) ? roundedMinutes : 0;
      
      for (let minute = minuteStart; minute < 60; minute += 30) {
        const slotStart = new Date(`${aujourdhui}T${formatTimeForInput(hour, minute)}:00`);
        const slotEnd = new Date(slotStart.getTime() + 30 * 60000); // 30 minutes
        
        // Vérifier si le créneau dépasse 17h
        if (slotEnd > new Date(`${aujourdhui}T17:00:00`)) break;
        
        // Vérifier si le créneau est dans moins de 15 minutes
        const minutesUntilSlot = (slotStart - now) / (1000 * 60);
        if (minutesUntilSlot < 15) continue; // Ignorer les créneaux dans moins de 15 minutes
        
        // Vérifier si le créneau est occupé
        const isOccupied = occupiedSlots.some(occupied => 
          slotStart < occupied.end && slotEnd > occupied.start
        );
        
        if (!isOccupied) {
          availableSlots.push({
            start: slotStart,
            end: slotEnd,
            available: true
          });
        }
      }
    }

    return availableSlots;
  }, [events, now, currentHour, currentMinute]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const aujourdhui = now.toISOString().split('T')[0];
    
    const total = events.length;
    
    // Créneaux disponibles : dans le futur ET disponible = true
    const disponibles = events.filter(c => {
      const isFuture = new Date(c.start) > now;
      return c.extendedProps.disponible && isFuture;
    }).length;
    
    // Créneaux occupés/passés : soit indisponible, soit dans le passé
    const occupes = events.filter(c => {
      const isPast = new Date(c.start) <= now;
      return !c.extendedProps.disponible || isPast;
    }).length;
    
    // Disponibles aujourd'hui : créneaux standards de 15h à 17h non occupés
    const todayDispo = generateTodayAvailableSlots.length;

    return { total, disponibles, occupes, todayDispo };
  }, [events, generateTodayAvailableSlots, now]);

  // Récupérer les créneaux occupés
  const fetchCreneaux = async (start, end) => {
    try {
      const token = getToken();
      if (!token) {
        setError("Non authentifié. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${APIURL.ROOTV1}/creaneau_occupes_by_user_id`, {
        params: {
          start: start.getTime(),
          end: end.getTime()
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const creneaux = response.data.creneaux || [];
      
      // Transformer en événements FullCalendar
      const formattedEvents = creneaux.map(creneau => {
        const startDate = new Date(creneau.debut);
        const isPast = startDate <= now;
        
        return {
          id: creneau.id,
          title: isPast ? "Passé" : (creneau.disponible ? "Disponible" : "Occupé"),
          start: creneau.debut,
          end: creneau.fin,
          color: isPast ? "#6B7280" : (creneau.disponible ? "#10B981" : "#EF4444"),
          textColor: isPast ? "#9CA3AF" : (creneau.disponible ? "#065F46" : "white"),
          extendedProps: {
            disponible: creneau.disponible,
            isPast: isPast,
            debut: creneau.debut,
            fin: creneau.fin
          }
        };
      });

      setEvents(formattedEvents);
      setError(null);
    } catch (error) {
      console.error("Erreur lors du chargement des créneaux:", error);
      setError(error.response?.data?.error || "Impossible de charger les créneaux");
    } finally {
      setLoading(false);
    }
  };

  // Charger les créneaux au montage du composant
  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    fetchCreneaux(start, end);
  }, []);

  // Handler pour le changement de vue du calendrier
  const handleDatesSet = (arg) => {
    //fetchCreneaux(arg.start, arg.end);
  };

  // Mettre à jour l'heure de début quand la date change
  useEffect(() => {
    if (newCreneau.date) {
      const selectedDate = new Date(newCreneau.date);
      const todayDate = new Date(today);
      
      // Si la date sélectionnée est aujourd'hui
      if (selectedDate.toDateString() === todayDate.toDateString()) {
        // Calculer l'heure de début minimum (heure actuelle arrondie aux 30 minutes supérieures)
        const roundedMinutes = currentMinute <= 30 ? 30 : 0;
        const startHour = currentMinute <= 30 ? currentHour : currentHour + 1;
        const minStartTime = formatTimeForInput(startHour, roundedMinutes);
        
        setNewCreneau(prev => ({
          ...prev,
          startTime: minStartTime,
          // Ajuster l'heure de fin si nécessaire (max 17:00)
          endTime: prev.endTime > "17:00" ? "17:00" : prev.endTime
        }));
      } else {
        // Sinon, on met 09:00 par défaut
        setNewCreneau(prev => ({
          ...prev,
          startTime: "09:00",
          endTime: "17:00"
        }));
      }
    }
  }, [newCreneau.date, today, currentHour, currentMinute]);

  // Calculer l'heure de début minimum
  const getMinStartTime = () => {
    if (!newCreneau.date) return "00:00";
    
    const selectedDate = new Date(newCreneau.date);
    const todayDate = new Date(today);
    
    // Si la date sélectionnée est aujourd'hui
    if (selectedDate.toDateString() === todayDate.toDateString()) {
      // Ajouter 15 minutes à l'heure actuelle
      const nowPlus15 = new Date(now.getTime() + 15 * 60000);
      const roundedMinutes = nowPlus15.getMinutes() <= 30 ? 30 : 0;
      const startHour = nowPlus15.getMinutes() <= 30 ? nowPlus15.getHours() : nowPlus15.getHours() + 1;
      
      // Si après 16h45, pas de créneau disponible aujourd'hui
      if (startHour > 16 || (startHour === 16 && roundedMinutes > 30)) {
        return "17:00"; // Aucun créneau disponible
      }
      
      return formatTimeForInput(startHour, roundedMinutes);
    }
    
    return "09:00"; // Sinon, on commence à 9h
  };

  // Calculer l'heure de fin maximum
  const getMaxEndTime = () => {
    if (!newCreneau.date) return "23:59";
    
    const selectedDate = new Date(newCreneau.date);
    const todayDate = new Date(today);
    
    // Si la date sélectionnée est aujourd'hui, max 17:00
    if (selectedDate.toDateString() === todayDate.toDateString()) {
      return "17:00";
    }
    
    return "18:00"; // Sinon, max 18:00
  };

  // Vérifier les conflits avec les créneaux existants
  const checkTimeConflicts = (startTime, endTime) => {
    if (!newCreneau.date) return false;
    
    const selectedDateStr = newCreneau.date;
    const startDateTime = new Date(`${selectedDateStr}T${startTime}`);
    const endDateTime = new Date(`${selectedDateStr}T${endTime}`);
    
    // Vérifier les conflits avec les créneaux existants
    const conflicts = events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      // Vérifier si les créneaux se chevauchent
      return (
        eventStart.toDateString() === startDateTime.toDateString() && // Même jour
        (
          (startDateTime < eventEnd && endDateTime > eventStart) || // Chevauchement
          (startDateTime.getTime() === eventStart.getTime()) // Exactement le même
        )
      );
    });
    
    return conflicts.length > 0;
  };

  // Calculer le nombre maximum de créneaux possibles
  const calculateMaxSlots = () => {
    if (!newCreneau.date || !newCreneau.startTime || !newCreneau.endTime) {
      return 0;
    }
    
    const startDateTime = new Date(`${newCreneau.date}T${newCreneau.startTime}`);
    const endDateTime = new Date(`${newCreneau.date}T${newCreneau.endTime}`);
    
    if (endDateTime <= startDateTime) {
      return 0;
    }
    
    // Vérifier les conflits
    if (checkTimeConflicts(newCreneau.startTime, newCreneau.endTime)) {
      return 0;
    }
    
    const totalMinutes = (endDateTime - startDateTime) / (1000 * 60);
    return Math.floor(totalMinutes / newCreneau.duration);
  };

  // Générer la prévisualisation des créneaux
  const generatePreview = () => {
    if (!newCreneau.date || !newCreneau.startTime || !newCreneau.endTime) {
      return [];
    }

    const maxSlots = calculateMaxSlots();
    if (maxSlots === 0) return [];
    
    const startDateTime = new Date(`${newCreneau.date}T${newCreneau.startTime}`);
    const endDateTime = new Date(`${newCreneau.date}T${newCreneau.endTime}`);
    const actualSlots = Math.min(newCreneau.numberOfSlots, maxSlots);
    
    const preview = [];
    let currentStart = new Date(startDateTime);

    for (let i = 0; i < actualSlots; i++) {
      const slotStart = new Date(currentStart);
      const slotEnd = new Date(slotStart.getTime() + newCreneau.duration * 60000);
      
      if (slotEnd > endDateTime) break;

      // Vérifier les conflits pour chaque créneau
      const hasConflict = checkTimeConflicts(
        slotStart.toTimeString().slice(0, 5),
        slotEnd.toTimeString().slice(0, 5)
      );

      preview.push({
        start: slotStart,
        end: slotEnd,
        hasConflict
      });

      currentStart = slotEnd;
    }

    return preview;
  };

  // Fonction pour vérifier si une date est un samedi (6)
  const isSaturday = (dateString) => {
    const date = new Date(dateString);
    return date.getDay() === 6; // 6 = Samedi
  };

  // Générer les dates disponibles (uniquement les samedis)
  const generateAvailableDates = () => {
    const dates = [];
    const startDate = new Date();
    
    // Générer les 60 prochains jours
    for (let i = 0; i < 60; i++) {
      const currentDate = new Date();
      currentDate.setDate(startDate.getDate() + i);
      
      // Inclure seulement les samedis
      if (currentDate.getDay() === 6) {
        dates.push(currentDate.toISOString().split('T')[0]);
      }
    }
    
    return dates;
  };

  // Dates disponibles pour l'input date
  const availableDates = useMemo(() => generateAvailableDates(), []);

  // Fonction pour désactiver les dates non-samedi dans l'input
  const isDateDisabled = (dateString) => {
    return !isSaturday(dateString);
  };

  // Ajouter plusieurs créneaux
 const handleAddCreneaux = async () => {
    if (!newCreneau.date) {
      setError("Veuillez sélectionner une date");
      return;
    }

    if (!newCreneau.type) {
      setError("Veuillez sélectionner un type de rendez-vous");
      return;
    }

    const startDateTime = new Date(`${newCreneau.date}T${newCreneau.startTime}`);
    const endDateTime = new Date(`${newCreneau.date}T${newCreneau.endTime}`);
    
    // Vérifier que l'heure de début n'est pas dans le passé
    if (startDateTime < now) {
      setError("L'heure de début ne peut pas être dans le passé");
      return;
    }
    
    // Vérifier que le créneau est dans au moins 15 minutes
    const minutesUntilStart = (startDateTime - now) / (1000 * 60);
    if (minutesUntilStart < 15) {
      setError("Le créneau doit être dans au moins 15 minutes");
      return;
    }
    if (endDateTime <= startDateTime) {
      setError("L'heure de fin doit être après l'heure de début");
      return;
    }

    if (newCreneau.duration <= 0) {
      setError("La durée doit être supérieure à 0");
      return;
    }

    if (newCreneau.numberOfSlots <= 0) {
      setError("Le nombre de créneaux doit être supérieur à 0");
      return;
    }

    // Vérifier les conflits
    if (checkTimeConflicts(newCreneau.startTime, newCreneau.endTime)) {
      setError("Des créneaux existent déjà dans cette plage horaire");
      return;
    }

    const maxSlots = calculateMaxSlots();
    if (newCreneau.numberOfSlots > maxSlots) {
      setError(`Maximum ${maxSlots} créneaux possibles dans cette plage horaire`);
      return;
    }

    setAdding(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getToken();
      const creneauxToAdd = [];
      
      let currentStart = new Date(startDateTime);
      const actualSlots = Math.min(newCreneau.numberOfSlots, maxSlots);

      // Fonction pour formater la date en YYYY-MM-DD HH:MM:SS (format MySQL)
      const formatDateTimeForAPI = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      for (let i = 0; i < actualSlots; i++) {
        const slotStart = new Date(currentStart);
        const slotEnd = new Date(slotStart.getTime() + newCreneau.duration * 60000);
        
        if (slotEnd > endDateTime) break;

        // Convertir le type en entier si c'est un nombre
        const typeValue = isNaN(parseInt(newCreneau.type)) 
          ? newCreneau.type 
          : parseInt(newCreneau.type);

        creneauxToAdd.push({
          debut: formatDateTimeForAPI(slotStart), // Format local YYYY-MM-DD HH:MM:SS
          fin: formatDateTimeForAPI(slotEnd),     // Format local YYYY-MM-DD HH:MM:SS
          disponible: true,
          type: typeValue // Envoyer le type
        });

        currentStart = slotEnd;
      }

      // Si un seul créneau, utiliser POST simple
      if (creneauxToAdd.length === 1) {
        await axios.post(`${APIURL.ROOTV1}/creaneau_occupes_by_user_id`, creneauxToAdd[0], {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Si plusieurs créneaux, utiliser la route multiple
        await axios.post(`${APIURL.ROOTV1}/creaneau_occupes_by_user_id/multiple`, {
          creneaux: creneauxToAdd
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      setSuccess(`${creneauxToAdd.length} créneau(x) ajouté(s) avec succès`);
      
      // Rafraîchir le calendrier
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        const view = calendarApi.view;
        setTimeout(() => fetchCreneaux(view.activeStart, view.activeEnd), 100);
      }
      
      // Réinitialiser le formulaire
      setNewCreneau({
        date: "",
        startTime: "",
        endTime: "17:00",
        duration: 60,
        numberOfSlots: 1,
        type: ""
      });
      
      setTimeout(() => setShowAddModal(false), 1500);
    } catch (error) {
      console.error("Erreur lors de l'ajout des créneaux:", error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.data?.errors) {
        // Si c'est une erreur de validation Laravel
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError("Erreur lors de l'ajout des créneaux");
      }
    } finally {
      setAdding(false);
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
      
      // Rafraîchir le calendrier
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        const view = calendarApi.view;
        setTimeout(() => fetchCreneaux(view.activeStart, view.activeEnd), 100);
      }
      
      setShowDeleteModal(false);
      setSelectedEvent(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setError("Erreur lors de la suppression du créneau");
    } finally {
      setDeleting(false);
    }
  };

  // Handler pour le clic sur un événement
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const isPast = event.extendedProps.isPast;
    
    if (isPast) {
      setError("Impossible de supprimer un créneau passé");
      return;
    }
    
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      isPast: event.extendedProps.isPast,
      disponible: event.extendedProps.disponible
    });
    setShowDeleteModal(true);
  };

  // Render du contenu des événements
  const renderEventContent = (eventInfo) => {
    const startTime = eventInfo.timeText.split(' - ')[0];
    const isAvailable = eventInfo.event.extendedProps.disponible;
    const isPast = eventInfo.event.extendedProps.isPast;
    
    return (
      <div className="p-1 text-xs">
        <div className="font-semibold">{startTime}</div>
        <div className={`text-xs px-1 rounded ${
          isPast ? 'bg-gray-100 text-gray-800' :
          isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isPast ? 'Passé' : (isAvailable ? 'Disponible' : 'Occupé')}
        </div>
      </div>
    );
  };

  const preview = generatePreview();
  const maxSlots = calculateMaxSlots();
  const minStartTime = getMinStartTime();
  const maxEndTime = getMaxEndTime();

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
              Gérez vos créneaux disponibles et occupés
            </p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Ajouter des créneaux
          </button>
        </div>

        {/* Messages d'alerte */}
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

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Créneaux totaux</p>
                <p className="text-xl font-semibold">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <Clock4 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Occupés/Passés</p>
                <p className="text-xl font-semibold text-red-600">{stats.occupes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <CalendarDays className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Dispo. aujourd{"'"}hui (15h-17h)</p>
                <p className="text-xl font-semibold text-purple-600">{stats.todayDispo}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {generateTodayAvailableSlots.length > 0 
                    ? `Créneaux disponibles: ${generateTodayAvailableSlots.length}`
                    : "Aucun créneau disponible"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des créneaux disponibles aujourd'hui */}
        {generateTodayAvailableSlots.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-blue-600" />
              Créneaux disponibles  aujourd{"'"}hui ({formatTimeForInput(currentHour, currentMinute)} + 15min - 17h)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {generateTodayAvailableSlots.slice(0, 8).map((slot, i) => {
                const minutesUntilSlot = (slot.start - now) / (1000 * 60);
                const isSoon = minutesUntilSlot < 30; // Moins de 30 minutes
                
                return (
                  <div key={i} className={`rounded-lg p-3 text-center border ${
                    isSoon 
                      ? 'bg-yellow-50 border-yellow-200' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <div className={`font-medium ${
                      isSoon ? 'text-yellow-800' : 'text-green-800'
                    }`}>
                      {slot.start.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className={`text-xs mt-1 ${
                      isSoon ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {isSoon ? 'Bientôt' : 'Disponible'}
                    </div>
                    {isSoon && (
                      <div className="text-xs text-gray-500 mt-1">
                        dans {Math.round(minutesUntilSlot)} min
                      </div>
                    )}
                  </div>
                );
              })}
              {generateTodayAvailableSlots.length > 8 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <div className="font-medium text-blue-800">
                    +{generateTodayAvailableSlots.length - 8} autres
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Calendrier */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
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
            eventClick={handleEventClick}
            datesSet={handleDatesSet}
            locale="fr"
            firstDay={1}
            weekends={true}
            hiddenDays={[0]} // Cacher seulement dimanche (0)
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5, 6], // Inclure samedi (6) dans les heures ouvrables
              startTime: '09:00',
              endTime: '17:00'
            }}
            slotMinTime="09:00:00"
            slotMaxTime="17:00:00"
            nowIndicator={true}
            selectable={false}
            editable={false}
            // Ajouter des couleurs de fond selon le jour
            dayCellClassNames={({ date }) => {
              return getDayBackgroundColor(date.toISOString());
            }}
          />
        )}
      </div>

      {/* Modal pour ajouter des créneaux */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <h2 className="text-lg font-bold">Ajouter des créneaux</h2>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setError(null);
                    setNewCreneau({
                      date: "",
                      startTime: "",
                      endTime: "17:00",
                      duration: 60,
                      numberOfSlots: 1,
                      type: ""
                    });
                  }}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Date *
                    </label>
                    <input
                      type="date"
                      value={newCreneau.date}
                      onChange={(e) => {
                        const selectedDate = e.target.value;
                        if (isSaturday(selectedDate)) {
                          setNewCreneau({
                            ...newCreneau,
                            date: selectedDate,
                            startTime: "",
                            endTime: selectedDate === today ? "17:00" : "17:00"
                          });
                        }
                      }}
                      min={today}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    {newCreneau.date && !isSaturday(newCreneau.date) && (
                      <p className="text-xs text-red-500 mt-1">
                        Seuls les samedis sont autorisés
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Heure de début *
                    </label>
                    <input
                      type="time"
                      value={newCreneau.startTime}
                      onChange={(e) => setNewCreneau({...newCreneau, startTime: e.target.value})}
                      min={minStartTime}
                      max={maxEndTime}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={!newCreneau.date}
                    />
                    {newCreneau.date && (
                      <p className="text-xs text-gray-500 mt-1">
                        {newCreneau.date === today 
                          ? `Minimum: ${minStartTime} (heure actuelle arrondie)`
                          : "Minimum: 09:00"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Heure de fin *
                    </label>
                    <input
                      type="time"
                      value={newCreneau.endTime}
                      onChange={(e) => setNewCreneau({...newCreneau, endTime: e.target.value})}
                      min={newCreneau.startTime || minStartTime}
                      max={maxEndTime}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={!newCreneau.date}
                    />
                    {newCreneau.date && newCreneau.date === today && (
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum: 17:00 pour aujourd{"'"}hui
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de rendez-vous *
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée d{"'"}un créneau *
                    </label>
                    <select
                      value={newCreneau.duration}
                      onChange={(e) => setNewCreneau({...newCreneau, duration: parseInt(e.target.value)})}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 heure</option>
                      <option value={90}>1 heure 30</option>
                      <option value={120}>2 heures</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de créneaux *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={newCreneau.numberOfSlots}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value > 0 && value <= 20) {
                          setNewCreneau({...newCreneau, numberOfSlots: value});
                        }
                      }}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {maxSlots > 0 && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700 font-medium">
                          Maximum: <span className="font-bold">{maxSlots}</span> créneaux possibles
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Plage: {newCreneau.startTime || "--:--"} - {newCreneau.endTime} ({newCreneau.duration} min/créneau)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Prévisualisation */}
              {preview.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Prévisualisation des créneaux:
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {preview.map((slot, i) => (
                      <div key={i} className={`flex items-center justify-between text-sm p-3 rounded-lg border ${
                        slot.hasConflict 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-white border-blue-100'
                      }`}>
                        <div className="flex-1">
                          <span className="font-medium text-gray-800">
                            {slot.start.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          <span className="mx-2 text-gray-400">→</span>
                          <span className="font-medium text-gray-800">
                            {slot.end.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                          slot.hasConflict
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {slot.hasConflict ? 'Conflit' : 'Disponible'}
                        </span>
                      </div>
                    ))}
                    {newCreneau.numberOfSlots > preview.length && (
                      <div className="text-center pt-2">
                        <p className="text-sm text-blue-600 font-medium">
                          + {newCreneau.numberOfSlots - preview.length} autre(s) créneau(x) seront créés
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-xl border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError(null);
                  setNewCreneau({
                    date: "",
                    startTime: "",
                    endTime: "17:00",
                    duration: 60,
                    numberOfSlots: 1,
                    type: ""
                  });
                }}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={adding}
              >
                Annuler
              </button>
              <button
                onClick={handleAddCreneaux}
                disabled={adding || !newCreneau.date || !newCreneau.type || maxSlots == 0}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium text-white flex items-center space-x-2 ${
                  adding || !newCreneau.date || !newCreneau.type || maxSlots === 0
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors`}
              >
                {adding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Ajout en cours...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Ajouter {newCreneau.numberOfSlots} créneau(s)</span>
                  </>
                )}
              </button>
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