import { useState, useEffect } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';

const ObjectifFilter = ({ onSubmit, onClose, initialValues = {} }) => {
  const [filterValues, setFilterValues] = useState({
    user: initialValues.user || '',
    date: initialValues.date || '',
    projet_id: initialValues.projet_id || ''
  });
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch users for filtering
  useEffect(() => {
    const fetchUsers = async () => {
      const selectedProjet = JSON.parse(localStorage.getItem('selectedProjet'));
      if (!selectedProjet) return;
      
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(
          `${APIURL.ROOTV1}/commerciaux_objectif/${selectedProjet.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setUsers(response.data.users || []);
      } catch (error) {
        console.error('Error fetching users for filter:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
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
    setFilterValues({ user: '', date: '', projet_id: '' });
    onSubmit({ user: '', date: '', projet_id: '' });
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Filtrer les objectifs</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block !text-gray-700 text-sm font-medium mb-2">
              Commercial :
            </label>
            <select
              name="user"
              value={filterValues.user}
              onChange={handleChange}
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 !text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Tous les commerciaux</option>
              {users.map(user => (
                <option key={user.user_id} value={user.user_id}>
                  {user.user?.name} {user.user?.prenom}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block !text-gray-700 text-sm font-medium mb-2">
              Date :
            </label>
            <input
              type="date"
              name="date"
              value={filterValues.date}
              onChange={handleChange}
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 !text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded"
          >
            Réinitialiser
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Appliquer
          </button>
        </div>
      </form>
    </div>
  );
};

export default ObjectifFilter;
