import axios from 'axios';
import { format, isValid, parseISO } from 'date-fns';

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
        icon: 'refresh-cw',
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
        icon: 'home',
        color: 'success',
        subtitle: (prospect, user, avance, reservation, bien, projet) => `Pour Le Client: ${prospect?.nom} ${prospect?.prenom}`
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
      15: {
        title: 'Une Réservation Validé',
        icon: 'check-circle',
        color: 'success',
        subtitle: (prospect, user, avance, reservation, bien, projet) => `Code: ${reservation?.code_reservation}`
      },
      96: {
        title: 'Nouvelle Publication Facebook',
        icon: 'share',
        color: 'info',
        subtitle: (prospect, user, avance, reservation, bien, projet, description_type) => description_type || 'Une nouvelle publication a été ajoutée'
      },
      97: {
        title: 'Nouveau Commentaire Instagram',
        icon: 'message-circle',
        color: 'info',
        subtitle: (prospect, user, avance, reservation, bien, projet, description_type) => description_type || 'Quelqu\'un a commenté votre publication'
      },
      98: {
        title: 'Nouvelle Réaction Facebook',
        icon: 'thumbs-up',
        color: 'info',
        subtitle: (prospect, user, avance, reservation, bien, projet, description_type) => description_type || 'Quelqu\'un a réagi à votre publication'
      }
    };

    const formattedNotifications = notifications
      .filter(notification => notification.type !== 99)
      .map(notification => {
        const { type, date, deleted_at, id, prospect, user, avance, reservation, bien, projet, lien, description_type } = notification;
        const notificationType = typeNotiMap[type];
        
        if (!notificationType) {
          console.warn(`Unknown notification type: ${type}, skipping...`);
          return null;
        }

        const { icon, color, subtitle, title } = notificationType;

        // Better date parsing with validation
        let formattedDate;
        try {
          // Try different parsing methods
          let dateObj;
          
          if (typeof date === 'string') {
            // Try parsing as ISO string first
            dateObj = parseISO(date);
            
            // If that fails, try direct Date constructor
            if (!isValid(dateObj)) {
              dateObj = new Date(date);
            }
          } else {
            dateObj = new Date(date);
          }
          
          if (isValid(dateObj)) {
            formattedDate = type === 2
              ? format(dateObj, 'dd/MM/yyyy HH:mm')
              : format(dateObj, 'dd/MM/yyyy');
          } else {
            console.warn('Invalid date received:', date);
            formattedDate = 'Date invalide';
          }
        } catch (error) {
          console.error('Error formatting date:', date, error);
          formattedDate = 'Date invalide';
        }

        return {
          id,
          deleted_at,
          url: lien,
          date: formattedDate,
          title: `${[20, 21, 8, 23, 24, 25, 26, 29].indexOf(type) >= 0 ? `${title}` : `Vous Avez ${title}`}`,
          icon: icon,
          color: color,
          subtitle: subtitle(prospect, user, avance, reservation, bien, projet, description_type),
          seen: notification.seen === 1
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