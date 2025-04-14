'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { APIURL, RESOURCE_URL } from '../../configs/api';
import Image from 'next/image';
import { useSociete } from '@/context/SocieteContext';
import Input from "../Input";
import toast from 'react-hot-toast';
import { RiEditLine } from "react-icons/ri";
import LoadingSpin from '../LoadingSpin';
import { useSearchParams, useRouter } from 'next/navigation';

const ProfileContent = ({ userId }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');
  const accessToken = localStorage.getItem('accessToken');
  const { selectedSociete } = useSociete();

  useEffect(() => {
    if (!userId || !accessToken) {
      setError('Authentication required.');
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${APIURL.UTILISATEURS}/${userId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = response.data.user || response.data;
        setUserData(data);
        setFormData({
          name: data.name || '',
          prenom: data.prenom || '',
          email: data.email || '',
          phone: data.phone || '',
          adresse: data.adresse || '',
          gender: data.gender || '',
          role: data.role || '',
          is_actif: data.is_actif || '',
          fonction: data.fonction || '',
          date_embauche: data.date_embauche || '',
          cin: data.cin || '',
          cnss: data.cnss || '',
          solde_conge: data.solde_conge || ''
        });
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
        } else {
          setError('Failed to fetch user data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, accessToken]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${APIURL.UTILISATEURS}/${userId}`, formData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      
      // If came from edit link, redirect back to table after save
      if (searchParams.get('edit')) {
        router.push('/Utilisateurs');
      }
    } catch (error) {
      toast.error('Failed to update profile. Please check your inputs.');
    }
  };

  const resetForm = () => {
    if (searchParams.get('edit')) {
      // Redirect back to user table if came from edit link
      router.push('/Utilisateurs');
    } else {
      // Reset form if editing from profile view
      setFormData({
        name: userData.name,
        prenom: userData.prenom,
        email: userData.email,
        phone: userData.phone,
        adresse: userData.adresse,
        gender: userData.gender,
        role: userData.role,
        is_actif: userData.is_actif,
        fonction: userData.fonction,
        date_embauche: userData.date_embauche,
        cin: userData.cin,
        cnss: userData.cnss,
        solde_conge: userData.solde_conge
      });
      setIsEditing(false);
    }
  };

  if (loading) return <div className='absolute inset-0 flex justify-center items-center'><LoadingSpin/></div>;
  if (error) return <div>{error}</div>;
  if (!userData) return <div>No user data found.</div>;

  return (
    <div className="relative">
      {/* Background Image */}
      <div className="w-full h-[22vh] relative">
        <Image
          src="/images/banners/background3.jpg"
          alt="Profile background"
          fill
          className="rounded-tr-lg object-cover"
          quality={80}
        />
      </div>

      {/* Profile Avatar Section */}
      <div className="flex items-center absolute top-[17vh] left-4 w-full pr-20">
        <div className="flex items-center flex-grow">
          <input type='file' accept='image/*' className='hidden' />
          <div className='relative w-32 h-32 cursor-pointer'>
            <img
              src={userData.photo ? 
                `${RESOURCE_URL.DOCS}/${selectedSociete.raison_sociale_concatene}_${selectedSociete.id}/users/${userData.photo}`
                : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'}
              alt="User Avatar"
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-1 right-1 bg-white p-1 rounded-full shadow-md">
              <RiEditLine className="text-gray-600 text-lg" />
            </div>
          </div>
          <div className="flex flex-col p-4 mt-8">
            <div className="font-bold text-2xl text-gray-900">
              {`${userData.name} ${userData.prenom}`}
            </div>
            <div className="text-gray-400 text-md font-medium">
              {userData.role === 1 ? 'Super Admin' 
                : userData.role === 2 ? 'Admin' 
                : userData.role === 3 ? 'Commercial' 
                : 'Utilisateur'}
            </div>
          </div>
        </div>

        {/* Top Modifier Button */}
        {!isEditing && !searchParams.get('edit') && (
          <div className='mt-8'>
            <button 
              className='bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors'
              onClick={() => setIsEditing(true)}
            >
              Modifier
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col p-4 mt-24 ml-4 rounded-lg">
        <div className="flex items-center gap-8">
          <button className="text-lg font-medium text-blue-500 border-b-2 border-blue-500">
            Informations Personnelles
          </button>
        </div>
        <div className='border-b border-[#b7daf6] mr-8'></div> 
      </div>

      {/* Profile Information Form */}
      <form onSubmit={handleProfileSubmit} className="flex flex-col px-4 ml-4 py-2">
        <div className="w-full grid grid-cols-1 md:grid-cols-1 xl:grid-cols-3 md:gap-8 xl:gap-x-16 xl:gap-y-4">
          <Input
            label="Nom:"
            name="name"
            value={formData.name}
            onChange={handleProfileChange}
            readOnly={!isEditing}
          />
          <Input
            label="Prénom:"
            name="prenom"
            value={formData.prenom}
            onChange={handleProfileChange}
            readOnly={!isEditing}
          />
          <Input
            label="Email:"
            name="email"
            value={formData.email}
            onChange={handleProfileChange}
            type="email"
            readOnly={!isEditing}
          />
          <Input
            label="Téléphone:"
            name="phone"
            value={formData.phone}
            onChange={handleProfileChange}
            type="tel"
            readOnly={!isEditing}
          />
          <Input
            label="Adresse:"
            name="adresse"
            value={formData.adresse}
            onChange={handleProfileChange}
            readOnly={!isEditing}
          />
          <Input
            label="Role:"
            name="role"
            value={formData.role === 1 ? 'Super Admin' : formData.role === 2 ? 'Admin' : formData.role === 3 ? 'Commercial' : 'Utilisateur'}
            readOnly
          />
          <Input
            label="Genre:"
            name="gender"
            value={formData.gender == 1 ? 'Homme' : formData.gender == 2 ? 'Femme' : ''}
            onChange={handleProfileChange}
            readOnly={!isEditing}
          />
          <Input
            label="Is Actif:"
            name="is_actif"
            value={formData.is_actif == 1 ? 'Oui' : formData.is_actif == 2 ? 'Non' : ''}
            onChange={handleProfileChange}
            readOnly={!isEditing}
          />
          <Input
            label="Fonction:"
            name="fonction"
            value={formData.fonction}
            onChange={handleProfileChange}
            readOnly={!isEditing}
          />
          <Input
            label="Date embauche:"
            name="date_embauche"
            value={formData.date_embauche}
            onChange={handleProfileChange}
            readOnly={!isEditing}
          />
          <Input
            label="CIN:"
            name="cin"
            value={formData.cin}
            onChange={handleProfileChange}
            readOnly={!isEditing}
          />
          <Input
            label="CNSS:"
            name="cnss"
            value={formData.cnss}
            onChange={handleProfileChange}
            readOnly={!isEditing}
          />
          <Input
            label="Solde Congé:"
            name="solde_conge"
            value={formData.solde_conge}
            onChange={handleProfileChange}
            type="number"
            readOnly={!isEditing}
          />
        </div>

        {/* Bottom Action Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-4 mt-8 mr-10">
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enregistrer
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileContent;