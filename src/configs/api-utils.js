import axios from 'axios';
import { APIURL } from './api';
import toast from 'react-hot-toast';
import { Statuts_Prospect, User_roles } from './enum'; // Adjust the path as necessary
import { formatDate } from '../utils/dateUtils';

// Function to fetch data by project
export const fetchDataByProjet = async (items, setData, setLoading) => {
  const accessToken = localStorage.getItem('accessToken');
  const selectedProjet =
    JSON.parse(localStorage.getItem('selectedProjet')) || {}; // Ensure it's not null
  setLoading(true);
  try {
    const response = await axios.get(
      `${APIURL.ROOT}/v1/projets/${selectedProjet?.id}/${items}/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    setLoading(false);

    setData(response.data[items]);
  } catch (error) {
    setLoading(false);
    console.error('Error fetching data:', error);
    toast.error('Failed to fetch data');
  }
};

// Function to fetch data dynamically based on item type
export const fetchData_Select = async (items, setData, setLoading) => {
  const accessToken = localStorage.getItem('accessToken');
  const endpoint = APIURL[items.toUpperCase()]; // Dynamically get the correct endpoint
  setLoading(true);

  try {
    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    setLoading(false);
    setData(response.data[items]);
  } catch (error) {
    setLoading(false);
    console.error('Error fetching data:', error);
    toast.error('Failed to fetch data');
  }
};

export const fetchData_table_by_projet = async (
  entity,
  params_url,
  searchTerm,
  currentPage,
  rowsPerPage,
  accesstoken,
  setLoading = () => {},
  setError = () => {},
  setData = () => {},
  setTotalRows = () => {}
) => {
  setLoading(true);
  setError(null);
  setData([]);

  try {
    const selectedProjet = JSON.parse(localStorage.getItem('selectedProjet')) || {};
    const urlsSansProjet = ['ReclamationsClients', 'projets', 'typeProjets', 'sources', 'banques', 'typefreins'];

    if (!urlsSansProjet.includes(entity.API_URL)) {
      if (!selectedProjet?.id) {
        setError('Veuillez sélectionner un projet');
        return;
      }
    }

    // Ensure these parameters are properly structured for your API
    const params = {
      page: currentPage,
      size: rowsPerPage, // or per_page depending on your API
      search: searchTerm,
      ...params_url
    };

    const baseUrl = urlsSansProjet.includes(entity.API_URL)
      ? `${APIURL.ROOT}/v1/${entity.API_URL}/`
      : `${APIURL.ROOT}/v1/projets/${selectedProjet?.id}/${entity.API_URL}/`;

    const response = await axios.get(baseUrl, {
      headers: {
        Authorization: `Bearer ${accesstoken}`,
      },
      params, // Make sure params are being sent
    });

    // Verify the response structure
    console.log('API Response:', response.data); // Debug log

    const responseData = response.data[entity.dataKey] || [];
    const totalItems = response.data.pagination?.totalItems || responseData.length;

    setData(responseData);
    setTotalRows(totalItems);

  } catch (err) {
    console.error('API Error:', err);
    const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des données';
    setError(errorMessage);
    
    if (err.response?.status !== 401) {
      toast.error(errorMessage);
    }
  } finally {
    setLoading(false);
  }
};

export const fetchData_table_by_id = async (
  entity,
  params_url,
  searchTerm,
  currentPage,
  rowsPerPage,
  accesstoken,
  setLoading,
  setError,
  setData,
  setTotalRows
) => {
  setLoading(true);
  setError('');
  try {
    const params = {
      page: currentPage,
      size: rowsPerPage,
      ...params_url
    };

    const response = await axios.get(
      `${APIURL.ROOT}/v1/${entity.API_URL}/${entity.id}`,
      {
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
        params,
      }
    );

    
    if (response.data && Array.isArray(response.data[entity.dataKey])) {
      let rawData = response.data[entity.dataKey];

      // Format the data first
      const formattedData = rawData.map((pro) => {
        return {
          ...pro,
          date_traitement: pro.date_traitement
            ? formatDate(pro.date_traitement)
            : '',
          // Keep original statut value - don't override it
          rappel: pro.date_rappel
            ? formatDate(pro.date_rappel)
            : '',
        };
      });

      // Apply global search on formatted fields
      let filteredData = formattedData;

      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filteredData = formattedData.filter((item) =>
          Object.keys(item).some((field) => {
            const value = (item[field] || '').toString().toLowerCase();
            return value.includes(lowerSearchTerm);
          })
        );
      }

      setData(filteredData);
      setTotalRows(response.data.pagination?.totalItems || filteredData.length);
    } else {
      setError(`No ${entity.name} found.`);
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Error loading data');
    if (err.response?.status === 401) {
      toast.error('Session expired, please log in again.');
    } else {
      toast.error('Failed to fetch data');
    }
  } finally {
    setLoading(false);
  }
};

export const fetchData_table = async (
  entity,
  searchTerm,
  currentPage,
  rowsPerPage,
  accesstoken,
  setLoading,
  setError,
  setData,
  setTotalRows
) => {
  setLoading(true);
  setError('');

  try {
    const params = {
      page: currentPage,
      size: rowsPerPage,
    };

    const response = await axios.get(entity.API_URL, {
      headers: { Authorization: `Bearer ${accesstoken}` },
      params,
    });

    if (response.data && Array.isArray(response.data[entity.dataKey])) {
      let filteredData = response.data[entity.dataKey];

      // Apply global search and specific filtering for 'role' and 'status' in a single filter
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();

        filteredData = filteredData.filter((item) => {
          // Create the full name string by combining 'name' and 'prenom'
          const fullName = `${item.name || ''}${item.prenom || ''} ${
            item.prenom || ''
          }`.toLowerCase();

          // Map role ID to role text using User_roles
          const role = Object.keys(User_roles).find(
            (key) => User_roles[key] === item.role
          );
          const roleText = role
            ? role.replace('ROLE_', '').replace('_', ' ').toLowerCase()
            : '';

          const status = (item.is_actif ? '1' : '2').toLowerCase();

          // Check if any of the fields match the searchTerm
          return (
            fullName.includes(lowerSearchTerm) || // Search in the full name
            roleText.includes(lowerSearchTerm) || // Search in role text
            status.includes(lowerSearchTerm) || // Search in status
            entity.searchFields.some((field) => {
              // If the field is 'fullname', search in the combined fullName
              if (field === 'fullname') {
                return fullName.includes(lowerSearchTerm);
              }

              const value = (item[field] || '').toLowerCase();
              return value.includes(lowerSearchTerm); // Search in other fields
            })
          );
        });
      }

      setData(filteredData);
      setTotalRows(response.data.pagination?.totalItems || filteredData.length);
    } else {
      setError(`No ${entity.name} found.`);
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Error loading data');
    if (err.response?.status === 401) {
      toast.error('Session expired, please log in again.');
    } else {
      toast.error('Failed to fetch data');
    }
  } finally {
    setLoading(false);
  }
};

// Function to check if files exist and fetch them
export const fetchList_fichier_exist = async (
  setFichier,
  item,
  setLoading_list
) => {
  const accessToken = localStorage.getItem('accessToken');
  setLoading_list(true);
  try {
    const res = await axios.get(`${APIURL.ROOTV1}/files_docs/${item}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    setFichier(res.data);
  } catch (erreur) {
    toast.error(erreur?.response?.data?.message || 'Failed to load files');
  } finally {
    setLoading_list(false);
  }
};
export const fetchList_fichier_exist_by_Code = async (
  setFichier,
  item,
  code,
  setLoading_list
) => {
  const accessToken = localStorage.getItem('accessToken');
  setLoading_list(true);
  try {
    const res = await axios.get(`${APIURL.ROOTV1}/files_docs_by_code/${item}/${code}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    setFichier(res.data);
  } catch (erreur) {
    toast.error(erreur?.response?.data?.message || 'Failed to load files');
  } finally {
    setLoading_list(false);
  }
};

export const fetchDataByProjet_2 = async (items,datakey, setData, setLoading) => {
  const accessToken = localStorage.getItem('accessToken');
  const selectedProjet =
    JSON.parse(localStorage.getItem('selectedProjet')) || {}; // Ensure it's not null
  setLoading(true);
  try {
    const response = await axios.get(
      `${APIURL.ROOTV1}/${items}/${selectedProjet?.id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    setLoading(false);
    setData(response.data[datakey]);
  } catch (error) {
    setLoading(false);
    console.error('Error fetching data:', error);
    toast.error('Failed to fetch data');
  }
};
export const data_by_projet_and_params = async (entityName, setData, setLoading, items, selectedProjet, params) => {
  const accessToken = localStorage.getItem('accessToken')
  try {
    const response = await axios.get(`${APIURL.ROOTV1}/${entityName}/` + selectedProjet + '/' + params, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    const dataKey = items

    setData(response.data[dataKey])

    setLoading(false)

    // console.log('data', data[dataKey]);
  } catch (error) {
    console.error('Error fetching data:', error)
    setLoading(false)
  }
}

export const fetchDataByProjet_params = async (items, setData, setLoading, params = {}) => {
  const accessToken = localStorage.getItem('accessToken');
  const selectedProjet = JSON.parse(localStorage.getItem('selectedProjet'));
  setLoading(true);
  
  try {
    const response = await axios.get(`${APIURL.ROOT}/v1/projets/${selectedProjet.id}/${items}/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: params
    });

    setLoading(false);
    setData(response.data[items]);
    
  } catch (error) {
    setLoading(false);
    console.error('Error fetching data:', error);
  }
};
