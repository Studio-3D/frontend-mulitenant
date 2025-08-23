import React from 'react';
import { PhoneIcon, BookmarkIcon, IdCard } from 'lucide-react';

export const CalendarHeaderObjectif = ({
  user_role,
  obj_appel,
  nb_appel,
  obj_res,
  nb_res,
  obj_visite,
  nb_visite,
}) => {
  return (
    <>
      <h5 style={{ color: '#666CFF', marginTop: '10px', marginLeft: '25px' }}>
        Ce Mois :{' '}
        {user_role <= 2 ? 'Chiffres/Objectifs' : 'Vos Chiffres/ Vos Objectifs'}
      </h5>
      <div className="px-6 py-4 flex flex-wrap gap-4">
        <StatCard
          icon={<PhoneIcon className="text-orange-500" size={20} />}
          title="Appels"
          obj={obj_appel}
          count={nb_appel}
          color="bg-orange-50"
        />
        <StatCard
          icon={<IdCard className="text-indigo-500" size={23} />}
          title="Visites"
          count={nb_visite}
          obj={obj_visite}
          color="bg-indigo-50"
        />
        <StatCard
          icon={<BookmarkIcon className="text-red-500" size={20} />}
          title="Réservations"
          count={nb_res}
          obj={obj_res}
          color="bg-red-50"
        />
      </div>
    </>
  );
};
const StatCard = ({ icon, title, count, obj, color }) => {
  return (
    <div
      className={`flex items-center p-4 rounded-xl shadow-sm ${color} flex-1 min-w-[180px]`}
    >
      <div className=" p-2 mr-3 rounded-full bg-white">{icon}</div>
      <div>
        <div className="text-2xl font-bold">
          {count}
          {obj != null && '/' + obj}
        </div>
        <div className=" text-gray-600">{title}</div>
      </div>
    </div>
  );
};
