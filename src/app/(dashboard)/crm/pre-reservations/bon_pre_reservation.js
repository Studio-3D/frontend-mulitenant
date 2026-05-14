import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { RESOURCE_URL } from '@/configs/api';

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
  propertyDetails: {
    marginTop: 20,
    marginBottom: 15,
    lineHeight: 1.8,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 30,
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
});

const BonPreReservationDocument = ({ data }) => {
  const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "0 DH";
  
  // Arrondir et convertir en nombre
  const num = Math.round(Number(amount));
  
  // Ajouter les espaces tous les 3 chiffres
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  
  return `${formatted} DH`;
};
  const [
    visite_id,
    code_pre_reserve,
    rdv_date,
    date_pre_reserve,
    bien_propriete,
    niveau,
    superficie,
    orientation,
    prix,
    userName,
    userPrenom,
    userData,
  ] = data;

  const user = userData || {};
  const societe = user?.societe || {};
// In your PDF component, use the frontend image path
  //const logoUrl = `/images/${societe.raison_sociale_concatene}_${societe.id}/logos/${societe.logo}`;
  const logoUrl = `${RESOURCE_URL.DOCS}/${user.societe.raison_sociale_concatene}_${user.societe.id}/logos/${user.societe.logo}`;

const getOrientationFullName = (abbreviation) => {
  const orientationMap = {
    'N': 'Nord',
    'S': 'Sud',
    'E': 'Est',
    'O': 'Ouest',
    'N_E': 'Nord-Est',
    'N_O': 'Nord-Ouest',
    'S_E': 'Sud-Est',
    'S_O': 'Sud-Ouest',
  };
  return orientationMap[abbreviation] || abbreviation;
}; 
  const orientationFullName = getOrientationFullName(orientation);

return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              src={logoUrl}  // Use absolute path from public folder
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


        <Text style={styles.title}>REÇU DE PRÉ-RÉSERVATION</Text>
        <Text style={styles.subtitle}>N° {code_pre_reserve || ''}</Text>

        <View style={styles.section}>
          <Text style={styles.text}>
            La société{' '}
            <Text style={styles.bold}>
              {societe?.raison_sociale || 'Société'}
            </Text>
            , confirme la pré-réservation du bien immobilier suivant :
          </Text>

          <View style={styles.propertyDetails}>
            <Text style={styles.text}>
              Le bien identifié sous la référence{' '}
              <Text style={styles.bold}>{bien_propriete || ''}</Text> est situé
              au { 
                    niveau == 0 ? 'Rez-de-chaussée' : 
                    (niveau == 1 ? '1er étage' : 
                    (niveau == 2 ? '2ème étage' : 
                    niveau + 'ème étage')) 
                },{' '}
              d{"'"}une superficie de {superficie == null ? 0 : superficie} m² et  {orientationFullName ? `orientation ${orientationFullName}` : ''}. Ce bien est proposé
              au prix de{' '}
              <Text style={styles.bold}>
                {prix ? formatCurrency(prix) : ''} DH
              </Text>
              .
              {rdv_date && (
                <>
                  {' '}
                  Un rendez-vous a été fixé pour le{' '}
                  <Text style={styles.bold}>
                    {rdv_date
                      ? new Date(rdv_date).toLocaleDateString('fr-FR')
                      : ''}
                  </Text>{' '}
                  afin de finaliser cette réservation.
                </>
              )}
            </Text>
          </View>

          <Text style={styles.text}>
            Ce reçu atteste de l{"'"}engagement du client à procéder à la
            réservation définitive du bien selon les modalités convenues entre
            les parties.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>
              {date_pre_reserve
                ? new Date(date_pre_reserve).toLocaleDateString('fr-FR')
                : ''}
            </Text>
            
          </Text>

          <Text style={styles.text}>
            Fait à {societe?.ville || '............'}, le{' '}
            {new Date().toLocaleDateString('fr-FR')}
          </Text>

          <View style={styles.signature}>
            <View style={{ width: '40%' }}>
              <View
                style={{
                  borderTop: '1px solid #000',
                  marginTop: 40,
                  paddingTop: 5,
                }}
              >
                <Text style={[styles.underline, { fontSize: 9 }]}>
                  Signature du Client
                </Text>
                <Text style={{ fontSize: 8, marginTop: 3 }}></Text>
                <Text style={{ fontSize: 8 }}>CIN / Passeport</Text>
              </View>
            </View>

            <View style={{ width: '40%', textAlign: 'right' }}>
              <View
                style={{
                  borderTop: '1px solid #000',
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

export default BonPreReservationDocument;
