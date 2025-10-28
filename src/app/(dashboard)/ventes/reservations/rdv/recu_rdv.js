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
  },
});

const MyDocument = ({ data }) => {
  const user = JSON.parse(localStorage.getItem('authUser'));
  const imageUrl = `/docs/${user.societe.raison_sociale_concatene}_${user.societe.id}/logos/${user.societe.logo}`;

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
        <Text style={styles.title}>REÇU DE RENDEZ-VOUS</Text>

        {/* Contenu principal */}
        <View style={styles.section}>
          <Text style={styles.text}>
            La société{' '}
            <Text style={styles.bold}>{user.societe.raison_sociale}</Text>,
            représentée par {' '}
            <Text style={styles.bold}>
              {data[9]} {data[10]}
            </Text>
            , confirme le rendez-vous pour la visite du bien décrit ci-dessous :
          </Text>

          <View style={styles.propertyDetails}>
            <Text style={styles.text}>
              <Text style={styles.bold}>• N° Dossier:</Text>{' '}
              {data[0] || 'N/A'}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.bold}>• Référence du bien:</Text>{' '}
              {data[1] || 'N/A'}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.bold}>• Type de Rendez vous :</Text> {data[2] || ''}
            </Text>
            
            <Text style={styles.text}>
              <Text style={styles.bold}>• Date du rendez-vous:</Text>{' '}
             {data[3] || ''}
            </Text>
           
           
           
          </View>

          <Text style={styles.text}>
            Ce reçu confirme la prise de rendez-vous pour la visite du bien immobilier.
            Le client {"s'"}engage à se présenter à {"l'"}heure convenue.
          </Text>

          <Text style={styles.text}>
            Fait à {user.societe.ville || '...'}, le{' '}
            {new Date().toLocaleDateString()}
          </Text>

          {/* Zone de signatures */}
          <View style={styles.signature}>
            <View>
              <Text style={styles.underline}>Le Client</Text>
              <Text>Nom et signature</Text>
            </View>
            <View>
              <Text style={styles.underline}>Le Responsable Commercial</Text>
              <Text>
                {data[9]} {data[10]}
              </Text>
            </View>
          </View>

          {/* Pied de page */}
          <View style={styles.footer}>
            <Text style={styles.bold}>
              {user.societe.raison_sociale}
            </Text>
            <Text>Merci de votre confiance</Text>
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