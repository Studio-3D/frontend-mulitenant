import { useState } from 'react';

const PartenaireFilter = ({ onSubmit, onClose, initialValues = {} }) => {
  const [filterValues, setFilterValues] = useState({
    description: initialValues.description || '',
    remise: initialValues.remise || '',
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilterValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(filterValues);
  };
  
  const handleReset = () => {
    setFilterValues({ description: '', remise: '' });
    onSubmit({ description: '', remise: '' });
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Filtrer les partenaires</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Description :
          </label>
          <input
            type="text"
            name="description"
            value={filterValues.description}
            onChange={handleChange}
            className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Filtrer par description"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Remise (%) :
          </label>
          <input
            type="number"
            name="remise"
            value={filterValues.remise}
            onChange={handleChange}
            className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Filtrer par remise"
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-300 hover:bg-gray-400 text-black py-1 px-4 rounded"
          >
            Réinitialiser
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-4 rounded"
          >
            Appliquer
          </button>
        </div>
      </form>
    </div>
  );
};

export default PartenaireFilter;
