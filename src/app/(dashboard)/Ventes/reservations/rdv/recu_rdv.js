import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

// Créez les styles
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

// Fonction principale
const ReceiptDocument = ({ data }) => {
  const user = JSON.parse(localStorage.getItem('authUser'));

  const imageUrl = `/Docs/${user.societe.raison_sociale_concatene}_${user.societe.id}/logos/${user.societe.logo}`;


  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image src={imageUrl} style={styles.logo} />
          </View>
          <View style={styles.companyDetails}>
            <Text>Societé: {user.societe.raison_sociale}</Text>
            <Text>Adresse: {user.societe.adresse}</Text>
            <Text>Tél : {user.societe.tel}</Text>
          </View>
        </View>
        <View style={styles.line}></View>

        {/* Titre */}
        <Text style={styles.title}>Fiche Rendez-vous Notaire</Text>

        {/* Contenu */}
        <View style={styles.section}>
          <Text style={styles.text}>
            Nous confirmons que&nbsp;
            <Text>
              {data[2].length > 1 ? 'les clients: ' : 'Le client: '}
              {data[2].map((client, i) => (
                <Text key={i}>
                  <Text style={styles.bold}>
                    {client.name} {client.prenom}
                  </Text>
                  {i !== data[2].length - 1 ? ' et ' : ''}{' '}
                  {/* Add "et" between clients if there's more than one */}
                </Text>
              ))}
            </Text>
            ,{data[2].length > 1 ? 'ont' : 'a'} un rendez-vous avec le notaire
            pour la signature du{' '}
            {data[5] == 1 ? 'Compromis de Vente ' : 'Contrat de vente'}{' '}
            concernant le bien <Text style={styles.bold}>« {data[1]} »</Text>,
            inscrit sous le dossier n°{' '}
            <Text style={styles.bold}>{data[0]}</Text>.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.text}>
            Le rendez-vous est programmé pour le{' '}
            <Text style={[styles.bold, styles.underline]}>{data[3]}</Text>, en
            présence du notaire et du commercial, afin {"d'"}accomplir les
            démarches nécessaires à la conclusion de {"l'"}accord de vente.
          </Text>
        </View>

        {/* Signatures */}
        <View style={styles.signature}>
          <Text>Signature des acquéreurs :</Text>
          <Text>Signature de {"l'"}entreprise :</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReceiptDocument;
