import React from 'react';
import { Document, Page, Text, StyleSheet, View } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    textDecoration: 'underline',
    fontStyle: 'italic',
  },
  section: {
    fontSize: 14,
    marginBottom: 18,
    textAlign: 'center',  // Center the paragraph
    paddingLeft: 20,
    paddingRight: 20,
  },
  normalText: {
    textAlign: 'center',  // Center the text
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: 1.5,  // Improve readability
  },
  bold: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  underline: {
    textDecoration: 'underline',
  },
  highlight: {
    fontSize: 10,
    color: 'red',
  },
  TextFin: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
    textDecoration: 'underline',
    marginTop: 15,
  },
});

const MyDocument = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>
          Pré-réservation du bien : {data[4] || 'Bien N/A'}
        </Text>

        {/* Centered Paragraph */}
        <View style={styles.section}>
          <Text style={styles.normalText}>
            {`Bien : ${data[4] || 'N/A'}`}
            {'\n'}
            {`Niveau : ${data[5] || 'N/A'}`}
            {'\n'}
            {`Superficie : ${data[6] || 'N/A'} m²`}
            {'\n'}
            {`Orientation : ${data[7] || 'N/A'}`}
            {'\n'}
            {`Date de rendez-vous : ${data[2] ? new Date(data[2]).toLocaleDateString() : 'N/A'}`}
            {'\n'}
            {`Prix : ${data[8] ? data[8].toLocaleString() : 'N/A'} DH`}
            {'\n'}
            {`Responsable : ${data[9]} ${data[10]}`}
          </Text>
        </View>

        {/* Footer or Additional Content */}
        <View style={styles.TextFin}>
          <Text>Nord Afrique Immobilier</Text>
          <Text>Es qualité</Text>
        </View>
      </Page>
    </Document>
  );
};

export default MyDocument;
