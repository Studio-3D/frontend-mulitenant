import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay } from 'date-fns';
import { CalendarHeader } from './CalendarHeader';
import { CalendarSidebar } from './CalendarSidebar';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { ListView } from './ListView';
import axios from 'axios';
import { APIURL } from '../../configs/api';


// Helper functions (should be defined or imported)
const toTitleCase = (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
const getColor = (type) => {
  const colors = {
    1: '#FF5733',
    27: '#33FF57',
    // Add other type-color mappings
  };
  return colors[type] || '#3385FF';
};

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState('month');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
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
  console.log('Access token:', accessToken);
  console.log('Selected project ID:', selectedProjet_id);

  useEffect(() => {
    fetchData();
  }, [selectedProjet_id, currentDate]); // Refetch when project or month changes

  const fetchData = async () => {
  setLoading(true);
  try {
    console.log('Making request to:', `${APIURL.ROOTV1}/fullcalendar/${selectedProjet_id}/0`);
    
    const response = await axios.get(
      `${APIURL.ROOTV1}/fullcalendar/${selectedProjet_id}/0`, 
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    console.log('Full API response:', response);
    
    if (!response.data) {
      throw new Error('Empty response data');
    }

    const { data, ...statsData } = response.data;
    console.log('Calendar events data:', data);
    console.log('Calendar stats data:', statsData);

    // Rest of your code...
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

      setLoading(false) // Data is loaded, set loading to false
    
  } catch (error) {
    console.error('Detailed fetch error:', {
      message: error.message,
      response: error.response,
      config: error.config
    });
    
    // Set some error state to display to the user
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

  // Navigation handlers
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const startDate = startOfMonth(currentDate);
    const startDay = getDay(startDate);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const days = [];
    
    // Previous month's days
    const prevMonthDays = startDay === 0 ? 6 : startDay; // Handle Sunday start
    for (let i = prevMonthDays; i > 0; i--) {
      days.push({
        date: new Date(currentYear, currentMonth, -i + 1),
        isCurrentMonth: false
      });
    }
    
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(currentYear, currentMonth, i),
        isCurrentMonth: true,
        hasEvents: events.some(event => 
          format(new Date(event.start), 'yyyy-MM-dd') === format(new Date(currentYear, currentMonth, i), 'yyyy-MM-dd')
        )
      });
    }
    
    // Next month's days to complete grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(currentYear, currentMonth + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const renderDayCell = (day, index) => (
    <div 
      key={index} 
      className={`
        min-h-[100px] p-2 border-b border-r hover:bg-gray-50 transition-colors
        ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-800'}
        ${format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'bg-blue-50' : ''}
      `}
    >
      <div className="text-right font-medium">
        {format(day.date, 'd')}
        {day.hasEvents && (
          <span className="ml-1 w-2 h-2 inline-block rounded-full bg-blue-500"></span>
        )}
      </div>
      {/* Add event indicators here */}
    </div>
  );

  const renderView = () => {
    const views = {
      week: <WeekView currentDate={currentDate} events={events} />,
      day: <DayView currentDate={currentDate} events={events} />,
      list: <ListView currentDate={currentDate} events={events} />,
      month: (
        <div className="calendar-grid">
          <div className="grid grid-cols-7 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
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
    
    return views[activeView] || views.month;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden p-4">
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white">Loading...</div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row">
        <CalendarSidebar stats={stats} />
        
        <div className="flex-1">
          <CalendarHeader />
          
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-b gap-4">
            <div className="flex items-center space-x-2">
              <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ChevronLeftIcon size={20} />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ChevronRightIcon size={20} />
              </button>
              <button onClick={goToToday} className="px-3 py-1 text-sm bg-cyan-100 rounded-md hover:bg-gray-300 transition-colors">
                Aujourd'hui
              </button>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-800">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            
            <div className="flex rounded-lg overflow-hidden bg-gray-100">
              {['Mois', 'Semaine', 'Jour', 'Liste'].map(view => (
                <button
                  key={view}
                  className={`px-4 py-1 text-sm capitalize ${
                    activeView === view 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveView(view)}
                >
                  {view}
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