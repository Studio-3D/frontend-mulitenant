import { useState } from 'react';

const TypologieFilter = ({ onSubmit, onClose, initialValues = {} }) => {
  const [filterValues, setFilterValues] = useState({
    typologie: initialValues.typologie || '',
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
    setFilterValues({ typologie: '' });
    onSubmit({ typologie: '' });
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Filtrer les typologies</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block !text-gray-700 text-sm font-bold mb-2">
            Typologie :
          </label>
          <input
            type="text"
            name="typologie"
            value={filterValues.typologie}
            onChange={handleChange}
            className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 !text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Filtrer par typologie"
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

export default TypologieFilter;
