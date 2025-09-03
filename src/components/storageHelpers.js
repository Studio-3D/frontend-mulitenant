// utils/storageHelpers.js
export const getStoredPerson = () => {
  const storedProspect = JSON.parse(localStorage.getItem('selectedProspect'));
  const storedClient = JSON.parse(localStorage.getItem('selectedClient'));
  
  return {
    person: storedProspect?.info?.dataProspect || storedClient?.info?.dataClient  || null,
    type: storedProspect ? 'prospect' : storedClient ? 'client' : null
  };
};

export const clearStoredPerson = () => {
  localStorage.removeItem('selectedProspect');
  localStorage.removeItem('selectedClient');
};