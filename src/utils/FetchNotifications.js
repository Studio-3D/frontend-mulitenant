import axios from 'axios';
import { formatDate, formatDateTime } from './dateUtils';

const fetchNotifications = async ({
  setNotifications,
  setNewNotificationsCount,
  setIsLoadingNotifications,
}) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const accessToken = localStorage.getItem('accessToken');
  const selectedProject = JSON.parse(localStorage.getItem('selectedProjet'));

  if (!accessToken || !selectedProject) {
    // Likely during logout or no project selected; silently skip
    return;
  }

  try {
    setIsLoadingNotifications(true);
    console.log('Fetching notifications...');

    const response = await axios.get(
      `${apiUrl}/get_notifications/${selectedProject.id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const notifications = response.data.all_notifications;
    const newNotificationsCount = Number(response.data.new_notifications_count);

    setNotifications([]);
    setNewNotificationsCount(newNotificationsCount);
    setIsLoadingNotifications(false);
    {
      /**91=====>99 notification de webhoook */
    }
    const typeNotiMap = {
      1: {
        title: 'Une Relance',
        icon: 'refresh-cw',
        color: 'warning',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Pour Le Client: ${prospect?.nom} ${prospect?.prenom}`,
      },
      2: {
        title: 'Un Rendez Vous',
        icon: 'calendar',
        color: 'primary',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Avec Le Client: ${prospect.nom} ${prospect.prenom}`,
      },
      3: {
        title: 'Un Bien Disponible',
        icon: 'home',
        color: 'success',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Pour Le Client: ${prospect?.nom} ${prospect?.prenom}`,
      },
      4: {
        title: "Pré Réservation sur le point d'expirer",
        icon: 'alert-triangle',
        color: 'error',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Pour le Client: ${prospect.nom} ${prospect.prenom}`,
      },
      5: {
        title: 'Un Echéance',
        icon: 'clock',
        color: 'error',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Avance N°: ${avance?.num_recu}`,
      },
      6: {
        title: 'Une Demande Validation Réservation',
        icon: 'mdi-check-all',
        color: 'warning',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Du Dossier: ${reservation?.code_reservation} `,
      },
      7: {
        title: 'Une Demande Validation Avance',
        icon: 'mdi-check-all',
        color: 'warning',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          ` N°: ${avance?.num_recu}`,
      },
      8: {
        title: "L'adminstrateur a changé le Bien",
        icon: 'mi:repeat',
        color: 'secondary',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Du Dossier: ${reservation?.code_reservation}`,
      },
      9: {
        title: 'Une Demande Validation Désistement',
        icon: 'mdi-check-all',
        color: 'warning',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Du Dossier: ${reservation?.code_reservation}`,
      },
      10: {
        title: 'Une Demande Validation Pénalité',
        icon: 'mdi-check-all',
        color: 'warning',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Du Dossier: ${reservation?.code_reservation}`,
      },
      11: {
        title: 'Un Désistement Validé',
        icon: 'hugeicons:smile',
        color: 'success',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Du Dossier: ${reservation?.code_reservation}`,
      },
      12: {
        title: 'Un Désistement Rejeté',
        icon: 'mingcute:sad-line',
        color: 'error',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Du Dossier: ${reservation?.code_reservation}`,
      },
      13: {
        title: 'Un Pénalité Validé',
        icon: 'hugeicons:smile',
        color: 'success',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Du Dossier: ${reservation?.code_reservation}`,
      },
      14: {
        title: 'Un Pénalité Rejeté',
        icon: 'mingcute:sad-line',
        color: 'error',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Du Dossier: ${reservation?.code_reservation}`,
      },
      15: {
        title: 'Une Réservation Validé',
        icon: 'check-circle',
        color: 'success',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Code: ${reservation?.code_reservation}`,
      },
      16: {
        title: 'Une Réservation Rejeté',
        icon: 'mingcute:sad-line',
        color: 'error',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Code: ${reservation?.code_reservation}`,
      },
      17: {
        title: 'Un Avance Validé',
        icon: 'hugeicons:smile',
        color: 'success',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Reçu N°: ${avance?.num_recu}`,
      },
      18: {
        title: 'Un Avance Rejeté',
        icon: 'mingcute:sad-line',
        color: 'error',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Reçu N°: ${avance?.num_recu}`,
      },
      19: {
        title: 'Un Bien Désisté est Vendu',
        icon: 'mingcute:sad-line',
        color: 'error',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Bien : ${bien?.propriete_dite_bien} Du Dossier: ${reservation?.code_reservation}`,
      },
      20: {
        title: 'Un chèque de remboursement est prét  ',
        icon: 'pepicons-pencil:file',
        color: 'primary',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Du Bien : ${bien?.propriete_dite_bien}`,
      },
      21: {
        title: 'Le client a pris le cheque du remboursement',
        icon: 'solar:hand-money-outline',
        color: 'error',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Du Bien : ${bien?.propriete_dite_bien}`,
      },
      22: {
        title: 'Une Demande Validation rdv notaire',
        icon: 'mdi-check-all',
        color: 'warning',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Du Dossier: ${reservation?.code_reservation} `,
      },
      23: {
        title: 'Le rdv avec notaire est Validé',
        icon: 'mdi-check-all',
        color: 'warning',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Du Dossier: ${reservation?.code_reservation} `,
      },
      24: {
        title: 'Le rdv avec notaire est Rejeté',
        icon: 'mdi-check-all',
        color: 'warning',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Du Dossier: ${reservation?.code_reservation} `,
      },
      25: {
        title: 'Le Commercial a changé le rdv avec le notaire',
        icon: 'mdi-pencil',
        color: 'warning',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Du Dossier: ${reservation?.code_reservation} `,
      },
      26: {
        title: "Le Compromis va Bientôt s'expirer",
        icon: 'mdi-pencil',
        color: 'warning',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Du Dossier: ${reservation?.code_reservation} `,
      },
      27: {
        title: 'Une Relance',
        icon: 'eos-icons:loading',
        color: 'warning',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Pour Le Prospect: N°Téléphone: ${prospect?.telephone}`,
      },
      28: {
        title: 'Un Rendez Vous',
        icon: 'guidance:meeting-room',
        color: 'primary',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Avec Le Prospect: N°Téléphone: ${prospect?.telephone}`,
      },
      29: {
        title: 'Le fichier des biens a été importé avec succès',
        icon: 'ic:twotone-import-export',
        color: 'primary',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Du Projet: ${projet?.nom}`,
      },
      30: {
        title: 'Un Rappel',
        icon: 'eos-icons:loading',
        color: 'primary',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `De Prospect: N°Téléphone: ${prospect?.telephone}`,
      },
      31: {
        title: 'Un Rendez Vous',
        icon: 'guidance:meeting-room',
        color: 'primary',
        subtitle: (prospect, user, avance, reservation, bien, projet) =>
          `Avec Le Prospect: N°Téléphone: ${prospect?.telephone}`,
      },
      91: {
        title: 'Mention Facebook',
        icon: 'at-sign',
        color: 'info',
        subtitle: (
          prospect,
          user,
          avance,
          reservation,
          bien,
          projet,
          description_type
        ) => description_type || 'Vous avez été mentionné sur Facebook',
      },
      92: {
        title: 'Publication Instagram',
        icon: 'camera',
        color: 'info',
        subtitle: (
          prospect,
          user,
          avance,
          reservation,
          bien,
          projet,
          description_type
        ) => description_type || 'Nouvelle publication Instagram',
      },
      93: {
        title: 'Commentaire Facebook',
        icon: 'message-square',
        color: 'info',
        subtitle: (
          prospect,
          user,
          avance,
          reservation,
          bien,
          projet,
          description_type
        ) => description_type || 'Nouveau commentaire Facebook',
      },
      94: {
        title: 'Mention Instagram',
        icon: 'at-sign',
        color: 'info',
        subtitle: (
          prospect,
          user,
          avance,
          reservation,
          bien,
          projet,
          description_type
        ) => description_type || 'Vous avez été mentionné sur Instagram',
      },
      95: {
        title: 'Réaction Instagram',
        icon: 'heart',
        color: 'info',
        subtitle: (
          prospect,
          user,
          avance,
          reservation,
          bien,
          projet,
          description_type
        ) => description_type || "Quelqu'un a réagi à votre message Instagram",
      },
      99: {
        title: 'Nouveau Message WhatsApp',
        icon: 'message-circle',
        color: 'success',
        subtitle: (
          prospect,
          user,
          avance,
          reservation,
          bien,
          projet,
          description_type
        ) => description_type || 'Nouveau message WhatsApp reçu',
      },
      96: {
        title: 'Nouvelle Publication Facebook',
        icon: 'share',
        color: 'info',
        subtitle: (
          prospect,
          user,
          avance,
          reservation,
          bien,
          projet,
          description_type
        ) => description_type || 'Une nouvelle publication a été ajoutée',
      },
      97: {
        title: 'Nouveau Commentaire Instagram',
        icon: 'message-circle',
        color: 'info',
        subtitle: (
          prospect,
          user,
          avance,
          reservation,
          bien,
          projet,
          description_type
        ) => description_type || "Quelqu'un a commenté votre publication",
      },
      98: {
        title: 'Nouvelle Réaction Facebook',
        icon: 'thumbs-up',
        color: 'info',
        subtitle: (
          prospect,
          user,
          avance,
          reservation,
          bien,
          projet,
          description_type
        ) => description_type || "Quelqu'un a réagi à votre publication",
      },

      /*27: {
        title: 'Appel Programmé',
        icon: 'phone',
        color: 'primary',
        subtitle: (
          prospect,
          user,
          avance,
          reservation,
          bien,
          projet,
          description_type
        ) => description_type || 'Appel à effectuer',
      },
      28: {
        title: "Rappel d'Appel",
        icon: 'phone',
        color: 'warning',
        subtitle: (
          prospect,
          user,
          avance,
          reservation,
          bien,
          projet,
          description_type
        ) => description_type || "Rappel d'appel",
      },*/
      51: {
        title: 'Nouveau prospect via WhatsApp',
        icon: 'message-circle',
        color: 'info',
        subtitle: (prospect, user, avance, reservation, bien, projet, description_type) => description_type || `Message WhatsApp entrant${prospect?.telephone ? ' de ' + prospect.telephone : ''}`
      },
      90: {
        title: 'Message Facebook',
        icon: 'message-circle',
        color: 'info',
        subtitle: (prospect, user, avance, reservation, bien, projet, description_type) => description_type || 'Nouveau message Facebook reçu'
      },
      91: {
        title: 'Mention Facebook',
        icon: 'at-sign',
        color: 'info',
        subtitle: (prospect, user, avance, reservation, bien, projet, description_type) => description_type || 'Vous avez été mentionné sur Facebook'
      },
      92: {
        title: 'Publication Instagram',
        icon: 'camera',
        color: 'info',
        subtitle: (prospect, user, avance, reservation, bien, projet, description_type) => description_type || 'Nouvelle publication Instagram'
      },
      93: {
        title: 'Commentaire Facebook',
        icon: 'message-square',
        color: 'info',
        subtitle: (prospect, user, avance, reservation, bien, projet, description_type) => description_type || 'Nouveau commentaire Facebook'
      },
      94: {
        title: 'Mention Instagram',
        icon: 'at-sign',
        color: 'info',
        subtitle: (prospect, user, avance, reservation, bien, projet, description_type) => description_type || 'Vous avez été mentionné sur Instagram'
      },
      95: {
        title: 'Réaction Instagram',
        icon: 'heart',
        color: 'info',
        subtitle: (prospect, user, avance, reservation, bien, projet, description_type) => description_type || 'Quelqu\'un a réagi à votre message Instagram'
      },
      99: {
        title: 'Nouveau Message WhatsApp',
        icon: 'message-circle',
        color: 'success',
        subtitle: (prospect, user, avance, reservation, bien, projet, description_type) => description_type || 'Nouveau message WhatsApp reçu'
      }
    };

    const formattedNotifications = notifications
      .filter((notification) => notification.type !== 99)
      .map((notification) => {
        const {
          type,
          date,
          deleted_at,
          id,
          prospect,
          user,
          avance,
          reservation,
          bien,
          projet,
          lien,
          description_type,
        } = notification;
        const notificationType = typeNotiMap[type];

        if (!notificationType) {
          console.warn(`Unknown notification type: ${type}, skipping...`);
          return null;
        }

        const { icon, color, subtitle, title } = notificationType;

        // Better date parsing with validation
        let formattedDate;
        try {
          formattedDate = type === 2 ? formatDateTime(date) : formatDate(date);

          if (!formattedDate) {
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
          title: `${
            [20, 21, 8, 23, 24, 25, 26, 29].indexOf(type) >= 0
              ? `${title}`
              : `Vous Avez ${title}`
          }`,
          icon: icon,
          color: color,
          subtitle: subtitle(
            prospect,
            user,
            avance,
            reservation,
            bien,
            projet,
            description_type
          ),
          seen: Boolean(notification.seen),
        };
      })
      .filter((notification) => notification !== null);

    setNotifications((prevNotif) => [...prevNotif, ...formattedNotifications]);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    setIsLoadingNotifications(false);
    throw error;
  }
};

export { fetchNotifications };
