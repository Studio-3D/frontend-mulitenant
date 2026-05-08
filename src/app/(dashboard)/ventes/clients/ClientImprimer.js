// components/ClientFullPDF.jsx
import React from "react";
import {
  Page,
  Document,
  View,
  Text,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

import { formatDate } from "../../../../utils/dateUtils";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
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
  line: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textDecoration: 'underline',
  },
  badge: {
    backgroundColor: '#2C3E50',
    color: 'white',
    padding: 5,
    textAlign: 'center',
    marginBottom: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15,
    color: '#2C3E50',
    borderBottomWidth: 1,
    borderBottomColor: '#3498DB',
    paddingBottom: 3,
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 10,
  },
  gridItem: {
    width: '50%',
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#7F8C8D',
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 10,
    color: '#34495E',
  },
  table: {
    width: "100%",
    marginTop: 10,
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#34495E",
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E4",
  },
  tableCell: {
    fontSize: 9,
    flex: 1,
    textAlign: "left",
    paddingHorizontal: 3,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    textAlign: "left",
    paddingHorizontal: 3,
  },
  footer: {
    textAlign: 'center',
    fontSize: 9,
    marginTop: 30,
    color: '#7F8C8D',
  },
  messageBox: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F0F7FF',
    borderRadius: 5,
  },
  messageText: {
    fontSize: 10,
    color: '#2C3E50',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // Styles pour les statuts
  statusValid: { color: "#27AE60", fontWeight: "bold" },
  statusRejected: { color: "#E74C3C", fontWeight: "bold" },
  statusPending: { color: "#F39C12", fontWeight: "bold" },
  interesse: { color: "#27AE60", fontWeight: "bold" },
  receptif: { color: "#2980B9", fontWeight: "bold" },
  perdu: { color: "#E74C3C", fontWeight: "bold" },
  injoignable: { color: "#95A5A6", fontWeight: "bold" },
  preReservation: { color: "#F39C12", fontWeight: "bold" },
  vendu: { color: "#27AE60", fontWeight: "bold" },
  preReservationPerdu: { color: "#E67E22", fontWeight: "bold" },
  reservationPerdu: { color: "#C0392B", fontWeight: "bold" },
  preReservationVendu: { color: "#16A085", fontWeight: "bold" },
});

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "0 DH";
  
  // Arrondir et convertir en nombre
  const num = Math.round(Number(amount));
  
  // Ajouter les espaces tous les 3 chiffres
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  
  return `${formatted} DH`;
};
const ClientFullPDF = ({ client, reservations, visites, user }) => {
  const societe = user?.societe || {};
  const logoUrl = `/images/${societe.raison_sociale_concatene}_${societe.id}/logos/${societe.logo}`;

  // Formatage des données
  const formatFinancement = (mode) => {
    switch (mode) {
      case "1":
        return "Comptant";
      case "2":
        return "Crédit";
      case "3":
        return "Indécis";
      default:
        return "";
    }
  };

  const NomBienComplet = (bien) => {
    if (!bien || typeof bien === 'string') {
      return '';
    }
    
    const noms = [];
    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);
    if (bien.propriete_dite_bien) noms.push(bien.propriete_dite_bien);
    
    return noms.length > 0 ? noms.join(' - ') : '';
  };

  const formatStatutReservation = (statut) => {
    switch (statut) {
      case "1":
        return { text: "Validé", style: styles.statusValid };
      case "2":
        return { text: "Refusé", style: styles.statusRejected };
      case "3":
        return { text: "En Attente", style: styles.statusPending };
      default:
        return { text: "Inconnu", style: {} };
    }
  };

  const formatInteret = (interet) => {
    switch (interet) {
      case "1":
        return { text: "Intéressé", style: styles.interesse };
      case "2":
        return { text: "Réceptif", style: styles.receptif };
      case "3":
        return { text: "Perdu", style: styles.perdu };
      case "4":
        return { text: "Injoignable", style: styles.injoignable };
      case "5":
        return { text: "Suivi Dossier", style: styles.injoignable };
      default:
        return { text: "", style: {} };
    }
  };

  const formatStatutVisite = (statut) => {
    switch (statut) {
      case "1":
        return { text: "Pré-Réservation", style: styles.preReservation };
      case "2":
        return { text: "Vendu", style: styles.vendu };
      case "3":
        return { text: "Pré-Réservation Perdu", style: styles.preReservationPerdu };
      case "4":
        return { text: "Réservation Perdu", style: styles.reservationPerdu };
      case "5":
        return { text: "Pré-Réservation Vendu", style: styles.preReservationVendu };
      default:
        return { text: "", style: {} };
    }
  };

  const formatCivilite = (civilite) => {
    switch (civilite) {
      case "1":
        return "Monsieur";
      case "2":
        return "Madame";
      case "3":
        return "Mademoiselle";
      default:
        return civilite || "";
    }
  };

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


        <Text style={styles.title}>FICHE CLIENT</Text>
        
        <View style={styles.badge}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 9 }}>
            Document confidentiel - Suivi client
          </Text>
        </View>

        {/* Section Informations Client */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS PERSONNELLES</Text>

          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Code Client</Text>
              <Text style={styles.gridValue}>{client.code_client || ""}</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Civilité</Text>
              <Text style={styles.gridValue}>{formatCivilite(client.civilite)}</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Nom complet</Text>
              <Text style={styles.gridValue}>
                {client.nom || ""} {client.prenom || ""}
              </Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>CIN</Text>
              <Text style={styles.gridValue}>{client.cin || ""}</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Téléphone principal</Text>
              <Text style={styles.gridValue}>{client.telephone_num1 || ""}</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Téléphone secondaire</Text>
              <Text style={styles.gridValue}>{client.telephone_num2 || ""}</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Email</Text>
              <Text style={styles.gridValue}>{client.email || ""}</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Pays / Ville</Text>
              <Text style={styles.gridValue}>
                {client.pays || ""} {client.ville ? `/ ${client.ville}` : ""}
              </Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Adresse</Text>
              <Text style={styles.gridValue}>{client.adresse || " "}</Text>
            </View>
          </View>
        </View>

        {/* Section Réservations */}
        {reservations && reservations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              RÉSERVATIONS ({reservations.length})
            </Text>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Code</Text>
                <Text style={styles.tableHeaderCell}>Date</Text>
                <Text style={styles.tableHeaderCell}>Bien</Text>
                <Text style={styles.tableHeaderCell}>Prix</Text>
                <Text style={styles.tableHeaderCell}>Avance</Text>
                <Text style={styles.tableHeaderCell}>Reste</Text>
                <Text style={styles.tableHeaderCell}>Financement</Text>
                <Text style={styles.tableHeaderCell}>Statut</Text>
              </View>

              {reservations.map((row, index) => {
                const statut = formatStatutReservation(row.statut);
                return (
                  <View style={styles.tableRow} key={index}>
                    <Text style={styles.tableCell}>{row.code_reservation || ""}</Text>
                    <Text style={styles.tableCell}>
                      {formatDate(row.date_reservation)}
                    </Text>
                    <Text style={styles.tableCell}>
                      {NomBienComplet(row.bien) || "-"}
                    </Text>
                    <Text style={styles.tableCell}>
                      {formatCurrency(row.prix)}
                    </Text>
                    <Text style={styles.tableCell}>
                      {formatCurrency(row.avances_sum_montant)}
                    </Text>
                    <Text style={styles.tableCell}>

                      {formatCurrency((row.prix || 0) - (row.avances_sum_montant || 0))}
                    </Text>
                    <Text style={styles.tableCell}>
                      {formatFinancement(row.mode_financement)}
                    </Text>
                    <Text style={[styles.tableCell, statut.style]}>
                      {statut.text}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Section Visites */}
        {visites && visites.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              HISTORIQUE DES VISITES ({visites.length})
            </Text>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Date</Text>
                <Text style={styles.tableHeaderCell}>Responsable</Text>
                <Text style={styles.tableHeaderCell}>Intérêt</Text>
                <Text style={styles.tableHeaderCell}>Statut</Text>
                <Text style={styles.tableHeaderCell}>Bien</Text>
              </View>

              {visites.map((row, index) => {
                const interet = formatInteret(row.interet);
                const statutVisite = formatStatutVisite(row.statut);

                return (
                  <View style={styles.tableRow} key={index}>
                    <Text style={styles.tableCell}>{formatDate(row.date)}</Text>
                    <Text style={styles.tableCell}>
                      {row.nom_cc || ""} {row.prenom_cc || ""}
                    </Text>
                    <Text style={[styles.tableCell, interet.style]}>
                      {interet.text}
                    </Text>
                    <Text style={[styles.tableCell, statutVisite.style]}>
                      {statutVisite.text}
                    </Text>
                    <Text style={styles.tableCell}>
                      {NomBienComplet(row.bien) || "-"}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Message professionnel */}
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            Ce document récapitule l'ensemble des informations client, réservations et visites.
            Toute modification doit être signalée au service commercial.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Document généré le {formatDate(new Date())} — {societe?.raison_sociale || 'Société'} — 
            Tous droits réservés {new Date().getFullYear()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ClientFullPDF;