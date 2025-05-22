'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import BreadCrumb from '../../../navigation/BreadCrumb';
import { ENDPOINTS } from '../../../../../configs/api';

const Res_Show = () => {
  const { reservationId } = useParams();
  return (
    <div>
      <div className="flex items-center justify-start" style={{marginBottom:'10px'}}>
        <BreadCrumb baseUrl={ENDPOINTS.RESERVATIONS} step={'Détail Reservation'+reservationId} />
      </div>
    </div>
  );
};

export default Res_Show;

