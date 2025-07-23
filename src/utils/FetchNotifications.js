import axios from 'axios';
import { format } from 'date-fns';

const fetchNotifications = async ({ setNotifications, setNewNotificationsCount, setIsLoadingNotifications }) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const accessToken = localStorage.getItem('accessToken');
  const selectedProject = JSON.parse(localStorage.getItem('selectedProjet'));

 
};

export { fetchNotifications };
