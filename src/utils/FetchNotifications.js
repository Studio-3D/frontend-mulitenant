import axios from 'axios';
import { format } from 'date-fns';

const fetchNotifications = async ({ setNotifications, setNewNotificationsCount, setIsLoadingNotifications }) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const accessToken = localStorage.getItem('accessToken');
  const selectedProject = JSON.parse(localStorage.getItem('selectedProjet'));

  if (!accessToken || !selectedProject) {
    console.error('Missing access token or selected project');
    return;
  }

  try {
    setIsLoadingNotifications(true);
    console.log('Fetching notifications...');

    const response = await axios.get(
      `${apiUrl}/get_notifications/${selectedProject.id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const notifications = response.data.all_notifications;
    const newNotificationsCount = Number(response.data.new_notifications_count);

    setNotifications([]);
    setNewNotificationsCount(newNotificationsCount);
    setIsLoadingNotifications(false);

    const typeNotiMap = {
      1: {
        title: 'Une Relance',
        icon: 'arrow-clockwise',
        color: 'warning',
        subtitle: (prospect, user, avance, reservation, bien, projet) => `Pour Le Client: ${prospect?.nom} ${prospect?.prenom}`
      },
      2: {
        title: 'Un Rendez Vous',
        icon: 'calendar',
        color: 'primary',
        subtitle: (prospect, user, avance, reservation, bien, projet) => `Avec Le Client: ${prospect.nom} ${prospect.prenom}`
      },
      3: {
        title: 'Un Bien Disponible',
        icon: 'unlock',
        color: 'error',
        subtitle: (prospect, user, avance, reservation, bien, projet) => `Pour Le Client: ${prospect.nom} ${prospect.prenom}`
      },
      4: {
        title: "Pré Réservation sur le point d'expirer",
        icon: 'alert-triangle',
        color: 'error',
        subtitle: (prospect, user, avance, reservation, bien, projet) => `Pour le Client: ${prospect.nom} ${prospect.prenom}`
      },
      5: {
        title: 'Un Echéance',
        icon: 'clock',
        color: 'error',
        subtitle: (prospect, user, avance, reservation, bien, projet) => `Avance N°: ${avance?.num_recu}`
      },
      // Other notification types...
      15: {
        title: 'Une Réservation Validé',
        icon: 'check-circle',
        color: 'success',
        subtitle: (prospect, user, avance, reservation, bien, projet) => `Code: ${reservation?.code_reservation}`
      },
      // Add more notification types as needed
    };

    const formattedNotifications = notifications
      .map(notification => {
        const { type, date, deleted_at, id, prospect, user, avance, reservation, bien, projet, lien } = notification;
        const notificationType = typeNotiMap[type];
        if (!notificationType) {
          console.error('Unknown notification type: ' + type);
          return null; // Skip this notification if type is unknown
        }

        const { icon, color, subtitle, title } = notificationType;

        const formattedDate = type === 2
          ? format(new Date(date), 'dd/MM/yyyy kk:mm')
          : format(new Date(date), 'dd/MM/yyyy');

        return {
          id,
          deleted_at,
          url: lien,
          date: formattedDate,
          title: `${[20, 21, 8, 23, 24, 25, 26, 29].indexOf(type) >= 0 ? `${title}` : `Vous Avez ${title}`}`,
          icon: icon,
          color: color,
          subtitle: subtitle(prospect, user, avance, reservation, bien, projet)
        };
      })
      .filter(notification => notification !== null);

    setNotifications(prevNotif => [...prevNotif, ...formattedNotifications]);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    setIsLoadingNotifications(false);
    throw error;
  }
};

export { fetchNotifications };
