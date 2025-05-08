import React from 'react';
import { CircleIcon, PhoneIcon, CalendarIcon, RefreshCwIcon } from 'lucide-react';
export const CalendarSidebar = () => {
  return <div className="w-full md:w-64 bg-white border-r p-4">
      <h2 className="text-lg font-medium mb-4">Today</h2>
      <div className="space-y-3">
        <SidebarItem icon={<CircleIcon size={16} className="text-green-500 fill-green-500" />} text="Follow-up Calls" active={true} />
        <SidebarSubItem icon={<PhoneIcon size={16} />} text="Calls" />
        <SidebarItem icon={<CircleIcon size={16} className="text-blue-500 fill-blue-500" />} text="Follow-up Visits" />
        <SidebarSubItem icon={<CalendarIcon size={16} />} text="Visits" />
        <SidebarItem icon={<CircleIcon size={16} className="text-gray-500" />} text="Exchanges" />
      </div>
    </div>;
};
const SidebarItem = ({
  icon,
  text,
  active = false
}) => {
  return <div className={`flex items-center p-2 rounded-md ${active ? 'bg-gray-100' : 'hover:bg-gray-50'} cursor-pointer`}>
      <span className="mr-2">{icon}</span>
      <span className="font-medium">{text}</span>
    </div>;
};
const SidebarSubItem = ({
  icon,
  text
}) => {
  return <div className="flex items-center p-2 pl-6 rounded-md hover:bg-gray-50 cursor-pointer">
      <span className="mr-2 text-gray-500">{icon}</span>
      <span className="text-gray-700">{text}</span>
    </div>;
};