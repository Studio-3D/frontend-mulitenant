export default function BienSuperficies({ bien }) {
  // Render nothing if there's no bien
  if (!bien) return null;
  
  // Format area with m²
  const formatArea = (value) => {
    if (value === null || value === undefined || value === 0 || value === "0" || value === "000") return '0 m²';
    return `${value} m²`;
  };

  // Helper function to check if a value should be displayed
  const shouldDisplay = (value) => {
    return value !== null && value !== undefined && value !== 0 && value !== "0" && value !== "000";
  };

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="border-b border-gray-200 px-6 py-4 bg-blue-50">
        <h2 className="text-lg font-medium !text-blue-700">Superficies du bien</h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main areas */}
          <div>
            <h3 className="text-sm font-medium !text-gray-500">Superficie habitable</h3>
            <p className="mt-1 font-medium">{formatArea(bien.superficie_habitable)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium !text-gray-500">Superficie architecte</h3>
            <p className="mt-1">{formatArea(bien.superficie_architecte)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium !text-gray-500">Superficie vendable</h3>
            <p className="mt-1 font-medium">{formatArea(bien.superficie_vendable)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium !text-gray-500">Superficie totale</h3>
            <p className="mt-1">{formatArea(bien.superficie_total)}</p>
          </div>
          
          {/* Terrasse */}
          {(shouldDisplay(bien.superficie_terrasse) || shouldDisplay(bien.superficie_terrasse_calculer)) && (
            <>
              {shouldDisplay(bien.superficie_terrasse) && (
                <div>
                  <h3 className="text-sm font-medium !text-gray-500">Superficie terrasse</h3>
                  <p className="mt-1">{formatArea(bien.superficie_terrasse)}</p>
                </div>
              )}
              
              {shouldDisplay(bien.superficie_terrasse_calculer) && (
                <div>
                  <h3 className="text-sm font-medium !text-gray-500">Superficie terrasse calculée</h3>
                  <p className="mt-1">{formatArea(bien.superficie_terrasse_calculer)}</p>
                </div>
              )}
            </>
          )}
          
          {/* Balcon */}
          {(shouldDisplay(bien.superficie_balcon) || shouldDisplay(bien.superficie_balcon_calculer)) && (
            <>
              {shouldDisplay(bien.superficie_balcon) && (
                <div>
                  <h3 className="text-sm font-medium !text-gray-500">Superficie balcon</h3>
                  <p className="mt-1">{formatArea(bien.superficie_balcon)}</p>
                </div>
              )}
              
              {shouldDisplay(bien.superficie_balcon_calculer) && (
                <div>
                  <h3 className="text-sm font-medium !text-gray-500">Superficie balcon calculée</h3>
                  <p className="mt-1">{formatArea(bien.superficie_balcon_calculer)}</p>
                </div>
              )}
            </>
          )}
          
          {/* Jardin */}
          {(shouldDisplay(bien.superficie_jardin) || shouldDisplay(bien.superficie_jardin_calculer)) && (
            <>
              {shouldDisplay(bien.superficie_jardin) && (
                <div>
                  <h3 className="text-sm font-medium !text-gray-500">Superficie jardin</h3>
                  <p className="mt-1">{formatArea(bien.superficie_jardin)}</p>
                </div>
              )}
              
              {shouldDisplay(bien.superficie_jardin_calculer) && (
                <div>
                  <h3 className="text-sm font-medium !text-gray-500">Superficie jardin calculée</h3>
                  <p className="mt-1">{formatArea(bien.superficie_jardin_calculer)}</p>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Parking and Box section */}
        {(shouldDisplay(bien.num_parking) || shouldDisplay(bien.superficie_parking) || shouldDisplay(bien.prix_parking) || 
          shouldDisplay(bien.num_box) || shouldDisplay(bien.superficie_box) || shouldDisplay(bien.prix_box)) && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Parking et Box</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Parking */}
              {shouldDisplay(bien.num_parking) && (
                <div>
                  <h4 className="text-sm font-medium !text-gray-500">Numéro parking</h4>
                  <p className="mt-1">{bien.num_parking}</p>
                </div>
              )}
              
              {shouldDisplay(bien.superficie_parking) && (
                <div>
                  <h4 className="text-sm font-medium !text-gray-500">Superficie parking</h4>
                  <p className="mt-1">{formatArea(bien.superficie_parking)}</p>
                </div>
              )}
              
              {shouldDisplay(bien.prix_parking) && (
                <div>
                  <h4 className="text-sm font-medium !text-gray-500">Prix parking</h4>
                  <p className="mt-1">{bien.prix_parking.toLocaleString('fr-FR')} Dhs</p>
                </div>
              )}
              
              {/* Box */}
              {shouldDisplay(bien.num_box) && (
                <div>
                  <h4 className="text-sm font-medium !text-gray-500">Numéro box</h4>
                  <p className="mt-1">{bien.num_box}</p>
                </div>
              )}
              
              {shouldDisplay(bien.superficie_box) && (
                <div>
                  <h4 className="text-sm font-medium !text-gray-500">Superficie box</h4>
                  <p className="mt-1">{formatArea(bien.superficie_box)}</p>
                </div>
              )}
              
              {shouldDisplay(bien.prix_box) && (
                <div>
                  <h4 className="text-sm font-medium !text-gray-500">Prix box</h4>
                  <p className="mt-1">{bien.prix_box.toLocaleString('fr-FR')} Dhs</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}