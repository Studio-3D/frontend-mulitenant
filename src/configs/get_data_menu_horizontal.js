import axios from 'axios';
import { APIURL } from './api';

export const get_nb_relances_rdv_visites = async (
  entityName,
  set_nb_rel_appel,
  set_nb_rdv_appel,
  setData_relance,
  setData_rdv,
  setData_client_frein,
  projetId
) => {
  const accessToken = localStorage.getItem('accessToken');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
    const response = await axios.get(`${apiUrl}/${entityName}/` + projetId, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    set_nb_rel_appel(response.data.nb_relances_appels);
    set_nb_rdv_appel(response.data.nb_rdv_appels);
    setData_relance(response.data.relance_visites);
    setData_rdv(response.data.rdv_visites);
    setData_client_frein(response.data.rel_client_freins);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

export const get_nb_menu = async (entityName, set_nb, projetId) => {
  const accessToken = localStorage.getItem('accessToken');
  let apiUrl = null;
  if (
    entityName == 'get_nb_rdv_appels' ||
    entityName == 'get_nb_relances_appels'
  ) {
    apiUrl = APIURL.ROOTV1;
  } else {
    apiUrl = process.env.NEXT_PUBLIC_API_URL;
  }
  try {
    const response = await axios.get(`${apiUrl}/${entityName}/` + projetId, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    set_nb(response.data.nb);
    console.log('ress=>'+response.data.nb)
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

export const get_notifs_horizontal_admin = async (
  entityName,
  set_nb_dst_att_valide,
  set_nb_pen_att_valide,
  set_nb_att_valid_avances,
  set_nb_att_valid_reservation,
  set_nb_demande_pre_remb,
  set_nb_echeances,
  /*set_nb_rdv_notaire, */ projetId
) => {
  const accessToken = localStorage.getItem('accessToken');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
    const response = await axios.get(`${apiUrl}/${entityName}/` + projetId, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    set_nb_dst_att_valide(response.data.nb_dst_att_valide);
    set_nb_pen_att_valide(response.data.nb_pen_att_valide);
    set_nb_att_valid_avances(response.data.nb_av_att_validation);
    set_nb_att_valid_reservation(response.data.nb_res_att_validation);
    set_nb_demande_pre_remb(response.data.nb_demande_pre_remourse);
    set_nb_echeances(response.data.nb_echeance);

    // set_nb_rdv_notaire(response.data.nb_rdv_notaire)
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

export const get_notifs_horizontal_comm = async (
  entityName,
  set_nb_dst_en_cours,
  set_nb_pen_en_cours,
  set_nb_av_en_cours,
  set_nb_res_en_cours,
  set_nb_demande_pre_remb,
  set_nb_echeances,
  /*set_nb_rdv_notaire,*/ projetId
) => {
  const accessToken = localStorage.getItem('accessToken');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
    const response = await axios.get(`${apiUrl}/${entityName}/` + projetId, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    set_nb_dst_en_cours(response.data.nb_dst_en_cours);
    set_nb_pen_en_cours(response.data.nb_pen_en_cours);
    set_nb_av_en_cours(response.data.nb_av_en_cours);
    set_nb_res_en_cours(response.data.nb_res_en_cours);
    set_nb_demande_pre_remb(response.data.nb_demande_pre_remourse);
    set_nb_echeances(response.data.nb_echeance);

    //set_nb_rdv_notaire(response.data.nb_rdv_notaire)
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

export const get_nb_notif_horizontal = async (entityName, set_nb, projetId) => {
  const accessToken = localStorage.getItem('accessToken');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL + '/v1';
  try {
    const response = await axios.get(`${apiUrl}/${entityName}/` + projetId, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    set_nb(response.data.nb);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
