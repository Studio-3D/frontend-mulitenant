'use client';

import { useEffect, useState,useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import { isAdmin, isComptable, isSuperAdmin } from '@/configs/enum';
import LoadingSpin from '@/components/LoadingSpin';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import { toast } from 'react-hot-toast';
import { 
  Euro, 
  FileText, 
  Key, 
  Percent,
  TrendingUp,
  Building2,
  Home,
  FileBarChart,
  Download,
  Calendar,
  Hash,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Landmark
} from 'lucide-react';

const RapportPage = () => {
  const [data, setData] = useState(null);
  const { user } = useAuth();
  const { selectedProjet } = useProjet();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');

  // Check user permissions and project selection
  useEffect(() => {
    if (user && !isAdmin(user.role) && !isSuperAdmin(user.role) && !isComptable(user.role)) {
      router.push('/home');
    }
    
    // Set current date
    const date = new Date();
    setCurrentDate(date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
  }, [user, router]);

  // Fetch data based on filters
  const fetchData = async () => {
    if (!selectedProjet?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await axios.get(
        `${APIURL.ROOTV1}/projets/${selectedProjet.id}/rapports`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const { data } = response;
      setData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching rapport data:', error);
      toast.error('Erreur lors du chargement des données');
      setLoading(false);
    }
  };

  // Update effect to fetch data when project changes
  useEffect(() => {
    if (selectedProjet?.id) {
      fetchData();
    }
  }, [selectedProjet?.id]);

    // Add this near your other state variables or in the render section
const propertyFields = useMemo(() => {
  if (!data) return [];
  return Object.entries(data)
    .filter(([key]) => key.startsWith('nb_') && key.endsWith('_vendu'))
    .map(([key, value]) => ({
      key,
      value,
      typeName: key
        .replace('nb_', '')
        .replace('_vendu', '')
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }));
}, [data]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate percentage
  const calculatePercentage = (partial, total) => {
    if (total === 0) return 0;
    return ((partial / total) * 100).toFixed(1);
  };

  if (!user || !selectedProjet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              Rapport Financier
            </h1>
            <div className="flex flex-wrap gap-4 text-gray-600">
              <div className="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
                <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                <span className="font-medium">{data?.projet_nom}</span>
              </div>
              <div className="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
                <Hash className="w-5 h-5 mr-2 text-blue-600" />
                <span>Code: {data?.projet_code}</span>
              </div>
              <div className="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                <span className="text-sm text-gray-600">
                  {currentDate}
                </span>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-lg px-6 py-4 border border-blue-100">
            <div className="text-sm text-gray-600 mb-1">Taux de réalisation</div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-blue-600">
                {calculatePercentage(data?.sum_encaissement, data?.sum_prix)}%
              </span>
              {calculatePercentage(data?.sum_encaissement, data?.sum_prix) > 50 ? (
                <ArrowUpRight className="w-6 h-6 text-green-500" />
              ) : (
                <ArrowDownRight className="w-6 h-6 text-orange-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {/* Total Price Card */}
        <div className="group bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Euro className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
              Total Ventes
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">
            {formatCurrency(data?.sum_prix || 0)}
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
            Prix total des biens vendus
          </div>
        </div>

        {/* Total Collections Card */}
        <div className="group bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
              Encaissements
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">
            {formatCurrency(data?.sum_encaissement || 0)}
          </div>
          <div className="text-sm text-gray-500">
            Total des encaissements (Avances & Penalites)
          </div>
        </div>

        {/* Remaining Balance Card */}
      

        {/* Advances Card */}
        <div className="group bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Landmark className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
              Avances
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">
            {formatCurrency(data?.sum_avances || 0)}
          </div>
          <div className="text-sm text-gray-500">
            Total des avances reçues
          </div>
        </div>
          <div className="group bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
              <Percent className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
              Solde Restant
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">
            {formatCurrency(data?.solde_restant || 0)}
          </div>
          <div className="text-sm text-gray-500">
            {calculatePercentage(data?.solde_restant, data?.sum_prix)}% du total
          </div>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        {/* Closed Files Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Dossiers Clôturés</div>
              <div className="text-3xl font-bold text-gray-800">{data?.nb_dos_cloturer || 0}</div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Key Handovers Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Remises de Clés</div>
              <div className="text-3xl font-bold text-gray-800">{data?.nb_remise_cles || 0}</div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Key className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Penalties Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Remboursements/Pénalités</div>
              <div className="text-3xl font-bold text-gray-800">
                {formatCurrency(data?.sum_remboursement_penalite || 0)}
              </div>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <FileBarChart className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Table Section */}
     {/* Detailed Table Section */}
<div className="bg-white rounded-xl shadow-lg overflow-hidden">
  <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
    <h2 className="text-xl font-semibold text-white flex items-center">
      <FileBarChart className="w-5 h-5 mr-2" />
      Détails des Biens Vendus par Type
    </h2>
    <span className="text-white/80 text-sm">
      {propertyFields.reduce((acc, field) => acc + field.value, 0)} total
    </span>
  </div>
  
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Type de Bien
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Nombre Vendus
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Pourcentage
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Distribution
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {propertyFields.map((field) => {
          const total = propertyFields.reduce((acc, f) => acc + f.value, 0);
          const percentage = total > 0 ? ((field.value / total) * 100).toFixed(1) : 0;
          
          return (
            <tr key={field.key} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <div className="flex items-center">
                  {field.typeName}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-semibold">
                {field.value}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                {percentage}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <div className="flex items-center justify-end">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
      
      {/* Dynamic Footer */}
      {/* Dynamic Footer */}

    </table>
  </div>
</div>

      {/* Export Button 
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => {
            toast.success('Préparation du rapport PDF...');
          }}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center shadow-lg hover:shadow-xl"
        >
          <Download className="w-5 h-5 mr-2" />
          Exporter le rapport (PDF)
        </button>
      </div>*/}
    </div>
  );
};

export default RapportPage;