import React from 'react';
import { PhoneIcon,  BookmarkIcon, XCircleIcon, IdCard } from 'lucide-react';
export const CalendarHeader = () => {
  return <div className="px-6 py-4 flex flex-wrap gap-4">
      <StatCard icon={<PhoneIcon className="text-blue-500" size={20} />} title="Appels" count={0} color="bg-blue-50" />
      <StatCard icon={<IdCard className="text-green-500" size={23} />} title="Visites" count={0} color="bg-green-50" />
      <StatCard icon={<BookmarkIcon className="text-cyan-500" size={20} />} title="Réservations" count={0} color="bg-cyan-50" />
      <StatCard icon={<XCircleIcon className="text-red-500" size={20} />} title="Désistements" count={0} color="bg-red-50" />
    </div>;
};
const StatCard = ({
  icon,
  title,
  count,
  color
}) => {
  return <div className={`flex items-center p-4 rounded-xl shadow-sm ${color} flex-1 min-w-[180px]`}>
      <div className=" p-2 mr-3 rounded-full bg-white">{icon}</div>
      <div>
        <div className="text-2xl font-bold">{count}</div>
        <div className=" text-gray-600">{title}</div>
      </div>
    </div>;
};