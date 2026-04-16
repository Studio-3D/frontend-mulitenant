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
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E4",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 50,
  },
  headerText: {
    textAlign: "right",
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3498DB",
    marginBottom: 10,
    textAlign: "center",
    textTransform: "uppercase",
  },
  clientSection: {
    marginBottom: 25,
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2C3E50",
    borderBottomWidth: 1,
    borderBottomColor: "#3498DB",
    paddingBottom: 3,
  },
  clientInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 5,
  },
  infoLabel: {
    width: "30%",
    fontSize: 12,
    fontWeight: "bold",
    color: "#7F8C8D",
  },
  infoValue: {
    width: "70%",
    fontSize: 12,
    color: "#34495E",
  },
  table: {
    width: "100%",
    marginTop: 15,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#3498DB",
    color: "white",
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
    fontSize: 10,
    flex: 1,
    textAlign: "left",
    paddingHorizontal: 3,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    textAlign: "left",
    paddingHorizontal: 3,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    color: "#7F8C8D",
    borderTopWidth: 1,
    borderTopColor: "#E4E4E4",
    paddingTop: 10,
    marginHorizontal: 40,
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

/*const formatDate = (dateString) => {
  return dateString ? moment(dateString).format('DD/MM/YYYY') : '';
};*/


const formatCurrency = (amount) => {
  return amount
    ? new Intl.NumberFormat("fr-FR").format(amount) + " DH"
    : "0 DH";
};

const ClientFullPDF = ({ client, reservations, visites, user }) => {
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
        return "Non spécifié";
    }
  };

   // Safe NomBienComplet function
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
        return { text: "Non spécifié", style: {} };
    }
  };

  const formatStatutVisite = (statut) => {
    switch (statut) {
      case "1":
        return { text: "Pré-Réservation", style: styles.preReservation };
      case "2":
        return { text: "Vendu", style: styles.vendu };
      case "3":
        return {
          text: "Pré-Réservation Perdu",
          style: styles.preReservationPerdu,
        };
      case "4":
        return { text: "Réservation Perdu", style: styles.reservationPerdu };
      case "5":
        return {
          text: "Pré-Réservation Vendu",
          style: styles.preReservationVendu,
        };
      default:
        return { text: "Non spécifié", style: {} };
    }
  };
// Add this function inside your component, before the return statement
const formatCivilite = (civilite) => {
  switch (civilite) {
    case "1":
      return "Mr";
    case "2":
      return "Mme";
    case "3":
      return "Mlle";
    default:
      return civilite || "";
  }
};
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src="/path/to/your/logo.png" style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={styles.companyName}>
              {user?.societe?.raison_sociale}
            </Text>
            <Text>Fiche Client - {formatDate(new Date())}</Text>
          </View>
        </View>

        <Text style={styles.reportTitle}>FICHE CLIENT COMPLÈTE</Text>

        {/* Section Informations Client */}
        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>INFORMATIONS CLIENT</Text>

          <View style={styles.clientInfo}>
            <Text style={styles.infoLabel}>Code Client:</Text>
            <Text style={styles.infoValue}>{client.code_client || ""}</Text>
          </View>

          <View style={styles.clientInfo}>
            <Text style={styles.infoLabel}>Nom Complet:</Text>
            <Text style={styles.infoValue}>
              {client.nom} {client.prenom}
            </Text>
          </View>

          <View style={styles.clientInfo}>
            <Text style={styles.infoLabel}>CIN:</Text>
            <Text style={styles.infoValue}>{client.cin || ""}</Text>
          </View>

          <View style={styles.clientInfo}>
            <Text style={styles.infoLabel}>Téléphone:</Text>
            <Text style={styles.infoValue}>
              {client.telephone_num1 || ""}
              {client.telephone_num2 && ` / ${client.telephone_num2}`}
            </Text>
          </View>

          <View style={styles.clientInfo}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{client.email || ""}</Text>
          </View>

          <View style={styles.clientInfo}>
            <Text style={styles.infoLabel}>Adresse:</Text>
            <Text style={styles.infoValue}>{client.adresse || ""}</Text>
          </View>
          <View style={styles.clientInfo}>
            <Text style={styles.infoLabel}>Payys/Ville:</Text>
            <Text style={styles.infoValue}>
              {client.pays || ""}/ {client.ville || ""}
            </Text>
          </View>
          <View style={styles.clientInfo}>
            <Text style={styles.infoLabel}>Civilité:</Text>
            <Text style={styles.infoValue}>{formatCivilite(client.civilite)}</Text>
          </View>
        </View>

        {/* Section Réservations */}
        {reservations.length > 0 && (
          <View style={{ marginBottom: 25 }}>
            <Text style={styles.sectionTitle}>
              RÉSERVATIONS ({reservations.length})
            </Text>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Code</Text>
                <Text style={styles.tableHeaderCell}>Date</Text>
                <Text style={styles.tableHeaderCell}>Bien</Text>
                <Text style={styles.tableHeaderCell}>Projet</Text>
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
                    <Text style={styles.tableCell}>{row.code_reservation}</Text>
                    <Text style={styles.tableCell}>
                      {formatDate(row.date_reservation)}
                    </Text>
                    <Text style={styles.tableCell}>
                      {NomBienComplet(row.bien) || ""}
                    </Text>
                    <Text style={styles.tableCell}>
                      {row.bien?.projet?.nom || ""}
                    </Text>
                    <Text style={styles.tableCell}>
                      {formatCurrency(row.prix)}
                    </Text>
                    <Text style={styles.tableCell}>
                      {formatCurrency(row.avances_sum_montant)}
                    </Text>
                    <Text style={styles.tableCell}>
                      {formatCurrency(
                        row.prix - (row.avances_sum_montant || 0)
                      )}
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
        {visites.length > 0 && (
          <View style={{ marginBottom: 25 }}>
            <Text style={styles.sectionTitle}>VISITES ({visites.length})</Text>

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
                      {row.nom_cc} {row.prenom_cc}
                    </Text>
                    <Text style={[styles.tableCell, interet.style]}>
                      {interet.text}
                    </Text>
                    <Text style={[styles.tableCell, statutVisite.style]}>
                      {statutVisite.text}
                    </Text>
                    <Text style={styles.tableCell}>
                      {NomBienComplet(row.bien) || ""}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Document généré le {formatDate(new Date())} - ©{" "}
            {user?.societe?.raison_sociale} {new Date().getFullYear()}
          </Text>
          <Text style={{ marginTop: 5 }}>Page 1 sur 1</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ClientFullPDF;
