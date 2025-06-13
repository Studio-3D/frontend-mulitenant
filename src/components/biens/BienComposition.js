import { useState, useEffect } from "react";
import axios from "axios";
import { APIURL } from "@/configs/api";

export default function BienComposition({ bien }) {
  const [compositionData, setCompositionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If no property data, don't try to fetch
    if (!bien || !bien.id) {
      setLoading(false);
      return;
    }
    
    const fetchComposition = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        // Use the correct API endpoint format
        const response = await axios.get(`${APIURL.ROOTV1}/compositionBiens`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { 
            page: 1, 
            size: 5, 
            bien_id: bien.id,
            nbre_balcons: '',
            nbre_buanderies: '',
            nbre_chambres: '',
            nbre_cuisines: '',
            nbre_salons: ''
          }
        });
        
        if (response.data && response.data.compositionBiens && response.data.compositionBiens.length > 0) {
          // Take the first composition data since we're only displaying one
          setCompositionData(response.data.compositionBiens[0]);
        } else {
          // If no composition data, just use the data from the bien object if available
          setCompositionData({
            nbre_chambres: bien.nbre_chambres || 0,
            nbre_salons: bien.nbre_salons || 0,
            nbre_sdb: bien.nbre_sdb || 0,
            nbre_cuisines: bien.nbre_cuisines || 0,
            nbre_terasses: bien.nbre_terasses || 0,
            nbre_balcons: bien.nbre_balcons || 0,
            nbre_halls: bien.nbre_halls || 0,
            nbre_receptions: bien.nbre_receptions || 0,
            nbre_buanderies: bien.nbre_buanderies || 0,
            nbre_placards: bien.nbre_placards || 0
          });
        }
      } catch (err) {
        console.error("Error fetching composition data:", err);
        setError("Impossible de charger les données de composition");
        
        // Fall back to bien data if API call fails
        setCompositionData({
          nbre_chambres: bien.nbre_chambres || 0,
          nbre_salons: bien.nbre_salons || 0,
          nbre_sdb: bien.nbre_sdb || 0,
          nbre_cuisines: bien.nbre_cuisines || 0,
          nbre_terasses: bien.nbre_terasses || 0,
          nbre_balcons: bien.nbre_balcons || 0,
          nbre_halls: bien.nbre_halls || 0,
          nbre_receptions: bien.nbre_receptions || 0,
          nbre_buanderies: bien.nbre_buanderies || 0,
          nbre_placards: bien.nbre_placards || 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchComposition();
  }, [bien]);

  // Display loading state while fetching data
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md !text-red-700">
        <p>{error}</p>
      </div>
    );
  }
  
  // Check if there's any composition data to display
  const hasComposition = compositionData && (
    (compositionData.nbre_chambres && compositionData.nbre_chambres > 0) || 
    (compositionData.nbre_salons && compositionData.nbre_salons > 0) || 
    (compositionData.nbre_sdb && compositionData.nbre_sdb > 0) || 
    (compositionData.nbre_cuisines && compositionData.nbre_cuisines > 0) || 
    (compositionData.nbre_terasses && compositionData.nbre_terasses > 0) || 
    (compositionData.nbre_balcons && compositionData.nbre_balcons > 0) || 
    (compositionData.nbre_halls && compositionData.nbre_halls > 0) || 
    (compositionData.nbre_receptions && compositionData.nbre_receptions > 0) || 
    (compositionData.nbre_buanderies && compositionData.nbre_buanderies > 0) || 
    (compositionData.nbre_placards && compositionData.nbre_placards > 0)
  );

  // If no composition data, show a message
  if (!hasComposition) {
    return (
      <div className="text-center py-8 !text-gray-500">
        <p>Aucune information de composition disponible pour ce bien.</p>
      </div>
    );
  }

  // Structure to define all possible composition elements and their icons
  const compositionItems = [
    {
      field: 'nbre_chambres',
      label: 'Chambres',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 !text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      field: 'nbre_salons',
      label: 'Salons',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 !text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      field: 'nbre_sdb',
      label: 'Salles de bain',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 !text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      field: 'nbre_cuisines',
      label: 'Cuisines',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 !text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    },
    {
      field: 'nbre_terasses',
      label: 'Terrasses',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 !text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      field: 'nbre_balcons',
      label: 'Balcons',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 !text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      field: 'nbre_halls',
      label: 'Halls',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 !text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      field: 'nbre_receptions',
      label: 'Réceptions',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 !text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      field: 'nbre_buanderies',
      label: 'Buanderies',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 !text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      )
    },
    {
      field: 'nbre_placards',
      label: 'Placards',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 !text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      )
    }
  ];

  // Filter out items that have value of 0 or are not present
  const presentItems = compositionItems.filter(item => 
    compositionData[item.field] && compositionData[item.field] > 0
  );

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="p-6">
        {presentItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {presentItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-medium !text-gray-500">{item.label}</h3>
                  <p className="mt-1 font-medium !text-gray-900">
                    {compositionData[item.field]} {compositionData[item.field] > 1 ? 'pièces' : 'pièce'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 !text-gray-500">
            <p>Aucune information de composition disponible pour ce bien.</p>
          </div>
        )}
      </div>
    </div>
  );
}
