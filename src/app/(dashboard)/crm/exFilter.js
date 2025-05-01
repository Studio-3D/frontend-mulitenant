
















import Input from '@/components/Input';

  const [filters, setFilters] = useState({
    nom: '',
    prenom: '',
    cin: '',
    telephone: '',
    email: '',
    statut:'',
  });

  const [tempFilters, setTempFilters] = useState({ ...filters });
  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };
  const resetFilters = () => {
    const reset = Object.fromEntries(Object.keys(filters).map(key => [key, '']));
    setFilters(reset);
    setTempFilters(reset);
  };
  const applyFilters = () => {
    setFilters(tempFilters);
  };

  filters in fetchdata






  


  filterComponent={
              <div className="space-y-4 p-4 rounded-lg shadow-md">
                <div
                  className="grid gap-5"
                  style={{
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  }}
                >
                  {/* Champs de recherche */}
                  <Input
                    type="text"
                    placeholder="Cin..."
                    value={tempFilters.cin}
                    onChange={(e) => handleFilterChange('cin', e.target.value)}
                    className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                  />
                  <Input
                    type="text"
                    placeholder="Nom..."
                    value={tempFilters.nom}
                    onChange={(e) => handleFilterChange('nom', e.target.value)}
                    className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                  />
                  <Input
                    type="text"
                    placeholder="Prénom..."
                    value={tempFilters.prenom}
                    onChange={(e) => handleFilterChange('prenom', e.target.value)}
                    className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                  />
  
                  <Input
                    type="number"
                    placeholder="Téléphone..."
                    value={tempFilters.telephone}
                    onChange={(e) =>
                      handleFilterChange('telephone', e.target.value)
                    }
                    className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                  />
                   <Input
                    type="email"
                    placeholder="Email..."
                    value={tempFilters.email}
                    onChange={(e) =>
                      handleFilterChange('email', e.target.value)
                    }
                    className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                  />
                  <select
                    value={tempFilters.statut}
                    onChange={(e) => handleFilterChange('statut', e.target.value)}
                    className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                  >
                    <option value="" disabled>
                      Choisir un Statut
                    </option>
  
                    {Object.values(Statuts_Prospect).map((data) => (
                      <option key={data.id} value={data.id}>
                        {data.label}
                      </option>
                    ))}
                  </select>
                </div>
  
                {/* Boutons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={applyFilters}
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Appliquer les filtres
                  </button>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            }