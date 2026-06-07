'use client';

import React, { useEffect, useState } from "react";
import {
  Home,
  User,
  Building2,
  Calendar,
  CheckCircle2,
  MinusCircle,
  Clock,
  Phone,
  Mail,
  Hash,
  PenTool,
  Stamp,
  ChevronUp,
  ChevronDown,
  FileText,
  ClipboardCheck,
  Scale,
  CreditCard,
  Briefcase,
  FileSignature
} from 'lucide-react'
import axios from 'axios';
import { useParams } from 'next/navigation';
import LoadingSpin from '@/components/LoadingSpin';
import { useAuth } from "@/context/AuthContext";
import { APIURL } from "@/configs/api";
import { getOrientationLabelFromAbbreviation } from "@/configs/enum";
import { AlertCircle } from 'lucide-react';
import { Eye } from 'lucide-react'; // Add this import
import BreadCrumb from "../../navigation/BreadCrumb";

// ── HELPERS ──
const formatPrice = (p) => p ? p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' MAD' : '0 MAD'
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR');
};

// Determine stage status based on data
const getStageStatus = (stageData, isCompromis = false, isContrat = false) => {
  if (!stageData) return 'empty';
  
  if (isCompromis) {
    // For compromis: check all fields + compromis_signee
    const fields = [
      stageData.date_sign_client,
      stageData.date_sign_mo,
      stageData.date_enreg,
      stageData.compromis_signee
    ];
    const allValid = fields.every(field => field && field !== '');
    const someValid = fields.some(field => field && field !== '');
    
    if (allValid) return 'completed';
    if (someValid) return 'in_progress';
    return 'empty';
  }
  
  if (isContrat) {
    // For contrat: check all fields + piece_jointe
    const fields = [
      stageData.date_sign_client,
      stageData.date_sign_mo,
      stageData.date_enreg,
      stageData.piece_jointe
    ];
    const allValid = fields.every(field => field && field !== '');
    const someValid = fields.some(field => field && field !== '');
    
    if (allValid) return 'completed';
    if (someValid) return 'in_progress';
    return 'empty';
  }
  
  // For other stages
  const fields = Object.values(stageData).filter(val => typeof val !== 'boolean');
  const allValid = fields.every(field => field && field !== '');
  const someValid = fields.some(field => field && field !== '');
  
  if (allValid) return 'completed';
  if (someValid) return 'in_progress';
  return 'empty';
};

// Get color based on status
const getStatusColor = (status) => {
  switch(status) {
    case 'completed': return '#10b981'; // green
    case 'in_progress': return '#f59e0b'; // orange
    default: return '#d1d5db'; // gray
  }
};

// Update the getGlobalStatus function to include livraison
const getGlobalStatus = () => {
  // First check livraison status (remise clés)
  if (livraisonStatus === 'completed') return 'Clés remises';
  
  // Then check contrat status
  if (contratStatus === 'completed') return 'Contrat signé';
  if (contratStatus === 'in_progress') return 'Contrat en cours';
  
  // Then check compromis status
  if (compromisStatus === 'completed') return 'Attestation signé';
  if (compromisStatus === 'in_progress') return 'Attestation en cours';
  
  // Default to reservation
  return 'Réservation';
};

