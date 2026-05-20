// components/ProspectFullPDF.jsx
import React from 'react';
import {
  Page,
  Document,
  View,
  Text,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { formatDate } from '@/utils/dateUtils';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
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
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 5,
    paddingVertical: 3,
  },
  infoLabel: {
    width: "30%",
    fontSize: 11,
    fontWeight: "bold",
    color: "#34495E",
  },
  infoValue: {
    width: "70%",
    fontSize: 11,
    color: "#555",
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
  stampArea: {
    marginTop: 30,
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 9,
  },
  badge: {
    backgroundColor: '#3498DB',
    color: 'white',
    padding: 5,
    textAlign: 'center',
    borderRadius: 3,
    marginBottom: 15,
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
    case "5":
      return "Suivi Dossier";
    default:
      return "";
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

const ProspectPDF = ({ prospect, appels, visites, user }) => {
  const societe = user?.societe || {};
  const logoUrl = `/images/${societe.raison_sociale_concatene}_${societe.id}/logos/${societe.logo}`;
  
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
            {societe?.adresse && <Text>Adresse: {societe.adresse}</Text>}
            {societe?.ville && <Text>Ville: {societe.ville}</Text>}
            {societe?.tel && <Text>Tél: {societe.tel}</Text>}
            {societe?.email && <Text>Email: {societe.email}</Text>}
            {societe?.rc && <Text>RC: {societe.rc}</Text>}
            {societe?.ice && <Text>ICE: {societe.ice}</Text>}
          </View>
        </View>


        <Text style={styles.title}>FICHE D{"'"}INFORMATION PROSPECT</Text>
        
        <View style={styles.badge}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            Document de suivi commercial confidentiel
          </Text>
        </View>

        {/* Section Informations Prospect */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS PERSONNELLES</Text>

          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Nom complet</Text>
              <Text style={styles.gridValue}>
                {(prospect?.nom || "") + " " + (prospect?.prenom || "")}
              </Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>CIN / Passeport</Text>
              <Text style={styles.gridValue}>{prospect?.cin || ""}</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Téléphone principal</Text>
              <Text style={styles.gridValue}>{prospect?.telephone || ""}</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Téléphone secondaire</Text>
              <Text style={styles.gridValue}>
                {prospect?.telephone_num2 && prospect.telephone_num2 !== 'null' 
                  ? prospect.telephone_num2 
                  : ""}
              </Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Adresse email</Text>
              <Text style={styles.gridValue}>{prospect?.email || ""}</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Accepte d{"'"}être contacté</Text>
              <Text style={styles.gridValue}>
                {prospect?.notifie === 1 ? "Oui ✓" : "Non ✗"}
              </Text>
            </View>
          </View>
        </View>

        {/* Section Origine et Affectation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ORIGINE & AFFECTATION</Text>

          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Source / Origine</Text>
              <Text style={styles.gridValue}>{prospect?.origin || ""}</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Provenance</Text>
              <Text style={styles.gridValue}>
                {prospect?.partenaire_id !== null
                  ? `Partenaire : ${prospect?.partenaire?.description || ""}`
                  : prospect?.source?.source || ""}
              </Text>
            </View>

            {prospect?.affecte_par_admin && (
              <>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Commercial assigné</Text>
                  <Text style={styles.gridValue}>
                    {prospect.affecte_par_admin.name || ""} {prospect.affecte_par_admin.prenom || ""}
                  </Text>
                </View>

                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Date d{"'"}assignation</Text>
                  <Text style={styles.gridValue}>
                    {prospect?.date_affectation ? formatDate(prospect.date_affectation) : "Non définie"}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Section Appels */}
        {appels && appels.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              HISTORIQUE DES ÉCHANGES TÉLÉPHONIQUES ({appels.length} appel(s))
            </Text>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Date</Text>
                <Text style={styles.tableHeaderCell}>Commercial</Text>
                <Text style={styles.tableHeaderCell}>Type</Text>
                <Text style={styles.tableHeaderCell}>Niveau d{"'"}intérêt</Text>
              </View>

              {appels.map((appel, index) => (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.tableCell}>{formatDate(appel.date)}</Text>
                  <Text style={styles.tableCell}>
                    {appel.user?.name || ""} {appel.user?.prenom || ""}
                  </Text>
                  <Text style={styles.tableCell}>
                    {appel.type_appel === 1 ? "📞 Entrant" : "📞 Sortant"}
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              VISITES RÉALISÉES ({visites.length} visite(s))
            </Text>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Date</Text>
                <Text style={styles.tableHeaderCell}>Responsable</Text>
                <Text style={styles.tableHeaderCell}>Intérêt</Text>
                <Text style={styles.tableHeaderCell}>Statut</Text>
                <Text style={styles.tableHeaderCell}>Bien immobilier</Text>
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

        {/* Message professionnel */}
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            Ce document fait office de suivi commercial. Toute information contenue dans ce document 
            est confidentielle et réservée à l{"'"}usage interne de {societe?.raison_sociale || 'la société'}.
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

export default ProspectPDF;