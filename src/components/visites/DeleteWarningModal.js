'use client';
import { IoAlertCircleOutline } from 'react-icons/io5';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

export default function DeleteWarningModal({ onClose, message }) {
  // Delete user handler

  return (
    <div className="w-[500px] p-4">
      <IoAlertCircleOutline className="text-[#FF4E4E] text-6xl mx-auto mt-2 mb-4" />
      <h2 className="text-xl font-semibold text-center">Attention</h2>
      <p className="text-center text-[#878484] mt-2">{message}</p>
      <div className="flex justify-center gap-4 mt-4 mb-4">
        <button
          className="font-medium px-4 py-2 rounded-lg bg-gray-200"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}