// Transform API data to match mock structure
// Update the transformApiData function - move getGlobalStatus inside and fix the logic
const transformApiData = (apiData) => {
  if (!apiData?.reservation) return null;
  
  const reservation = apiData.reservation;
  const bien = reservation.bien;
  const aquereurs = reservation.aquereurs || [];
  const composition = bien?.composition_bien?.[0] || {};
  const compromis = reservation.compromis_vente;
  const contrat = reservation.contrat_vente;
  const remiseCle = bien?.remise_cle;
  
  // Determine compromis status
  const compromisStatus = getStageStatus(compromis, true, false);
  
  // Determine contrat status
  const contratStatus = getStageStatus(contrat, false, true);
  
  // Determine livraison status based on remise clés
  const livraisonStatus = remiseCle?.date_remise ? 'completed' : 'empty';
  
  // Define getGlobalStatus inside transformApiData where variables are available
  const getGlobalStatus = () => {
    // First check livraison status (remise clés)
    if (livraisonStatus === 'completed') return 'Clés remises';
    
    // Then check contrat status
    if (contratStatus === 'completed') return 'Contrat signé';
    if (contratStatus === 'in_progress') return 'Contrat en cours';
    
    // Then check compromis status
    if (compromisStatus === 'completed') return 'Attestation signé';
    if (compromisStatus === 'in_progress') return 'Attestation en cours';
    
    // Default to reservation
    return 'Réservation';
  };
  
  const NomBienComplet = (bien) => {
    if (!bien) return "";
    
    const noms = [];
    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);
    if (bien.propriete_dite_bien) noms.push(bien.propriete_dite_bien);

    return noms.join(" - ");
  };

  return {
    id: `${reservation.id}`,
    code_reservation: `${reservation.code_reservation}`,
    globalStatus: getGlobalStatus(),
    clients: aquereurs.map(aq => ({
      nom: aq.client?.nom || '',
      prenom: aq.client?.prenom || '',
      cin: aq.client?.cin || '',
      telephone: aq.client?.telephone_num1 || '',
      email: aq.client?.email || '',
      pourcentage: aq.pourcentage
    })),
    notaire: {
      nom: reservation.notaire?.name || '',
      prenom: reservation.notaire?.prenom || '',
      email: reservation.notaire?.email || '',
      telephone: reservation.notaire?.phone || null
    },
    bien: {
      propriete: NomBienComplet(reservation?.bien) ||'',
      projet: reservation.projet?.nom || '',
      reference: bien?.numero || '',
      type: bien?.type_bien?.type || '',
      nombre_pieces: (composition.nbre_chambres || 0) + 
                     (composition.nbre_salons || 0) + 
                     (composition.nbre_cuisines || 0),
      nombre_chambres: composition.nbre_chambres || 0, // Fixed typo from nomrbe_chambres to nombre_chambres
      superficie: bien?.superficie_total || 0,
      prix: reservation?.prix || 0,
      etage: bien?.niveau === 0 ? 'RDC' : `Étage ${bien.niveau}`,
      adresse: reservation.projet?.adresse || '',
      orientation: bien?.orientation || '',
      titre_foncier: bien?.titre_foncier || '',
      superficie_balcon: bien?.superficie_balcon || 0,
      superficie_terrasse: bien?.superficie_terrasse || 0,
      prix_parking: bien?.prix_parking || 0,
      composition: composition,
      remise_cle: remiseCle
    },
    reservation: {
      bien_id: reservation.bien_id || '',
      code: reservation.code_reservation || '',
      date: formatDate(reservation.date_reservation) || '',
      status: 'completed',
      prix: reservation.prix || 0,
      avance_versee: apiData.sum_avances_valides || 0,
      first_avance: reservation.first_avance
    },
    compromis: {
      date_signature_client: formatDate(compromis?.date_sign_client),
      date_signature_mo: formatDate(compromis?.date_sign_mo),
      date_enregistrement: formatDate(compromis?.date_enreg),
      compromis_signee: compromis?.compromis_signee || null,
      status: compromisStatus
    },
    contrat: {
      date_signature_client: formatDate(contrat?.date_sign_client),
      date_signature_mo: formatDate(contrat?.date_sign_mo),
      date_enregistrement: formatDate(contrat?.date_enreg),
      contrat_signe: contrat?.piece_jointe || null,
      status: contratStatus
    },
    livraison: {
      date_livraison: formatDate(remiseCle?.date_remise),
      fichier_livraison: remiseCle?.fichier || null,
      status: livraisonStatus
    }
  };
};

// Remove the standalone getGlobalStatus function from outside transformApiData
// const getGlobalStatus = () => { ... } // DELETE THIS

// ── SUB-COMPONENTS ──

