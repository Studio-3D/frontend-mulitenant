'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ProjetsPage from '@/app/(dashboard)/Projets/page';

const ProjetsContent = () => {
  const params = useParams();
  const user_id = params?.id; // si le fichier est dans [id]/page.jsx par exemple

  return (
    <div className="p-4">
{/*       <h1 className="text-2xl mb-4 font-semibold">Projets de l'utilisateur #{user_id}</h1>
 */}      <ProjetsPage user_id={user_id} />
    </div>
  );
};

export default ProjetsContent;
