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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: '30%',
  },
  logo: {
    width: 60,
    height: 'auto',
  },
  companyDetails: {
    width: '60%',
    fontSize: 9,
    textAlign: 'right',
    lineHeight: 1.5,
  },
  title: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
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
    textAlign: 'left',
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
  },
  stampArea: {
    marginTop: 30,
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 9,
  }
});

const MyDocument = ({ data }) => {
  const user = JSON.parse(localStorage.getItem('authUser'));
  const imageUrl = `/Docs/${user.societe.raison_sociale_concatene}_${user.societe.id}/logos/${user.societe.logo}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête avec logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image src={imageUrl} style={styles.logo} />
          </View>
          <View style={styles.companyDetails}>
            <Text style={styles.bold}>{user.societe.raison_sociale}</Text>
            <Text>{user.societe.adresse}</Text>
            <Text>Tél: {user.societe.tel}</Text>
            <Text>Email: {user.societe.email}</Text>
          </View>
        </View>
        <View style={styles.line} />

        {/* Titre principal */}
        <Text style={styles.title}>REÇU DE PRÉ-RÉSERVATION</Text>
        <Text style={styles.subtitle}>N° {data[0] || 'N/A'}</Text>

        {/* Contenu principal */}
        <View style={styles.section}>
          <Text style={styles.text}>
            Je soussigné(e), <Text style={styles.bold}>{data[9]} {data[10]}</Text>, 
            représentant(e) de la société <Text style={styles.bold}>{user.societe.raison_sociale}</Text>,
            confirme la pré-réservation du bien immobilier suivant :
          </Text>

          <View style={styles.propertyDetails}>
            <Text style={styles.text}>
              Le bien identifié sous la référence <Text style={styles.bold}>{data[4] || 'N/A'}</Text> est situé en Niveau: {data[5] || 'bien non spécifié'} {'d\''}une superficie de {data[6] || 'N/A'} mètres carrés,
              Ce bien présente une orientation <Text style={styles.bold}>{data[7] || 'non spécifiée'}</Text> et est proposé au prix de <Text style={styles.bold}>{data[8] ? data[8].toLocaleString() : 'N/A'} DH</Text>.
              Un rendez-vous a été fixé pour le <Text style={styles.bold}>{data[2] ? new Date(data[2]).toLocaleDateString() : 'date non précisée'}</Text> afin de finaliser cette réservation.
            </Text>
          </View>

          <Text style={styles.text}>
            Ce reçu atteste de {'l\''}engagement du client à procéder à la réservation définitive du bien selon les modalités convenues entre les parties.
          </Text>

          <Text style={styles.text}>
            Fait à {user.societe.ville || '...'}, le {new Date().toLocaleDateString()}
          </Text>

          {/* Zone de signatures */}
          <View style={styles.signature}>
            <View>
              <Text style={styles.underline}>Le Client</Text>
              <Text>Nom et signature</Text>
            </View>
            <View>
              <Text style={styles.underline}>Le Responsable Commercial</Text>
              <Text>{data[9]} {data[10]}</Text>
            </View>
          </View>

          {/* Pied de page */}
          <View style={styles.footer}>
            <Text style={styles.bold}>Nord Afrique Immobilier - Es qualité</Text>
            <Text>Merci pour votre confiance</Text>
          </View>

          {/* Zone pour cachet */}
          <View style={styles.stampArea}>
            <Text>Cachet et signature de {'l\''}agence</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default MyDocument;