// Update the TopBar component
function TopBar({ dossier, isOpen, onToggle }) {
  const d = dossier
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ background: '#f1f5f9', color: '#64748b', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>
          {'Code :'+d.code_reservation}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#059669', padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, border: '1px solid #a7f3d0' }}>
          <Clock size={14} />
          {d.globalStatus}
        </span>
        <span style={{ fontSize: '15px', color: '#1e293b', fontWeight: 700 }}>
          {d.clients[0]?.prenom} {d.clients[0]?.nom}
        </span>
        <span style={{ color: '#94a3b8', fontSize: '14px' }}>
          • {d.bien.type} {d.bien.nombre_chambres!=0 && d.bien.nombre_chambres+'chambres'} • {d.bien.superficie}m² • {formatPrice(d.reservation.prix)}
        </span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* View Details Link */}
        <a 
          href={`/ventes/reservations/${d.id}`} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '13px', 
            color: '#4f46e5', 
            fontWeight: 500, 
            textDecoration: 'none',
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '6px',
            background: '#f5f3ff',
            border: '1px solid #ddd6fe',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#ede9fe';
            e.target.style.borderColor = '#c4b5fd';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#f5f3ff';
            e.target.style.borderColor = '#ddd6fe';
          }}
        >
          <Eye size={14} />
          Voir les détails
        </a>
        
        {/* Toggle Button */}
        <button 
          onClick={onToggle} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '13px', 
            color: '#64748b', 
            fontWeight: 500, 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '6px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#f8fafc';
          }}
        >
          Détails du dossier
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
    </div>
  )
}

function InfoSection({ dossier }) {
  const d = dossier
  const labelStyle = { fontSize: '13px', color: '#94a3b8', minWidth: '80px' }
  const valueStyle = { fontSize: '13px', color: '#1e293b', fontWeight: 600, textAlign: 'right' }
  const iconRowStyle = { display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0' }
  const sectionTitleStyle = { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }
  const titleTextStyle = { fontSize: '15px', fontWeight: 700, color: '#1e293b' }
  const iconColor = '#4f46e5'

  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '28px 24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
        
        <div>
          <div style={sectionTitleStyle}>
            <Home size={18} color={iconColor} />
            <span style={titleTextStyle}>Le Bien</span>
          </div>
         {[
  ['Projet', d.bien.projet],
  ['Propriete dite bien', d.bien.propriete],
  ['Numéro', d.bien.reference],
  ['Type', `${d.bien.type} ${d.bien.nombre_chambres != 0 && d.bien.nombre_chambres + ' chambres'}`],
  ['Étage', d.bien.etage],
  ['Orientation', getOrientationLabelFromAbbreviation(d.bien.orientation)],
  ['Titre foncier', d.bien.titre_foncier]
].map(([label, val]) => (
  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '6px 0' }}>
    <span style={labelStyle}>{label}</span>
    {label === 'Propriete dite bien' && val ? (
      <a 
        href={`/biens/${d?.reservation?.bien_id}`} 
        style={{ 
          fontSize: '13px', 
          color: '#4f46e5', 
          fontWeight: 600, 
          textDecoration: 'none',
          cursor: 'pointer',
          borderBottom: '1px solid #c7d2fe',
          paddingBottom: '1px'
        }}
        onMouseEnter={(e) => {
          e.target.style.color = '#3730a3';
          e.target.style.borderBottom = '2px solid #3730a3';
        }}
        onMouseLeave={(e) => {
          e.target.style.color = '#4f46e5';
          e.target.style.borderBottom = '1px solid #c7d2fe';
        }}
      >
        {val}
      </a>
    ) : (
      <span style={valueStyle}>{val || 'Non spécifié'}</span>
    )}
  </div>
))}
        </div>

        <div>
          <div style={sectionTitleStyle}>
            <User size={18} color={iconColor} />
            <span style={titleTextStyle}>Client(s)</span>
          </div>
          {d.clients.map((client, idx) => (
            <div key={idx} style={{ marginBottom: idx < d.clients.length - 1 ? '16px' : 0, paddingBottom: idx < d.clients.length - 1 ? '16px' : 0, borderBottom: idx < d.clients.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={iconRowStyle}><User size={15} color="#94a3b8" /><span style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>{client.prenom} {client.nom} ({client.pourcentage}%)</span></div>
              <div style={iconRowStyle}><CreditCard size={15} color="#94a3b8" /><span style={{ fontSize: '13px', color: '#475569' }}>{client.cin || 'Non renseigné'}</span></div>
              <div style={iconRowStyle}><Phone size={15} color="#94a3b8" /><span style={{ fontSize: '13px', color: '#475569' }}>{client.telephone || 'Non renseigné'}</span></div>
              <div style={iconRowStyle}><Mail size={15} color="#94a3b8" /><span style={{ fontSize: '13px', color: '#475569' }}>{client.email || 'Non renseigné'}</span></div>
            </div>
          ))}
        </div>

        <div>
          <div style={sectionTitleStyle}>
            <Building2 size={18} color={iconColor} />
            <span style={titleTextStyle}>Notaire</span>
          </div>
          <div style={iconRowStyle}><User size={15} color="#94a3b8" /><span style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>Maître {d.notaire.prenom} {d.notaire.nom}</span></div>
          <div style={iconRowStyle}><Mail size={15} color="#94a3b8" /><span style={{ fontSize: '13px', color: '#475569' }}>{d.notaire.email || 'Non renseigné'}</span></div>
          <div style={iconRowStyle}><Phone size={15} color="#94a3b8" /><span style={{ fontSize: '13px', color: d.notaire.telephone ? '#475569' : '#cbd5e1', fontStyle: d.notaire.telephone ? 'normal' : 'italic' }}>{d.notaire.telephone || 'Non renseigné'}</span></div>
        </div>
      </div>
    </div>
  )
}

