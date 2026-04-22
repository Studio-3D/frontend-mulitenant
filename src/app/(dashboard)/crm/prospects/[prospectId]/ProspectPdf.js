// components/ProspectFullPDF.jsx
import React from "react";
import {
  Page,
  Document,
  View,
  Text,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { formatDate } from "@/utils/dateUtils";

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
  section: {
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
  infoRow: {
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
  messageBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#FFF3E0",
    borderRadius: 5,
  },
  messageText: {
    fontSize: 11,
    color: "#E65100",
    fontStyle: "italic",
  },
});

const formatInteret = (interet) => {
  switch (interet) {
    case "1":
      return "Intéressé";
    case "2":
      return "Réceptif";
    case "3":
      return "Perdu";
    case "4":
      return "Injoignable";
    default:
      return "Non spécifié";
  }
};

const formatStatutVisite = (statut) => {
  switch (statut) {
    case "1":
      return "Pré-Réservation";
    case "2":
      return "Vendu";
    case "3":
      return "Pré-Réservation Perdu";
    case "4":
      return "Réservation Perdu";
    case "5":
      return "Pré-Réservation Vendu";
    default:
      return "Non spécifié";
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

const ProspectPDF = ({ prospect, appels, visites, user }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src="/path/to/your/logo.png" style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={styles.companyName}>
              {user?.societe?.raison_sociale || "Votre Société"}
            </Text>
            <Text>Fiche Prospect </Text>
          </View>
        </View>

        <Text style={styles.reportTitle}>FICHE PROSPECT COMPLÈTE</Text>

        {/* Section Informations Prospect */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS PROSPECT</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nom Complet:</Text>
            <Text style={styles.infoValue}>
              {(prospect?.nom || "") + " " + (prospect?.prenom || "")}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>CIN:</Text>
            <Text style={styles.infoValue}>{prospect?.cin || "Non renseigné"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Téléphone 1:</Text>
            <Text style={styles.infoValue}>{prospect?.telephone || "Non renseigné"}</Text>
          </View>

          {prospect?.telephone_num2 && prospect.telephone_num2 !== 'null' && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Téléphone 2:</Text>
              <Text style={styles.infoValue}>{prospect.telephone_num2}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{prospect?.email || "Non renseigné"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Origine:</Text>
            <Text style={styles.infoValue}>{prospect?.origin || "Non spécifié"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Source:</Text>
            <Text style={styles.infoValue}>
              {prospect?.partenaire_id !== null
                ? `Partenaire (${prospect?.partenaire?.description})`
                : prospect?.source?.source || "Non spécifié"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Accepte d{"'"}être contacté:</Text>
            <Text style={styles.infoValue}>
              {prospect?.notifie === 1 ? "Oui" : "Non"}
            </Text>
          </View>
        </View>

        {/* Section Suivi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Affectation</Text>

          {prospect?.affecte_par_admin && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Affecté par:</Text>
              <Text style={styles.infoValue}>
                {prospect.affecte_par_admin.name || ""} {prospect.affecte_par_admin.prenom || ""}
              </Text>
            </View>
          )}

          {prospect?.date_affectation && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date affectation:</Text>
              <Text style={styles.infoValue}>{formatDate(prospect.date_affectation)}</Text>
            </View>
          )}

        </View>

        {/* Section Appels */}
        {appels && appels.length > 0 && (
          <View style={{ marginBottom: 25 }}>
            <Text style={styles.sectionTitle}>
              JOURNAL DES APPELS ({appels.length})
            </Text>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Date</Text>
                <Text style={styles.tableHeaderCell}>Commercial</Text>
                <Text style={styles.tableHeaderCell}>Type</Text>
                <Text style={styles.tableHeaderCell}>Intérêt</Text>
              </View>

              {appels.map((appel, index) => (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.tableCell}>{formatDate(appel.date)}</Text>
                  <Text style={styles.tableCell}>
                    {appel.user?.name || ""} {appel.user?.prenom || ""}
                  </Text>
                  <Text style={styles.tableCell}>
                    {appel.type_appel === 1 ? "Appel entrant" : "Appel sortant"}
                  </Text>
                  <Text style={styles.tableCell}>
                    {formatInteret(appel.interet)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Section Visites */}
        {visites && visites.length > 0 && (
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

              {visites.map((visite, index) => (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.tableCell}>{formatDate(visite.date)}</Text>
                  <Text style={styles.tableCell}>
                    {visite.nom_cc || ""} {visite.prenom_cc || ""}
                  </Text>
                  <Text style={styles.tableCell}>
                    {formatInteret(visite.interet)}
                  </Text>
                  <Text style={styles.tableCell}>
                    {formatStatutVisite(visite.statut)}
                  </Text>
                  <Text style={styles.tableCell}>
                    {NomBienComplet(visite.bien) || visite.bien_id || ""}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Document généré le {formatDate(new Date())} - ©{" "}
            {user?.societe?.raison_sociale || "Votre Société"} {new Date().getFullYear()}
          </Text>
          <Text style={{ marginTop: 5 }}>Page 1 sur 1</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ProspectPDF;