'use client'

import ProspectForm from './ProspectForm';
export default function ProspectFormDialg({ onClose, id, onSuccess }) {
  return (
    <div className="w-full max-w-[90%] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[800px] h-auto bg-white flex flex-col mx-auto">
      <ProspectForm id={id} onClose={onClose} onSuccess={onSuccess} />
    </div>
  );
}
