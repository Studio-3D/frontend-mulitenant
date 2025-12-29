import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

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

const MyDocument = ({ data }) => {
  // Extract data from props - Now includes user data as last element
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
    userData, // Last element contains user data
  ] = data;

  // Use passed user data
  const user = userData || {};
  const societe = user?.societe || {};
  const imageUrl = `/docs/${user.societe.raison_sociale_concatene}_${user.societe.id}/logos/${user.societe.logo}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête avec logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {imageUrl ? (
              <Image
                src={
                  'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=200&auto=format&fit=crop'
                }
                style={styles.logo}
              />
            ) : (
              <View
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: '#f0f0f0',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px solid #ccc',
                }}
              >
                <Text style={{ fontSize: 8, color: '#666' }}>LOGO</Text>
                <Text style={{ fontSize: 6, color: '#999' }}>
                  Non disponible
                </Text>
              </View>
            )}
          </View>
          <View style={styles.companyDetails}>
            <Text style={[styles.bold, { marginBottom: 5 }]}>
              {societe?.raison_sociale || 'Société'}
            </Text>
            {societe?.adresse && <Text>{societe.adresse}</Text>}
            {societe?.ville && <Text>{societe.ville}</Text>}
            {societe?.tel && <Text>Tél: {societe.tel}</Text>}
            {societe?.email && <Text>Email: {societe.email}</Text>}
            {societe?.rc && <Text>RC: {societe.rc}</Text>}
            {societe?.ice && <Text>ICE: {societe.ice}</Text>}
          </View>
        </View>

        <View style={styles.line} />

        {/* Titre principal */}
        <Text style={styles.title}>REÇU DE PRÉ-RÉSERVATION</Text>
        <Text style={styles.subtitle}>N° {code_pre_reserve || ''}</Text>

        {/* Contenu principal */}
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
              au {niveau == 0 ? 'Rez-de-chaussée' : niveau + 'ème étage'},{' '}
              {"d'"}une superficie de {superficie || ''} m². Ce bien est proposé
              au prix de{' '}
              <Text style={styles.bold}>
                {prix ? prix.toLocaleString('fr-FR') : ''} DH
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
            Ce reçu atteste de {"l'"}engagement du client à procéder à la
            réservation définitive du bien selon les modalités convenues entre
            les parties.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>
              {date_pre_reserve
                ? new Date(date_pre_reserve).toLocaleDateString('fr-FR')
                : ''}
            </Text>
            .
          </Text>

          <Text style={styles.text}>
            Fait à {societe?.ville || '...'}, le{' '}
            {new Date().toLocaleDateString('fr-FR')}
          </Text>

          {/* Zone de signatures */}
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
                <Text style={{ fontSize: 8, marginTop: 3 }}>Nom et prénom</Text>
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

          {/* Zone pour cachet */}
          <View style={styles.stampArea}>
            <Text style={{ marginBottom: 10 }}>
              Cachet et signature de la société
            </Text>
            <View
              style={{
                width: 150,
                height: 80,
                border: '1px dashed #999',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 8, color: '#999' }}>Cachet ici</Text>
            </View>
          </View>

          {/* Pied de page */}
          <View style={styles.footer}>
            <Text>Merci pour votre confiance</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default MyDocument;
