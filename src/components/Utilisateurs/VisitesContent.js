'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import VisiteTable from '@/app/(dashboard)/crm/visites/VisiteTable';

const VisitesContent = () => {
  const params = useParams();
  const user_id = params?.id; // si le fichier est dans [id]/page.jsx par exemple

  return (
    <div className="p-4">
      <VisiteTable user_id={user_id} />
    </div>
  );
};

export default VisitesContent;
