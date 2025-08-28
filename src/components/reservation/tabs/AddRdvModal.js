import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { X, Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { APIURL } from "../../../configs/api";
import Pusher from "pusher-js";

const AddRdvModal = ({ open, reservation_id, onClose, onRdvAdded }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [type, setType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState(null);
  const [calendarApi, setCalendarApi] = useState(null);
  const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY_PROP_Rdv;
  const [showDetailModal, setShowDetailModal] = useState(false);

  const types = [
    { title: "Attestation de vente", value: 1 },
    { title: "Contrat de vente", value: 2 },
  ];

  useEffect(() => {
    if (!open || !calendarApi) return;

    console.log("Initializing Pusher with key:", pusherKey);
    const cleanup = pusher_function();

    return () => {
      console.log("Running Pusher cleanup");
      cleanup && cleanup();
    };
  }, [open, calendarApi, pusherKey]);
  // Modified refreshCalendar function
  const refreshCalendar = async (fetchInfo) => {
    if (!calendarApi) return;

    try {
      const events = await fetchEvents(fetchInfo);
      calendarApi.removeAllEvents();
      calendarApi.addEventSource(events);
    } catch (error) {
      console.error("Error refreshing calendar:", error);
    }
  };

  // Modified fetchEvents to handle missing fetchInfo
  const fetchEvents = async (fetchInfo = {}) => {
    const token = localStorage.getItem("accessToken");

    // If no fetchInfo provided, use default values
    const start = fetchInfo.start || new Date();
    const end = fetchInfo.end || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default to 1 week

    try {
      const res = await axios.get(`${APIURL.ROOT}/creneaux-occupes`, {
        params: {
          start: start.valueOf(),
          end: end.valueOf(),
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const now = new Date();
      return res.data
        .filter((c) => new Date(c.fin) > now)
        .map((c) => ({
          id: c.id,
          title:
            new Date(c.debut) < now
              ? "Passé"
              : c.disponible
              ? "Disponible"
              : "Occupé",
          start: c.debut,
          end: c.fin,
          color:
            new Date(c.debut) < now
              ? "#9CA3AF"
              : c.disponible
              ? "#10B981"
              : "#EF4444",
          textColor:
            new Date(c.debut) < now
              ? "#6B7280"
              : c.disponible
              ? "#065F46"
              : "black",
          borderColor: "transparent",
          extendedProps: {
            disponible: new Date(c.debut) < now ? false : c.disponible,
          },
        }));
    } catch (error) {
      console.error("Erreur de chargement des créneaux:", error);
      return [];
    }
  };
  // Clean up selections when modal closes
  useEffect(() => {
    return () => {
      if (calendarApi && selectedSlot) {
        clearSelection();
      }
    };
  }, [calendarApi, selectedSlot]);

  const clearSelection = () => {
    if (calendarApi) {
      calendarApi.getEvents().forEach((event) => {
        if (event.extendedProps?.isSelection) {
          event.remove();
        }
      });
    }
    setSelectedSlot(null);
  };

  // Add this at the top of your component with other constants
  const DATE_FORMAT_OPTIONS = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const handleSlotSelect = async (selectInfo) => {
    const now = new Date();
    if (selectInfo.start < now) {
      setErrors({ general: ["You can't select past dates"] });
      return;
    }

    clearSelection();
    setSelectedSlot({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      display: selectInfo.start.toLocaleString("fr-FR", DATE_FORMAT_OPTIONS),
    });
    setShowDetailModal(true);

    try {
      const response = await axios.post(
        `${APIURL.ROOT}/update-reservation-creneau/${reservation_id}`,
        {
          rdv: selectInfo.startStr,
          type: type, // Make sure type is selected first
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      // Visual feedback
      selectInfo.view.calendar.addEvent({
        title: "Selected",
        start: selectInfo.start,
        end: selectInfo.end,
        color: "#3b82f6",
        display: "background",
        extendedProps: { isSelection: true },
      });
    } catch (error) {
      console.error("Slot update failed:", error);
      setErrors({
        general: [error.response?.data?.message || "Update failed"],
      });
      selectInfo.view.calendar.unselect();
    }
  };

  // Enhanced Pusher handler

  const pusher_function = () => {
    if (!pusherKey) {
      console.error("Pusher key is missing");
      return;
    }

    const pusher = new Pusher(pusherKey, {
      cluster: "eu",
      forceTLS: true,
      authEndpoint: `${APIURL.ROOT}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      },
    });

    const channel = pusher.subscribe("rdv-updates");

    console.log("Subscribing to channel...");

    channel.bind("Rendez_vous_Prop", (data) => {
      console.log("Received Pusher event:", data);

      if (data.reservationId == reservation_id) {
        console.log("Matching reservation ID, refreshing...");

        const view = calendarApi.view;
        refreshCalendar({
          start: view.activeStart,
          end: view.activeEnd,
          timeZone: view.calendar.getOption("timeZone"),
        });

        if (
          selectedSlot &&
          new Date(selectedSlot.start).getTime() ==
            new Date(data.newDate).getTime()
        ) {
          calendarApi.addEvent({
            title: "Selected",
            start: selectedSlot.start,
            end: selectedSlot.end,
            color: "#3b82f6",
            display: "background",
            extendedProps: { isSelection: true },
          });
        }
      }
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!selectedSlot || !type) {
      setErrors({ general: ["Veuillez sélectionner un créneau et un type"] });
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${APIURL.ROOT}/store_rdv_reservation/${reservation_id}`,
        {
          rdv: selectedSlot.start,
          type: type,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onRdvAdded(response.data);
      onClose();
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general: ["Une erreur est survenue lors de l'enregistrement"],
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    clearSelection();
    onClose();
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    clearSelection();
  };
  if (!open) return null;

  return (
   <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
  <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[200vh] flex flex-col">
    {/* Header */}
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <h2 className="text-lg font-bold">Nouveau Rendez-vous</h2>
        </div>
        <button
          onClick={handleClose}
          className="p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>

    {/* Scrollable Content - Augmentation de la hauteur */}
    <div className="overflow-y-auto flex-1 p-4 space-y-4" style={{ maxHeight: 'calc(200vh - 120px)' }}>
      {/* Calendar Section avec hauteur augmentée */}
      <div className="space-y-2">
        <h3 className="text-md font-semibold flex items-center space-x-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <span>Sélectionnez un créneau</span>
        </h3>

        <div className="border rounded-lg overflow-hidden h-[500px]"> {/* Augmentation de 350px à 500px */}
          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "timeGridDay,timeGridWeek",
            }}
            height="100%"
            allDaySlot={false}
            slotDuration="00:30:00"
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
            selectable={true}
            selectMirror={true}
            select={handleSlotSelect}
            datesSet={(arg) => setCalendarApi(arg.view.calendar)}
            validRange={{
              start: new Date(),
            }}
            selectAllow={(selectInfo) => {
              const now = new Date();
              return selectInfo.start >= now;
            }}
            selectOverlap={(event) => {
              return event.extendedProps?.disponible !== false;
            }}
            slotMinTime="08:00:00"
            slotMaxTime="18:00:00"
            events={fetchEvents}
            locale="fr"
            firstDay={1}
            weekends={false}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5],
              startTime: "08:00",
              endTime: "18:00",
            }}
            dayHeaderFormat={{
              weekday: "short",
              day: "numeric",
              month: "short",
            }}
            hiddenDays={[0, 6]}
            nowIndicator={true}
            unselectAuto={false}
          />
        </div>
      </div>

      {showDetailModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white sticky top-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <h2 className="text-lg font-bold">
                    Détails du rendez-vous
                  </h2>
                </div>
                <button
                  onClick={handleCloseDetail}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Créneau sélectionné
                    </p>
                    <p className="text-xs text-blue-500">
                      {selectedSlot.display} •{" "}
                      {new Date(selectedSlot.start).toLocaleTimeString(
                        "fr-FR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}{" "}
                      -{" "}
                      {new Date(selectedSlot.end).toLocaleTimeString(
                        "fr-FR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de rendez-vous *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                  >
                    <option value="">Sélectionner un type</option>
                    {types.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {errors && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <div>
                      {Object.values(errors).map((error, index) => (
                        <p key={index} className="text-xs text-red-500">
                          {error[0]}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-2 border-t rounded-b-xl sticky bottom-0">
              <button
                type="button"
                onClick={handleCloseDetail}
                className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={!selectedSlot || !type || isSubmitting}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium text-white ${
                  !selectedSlot || !type
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } transition-colors flex items-center space-x-1`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-3 w-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <span>Confirmer</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
</div>
  );
};

export default AddRdvModal;
