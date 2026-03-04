'use client';
import { useState, useRef } from 'react';
import Button from '@/components/Button';
import axios from 'axios';
import toast from 'react-hot-toast';
import { APIURL } from '../../../../configs/api';
import Modal from '@/components/Modal'; // Make sure you import the Modal component
import Modal_valider_avance from './Modal_valider_avance'; // Import your Modal_Traite component
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import format from 'date-fns/format';
import { useAuth } from '../../../../context/AuthContext';

export default function Modal_Valider_Reservation({
  onClose,
  code_reservation,
  first_av_statut,
  first_num_recu,
  id,
  av_id,
  closeParentModal,
  commercial,
  aquereurs,
  date_res,
  prix,
  avance,
  res_show = false,
  onReservationUpdate, // Add this prop
}) {
  const [open_v_avances, setOpen_v_avances] = useState(false);

  const [loading, setLoading] = useState({ form: false });
  const { token } = useAuth();
  const accessToken = token || localStorage.getItem('accessToken');
  const closeAllModals = () => {
    onClose(); // Close current modal
    closeParentModal(); // Close parent modal
  };

  const handle_oui = () => {
    if (first_av_statut == 3) {
      setOpen_v_avances(true);
    } else {
      handle_annuler_avance();
    }
  };
  const handleSuccess = () => {
    if (res_show && onReservationUpdate) {
      console.log('🔍 Calling onReservationUpdate from success');
      onReservationUpdate();
    } else {
      localStorage.setItem('load_data_reservation', 1);
    }
    closeAllModals();
  };

  //valider reservation sans avance
  const handle_annuler_avance = () => {
    setLoading({ ...loading, form: true });
    const formData = new FormData();
    formData.append('statut_res', 1);
    formData.append('with_avance', 0);
    axios({
      method: 'put',
      url: `${APIURL.ROOTV1}/traiter_reservation/${id}`,
      data: formData,
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(() => {
        setLoading({ ...loading, form: false });

        onClose();
        setOpen_v_avances(false);
        toast.success('Réservation Validé avec succès');
        if (res_show && onReservationUpdate) {
          // If we're in res_show mode, call the callback to reload data
          console.log('🔍 Calling onReservationUpdate callback');
          onReservationUpdate();
        } else {
          // Original behavior for other cases
          localStorage.setItem('load_data_reservation', 1);
        }
      })
      .catch(() => {
        console.log('err');
      });
  };

  const defaultValues = {
    cc: commercial,
    date_res: format(new Date(date_res), 'yyyy-MM-dd'), // Format for date input
  };

  const TextField = ({
    label,
    name,
    type = 'text',
    required = false,
    control,
    errors,
    width = 'w-full',
    height = 'h-10',
    disabled = false,
    value, // Add value prop
  }) => {
    return (
      <div className="mb-4">
        <label
          htmlFor={name}
          className="block text-sm font-medium !text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id={name}
              name={name}
              type={type}
              className={`block ${width} ${height} px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors[name] ? 'border-red-500' : ''
              }`}
              required={required}
              disabled={disabled}
              value={value || field.value || ''} // Use the passed value prop
            />
          )}
        />
        {errors[name] && (
          <div className="mt-1 text-xs !text-red-600">
            <p>{errors[name]?.message}</p>
          </div>
        )}
      </div>
    );
  };

  const validationSchemaRef = useRef(yup.object().shape({}));
  const {
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchemaRef.current),
    defaultValues,
  });

  return (
    <>
      <div className="w-full max-w-[70%] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[800px] h-auto bg-white flex flex-col mx-auto">
        <div className="w-full h-[60px] bg-blue-600 px-4">
          <div className="flex items-center justify-center h-full">
            <h1 className="text-3xl font-bold text-center text-white">
              Etape 1 : Validation Réservation
            </h1>
          </div>
        </div>

        {/* Centered content container */}

        <div className="flex flex-col items-center justify-center w-full mt-10">
          <div className="w-full max-w-md">
            {' '}
            {/* Control width of the content */}
            <TextField
              type="text"
              label="Commercial:"
              disabled={true}
              name="cc"
              control={control}
              errors={errors}
              width="w-full" // Make it take full width of its container
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center  w-full">
          <div className="w-full max-w-md">
            {Object.values(aquereurs).map((aquereur, index) => (
              <div key={index}>
                <TextField
                  type="text"
                  label={`client ${index + 1} :`}
                  disabled={true}
                  name={`client_${index}`}
                  control={control}
                  errors={errors}
                  width="w-full"
                  value={`${aquereur.client.nom} ${aquereur.client.prenom}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center  w-full">
          <div className="w-full max-w-md">
            <TextField
              type="date"
              label="Date Réservation:"
              disabled={true}
              name="date_res"
              control={control}
              errors={errors}
              width="w-full" // Make it take full width of its container
            />
          </div>
        </div>
        <div className="p-3 w-[600px]">
          <h1 style={{ textAlign: 'center', marginTop: '15px' }}>
            Etes-vous sûr de vouloir valider la réservation :{code_reservation}?
          </h1>
          <div className="flex justify-center gap-2 mt-[2%]">
            <Button
              type="submit"
              size="large"
              variant="contained"
              color="success"
              onClick={handle_oui}
              disabled={loading.form}
              loading={loading.form}
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
        <Modal
          isVisible={open_v_avances}
          onClose={() => setOpen_v_avances(false)} maxWidth="max-w-xl"
        >
          <Modal_valider_avance
            onload_res_true={() => setLoading({ ...loading, form: true })}
            onload_res_false={() => setLoading({ ...loading, form: false })}
            prix={prix}
            avance={avance}
            first_num_recu={first_num_recu}
            id={id}
            av_id={av_id}
            onClose={() => setOpen_v_avances(false)}
            onClose_all={closeAllModals} // Pass the combined close function
            onSuccess={handleSuccess} // Pass success callback
            res_show={res_show} // Pass res_show flag
          />
        </Modal>
      )}
    </>
  );
}
