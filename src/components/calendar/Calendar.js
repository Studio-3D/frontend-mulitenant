import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay, addDays, addWeeks, subDays, subWeeks, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarHeader } from './CalendarHeader';
import { CalendarSidebar } from './CalendarSidebar';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { ListView } from './ListView';
import axios from 'axios';
import { APIURL } from '../../configs/api';

const toTitleCase = (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
const getColor = (type) => {
  const colors = {
    1: '#FF5733',
    27: '#33FF57',
    // Add other type-color mappings as needed
  };
  return colors[type] || '#3385FF';
};

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState('month');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  // ... (keep your existing state declarations)
  const [numbre_appels, setNb_Appels] = useState(0)
  const [numbre_visites, setNb_Visites] = useState(0)
  const [numbre_reservations, setNb_Reservations] = useState(0)
  const [numbre_desistements, setNb_Desistement] = useState(0)
  const [obj_appels_mois, setObj_appels_mois] = useState(0)
  const [obj_visites_mois, setObj_visites_mois] = useState(0)
  const [obj_reservations_mois, setObj_reservations_mois] = useState(0)

  const [numbre_appels_month, setNb_Appels_month] = useState(0)
  const [numbre_visites_month, setNb_Visites_month] = useState(0)
  const [numbre_reservations_month, setNb_Reservations_month] = useState(0)
  const [numbre_desistements_month, setNb_Desistement_month] = useState(0)

  const [stats, setStats] = useState({
    calls: { current: 0, month: 0, objective: 0 },
    visits: { current: 0, month: 0, objective: 0 },
    reservations: { current: 0, month: 0, objective: 0 },
    cancellations: 0
  });

  const accessToken = localStorage.getItem('accessToken');
  const selectedProjet_id = JSON.parse(localStorage.getItem('selectedProjet'))?.id || 0;
  console.log('Token d\'accès:', accessToken);
  console.log('ID du projet sélectionné:', selectedProjet_id);

  useEffect(() => {
    fetchData();
  }, [selectedProjet_id, currentDate]); // Recharge les données quand le projet ou le mois change

  const fetchData = async () => {
  setLoading(true);
  try {
    console.log('Requête envoyée à:', `${APIURL.ROOTV1}/fullcalendar/${selectedProjet_id}/0`);
    
    const response = await axios.get(
      `${APIURL.ROOTV1}/fullcalendar/${selectedProjet_id}/0`, 
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    console.log('Réponse complète de l\'API:', response);
    
    if (!response.data) {
      throw new Error('Données de réponse vides');
    }

    const { data, ...statsData } = response.data;
    console.log('Données des événements du calendrier:', data);
    console.log('Statistiques du calendrier:', statsData);

    // Reste du code...
     setEvents(
        data.map(dt => ({
          type: dt.type,
          id: dt.id,
          title: toTitleCase(dt.description_type),
          backgroundColor: getColor(dt.type),
          borderColor: getColor(dt.type),
          start:
            dt.type == 1 || dt.type == 27
              ? format(new Date(dt.date), 'yyyy-MM-dd')
              : format(new Date(dt.date), 'yyyy-MM-dd H:m'),
          Allday: true,
          url: selectedProjet_id != 0 ? dt.lien : '#',
          deleted_at: dt.deleted_at,
          projet_code: dt.projet?.code,
          selectedProjet_id: selectedProjet_id
        }))
      )
      setNb_Appels(response.data.nb_appels_now)
      setNb_Visites(response.data.nb_visites_now)
      setNb_Reservations(response.data.nb_reservations_now)
      setNb_Desistement(response.data.nb_des_now)
      setObj_appels_mois(response.data.obj_mois_appels)
      setObj_visites_mois(response.data.obj_mois_visites)
      setObj_reservations_mois(response.data.obj_mois_reservations)
      setNb_Appels_month(response.data.nb_appels_month)
      setNb_Visites_month(response.data.nb_visites_month)
      setNb_Reservations_month(response.data.nb_reservations_month)
      setNb_Desistement_month(response.data.nb_des_month)

      setLoading(false) // Les données sont chargées, désactive le loading
    
  } catch (error) {
    console.error('Erreur détaillée du fetch:', {
      message: error.message,
      response: error.response,
      config: error.config
    });
    
    // Définit un état d'erreur à afficher à l'utilisateur
    setStats({
      calls: { current: -1, month: -1, objective: -1 },
      visits: { current: -1, month: -1, objective: -1 },
      reservations: { current: -1, month: -1, objective: -1 },
      cancellations: -1
    });
  } finally {
    setLoading(false);
  }
};
  // Navigation handlers for all views
  const nextPeriod = () => {
    if (activeView === 'day') {
      setCurrentDate(addDays(currentDate, 1));
    } else if (activeView === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const prevPeriod = () => {
    if (activeView === 'day') {
      setCurrentDate(subDays(currentDate, 1));
    } else if (activeView === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  // Enhanced renderCalendarDays function to include events
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const startDate = startOfMonth(currentDate);
    const startDay = getDay(startDate);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const days = [];
    
    // Previous month days
    const prevMonthDays = startDay === 0 ? 6 : startDay;
    for (let i = prevMonthDays; i > 0; i--) {
      const date = new Date(currentYear, currentMonth, -i + 1);
      days.push({
        date,
        isCurrentMonth: false,
        events: events.filter(event => 
          format(new Date(event.start), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        )
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      days.push({
        date,
        isCurrentMonth: true,
        events: events.filter(event => 
          format(new Date(event.start), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        )
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        events: events.filter(event => 
          format(new Date(event.start), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        )
      });
    }
    
    return days;
  };

  // Enhanced day cell rendering with event names and colors
  const renderDayCell = (day, index) => {
    const isToday = isSameDay(day.date, new Date());
    
    return (
      <div 
        key={index} 
        className={`
          min-h-[100px] p-2 border-b border-r hover:bg-gray-50 transition-colors
          ${!day.isCurrentMonth ? 'text-gray-400 bg-gray-50' : 'text-gray-800'}
          ${isToday ? 'bg-blue-50 font-bold' : ''}
          relative
        `}
      >
        <div className="text-right font-medium mb-1">
          {format(day.date, 'd')}
        </div>
        
        <div className="overflow-y-auto max-h-[80px]">
          {day.events.map((event, i) => (
            <div 
              key={i} 
              className="text-xs p-1 mb-1 rounded truncate"
              style={{ 
                backgroundColor: `${event.backgroundColor}20`, // Add opacity
                borderLeft: `3px solid ${event.backgroundColor}`,
                color: '#333'
              }}
              title={event.title}
            >
              {event.title}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Enhanced view rendering with proper navigation
  const renderView = () => {
    const views = {
      week: (
        <WeekView 
          currentDate={currentDate} 
          events={events} 
          onNext={nextPeriod}
          onPrev={prevPeriod}
          onToday={goToToday}
        />
      ),
      day: (
        <DayView 
          currentDate={currentDate} 
          events={events}
          onNext={nextPeriod}
          onPrev={prevPeriod}
          onToday={goToToday}
        />
      ),
      list: <ListView currentDate={currentDate} events={events} />,
      month: (
        <div className="calendar-grid">
          <div className="grid grid-cols-7 border-b">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day, i) => (
              <div key={i} className="py-2 text-center text-sm font-medium text-blue-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 grid-rows-6">
            {renderCalendarDays().map(renderDayCell)}
          </div>
        </div>
      )
    };
    
    return views[activeView] || [views.month];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden p-4">
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white">Chargement...</div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row">
        <CalendarSidebar stats={stats} />
        
        <div className="flex-1">
          <CalendarHeader />
          
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-b gap-4">
            <div className="flex items-center space-x-2">
              <button onClick={prevPeriod} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ChevronLeftIcon size={20} />
              </button>
              <button onClick={nextPeriod} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ChevronRightIcon size={20} />
              </button>
              <button onClick={goToToday} className="px-3 py-1 text-sm bg-cyan-100 rounded-md hover:bg-cyan-200 transition-colors">
                Aujourd'hui
              </button>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-800">
              {activeView === 'month' && format(currentDate, 'MMMM yyyy', { locale: fr })}
              {activeView === 'week' && `${format(startOfWeek(currentDate), 'd MMM')} - ${format(endOfWeek(currentDate), 'd MMM yyyy')}`}
              {activeView === 'day' && format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </h2>
            
            <div className="flex rounded-lg overflow-hidden bg-gray-100">
              {['month', 'week', 'day', 'list'].map(view => (
                <button
                  key={view}
                  className={`px-4 py-1 text-sm capitalize ${
                    activeView === view 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveView(view)}
                >
                  {view === 'month' ? 'Mois' : 
                   view === 'week' ? 'Semaine' : 
                   view === 'day' ? 'Jour' : 'Liste'}
                </button>
              ))}
            </div>
          </div>
          
          {renderView()}
        </div>
      </div>
    </div>
  );
};