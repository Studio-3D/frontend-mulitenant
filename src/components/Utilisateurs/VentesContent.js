'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ReservationTable from '@/app/(dashboard)/ventes/reservations/ReservationTable';

const VentesContent = ({user_id}) => {
  
  return (
    <div className="p-4">
      <ReservationTable user_id={user_id} />
    </div>
  );
};

export default VentesContent;
