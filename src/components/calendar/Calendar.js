import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  format,
  addMonths,
  subMonths,
  getDaysInMonth,
  startOfMonth,
  getDay,
  addDays,
  addWeeks,
  subDays,
  subWeeks,
  startOfWeek,
  endOfWeek,
  isSameDay,
  parseISO,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarHeader } from './CalendarHeader';
import { CalendarHeaderObjectif } from './CalendarHeaderObjectif';

import { CalendarSidebar } from './CalendarSidebar';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Eye,
  Folder,
  Icon,
  User,
  Users,
} from 'lucide-react';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { ListView } from './ListView';
import axios from 'axios';
import { APIURL } from '../../configs/api';
import {
  EVENT_TYPES,
  getEventColor,
  getEventCategory,
  SIDEBAR_ITEMS,
} from './calendar-constants';
import LoadingSpin from '@/components/LoadingSpin';
import { isAdmin, isSuperAdmin,isCommercial } from '@/configs/enum';
import { useRouter } from 'next/navigation';
const toTitleCase = (str) =>
  str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );

import { useAuth } from '../../context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import { useSociete } from '@/context/SocieteContext';
export const Calendar = () => {
     const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState(user?.role == 3 ? -1 : 0); // Set initial tab to user ID
  const [change, setChange] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState('month');
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [numbre_appels, setNb_Appels] = useState(0);
  const [numbre_visites, setNb_Visites] = useState(0);
  const [numbre_reservations, setNb_Reservations] = useState(0);
  const [numbre_desistements, setNb_Desistement] = useState(0);

  /***Objectifs */
  const [obj_appels_mois, setObj_appels_mois] = useState(0);
  const [obj_visites_mois, setObj_visites_mois] = useState(0);
  const [obj_reservations_mois, setObj_reservations_mois] = useState(0);

  const [numbre_appels_month, setNb_Appels_month] = useState(0);
  const [numbre_visites_month, setNb_Visites_month] = useState(0);
  const [numbre_reservations_month, setNb_Reservations_month] = useState(0);

  const [stats, setStats] = useState({
    calls: { current: 0, month: 0, objective: 0 },
    visits: { current: 0, month: 0, objective: 0 },
    reservations: { current: 0, month: 0, objective: 0 },
    cancellations: 0,
  });

  const accessToken = localStorage.getItem('accessToken');
  const { selectedProjet  } = useProjet();
  const { selectedSociete } = useSociete();
  const selectedProjet_id =selectedProjet?.id

  const hasExecuted = useRef(false);
const userRole = user?.role;
    
      useEffect(() => {
        if (
          user && 
          !isAdmin(userRole) &&
          !isSuperAdmin(userRole) &&
          !isCommercial(userRole)
        ) {
          router.push('/');
        }else{
     fetchData(activeTab);

        }
      }, [user, userRole, router,selectedProjet_id, currentDate, activeTab]);

  useEffect(() => {
    if (user?.role >= 2) {
      fetchUsers();
      hasExecuted.current = true;
    }
  }, [selectedSociete]);
 
  useEffect(() => {
    const filtered = applyFilter(events, activeFilter);
    setFilteredEvents(filtered);
  }, [activeFilter, events]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${APIURL.ROOTV1}/commerciaux/` + selectedProjet_id,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const responseData = response.data;
      console.log('Users data:', responseData.data);
      setUsers(responseData.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchData = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${APIURL.ROOTV1}/fullcalendar/${selectedProjet_id}/${id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!response.data) throw new Error('Données de réponse vides');

      const { data, ...statsData } = response.data;
      setNb_Appels(response.data.nb_appels_now);
      setNb_Visites(response.data.nb_visites_now);
      setNb_Reservations(response.data.nb_reservations_now);
      setNb_Desistement(response.data.nb_des_now);

      /**Objectifss */

      setObj_appels_mois(response.data.obj_mois_appels);
      setObj_visites_mois(response.data.obj_mois_visites);
      setObj_reservations_mois(response.data.obj_mois_reservations);
      setNb_Appels_month(response.data.nb_appels_month);
      setNb_Visites_month(response.data.nb_visites_month);
      setNb_Reservations_month(response.data.nb_reservations_month);
      const allEvents = data.map((dt) => {
        let eventDate = dt.date;

        if (!dt.date.includes('T')) {
          eventDate = dt.date + 'T00:00:00';
        }

        if (dt.date.includes('.') && dt.date.split('.')[1].length > 3) {
          const parts = dt.date.split('.');
          eventDate = parts[0] + '.' + parts[1].substring(0, 3) + 'Z';
        }

        return {
          type: dt.type,
          id: dt.id,
          title: toTitleCase(dt.description_type),
          backgroundColor: getEventColor(dt.type),
          borderColor: getEventColor(dt.type),
          start: eventDate,
          allDay:
            !dt.date.includes('T') || dt.date.endsWith('T00:00:00.000000Z'),
          url: selectedProjet_id != 0 ? dt.lien : '#',
          deleted_at: dt.deleted_at,
          projet_code: dt.projet?.code,
          selectedProjet_id: selectedProjet_id,
          category: getEventCategory(dt.type),
        };
      });

      setEvents(allEvents);
    } catch (error) {
      console.error('Erreur:', error);
      setStats({
        calls: { current: -1, month: -1, objective: -1 },
        visits: { current: -1, month: -1, objective: -1 },
        reservations: { current: -1, month: -1, objective: -1 },
        cancellations: -1,
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = useMemo(() => {
    return (events, filter) => {
      if (filter === 'all') return events;
      return events.filter((event) => event.category === filter);
    };
  }, []);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // Navigation handlers
  const nextPeriod = () => {
    if (activeView === 'day') setCurrentDate(addDays(currentDate, 1));
    else if (activeView === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const prevPeriod = () => {
    if (activeView === 'day') setCurrentDate(subDays(currentDate, 1));
    else if (activeView === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  const handleEventClick = (event) => {
    if (event.url && event.url !== '#') {
      window.open(event.url, '_blank');
    }
  };

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
        events: filteredEvents.filter(
          (event) =>
            format(new Date(event.start), 'yyyy-MM-dd') ===
            format(date, 'yyyy-MM-dd')
        ),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      days.push({
        date,
        isCurrentMonth: true,
        events: filteredEvents.filter(
          (event) =>
            format(new Date(event.start), 'yyyy-MM-dd') ===
            format(date, 'yyyy-MM-dd')
        ),
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        events: filteredEvents.filter(
          (event) =>
            format(new Date(event.start), 'yyyy-MM-dd') ===
            format(date, 'yyyy-MM-dd')
        ),
      });
    }

    return days;
  };

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
              className="text-xs p-1 mb-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: `${event.backgroundColor}20`,
                borderLeft: `3px solid ${event.backgroundColor}`,
                color: '#333',
              }}
              title={`${event.title}${
                event.projet_code ? ` (${event.projet_code})` : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleEventClick(event);
              }}
            >
              {event.title}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderView = () => {
    const views = {
      week: (
        <WeekView
          currentDate={currentDate}
          events={filteredEvents}
          onNext={nextPeriod}
          onPrev={prevPeriod}
          onToday={goToToday}
        />
      ),
      day: (
        <DayView
          currentDate={currentDate}
          events={filteredEvents}
          onNext={nextPeriod}
          onPrev={prevPeriod}
          onToday={goToToday}
        />
      ),
      month: (
        <div className="calendar-grid">
          <div className="grid grid-cols-7 border-b">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day, i) => (
              <div
                key={i}
                className="py-2 text-center text-sm font-medium text-blue-500"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 grid-rows-6">
            {renderCalendarDays().map(renderDayCell)}
          </div>
        </div>
      ),
    };

    return views[activeView] || views.month;
  };

  const handleChange = (event, value) => {
    setActiveTab(value);
    // Don't call fetchData here, let the useEffect handle it
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden p-4">
      {loading && (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpin />
        </div>
      )}
  {(isAdmin(userRole) ||isCommercial(userRole)) && (
    <>
    
    
      {/* User tabs for role >= 2 */}
      {user?.role >= 2 && (
        <div className="w-full mb-4">
          <div className="w-full">
            <div className="w-full">
              <div className="flex overflow-x-auto border-b border-gray-200">
                {user?.role <= 2 && (
                  <>
                    <button
                      onClick={() => handleChange(null, 0)}
                      className={`flex items-center px-4 py-2 border-b-2 border-transparent whitespace-nowrap ${
                        activeTab === 0
                          ? 'border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Tous
                    </button>
                    <button
                      onClick={() => handleChange(null, user.id)}
                      className={`flex items-center px-4 py-2 border-b-2 border-transparent whitespace-nowrap ${
                        activeTab === user.id
                          ? 'border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Administrateur
                    </button>
                  </>
                )}

                {users?.map((key) => (
                  <button
                    key={key.user_id}
                    onClick={() => handleChange(null, key.user?.user_id_origin)}
                    className={`flex items-center px-4 py-2 border-b-2 border-transparent whitespace-nowrap ${
                      activeTab === key.user?.user_id_origin
                        ? 'border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {key.user?.name || 'Unknown User'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row">
        <CalendarSidebar
          onFilterChange={handleFilterChange}
          activeFilter={activeFilter}
        />

        <div className="flex-1">
          <CalendarHeader
            nb_appels_now={numbre_appels}
            nb_visites_now={numbre_visites}
            nb_res_now={numbre_reservations}
            nb_des_now={numbre_desistements}
          />
          {/*n'est pas admin et tous*/}
          {activeTab != user.id && activeTab != 0 && (
            <CalendarHeaderObjectif
              user_role={user.role} //commercial  Ce Mois: Vos Chiffres/ Vos Objectifs
              obj_appel={obj_appels_mois}
              nb_appel={numbre_appels_month}
              obj_res={obj_reservations_mois}
              nb_res={numbre_reservations_month}
              obj_visite={obj_visites_mois}
              nb_visite={numbre_visites_month}
            />
          )}
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-b gap-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={prevPeriod}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronLeftIcon size={20} />
              </button>
              <button
                onClick={nextPeriod}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronRightIcon size={20} />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm bg-cyan-100 rounded-md hover:bg-cyan-200 transition-colors"
              >
                Aujour{"d'"}hui
              </button>
            </div>

            <h2 className="text-xl font-semibold text-gray-800">
              {activeView === 'month' &&
                format(currentDate, 'MMMM yyyy', { locale: fr })}
              {activeView === 'week' &&
                `${format(startOfWeek(currentDate), 'd MMM')} - ${format(
                  endOfWeek(currentDate),
                  'd MMM yyyy'
                )}`}
              {activeView === 'day' &&
                format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </h2>

            <div className="flex rounded-lg overflow-hidden bg-gray-100">
              {['month', 'week', 'day'].map((view) => (
                <button
                  key={view}
                  className={`px-4 py-1 text-sm capitalize ${
                    activeView === view
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveView(view)}
                >
                  {view === 'month'
                    ? 'Mois'
                    : view === 'week'
                    ? 'Semaine'
                    : view === 'day'
                    ? 'Jour'
                    : 'Liste'}
                </button>
              ))}
            </div>
          </div>
          {renderView()}
        </div>
      </div>
    </>
  )}
    </div>
  );
};
