// components/ClientPDF.jsx
import React from 'react';
import { Page, Document, View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: 'white',
    padding: 30,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    textAlign: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  section: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#444'
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5
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
  table: {
    width: '100%',
    marginTop: 10
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 5
  },
  tableRow: {
    flexDirection: 'row',
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  tableCell: {
    fontSize: 10,
    padding: 3,
    flex: 1
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee'
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
  // Données client complètes
  const client = {
    civilite: 'Mme',
    nom: 'Benali',
    prenom: 'Fatima',
    cin: 'AB123456',
    email: 'fatima.benali@example.com',
    profession: 'Enseignante',
    adresse: '45 Rue des Oliviers',
    ville: 'Casablanca',
    pays: 'Maroc',
    telephone1: '0612345678',
    telephone2: '0522334455',
    situation_pro: 'particulier',
    date_naissance: '1980-03-15',
    lieu_naissance: 'Rabat',
    situation_familiale: 'Mariée'
  };

  // Données de réservation
  const reservation = {
    id: 'RES-2023-0456',
    date_reservation: '2023-11-15',
    code_reservation: 'RES-2023-0456',
    prix: 850000,
    avance: 250000,
    responsable: 'Karim Eloui',
    bien: {
      reference: 'APT-B2-15',
      type: 'Appartement',
      superficie: 75,
      etage: 2,
      immeuble: 'Résidence Les Palmiers',
      tranche: 'Tranche B',
      bloc: 'Bloc 2',
      titre_foncier: 'TF789456123'
    },
    visites: [
      {
        date: '2023-11-10',
        responsable: 'Karim Eloui',
        type: 'Visite technique'
      }
    ],
    paiements: [
      {
        date: '2023-11-16',
        montant: 150000,
        mode: 'Virement bancaire',
        reference: 'VIR-456789'
      },
      {
        date: '2023-12-05',
        montant: 100000,
        mode: 'Chèque',
        reference: 'CHQ-123456'
      }
    ]
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>FICHE CLIENT ET RESERVATION</Text>
        </View>

        {/* Section Client */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Client</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Nom complet:</Text>
            <Text style={styles.value}>{client.civilite} {client.nom} {client.prenom}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>CIN:</Text>
            <Text style={styles.value}>{client.cin}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Date de naissance:</Text>
            <Text style={styles.value}>{formatDate(client.date_naissance)} à {client.lieu_naissance}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Contacts:</Text>
            <Text style={styles.value}>
              Tél: {client.telephone1} {client.telephone2 && ` / ${client.telephone2}`}
              {"\n"}Email: {client.email}
            </Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Adresse:</Text>
            <Text style={styles.value}>
              {client.adresse}, {client.ville}, {client.pays}
            </Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Situation:</Text>
            <Text style={styles.value}>
              {client.profession}, {client.situation_familiale}
            </Text>
          </View>
        </View>

        {/* Section Réservation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de la Réservation</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Code réservation:</Text>
            <Text style={styles.value}>{reservation.code_reservation}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Date réservation:</Text>
            <Text style={styles.value}>{formatDate(reservation.date_reservation)}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Responsable:</Text>
            <Text style={styles.value}>{reservation.responsable}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Prix total:</Text>
            <Text style={styles.value}>{formatCurrency(reservation.prix)}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Avance versée:</Text>
            <Text style={styles.value}>{formatCurrency(reservation.avance)}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Reste à payer:</Text>
            <Text style={styles.value}>
              {formatCurrency(reservation.prix - reservation.avance)}
            </Text>
          </View>
        </View>

        {/* Section Bien Immobilier */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Caractéristiques du Bien</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Référence:</Text>
            <Text style={styles.value}>{reservation.bien.reference}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Type:</Text>
            <Text style={styles.value}>{reservation.bien.type}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Superficie:</Text>
            <Text style={styles.value}>{reservation.bien.superficie} m²</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Localisation:</Text>
            <Text style={styles.value}>
              {reservation.bien.immeuble}, {reservation.bien.bloc}, Étage {reservation.bien.etage}
            </Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Titre foncier:</Text>
            <Text style={styles.value}>{reservation.bien.titre_foncier}</Text>
          </View>
        </View>

        {/* Section Visites */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique des Visites</Text>
          
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCell}>Date</Text>
              <Text style={styles.tableCell}>Type</Text>
              <Text style={styles.tableCell}>Responsable</Text>
            </View>
            
            {reservation.visites.map((visite, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.tableCell}>{formatDate(visite.date)}</Text>
                <Text style={styles.tableCell}>{visite.type}</Text>
                <Text style={styles.tableCell}>{visite.responsable}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section Paiements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique des Paiements</Text>
          
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCell}>Date</Text>
              <Text style={styles.tableCell}>Montant</Text>
              <Text style={styles.tableCell}>Mode</Text>
              <Text style={styles.tableCell}>Référence</Text>
            </View>
            
            {reservation.paiements.map((paiement, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.tableCell}>{formatDate(paiement.date)}</Text>
                <Text style={styles.tableCell}>{formatCurrency(paiement.montant)}</Text>
                <Text style={styles.tableCell}>{paiement.mode}</Text>
                <Text style={styles.tableCell}>{paiement.reference}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pied de page */}
        <View style={styles.footer}>
          <Text style={{ fontSize: 10 }}>Document généré le {formatDate(new Date())}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ClientPDF;