// Update the FieldItem component to accept custom color
function FieldItem({ label, value, icon: Icon, completed, isSignature = false, warning = false }) {
  const isDone = completed && value
  const bgColor = isDone ? '#f0fdf4' : '#fefce8'
  const pendingBg = !value ? '#f8fafc' : bgColor
  const borderColor = isDone ? '#dcfce7' : !value ? '#e2e8f0' : '#fef9c3'
  
  // Determine text color based on warning status
  const textColor = warning ? '#dc2626' : value ? '#1e293b' : '#ea580c'

  return (
    <div style={{ 
      background: pendingBg, 
      borderRadius: '10px', 
      padding: '12px 14px', 
      marginBottom: '10px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      border: `1px solid ${warning ? '#fecaca' : borderColor}`,
      borderLeft: warning ? '4px solid #dc2626' : `1px solid ${borderColor}`
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {Icon && <Icon size={14} color={warning ? '#dc2626' : '#94a3b8'} />}
          <span style={{ 
            fontSize: '14px', 
            fontWeight: 600, 
            color: textColor, 
            fontStyle: value ? 'normal' : 'italic' 
          }}>
            {isSignature && value ? 'Document signé ' : value || 'En attente'}
          </span>
          {warning && <AlertCircle size={14} color="#dc2626" />}
        </div>
        {/*isSignature && value && (
          <span style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>
            {value}
          </span>
        )*/}
      </div>
      {value ? (
        <div style={{ 
          width: '28px', 
          height: '28px', 
          borderRadius: '50%', 
          background: warning ? '#fef2f2' : '#dcfce7', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          {warning ? (
            <AlertCircle size={18} color="#dc2626" />
          ) : (
            <CheckCircle2 size={18} color="#16a34a" />
          )}
        </div>
      ) : (
        <div style={{ 
          width: '28px', 
          height: '28px', 
          borderRadius: '50%', 
          background: '#f1f5f9', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <MinusCircle size={18} color="#94a3b8" />
        </div>
      )}
    </div>
  )
}

function StageCard({ title, icon: Icon, titleColor, dotColor, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon size={18} color={titleColor} />
          <span style={{ fontSize: '15px', fontWeight: 700, color: titleColor }}>{title}</span>
        </div>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: dotColor }} />
      </div>
      <div style={{ padding: '14px', flex: 1 }}>
        {children}
      </div>
    </div>
  )
}

export default function DossierPage() {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const { id } = useParams();
  const [dossierData, setDossierData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const accessToken = token || localStorage.getItem('accessToken');

  const fetchData = async () => {
    try {
      if (!id) {
        setError('No reservation ID provided');
        return;
      }

      setLoading(true);
      setError(null);

      if (!accessToken) {
        throw new Error('No access token found');
      }

      const apiUrl = `${APIURL.ROOTV1}/etat_dossier/${id}`;
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      const transformedData = transformApiData(response.data);
      setDossierData(transformedData);
      
    } catch (error) {
      console.error('Error fetching dossier:', error);
      if (error.response) {
        setError(`Server error: ${error.response.status}`);
      } else if (error.request) {
        setError('No response from server');
      } else {
        setError(`Request error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <LoadingSpin />
      </div>
    );
  }

  if (error || !dossierData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>
        {error || 'No data available'}
      </div>
    );
  }

  const d = dossierData;
// In the main component, calculate the reste and dot color
const reste = d.reservation.prix - d.reservation.avance_versee;
const reservationDotColor = reste > 0 ? '#ef4444' : '#10b981'; // red if reste > 0, else green
  return (
    <>
      <div className="flex items-center justify-start">
            <BreadCrumb
              baseUrl={'/etat-dossiers'}
              step={`Détail Dossier`}
            />
      </div>
      <div style={{ minHeight: '100vh', background: '#eef2f7', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        
        <TopBar dossier={d} isOpen={isDetailsOpen} onToggle={() => setIsDetailsOpen(!isDetailsOpen)} />
        
        {isDetailsOpen && <InfoSection dossier={d} />}

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            
            {/* Réservation - Always green since data exists */}
          <StageCard title="Détail Réservation" icon={Calendar} titleColor="#2563eb" dotColor={reservationDotColor}>
            
    <FieldItem 
      label="Code Réservation" 
      value={`${d.reservation.code}`} 
      icon={Hash} 
      completed={!!d.reservation.code} 
    />
    <FieldItem 
      label="Date de réservation" 
      value={d.reservation.date} 
      completed={!!d.reservation.date} 
    />
    <FieldItem 
      label="Prix total" 
      value={formatPrice(d.reservation.prix)} 
      icon={CreditCard} 
      completed={!!d.reservation.prix} 
    />
    <FieldItem 
      label="Avance versée" 
      value={formatPrice(d.reservation.avance_versee)} 
      icon={CheckCircle2} 
      completed={!!d.reservation.avance_versee} 
    />
    <FieldItem 
      label="Reste à payer" 
      value={formatPrice(d.reservation.prix - d.reservation.avance_versee)} 
      icon={AlertCircle} 
      completed={reste === 0}
      warning={reste > 0}
    />
  </StageCard>

            {/* Compromis de Vente - Dynamic color based on status */}
            <StageCard 
              title="Attestation de Vente" 
              icon={FileText} 
              titleColor={d.compromis.status === 'completed' ? '#2563eb' : d.compromis.status === 'in_progress' ? '#ea580c' : '#6b7280'}
              dotColor={getStatusColor(d.compromis.status)}
            >
              <FieldItem label="Date d'enregistrement" value={d.compromis.date_enregistrement} completed={!!d.compromis.date_enregistrement} />
              <FieldItem label="Signature Client" value={d.compromis.date_signature_client} icon={PenTool} completed={!!d.compromis.date_signature_client} />
              <FieldItem label="Signature Maître d'Ouvrage" value={d.compromis.date_signature_mo} icon={Stamp} completed={!!d.compromis.date_signature_mo} />
              <FieldItem 
                label="Attestation signé" 
                value={d.compromis.compromis_signee} 
                icon={FileSignature} 
                completed={!!d.compromis.compromis_signee}
                isSignature={true}
              />
            </StageCard>

            {/* Contrat de Vente - Dynamic color based on status */}
            <StageCard 
              title="Contrat de Vente" 
              icon={Scale} 
              titleColor={d.contrat.status === 'completed' ? '#2563eb' : d.contrat.status === 'in_progress' ? '#ea580c' : '#6b7280'}
              dotColor={getStatusColor(d.contrat.status)}
            >
              <FieldItem label="Date d'enregistrement" value={d.contrat.date_enregistrement} completed={!!d.contrat.date_enregistrement} />
              <FieldItem label="Signature Maître d'Ouvrage" value={d.contrat.date_signature_mo} icon={Stamp} completed={!!d.contrat.date_signature_mo} />
              <FieldItem label="Signature Client" value={d.contrat.date_signature_client} icon={PenTool} completed={!!d.contrat.date_signature_client} />
              <FieldItem 
                label="Contrat signé" 
                value={d.contrat.contrat_signe} 
                icon={FileSignature} 
                completed={!!d.contrat.contrat_signe}
                isSignature={true}
              />
            </StageCard>

            {/* Livraison - Always gray since no data */}
            <StageCard title="Livraison" icon={Briefcase} titleColor="#6b7280" dotColor={getStatusColor(d.livraison.status)}>
              <FieldItem label="Date de livraison" value={d.livraison.date_livraison} completed={!!d.livraison.date_livraison} />
            </StageCard>
          </div>
        </div>
      </div>
    </>
  )
}