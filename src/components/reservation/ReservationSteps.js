import { useState, useEffect, useRef } from 'react';

export default function ReservationSteps({
  reservation,

}) {
  // State for hover tooltip
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [shouldScroll, setShouldScroll] = useState(false);
  const [filteredHistorique, setFilteredHistorique] = useState([]);
  const containerRef = useRef(null);

  // Function to get action label
  const getActionLabel = (action) => {
    const cleanAction = action?.toString().trim();
    
    const actionLabels = {
      '1': 'En attente',
      '2': 'Validation',
      '4': 'Rejet',
      '5': 'Rejet-Relance',
      '6': 'Désistement défintif',
      '7': 'Désistement proche',
      '8': 'Désistement co Réservataire',
      '9': 'Désistement partiel',
      '10': 'Changement bien',
      '11': 'Attestation de Vente',
      '12': 'Contrat de Vente',
      '13':'Reconstitution Dossier'
    };
    
    return actionLabels[cleanAction] || `Action ${cleanAction}`;
  };

  // Function to get action color
  const getActionColor = (action) => {
    const cleanAction = action?.toString().trim();
    
    if (cleanAction === '4' || cleanAction === '5') {
      return 'bg-orange-500'; // Red for reject
    }
    
    if (['6', '7', '8', '9'].includes(cleanAction)) {
      return 'bg-red-500'; // Blue for desistement
    }
    
    return 'bg-green-500'; // Green for other actions
  };

  // Function to get short date
  const formatShortDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  // Function to get time
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  // Handle mouse enter for tooltip
  const handleMouseEnter = (item, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredItem(item);
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  // Process historique data in useEffect
  useEffect(() => {
    if (!reservation?.historiques || reservation.historiques.length === 0) {
      setFilteredHistorique([]);
      setShouldScroll(false);
      return;
    }

    // Filter out action '3' and sort by ID (oldest first for left-to-right display)
    const filtered = [...reservation.historiques]
      .filter(item => {
        const cleanAction = item.action?.toString().trim();
        return cleanAction !== '3';
      })
      .sort((a, b) => a.id - b.id);

    setFilteredHistorique(filtered);
    setShouldScroll(filtered.length > 8);
  }, [reservation]);

  // Check if historique data exists
  if (!reservation?.historiques || reservation.historiques.length === 0) {
    return (
      <div className="mt-6 text-center text-gray-500 text-sm">
        Aucun historique disponible
      </div>
    );
  }

  if (filteredHistorique.length === 0) {
    return (
      <div className="mt-6 text-center text-gray-500 text-sm">
        Aucun historique disponible (après filtrage)
      </div>
    );
  }

  // Calculate width based on number of items
  const minItemWidth = 120; // Minimum width for each item in pixels
  const totalMinWidth = filteredHistorique.length * minItemWidth;

  return (
    <div className="mt-6">
      {/* Horizontal Timeline Container with scrolling */}
      <div 
        ref={containerRef}
        className={`relative ${shouldScroll ? 'overflow-x-auto pb-4' : ''}`}
      >
        {/* Main horizontal line - FULL WIDTH, will extend with scroll */}
        <div 
          className="absolute h-0.5 bg-gray-300 top-4 z-0"
          style={{
            left: 0,
            right: 0,
            width: shouldScroll ? totalMinWidth : '100%',
            minWidth: '100%'
          }}
        ></div>
        
        {/* Timeline items container */}
        <div 
          className="relative"
          style={{ 
            width: shouldScroll ? totalMinWidth : '100%',
            minWidth: '100%'
          }}
        >
          <div className="flex items-start">
            {filteredHistorique.map((item, index) => (
              <div 
                key={item.id} 
                className="flex flex-col items-center px-2"
                style={{ 
                  minWidth: `${minItemWidth}px`,
                  width: shouldScroll ? `${minItemWidth}px` : 'auto',
                  flex: shouldScroll ? '0 0 auto' : '1',
                  position: 'relative'
                }}
                onMouseEnter={(e) => handleMouseEnter(item, e)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Action dot with cursor pointer */}
                <div
                  className={`w-8 h-8 rounded-full ${getActionColor(item.action)} flex items-center justify-center text-white text-sm font-bold z-10 border-2 border-white cursor-pointer hover:scale-110 transition-transform duration-200`}
                >
                  {index + 1}
                </div>
                
                {/* Date and Time */}
                <div className="mt-2 text-center">
                  <div className="text-xs font-medium text-gray-700 whitespace-nowrap">
                    {formatShortDate(item.created_at)}
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    {formatTime(item.created_at)}
                  </div>
                </div>
                
                {/* Action label */}
                <div className="mt-1 text-xs font-semibold text-gray-800 text-center truncate w-full">
                  {getActionLabel(item.action)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredItem && (
        <div 
          className="fixed z-50 bg-white border border-gray-300 rounded-md shadow-lg p-3 max-w-xs pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y - 10}px`,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          {/* Tooltip arrow */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-gray-300"></div>
          
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-3 h-3 rounded-full ${getActionColor(hoveredItem.action)}`}></div>
              <h4 className="font-bold text-gray-800 text-sm">
                {getActionLabel(hoveredItem.action)}
              </h4>
            </div>
            <div className="text-xs text-gray-500">
              {formatShortDate(hoveredItem.created_at)} à {formatTime(hoveredItem.created_at)}
            </div>
          </div>
          
          {/* Description */}
          {hoveredItem.description && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs font-medium text-gray-700 mb-1">Description:</div>
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                {typeof hoveredItem.description === 'string' 
                  ? hoveredItem.description
                  : JSON.stringify(hoveredItem.description, null, 2)}
              </div>
            </div>
          )}
          
          {/* User info */}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Par: {hoveredItem?.user?.name || 'N/A'}
            </div>
          </div>
        </div>
      )}

     
    </div>
  );
}