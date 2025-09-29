'use client';

import React from 'react';
import ProjetsPage from '@/app/(dashboard)/Projets/page';

const ProjetsContent = ({ user_id }) => {
  return (
    <div className="p-4">
      <ProjetsPage user_id={user_id} />
    </div>
  );
};

export default ProjetsContent;
