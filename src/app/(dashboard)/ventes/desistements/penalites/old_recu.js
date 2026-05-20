import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

import { MODE_PAIEMENT } from '@/configs/enum';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  logoContainer: {
    width: '30%',
    minHeight: 80,
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: 'contain',
  },
  companyDetails: {
    width: '65%',
    fontSize: 9,
    textAlign: 'right',
    lineHeight: 1.5,
  },
  title: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textDecoration: 'underline',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 20,
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 20,
  },
  text: {
    fontSize: 11,
    lineHeight: 1.6,
    textAlign: 'justify',
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  underline: {
    textDecoration: 'underline',
  },
  footer: {
    textAlign: 'center',
    fontSize: 10,
    marginTop: 30,
    color: '#7F8C8D',
  },
  signature: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 50,
    fontSize: 10,
    paddingHorizontal: 20,
  },
  stampArea: {
    marginTop: 30,
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 9,
  },
  infoBox: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#E74C3C',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: '35%',
    fontWeight: 'bold',
    color: '#34495E',
  },
  infoValue: {
    width: '65%',
    color: '#2C3E50',
  },
  badge: {
    backgroundColor: '#E74C3C',
    padding: 6,
    textAlign: 'center',
    marginBottom: 15,
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E74C3C',
    textAlign: 'center',
    marginVertical: 15,
    backgroundColor: '#FDEBD0',
    padding: 10,
    borderRadius: 5,
  },
  warningBox: {
    backgroundColor: '#FADBD8',
    padding: 7,
    marginVertical: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  warningText: {
    fontSize: 5,
    color: '#C0392B',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "0 DH";
  
  const num = Math.round(Number(amount));
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  
  return `${formatted} DH`;
};

const PenaliteDesistementDocument = ({ data }) => {
  const user = JSON.parse(localStorage.getItem('authUser'));
  const societe = user?.societe || {};
  const logoUrl = `/images/${societe.raison_sociale_concatene}_${societe.id}/logos/${societe.logo}`;

  // Extraction des données
  const codeDossier = data[0];
  const numeroRecu = data[1];
  const montantPenalite = data[2];
  const modePaiement = data[3];
  const numeroPaiement = data[4];
  const bien = data[5]; // C'est un objet bien complet
  const clients = data[8];
  
  // Fonction pour obtenir le nom complet du bien à partir de l'objet
  const getNomBienComplet = (bien) => {
    if (!bien || typeof bien === 'string') {
      return bien || '';
    }
    
    const noms = [];
    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);
    if (bien.propriete_dite_bien) noms.push(bien.propriete_dite_bien);
    
    return noms.length > 0 ? noms.join(' - ') : (bien.propriete_dite_bien || bien.numero || 'Bien non spécifié');
  };
  
  const bienCompletNom = getNomBienComplet(bien);
  
  // Gestion des clients (qui peut être un tableau de tableaux)
  let clientsFormatted = 'Le client';
  let estMultiplesClients = false;
  
  if (clients && Array.isArray(clients)) {
    // Aplatir le tableau si nécessaire
    const flatClients = clients.flat();
    if (flatClients.length > 0) {
      clientsFormatted = flatClients.join(' ');
      estMultiplesClients = flatClients.length > 1;
    }
  } else if (typeof clients === 'string') {
    clientsFormatted = clients;
  }

  const modePaiementLibelle = MODE_PAIEMENT[modePaiement]?.label || '';
  const estEspece = modePaiementLibelle === 'Espèce';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - Style pré-réservation */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              src={logoUrl}
              style={styles.logo}
            />
          </View>
          <View style={styles.companyDetails}>
            <Text style={[styles.bold, { marginBottom: 5 }]}>
              {societe?.raison_sociale || 'Société'}
            </Text>
            {societe?.adresse && <Text>Adresse:{societe.adresse}</Text>}
            {societe?.ville && <Text>Ville:{societe.ville}</Text>}
            {societe?.tel && <Text>Tél: {societe.tel}</Text>}
            {societe?.email && <Text>Email: {societe.email}</Text>}
            {societe?.rc && <Text>RC: {societe.rc}</Text>}
            {societe?.ice && <Text>ICE: {societe.ice}</Text>}
          </View>
        </View>


        <Text style={styles.title}>REÇU DE PÉNALITÉ DE DÉSISTEMENT</Text>
        <Text style={styles.subtitle}>N° {numeroRecu || ''}</Text>

        <View style={styles.section}>
          {/* Informations récapitulatives */}
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>N° Dossier :</Text>
              <Text style={styles.infoValue}>{codeDossier || ''}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bien immobilier :</Text>
              <Text style={styles.infoValue}>{bienCompletNom}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Client(s) :</Text>
              <Text style={styles.infoValue}>{clientsFormatted}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mode de paiement :</Text>
              <Text style={styles.infoValue}>
                {modePaiementLibelle}
                {!estEspece && numeroPaiement && ` - N°: ${numeroPaiement}`}
              </Text>
            </View>
          </View>

          {/* Montant en évidence */}
          <Text style={styles.amount}>
            Montant de la pénalité : {formatCurrency(montantPenalite)}
          </Text>

          {/* Texte officiel */}
          <Text style={styles.text}>
            Nous, <Text style={styles.bold}>{societe?.raison_sociale || 'La société'}</Text>, 
            attestons par la présente que {estMultiplesClients ? 'les clients' : 'le client'}{' '}
            <Text style={styles.bold}>{clientsFormatted}</Text> {estMultiplesClients ? 'ont' : 'a'} versé{!estMultiplesClients && 'e'} 
            une pénalité de désistement d{"'"}un montant de{' '}
            <Text style={styles.bold}>{formatCurrency(montantPenalite)}</Text>.
          </Text>

          <Text style={styles.text}>
            Ce règlement a été effectué {estEspece ? 'en espèces' : `par ${modePaiementLibelle}`}
            {!estEspece && numeroPaiement && ` sous la référence n° ${numeroPaiement}`}, 
            concernant le bien immobilier désigné sous la référence{' '}
            <Text style={styles.bold}>{bienCompletNom}</Text>.
          </Text>

          <Text style={styles.text}>
            La présente pénalité de désistement est versée suite à la décision du client 
            de ne pas donner suite à la réservation du bien immobilier. Conformément aux 
            conditions générales de vente et à la clause de réservation signée par les parties,
            ce montant reste définitivement acquis à la société à titre de dommages et intérêts.
          </Text>

          {/* Avertissement */}
        

          <Text style={styles.text}>
            Par le présent reçu, le client reconnaît avoir été informé des conditions 
            de désistement et accepte que cette pénalité reste acquise à la société.
          </Text>

          <Text style={styles.text}>
            Fait à {societe?.ville || '............'}, le {new Date().toLocaleDateString('fr-FR')}
          </Text>

        

      <View style={styles.signature}>
  <View style={{ width: '40%' }}>
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: '#000',
        marginTop: 40,
        paddingTop: 5,
      }}
    >
      <Text style={[styles.underline, { fontSize: 9 }]}>
        Signature du Client
      </Text>
      <Text style={{ fontSize: 8, marginTop: 3 }}>{clientsFormatted}</Text>
      <Text style={{ fontSize: 8 }}>CIN / Passeport</Text>
    </View>
  </View>

  <View style={{ width: '40%', textAlign: 'right' }}>
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: '#000',
        marginTop: 40,
        paddingTop: 5,
      }}
    >
      <Text style={[styles.underline, { fontSize: 9 }]}>
        Signature de la Société
      </Text>
      <Text style={{ fontSize: 8, marginTop: 3 }}>
        {societe?.raison_sociale || 'Société'}
      </Text>
      <Text style={{ fontSize: 8 }}>Représentant légal</Text>
    </View>
  </View>
</View>



         
                   
         
                  
                 </View>
               </Page>
    </Document>
  );
};

export default PenaliteDesistementDocument;