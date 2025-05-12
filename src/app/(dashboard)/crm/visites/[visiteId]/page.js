'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ClientDetailsPage } from '@/components/visites/ClientDetailsPage';
import BreadCrumb from '../../../navigation/BreadCrumb';
import { ENDPOINTS } from '../../../../../configs/api';

const VisiteShow = () => {
  const { visiteId } = useParams();
  return (
    <div>
      <div className="flex items-center justify-start" style={{marginBottom:'10px'}}>
        <BreadCrumb baseUrl={ENDPOINTS.VISITES} step={'Détail Visite'} />
      </div>
      <ClientDetailsPage visiteId={visiteId} />
    </div>
  );
};

export default VisiteShow;
