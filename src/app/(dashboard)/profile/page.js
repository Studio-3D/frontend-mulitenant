'use client';
import React, { useState ,useRef} from 'react';
import { useForm } from 'react-hook-form';
import {
  User,
  Shield,
  Camera,
  Mail,
  Check,
  Eye,
  EyeOff,
  ChevronDown,
} from 'lucide-react';
import Button from '@/components/Button';
import TextField from '@/components/Textfield';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { APIURL, RESOURCE_URL } from '@/configs/api';
import { useRouter } from 'next/navigation';
import SelectInput from '@/components/SelectInput';



/* ─── Personal Info Form ─── */
/* ─── Personal Info Form ─── */
function PersonalInfoForm({ user, onUpdate }) {
  const router = useRouter();
  const { updateUser } = useAuth(); // Get updateUser from context
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      prenom: user?.prenom || '',
      phone: user?.phone || '',
      gender: user?.gender || 'homme',
    }
  });

  // Watch gender value for the SelectInput
  const genderValue = watch('gender');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const onSubmit = async (data) => {
  setIsLoading(true);
  setIsSuccess(false);
  setError('');
  
  try {
    const token = localStorage.getItem('accessToken');
    
    // Create FormData object for multipart/form-data
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('prenom', data.prenom);
    formData.append('phone', data.phone || '');
    formData.append('gender', data.gender);
    formData.append('_method', 'PUT'); // Add method spoofing
    
    // Append image if selected
    if (selectedImage) {
      formData.append('photo', selectedImage);
    }
    
    // Use POST instead of PUT with method spoofing
    const response = await axios.post(
      `${APIURL.ROOTV1}/update_personal_info/${user.id}`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    
    if (response.data.success) {
      setIsSuccess(true);
      
      // Update user in context with new data including photo
      const updatedUser = {
        ...user,
        ...data,
        photo: response.data.user?.photo || user.photo
      };
      
      updateUser(updatedUser);
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
      
      if (onUpdate) {
        onUpdate(updatedUser);
      }
      
      // Clear image selection
      setSelectedImage(null);
      setImagePreview(null);
      
      // Refresh the user data from server
      setTimeout(() => {
       // window.location.reload();
      }, 1500);
    }
  } catch (err) {
    console.error('Upload error:', err);
    setError(err.response?.data?.message || 'Une erreur est survenue');
  } finally {
    setIsLoading(false);
  }
};

  const genderOptions = [
    { value: 'homme', label: 'Homme' },
    { value: 'femme', label: 'Femme' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TextField
          name="prenom"
          label="Prénom"
          control={control}
          errors={errors}
          required
          width="w-full"
          height="h-11"
          rules={{ required: 'Le prénom est requis' }}
        />
        
        <TextField
          name="name"
          label="Nom"
          control={control}
          errors={errors}
          required
          width="w-full"
          height="h-11"
          rules={{ required: 'Le nom est requis' }}
        />
        
        <TextField
          name="phone"
          label="Téléphone"
          type="tel"
          control={control}
          errors={errors}
          width="w-full"
          height="h-11"
        />
        
        {/* Replace the custom Select with SelectInput */}
        <SelectInput
          label="Sexe"
          name="gender"
          value={genderValue}
          options={genderOptions}
          onChange={(value) => setValue('gender', value, { shouldValidate: true })}
          error={errors.gender?.message}
          required
          width="w-full"
          placeholder="Sélectionnez votre sexe"
        />
      </div>
      
      {/* Image preview section */}
      {(imagePreview || user?.photo) && (
        <div className="mt-4 p-4 border border-slate-200 rounded-lg">
          <p className="text-sm font-medium text-slate-700 mb-2">Aperçu de la photo</p>
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={imagePreview || user.photo
                        ? `${RESOURCE_URL.DOCS}/${
                            user.societe
                              ? user?.societe?.raison_sociale_concatene
                              : user?.societe?.raison_sociale_concatene
                          }_${user.societe_id ? user.societe_id : user.societe_id}/users/${
                            user?.photo
                          }`
                        : '/default-avatar.png'}
                alt="Profile preview"
                className="h-20 w-20 rounded-full object-cover border-2 border-blue-200"
              />
              {selectedImage && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                    fileInputRef.current.value = '';
                  }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              )}
            </div>
            <div className="flex-1">
              {selectedImage ? (
                <p className="text-sm text-slate-600">
                  Fichier sélectionné: <span className="font-medium">{selectedImage.name}</span>
                </p>
              ) : (
                <p className="text-sm text-slate-600">
                  Photo actuelle
                </p>
              )}
              <button
                type="button"
                onClick={handleImageClick}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {selectedImage ? 'Changer la photo' : 'Modifier la photo'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* If no image, show upload button */}
      {!imagePreview && !user?.photo && (
        <div className="mt-4">
          <button
            type="button"
            onClick={handleImageClick}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <Camera className="h-4 w-4" />
            Ajouter une photo de profil
          </button>
        </div>
      )}
      
      <div className="flex items-center justify-end pt-5 border-t border-slate-100">
        {error && (
          <span className="text-red-600 text-sm mr-4 flex items-center font-medium">
            {error}
          </span>
        )}
        {isSuccess && (
          <span className="text-emerald-600 text-sm mr-4 flex items-center font-medium">
            <Check className="h-4 w-4 mr-1.5" /> Enregistré avec succès
          </span>
        )}
        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </div>
    </form>
  );
}

/* ─── Security Form with Enhanced Validation ─── */
function SecurityForm({ user }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const { control, handleSubmit, formState: { errors }, watch, reset, setError: setFormError } = useForm({
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    },
    mode: 'onChange', // Validate on change to enable/disable button in real-time
    reValidateMode: 'onChange'
  });

  const newPassword = watch('new_password');
  const currentPassword = watch('current_password');
  const newPasswordConfirmation = watch('new_password_confirmation');

  // Check if form has validation errors or is incomplete
  const hasValidationErrors = () => {
    // Check if there are any errors from react-hook-form
    if (Object.keys(errors).length > 0) {
      return true;
    }
    
    // Check if any field is empty
    if (!currentPassword || !newPassword || !newPasswordConfirmation) {
      return true;
    }
    
    // Check password length
    if (newPassword.length < 8) {
      return true;
    }
    
    // Check if passwords match
    if (newPassword !== newPasswordConfirmation) {
      return true;
    }
    
    // Check if new password is same as current (optional, but good practice)
    if (newPassword === currentPassword) {
      return true;
    }
    
    return false;
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setIsSuccess(false);
    setError('');
    
    // Client-side validation: Check if new password is same as old
    if (data.new_password === data.current_password) {
      setFormError('new_password', {
        type: 'manual',
        message: 'Le nouveau mot de passe doit être différent de l\'ancien'
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        `${APIURL.ROOTV1}/update_password/${user.id}`,
        {
          current_password: data.current_password,
          new_password: data.new_password,
          new_password_confirmation: data.new_password_confirmation
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (response.data.success) {
        setIsSuccess(true);
        reset(); // Clear form after success
        
        // Optional: Show success message and maybe logout user or ask to login again
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      }
    } catch (err) {
      // Handle specific error messages from backend
      if (err.response?.data?.errors) {
        // Handle validation errors
        const backendErrors = err.response.data.errors;
        if (backendErrors.current_password) {
          setFormError('current_password', {
            type: 'manual',
            message: backendErrors.current_password[0]
          });
        }
        if (backendErrors.new_password) {
          setFormError('new_password', {
            type: 'manual',
            message: backendErrors.new_password[0]
          });
        }
      } else {
        setError(err.response?.data?.message || 'Une erreur est survenue');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const Toggle = ({ visible, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3.5 top-[38px] text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
      tabIndex={-1}
    >
      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4 max-w-md">
        <div className="space-y-2 relative">
          <TextField
            label="Mot de passe actuel"
            name="current_password"
            control={control}
            errors={errors}
            type={showCurrent ? 'text' : 'password'}
            required
            width="w-full"
            height="h-11"
            rules={{
              required: 'Le mot de passe actuel est requis'
            }}
          />
          <Toggle
            visible={showCurrent}
            onToggle={() => setShowCurrent(!showCurrent)}
          />
        </div>
        
        <div className="space-y-2 relative">
          <TextField
            label="Nouveau mot de passe"
            name="new_password"
            control={control}
            errors={errors}
            type={showNew ? 'text' : 'password'}
            required
            width="w-full"
            height="h-11"
            rules={{
              required: 'Le nouveau mot de passe est requis',
              minLength: {
                value: 8,
                message: 'Le mot de passe doit contenir au moins 8 caractères'
              },
              validate: {
                notSameAsOld: (value) => 
                  !currentPassword || value !== currentPassword || 'Le nouveau mot de passe doit être différent de l\'ancien'
              }
            }}
          />
          <Toggle
            visible={showNew}
            onToggle={() => setShowNew(!showNew)}
          />
          {/* Error message in red when validation fails */}
          {errors.new_password && (
            <p className="text-xs text-red-500 mt-1">
              {errors.new_password.message}
            </p>
          )}
          {/* Show requirement in red when not met */}
          {!errors.new_password && newPassword && newPassword.length > 0 && newPassword.length < 8 && (
            <p className="text-xs text-red-500 mt-1">
              Le mot de passe doit contenir au moins 8 caractères.
            </p>
          )}
          {/* Show requirement in gray when not started or met */}
          {!newPassword && !errors.new_password && (
            <p className="text-xs text-slate-400 mt-1">
              Le mot de passe doit contenir au moins 8 caractères.
            </p>
          )}
          {newPassword && newPassword.length >= 8 && !errors.new_password && (
            <p className="text-xs text-emerald-500 mt-1">
              ✓ Longueur minimale atteinte
            </p>
          )}
        </div>
        
        <div className="space-y-2 relative">
          <TextField
            label="Confirmation du mot de passe"
            name="new_password_confirmation"
            control={control}
            errors={errors}
            type={showConfirm ? 'text' : 'password'}
            required
            width="w-full"
            height="h-11"
            rules={{
              required: 'La confirmation du mot de passe est requise',
              validate: {
                matches: (value) => {
                  if (!newPassword) return true; // Skip if new password is not set yet
                  return value === newPassword || 'Les mots de passe ne correspondent pas';
                }
              }
            }}
          />
          <Toggle
            visible={showConfirm}
            onToggle={() => setShowConfirm(!showConfirm)}
          />
          {/* Error message in red when passwords don't match */}
          {errors.new_password_confirmation && (
            <p className="text-xs text-red-500 mt-1 font-medium">
              {errors.new_password_confirmation.message}
            </p>
          )}
          {/* Show error when passwords don't match (even if no form error yet) */}
          {!errors.new_password_confirmation && 
           newPassword && 
           newPasswordConfirmation && 
           newPassword !== newPasswordConfirmation && (
            <p className="text-xs text-red-500 mt-1 font-medium">
              Les mots de passe ne correspondent pas
            </p>
          )}
          {/* Success message when passwords match */}
          {!errors.new_password_confirmation && 
           newPassword && 
           newPasswordConfirmation && 
           newPassword === newPasswordConfirmation && (
            <p className="text-xs text-emerald-500 mt-1">
              ✓ Les mots de passe correspondent
            </p>
          )}
        </div>

        {/* Password strength indicator (optional) */}
        {newPassword && newPassword.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-slate-500 mb-1">Force du mot de passe:</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => {
                const isActive = 
                  (level === 1 && newPassword.length >= 8) ||
                  (level === 2 && newPassword.length >= 8 && /[A-Z]/.test(newPassword)) ||
                  (level === 3 && newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword)) ||
                  (level === 4 && newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[!@#$%^&*]/.test(newPassword));
                
                return (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full ${
                      isActive ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Utilisez au moins 8 caractères avec des majuscules, des chiffres et des symboles pour un mot de passe plus fort.
            </p>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-end pt-5 border-t border-slate-100">
        {error && (
          <span className="text-red-600 text-sm mr-4 flex items-center font-medium">
            {error}
          </span>
        )}
        {isSuccess && (
          <span className="text-emerald-600 text-sm mr-4 flex items-center font-medium">
            <Check className="h-4 w-4 mr-1.5" /> Mot de passe mis à jour avec succès
          </span>
        )}
        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading || hasValidationErrors()}
          className={hasValidationErrors() ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
        </Button>
      </div>
    </form>
  );
}
/* ─── Main Profile Page ─── */
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal');
  const { user, loading } = useAuth();

  // Update user in context locally
  const handleUserUpdate = (updatedUser) => {
    // Update localStorage
    localStorage.setItem('authUser', JSON.stringify(updatedUser));
    
    // Note: The page will reload after successful update
    // So we don't need to update context here
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Vous devez être connecté pour voir cette page.</p>
      </div>
    );
  }

  const tabs = [
    {
      key: 'personal',
      label: 'Informations personnelles',
      shortLabel: 'Infos',
      icon: User,
    },
    {
      key: 'security',
      label: 'Sécurité',
      shortLabel: 'Sécurité',
      icon: Shield,
    },
  ];

  // Get initials for avatar
  const getInitials = () => {
    const firstName = user?.prenom?.charAt(0) || '';
    const lastName = user?.name?.charAt(0) || '';
    return (firstName + lastName).toUpperCase();
  };

  return (
    <div className="w-full">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200 overflow-hidden">
        {/* Profile Header */}
        <div className="px-6 sm:px-8 pt-8 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            {/* In the main ProfilePage component, update the avatar section */}
            <div className="relative flex-shrink-0">
              {user.photo ? (
                <img 
                  src={user.photo&&
                    user.photo
                        ? `${RESOURCE_URL.DOCS}/${
                            user.societe
                              ? user?.societe?.raison_sociale_concatene
                              : user?.societe?.raison_sociale_concatene
                          }_${user.societe_id ? user.societe_id : user.societe_id}/users/${
                            user?.photo
                          }`
                        : '/default-avatar.png'} 
                  alt={`${user.name} ${user.prenom}`}
                  className="h-24 w-24 rounded-full object-cover shadow-lg shadow-blue-200/50 ring-4 ring-blue-50"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-200/50 ring-4 ring-blue-50">
                  {getInitials()}
                </div>
              )}
              {/* Note: The camera button in the header now just triggers the form's image upload */}
              <button
                onClick={() => {
                  // Switch to personal tab and trigger file input
                  setActiveTab('personal');
                  // Small delay to allow tab switch then trigger file input
                  setTimeout(() => {
                    const fileInput = document.querySelector('input[type="file"]');
                    if (fileInput) fileInput.click();
                  }, 100);
                }}
                className="absolute -bottom-1 -right-1 p-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-colors"
                aria-label="Changer la photo de profil"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            {/* Info */}
            <div className="text-center sm:text-left pt-1 flex-1">
              <h1 className="text-2xl font-bold text-slate-900">
                {user?.name} {user?.prenom}
              </h1>
              <div className="flex items-center justify-center sm:justify-start text-slate-500 mt-1.5 gap-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Compte {user?.is_actif == 1 ? 'actif' : 'désactivé'}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Tabs */}
        <div className="px-6 sm:px-8 pt-4">
          <div className="flex gap-1 relative">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${isActive ? 'text-blue-600' : ''}`}
                  />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 sm:mx-8 mt-3 border-t border-slate-100" />

        {/* Section Header + Content */}
        <div className="px-6 sm:px-8 py-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              {activeTab === 'personal'
                ? 'Informations personnelles'
                : 'Sécurité'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {activeTab === 'personal'
                ? 'Mettez à jour vos informations personnelles et vos coordonnées.'
                : 'Gérez votre mot de passe et les paramètres de sécurité de votre compte.'}
            </p>
          </div>

          {activeTab === 'personal' && (
            <PersonalInfoForm user={user} onUpdate={handleUserUpdate} />
          )}
          {activeTab === 'security' && <SecurityForm user={user} />}
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-slate-400 mt-6">
        Vos données sont protégées et sécurisées.
      </p>
    </div>
  );
}