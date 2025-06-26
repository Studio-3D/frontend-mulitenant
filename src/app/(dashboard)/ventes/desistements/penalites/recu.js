import React from 'react';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

import { MODE_PAIEMENT } from '@/configs/enum';
// Create styles
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
  underline: {
    textDecoration: 'underline',
  },
  logo: {
    width: 60, // Ajustez la taille du logo ici
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
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: '#000', // Couleur de la barre (noire ici)
    marginBottom: 20, // Espace entre la barre et le titre
  },
  text: {
    fontSize: 10,
    lineHeight: 1.6,
    textAlign: 'justify',
  },
  bold: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  signature: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    fontSize: 10,
  },
});

const MyDocument = ({ data }) => {
  const user = JSON.parse(localStorage.getItem('authUser'));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.logoContainer}></View>
          <View style={styles.companyDetails}>
            <Text>Societé: {user.societe.raison_sociale}</Text>
            <Text>Adresse: {user.societe.adresse}</Text>
            <Text>Tél : {user.societe.tel}</Text>
          </View>
        </View>
        <View style={styles.line}></View>
        {/* Titre */}
        <Text style={styles.title}>Reçu Pénalité :{data[1]}</Text>
        <Text style={styles.title}>De Dossier: {data[0]} </Text>

        {/* Contenu */}
        <View style={styles.section}>
          <Text style={styles.text}>
            Nous confirmons que&nbsp;
            <Text>
              {data[8] != null && (
                <>
                  {data[8] != null ? 'les clients: ' : 'Le client: '}
                  {data[8]}
                </>
              )}
            </Text>
            ,{data[8].length > 1 ? 'ont payés' : 'a payé'} une Pénalité du{' '}
            <Text style={styles.bold}>{data[2]} DH </Text>{' '}
            {MODE_PAIEMENT[data[3]]?.label != 'Espèce' ? 'En' : 'par'}{' '}
            {MODE_PAIEMENT[data[3]]?.label}{' '}
            {MODE_PAIEMENT[data[3]]?.label != 'Espèce'
              ? 'N° Paiement :' + data[4]
              : null}{' '}
            concernant le Bien {data[5]}.
          </Text>
        </View>
        {/* Signatures */}
        <View style={styles.signature}>
          <Text>Signature des acquéreurs :</Text>
          <Text>Signature de {'l\''}entreprise :</Text>
        </View>
      </Page>
    </Document>
  );
};

export default MyDocument;
