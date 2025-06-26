import React, { useState } from 'react';
import { StatCard } from './StatCard';
import { DateFilter } from './DateFilter';
import { AreaChart } from './charts/AreaCharts';
import { BarChart } from './charts/BarChart';
import { PieChart } from './charts/PieChart';
import { startOfMonth, endOfMonth, format, subDays } from 'date-fns';
import {
  AlertCircleIcon,
  ThumbsUpIcon,
  BanknoteIcon,
  UsersIcon,
  UserPlusIcon,
  PhoneCallIcon,
  ArrowDownIcon,
} from 'lucide-react';

export const Dashboard = () => {
  const today = new Date();
  const [startDate, setStartDate] = useState(startOfMonth(today));
  const [endDate, setEndDate] = useState(endOfMonth(today));
  
  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">
          Aperçu Général
        </h2>
        <DateFilter
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateChange}
        />
      </div>
      <div className="relative mb-6">
        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-4 snap-x scrollbar-none">
          <div className="flex gap-4 xl:gap-[46px] min-w-max">
            <div className="w-72 sm:w-auto snap-start">
              <StatCard
                title="Pénalité"
                value="845"
                change="+12.5%"
                isPositive={false}
                icon={<AlertCircleIcon className="w-5 h-5" />}
                color="bg-gradient-to-r from-red-400 to-red-500"
              />
            </div>
            <div className="w-72 sm:w-auto snap-start">
              <StatCard
                title="Bien Vendu"
                value="1,257"
                change="+8.2%"
                isPositive={true}
                icon={<ThumbsUpIcon className="w-5 h-5" />}
                color="bg-gradient-to-r from-green-400 to-green-500"
              />
            </div>
            <div className="w-72 sm:w-auto snap-start">
              <StatCard
                title="Encaissement"
                value="12,348 €"
                change="+4.4%"
                isPositive={true}
                icon={<BanknoteIcon className="w-5 h-5" />}
                color="bg-gradient-to-r from-blue-400 to-blue-500"
              />
            </div>
            <div className="w-72 sm:w-auto snap-start">
              <StatCard
                title="Visites"
                value="324"
                change="+1.1%"
                isPositive={true}
                icon={<UsersIcon className="w-5 h-5" />}
                color="bg-gradient-to-r from-purple-400 to-purple-500"
              />
            </div>
            <div className="w-72 sm:w-auto snap-start">
              <StatCard
                title="Prospects"
                value="156"
                change="+2.3%"
                isPositive={true}
                icon={<UserPlusIcon className="w-5 h-5" />}
                color="bg-gradient-to-r from-orange-400 to-orange-500"
              />
            </div>
            <div className="w-72 sm:w-auto snap-start">
              <StatCard
                title="Appels"
                value="892"
                change="+5.7%"
                isPositive={true}
                icon={<PhoneCallIcon className="w-5 h-5" />}
                color="bg-gradient-to-r from-teal-400 to-teal-500"
              />
            </div>
          </div>
        </div>
        <div className="absolute left-0 right-0 bottom-0 h-4 bg-gradient-to-t from-gray-50 pointer-events-none sm:hidden"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Tendance des Ventes
          </h3>
          <AreaChart startDate={startDate} endDate={endDate} />
        </div>
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Utilisateurs par Source
          </h3>
          <BarChart startDate={startDate} endDate={endDate} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4 md:p-6 lg:col-span-1">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Visites</h3>
          <div className="h-80">
            <PieChart startDate={startDate} endDate={endDate} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 md:p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Remboursement
          </h3>
          <AreaChart startDate={startDate} endDate={endDate} />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Désistement</h3>
          <span className="text-sm text-gray-500">
            Total: {Math.floor(Math.random() * 50 + 100)} cas
          </span>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${['bg-red-100', 'bg-orange-100', 'bg-yellow-100', 'bg-gray-100'][item - 1]}`}
                >
                  <ArrowDownIcon
                    className={`w-5 h-5 ${['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-gray-600'][item - 1]}`}
                  />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-800">
                    {
                      [
                        'Raison personnelle',
                        'Changement de situation',
                        'Insatisfaction',
                        'Autre motif',
                      ][item - 1]
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(subDays(new Date(), item), 'PPp')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {[15, 12, 8, 5][item - 1]} cas
                </p>
                <p
                  className={`text-xs ${['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-gray-500'][item - 1]}`}
                >
                  {['+25%', '+10%', '-5%', '-15%'][item - 1]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};