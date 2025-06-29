// components/ClientPDF.jsx
import React from 'react';
import { Page, Document, View, Text, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#D9EDDF',
    padding: 30,
    fontFamily: 'Helvetica'
  },
  container: {
    width: '100%'
  },
  header: {
    marginBottom: 20,
    position: 'relative'
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    marginBottom: 25
  },
  logo: {
    position: 'absolute',
    height: 80,
    width: 60,
    left: 0,
    top: -15,
    backgroundColor: 'white',
    padding: '0 5px'
  },
  title: {
    color: 'darkblue',
    fontSize: 28,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 15
  },
  clientName: {
    backgroundColor: 'white',
    padding: 10,
    textAlign: 'center',
    color: '#014f86',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    border: '1px solid #e0e0e0',
    borderRadius: 4
  },
  section: {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: 6,
    padding: 15,
    marginBottom: 15
  },
  sectionTitle: {
    color: 'darkblue',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 5
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8
  },
  label: {
    width: '40%',
    fontSize: 12,
    fontWeight: 'bold'
  },
  value: {
    width: '60%',
    fontSize: 12
  },
  twoColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  column: {
    width: '48%'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 5,
    marginBottom: 5
  },
  tableRow: {
    flexDirection: 'row',
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  tableCell: {
    fontSize: 10,
    padding: 3
  },
  amountPositive: {
    color: 'green'
  },
  amountNegative: {
    color: 'red'
  },
  amountNeutral: {
    color: 'blue'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  visaBox: {
    width: '50%'
  },
  dateText: {
    fontSize: 10,
    textAlign: 'right'
  }
});

const formatDate = (dateString) => {
  if (!dateString) return 'Non renseigné';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(amount || 0) + ' DH';
};

const ClientPDF = () => {
  // Données d'exemple avec des erreurs
  const client = {
    civilite: 'M',
    nom: 'Dupont',
    prenom: 'Jean',
    cin: 'AB123456', // CIN erroné (trop court)
    email: 'jean.dupont@', // Email invalide
    profession: 'Commerçant',
    adresse: '12 Rue des Fleurs',
    ville: 'Casablanca',
    pays: 'Maroc',
    telephone1: '061234567', // Numéro incomplet
    telephone2: null,
    situation_pro: 'particulier',
    date_naissance: '1985-06-15',
    lieu_naissance: 'Rabat'
  };

  const reservation = {
    id: 1,
    date_reservation: '2023-05-20',
    code_reservation: 'RES-2023-001',
    prix: 1250000,
    totalPayments: 250000,
    bien: {
      projet: { nom: 'Résidence Les Jardins' },
      tranche: { nom: 'Tranche A' },
      bloc: { nom: 'Bloc B' },
      immeuble: { nom: 'Immeuble C' },
      niveau: 3,
      numero: 'B3-45',
      type: { type: 'Appartement' },
      titre_foncier: 'TF123456789',
      superficie_totale: 85
    },
    user: {
      name: 'Martin',
      prenom: 'Sophie'
    },
    aquereurs: {
      pourcentage: 1 // 100%
    }
  };

  const payments = [
    { date: '2023-05-21', type: 'Acompte', mode: 'Virement', montant: 150000 },
    { date: '2023-06-10', type: 'Paiement', mode: 'Chèque', montant: 100000 }
  ];

  const visits = [
    { date: '2023-05-15', lieu: 'Showroom principal', responsable: 'Sophie Martin' }
  ];

  const calls = [
    { date: '2023-05-18', objet: 'Rappel signature contrat', statut: 'Terminé' }
  ];

  const currentDate = new Date().toLocaleDateString('fr-FR');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* En-tête avec logo */}
          <View style={styles.header}>
            <View style={styles.hr} />
            <Image style={styles.logo} src="/img/logo_nordd.png" />
          </View>

          {/* Titre principal */}
          <Text style={styles.title}>FICHE CLIENT</Text>

          {/* Nom du client */}
          <View style={styles.clientName}>
            <Text>{client.civilite}. {client.nom} {client.prenom}</Text>
          </View>

          {/* Section Informations Client */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations Personnelles</Text>
            
            <View style={styles.row}>
              <Text style={styles.label}>CIN:</Text>
              <Text style={styles.value}>{client.cin} (invalide)</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{client.email} (incomplet)</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Téléphone:</Text>
              <Text style={styles.value}>
                {client.telephone1} (manque un chiffre)
                {client.telephone2 && ` / ${client.telephone2}`}
              </Text>
            </View>
            
            {/* ... autres champs client ... */}
          </View>

          {/* Section Bien Immobilier */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Information du Bien</Text>
            
            <View style={styles.twoColumns}>
              <View style={styles.column}>
                <View style={styles.row}>
                  <Text style={styles.label}>Projet:</Text>
                  <Text style={styles.value}>{reservation.bien.projet.nom}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Bloc/Immeuble:</Text>
                  <Text style={styles.value}>
                    {reservation.bien.bloc.nom} / {reservation.bien.immeuble.nom}
                  </Text>
                </View>
              </View>
              
              <View style={styles.column}>
                <View style={styles.row}>
                  <Text style={styles.label}>Superficie:</Text>
                  <Text style={styles.value}>
                    {reservation.bien.superficie_totale}m²
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Prix:</Text>
                  <Text style={[styles.value, styles.amountNeutral]}>
                    {formatCurrency(reservation.prix)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Section Paiements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historique des Paiements</Text>
            
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, {width: '25%'}]}>Date</Text>
              <Text style={[styles.tableCell, {width: '25%'}]}>Type</Text>
              <Text style={[styles.tableCell, {width: '25%'}]}>Mode</Text>
              <Text style={[styles.tableCell, {width: '25%'}]}>Montant</Text>
            </View>
            
            {payments.map((payment, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={[styles.tableCell, {width: '25%'}]}>{formatDate(payment.date)}</Text>
                <Text style={[styles.tableCell, {width: '25%'}]}>{payment.type}</Text>
                <Text style={[styles.tableCell, {width: '25%'}]}>{payment.mode}</Text>
                <Text style={[styles.tableCell, {width: '25%'}]}>{formatCurrency(payment.montant)}</Text>
              </View>
            ))}
            
            <View style={[styles.row, {marginTop: 10}]}>
              <Text style={[styles.label, {fontWeight: 'bold'}]}>Reste à payer:</Text>
              <Text style={[styles.value, styles.amountNegative, {fontWeight: 'bold'}]}>
                {formatCurrency(reservation.prix - reservation.totalPayments)}
              </Text>
            </View>
          </View>

          {/* Pied de page */}
          <View style={styles.footer}>
            <View style={styles.visaBox}>
              <Text>Visa Commercial</Text>
              <View style={{height: 30, border: '1px solid #d4d4d4', borderRadius: 4}}></View>
            </View>
            <View>
              <Text style={styles.dateText}>Date: {currentDate}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ClientPDF;