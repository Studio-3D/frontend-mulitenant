import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { X, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const AddRdvModal = ({ open, reservation_id,onClose, onRdvAdded }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [type, setType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState(null);
  const [calendarApi, setCalendarApi] = useState(null);

  const types = [
    { title: 'Compromis de vente', value: 1 },
    { title: 'Contrat de vente', value: 2 },
  ];

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

  const handleSlotSelect = (selectInfo) => {
    const now = new Date();
    const selectedDate = selectInfo.start;

    // Clear previous errors and selections
    setErrors(null);
    clearSelection();

    // Check if date is in the past
    if (selectedDate < now) {
      setErrors({
        general: ['Vous ne pouvez pas sélectionner une date/heure passée'],
      });
      selectInfo.view.calendar.unselect();
      return;
    }

    // Add visual selection
    selectInfo.view.calendar.addEvent({
      title: 'Sélectionné',
      start: selectInfo.start,
      end: selectInfo.end,
      color: '#3b82f6', // Blue color
      display: 'background',
      extendedProps: {
        isSelection: true,
      },
    });

    setSelectedSlot({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      display: selectInfo.start.toLocaleString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!selectedSlot || !type) {
      setErrors({ general: ['Veuillez sélectionner un créneau et un type'] });
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        'http://127.0.0.1:8000/api/store_rdv_reservation/'+reservation_id,
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
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

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* Calendar Section */}
          <div className="space-y-2">
            <h3 className="text-md font-semibold flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Sélectionnez un créneau</span>
            </h3>

            <div className="border rounded-lg overflow-hidden h-[350px]">
              <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: 'prev,next',
                  center: 'title',
                  right: 'timeGridDay,timeGridWeek',
                }}
                height="100%"
                allDaySlot={false}
                slotDuration="00:30:00"
                slotLabelFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
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
                events={async (fetchInfo) => {
                  const token = localStorage.getItem('accessToken');
                  try {
                    const res = await axios.get(
                      'http://127.0.0.1:8000/api/creneaux-occupes',
                      {
                        params: {
                          start: fetchInfo.start.valueOf(),
                          end: fetchInfo.end.valueOf(),
                        },
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                    const now = new Date();
                    return res.data
                      .filter((c) => new Date(c.fin) > now)

                      .map((c) => {
                        const slotStart = new Date(c.debut);
                        const isPast = slotStart < now;

                        return {
                          id: c.id,
                          title: isPast
                            ? 'Passé'
                            : c.disponible
                            ? 'Disponible'
                            : 'Occupé',
                          start: c.debut,
                          end: c.fin,
                          color: isPast
                            ? '#9CA3AF'
                            : c.disponible
                            ? '#10B981'
                            : '#EF4444',
                          textColor: isPast
                            ? '#6B7280'
                            : c.disponible
                            ? '#065F46'
                            : 'black',
                          borderColor: 'transparent',
                          extendedProps: {
                            disponible: isPast ? false : c.disponible,
                          },
                        };
                      });
                  } catch (error) {
                    console.error('Erreur de chargement des créneaux:', error);
                    return [];
                  }
                }}
                locale="fr"
                firstDay={1}
                weekends={false}
                businessHours={{
                  daysOfWeek: [1, 2, 3, 4, 5],
                  startTime: '08:00',
                  endTime: '18:00',
                }}
                dayHeaderFormat={{
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                }}
                hiddenDays={[0, 6]}
                nowIndicator={true}
                unselectAuto={false}
              />
            </div>
          </div>

          {/* Selected Slot Info */}
          {selectedSlot && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Créneau sélectionné
                  </p>
                  <p className="text-xs text-blue-500">
                    {selectedSlot.display} •{' '}
                    {new Date(selectedSlot.start).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(selectedSlot.end).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Section */}
          <div className="space-y-3">
            <h3 className="text-md font-semibold flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>Détails du rendez-vous</span>
            </h3>

            <div className="grid grid-cols-1 gap-3">
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

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-2 border-t sticky bottom-0">
          <button
            type="button"
            onClick={handleClose}
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
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
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
  );
};

export default AddRdvModal;
