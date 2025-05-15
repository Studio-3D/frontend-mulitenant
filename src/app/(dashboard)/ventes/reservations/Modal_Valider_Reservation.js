'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Button from '@/components/Button';
import toast from 'react-hot-toast';
import { APIURL } from '../../../../configs/api';
import { useAuth } from '../../../../context/AuthContext';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Modal from '@/components/Modal'; // Make sure you import the Modal component
import Modal_valider_avance from './Modal_valider_avance'; // Import your Modal_Traite component

export default function Modal_Valider_Reservation({
  onClose,
  code_reservation,
  first_av_statut,
  first_num_recu,
  id,
}) {
  const [Commentaire_av, setCommentaire_av] = useState(null);
  const [action, setAction] = useState(null);
  const [date_encaissement, set_date_encaissement] = useState(null);
  const [num_remise, set_num_remise] = useState(null);
  const [open_v_avances, setOpen_v_avances] = useState(false);
  const [Commentaire_res, setCommentaire_res] = useState(null);
  const [loading_v, setLoading_v] = useState(false);

  const { token } = useAuth();
  const accessToken = token || localStorage.getItem('accessToken');
  const [loading, setLoading] = useState({ form: false });

  const handle_oui = () => {
    //3
    if (first_av_statut == 1) {
      setOpen_v_avances(true);
    } else {
      handle_annuler_avance();
    }
  };

  const onSubmit = (data) => {
    console.log(id);
    setLoading({ ...loading, form: true });
    setBackendErrors();
    //1 traiter_rdv_relance_appel 2/traite visites
    let url = `${APIURL.ROOTV1}/traiter_relance_rdv_visite/${Number(id)}`;

    let method = 'put';

    axios({
      method: method,
      url: url,
      data: data,
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        setLoading({ ...loading, form: false });

        if (res.status === 200) {
          toast.success(`Réservation Validé avec succès`);
          onClose();
        }
      })
      .catch((error) => {
        setLoading({ ...loading, form: false });

        const response = error.response;
        if (response?.status === 422) {
          setBackendErrors(response.data.message || {});
          toast.error(response.data.message || 'Erreur de validation.');
          setTimeout(() => setBackendErrors(null), 5000);
        } else {
          toast.error("Une erreur s'est produite.");
        }
      });
  };

  return (
    <>
      <div className="w-full max-w-[90%] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[800px] h-auto bg-white flex flex-col mx-auto">
        <div className="w-full h-[60px] bg-blue-600 px-4">
          <div className="flex items-center justify-center h-full">
            <h1 className="text-3xl font-bold text-center text-white">
              Validation Réservation
            </h1>
          </div>
        </div>

        <div className="p-4 w-[600px]">
          <h1 style={{ textAlign: 'center', marginTop: '15px' }}>
            Etes-vous sûr de Valider la Réservation Code:{code_reservation}?
          </h1>
          <div className="flex justify-center gap-2 mt-[2%]">
            <Button
              type="submit"
              size="large"
              variant="contained"
              color="success"
              onClick={handle_oui}
            >
              OUI
            </Button>
            <Button
              type="delete"
              size="large"
              variant="outlined"
              color="error"
              onClick={onClose}
            >
              NON
            </Button>
          </div>
        </div>
      </div>

      {open_v_avances && (
        <Modal isVisible={open_v_avances} onClose={() => setOpen_v_avances(false)}>
          <Modal_valider_avance
            first_num_recu={first_num_recu}
            id={id}
            onClose={() => setOpen_v_avances(false)}
          />
        </Modal>
      )}
    </>
  );
}