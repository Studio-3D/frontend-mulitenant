import React from "react";
import {
  Document,
  Page,
  Text,
  Image,
  StyleSheet,
  View,
} from "@react-pdf/renderer";
import { MODE_PAIEMENT } from "../../../../../../configs/enum";

// Créez des styles inspirés du reçu de pré-réservation
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
  },
  logoContainer: {
    width: "30%",
    minHeight: 80,
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: "contain",
  },
  companyDetails: {
    width: "65%",
    fontSize: 9,
    textAlign: "right",
    lineHeight: 1.5,
  },
  title: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textDecoration: "underline",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 12,
    marginBottom: 20,
    fontStyle: "italic",
  },
  section: {
    marginBottom: 15,
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 20,
  },
  text: {
    fontSize: 10,
    lineHeight: 1.6,
    textAlign: "justify",
    marginBottom: 8,
  },
  bold: {
    fontWeight: "bold",
  },
  underline: {
    textDecoration: "underline",
  },
  signature: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 50,
    fontSize: 10,
    paddingHorizontal: 20,
  },
  montantBox: {
    marginTop: 15,
    marginBottom: 15,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  montantText: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
});

const MyDocument = ({ data }) => {
  const formValues = data[0];
  const selectedProjet = JSON.parse(localStorage.getItem("selectedProjet"));
  const societe = formValues.user?.societe || {};

  const logoUrl = `/images/${societe.raison_sociale_concatene}_${societe.id}/logos/${societe.logo}`;

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "0 DH";
    const num = Math.round(Number(amount));
    const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return `${formatted} DH`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête avec logo et infos société */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image src={logoUrl} style={styles.logo} />
          </View>
          <View style={styles.companyDetails}>
            <Text style={[styles.bold, { marginBottom: 5 }]}>
              {formValues.raison_social || societe?.raison_sociale || "Société"}
            </Text>
            {formValues.adresse && <Text>{formValues.adresse}</Text>}
            {societe?.ville && <Text>{societe.ville}</Text>}
            {societe?.tel && <Text>Tél: {societe.tel}</Text>}
            {societe?.email && <Text>Email: {societe.email}</Text>}
          </View>
        </View>

        {/* Ligne de séparation */}
        <View style={styles.line} />

        {/* Titre du document */}
        <Text style={styles.title}>QUITTANCE</Text>

        {/* Section LE SOUSSIGNÉ */}
        <View style={styles.section}>
          <Text style={[styles.bold, styles.underline]}>LE SOUSSIGNÉ:</Text>
        </View>

        {/* Section Société */}
        <View style={styles.section}>
          <Text style={styles.text}>
            LA SOCIÉTÉ{" "}
            <Text style={styles.bold}>« {formValues.raison_social} »</Text>,
            société à responsabilité limitée de droit Marocain, au capital
            social de{" "}
            <Text style={styles.bold}>
              {formatCurrency(formValues.capital)}
            </Text>
            , ayant son siège social à{" "}
            <Text style={styles.bold}>{formValues.adresse}</Text>, immatriculée
            au registre du commerce sous n°{" "}
            <Text style={styles.bold}>{formValues.registre_commerce}</Text> et
            dont le numéro de l’identifiant fiscal est le n°{" "}
            <Text style={styles.bold}>{formValues.id_fiscal}</Text>.
          </Text>
        </View>

        {/* Section réception du paiement */}
        <View style={styles.section}>
          <Text style={styles.text}>
            Lequel reconnaît avoir reçu de{" "}
            {formValues.clientsList.map((clientData, index) => {
              const isLast = index === formValues.clientsList.length - 1;
              const separator = isLast
                ? ""
                : index === formValues.clientsList.length - 2
                ? " et "
                : ", ";
              return (
                <React.Fragment key={index}>
                  <Text style={styles.bold}>
                    {clientData.civilite == "1"
                      ? "Mr"
                      : clientData.civilite == "2"
                      ? "Mme"
                      : "Mlle"}{" "}
                    {clientData.nom} {clientData.prenom}
                  </Text>
                  {separator}
                </React.Fragment>
              );
            })}{" "}
            la somme de{" "}
            <Text style={styles.bold}>{formatCurrency(formValues.montant)}</Text>{" "}
            {formValues.mode_paiement != 1 ? (
              <>
                au moyen d’un{" "}
                <Text style={styles.bold}>
                  {MODE_PAIEMENT[formValues.mode_paiement]?.label}
                </Text>{" "}
                émis sur{" "}
                <Text style={styles.bold}>« {formValues.banque} »</Text> portant
                N° <Text style={styles.bold}>{formValues.numero_paiement}</Text>.
              </>
            ) : (
              <>
                en{" "}
                <Text style={styles.bold}>
                  {MODE_PAIEMENT[formValues.mode_paiement]?.label}
                </Text>
                .
              </>
            )}
          </Text>
        </View>

        {/* Section description du bien */}
        <View style={styles.section}>
          <Text style={styles.text}>
            Représentant partie du prix d’acquisition de la propriété sise
            {selectedProjet?.nbre_tranches !== 0 && (
              <Text style={styles.bold}>
                {" "}
                à la tranche « {formValues.tranche} »
              </Text>
            )}
            {selectedProjet?.nbre_blocs !== 0 && (
              <Text style={styles.bold}> au bloc « {formValues.bloc} »</Text>
            )}
            {selectedProjet?.nbre_immeubles !== 0 && (
              <Text style={styles.bold}>
                {" "}
                à l’immeuble « {formValues.immeuble} »
              </Text>
            )}
            ,{" "}
            <Text style={styles.bold}>
              {formValues.etage != 0
                ? `à l'étage ${formValues.etage} `
                : "au RDC "}
            </Text>
            <Text style={styles.bold}>{formValues.propriete_dite_bien}</Text>{" "}
            numéro <Text style={styles.bold}>{formValues.bien_numero}</Text>{" "}
            situé à <Text style={styles.bold}>{formValues.adresse_projet}</Text>
            , consistant en un{" "}
            <Text style={styles.bold}>{formValues.type}</Text> en copropriété à
            usage d’habitation d’une superficie approximative de{" "}
            <Text style={styles.bold}>{formValues.superficie_habitable} m²</Text>
            {formValues.isParkingAvailable && (
              <>
                , avec un parking de superficie{" "}
                <Text style={styles.bold}>
                  {formValues.superficie_parking} m²
                </Text>{" "}
                de prix{" "}
                <Text style={styles.bold}>
                  {formatCurrency(formValues.prix_parking)}
                </Text>
              </>
            )}
            , le bien faisant partie d’un ensemble immobilier actuellement en
            futur d’achèvement, faisant l’objet d’un titre foncier mère Numéro{" "}
            <Text style={styles.bold}>{formValues.titre_foncier}</Text>, et
            donne en conséquence quittance définitive et entière pour la dite
            somme.
          </Text>
        </View>

        {/* Montant de la quittance (encadré) */}
        <View style={styles.montantBox}>
          <Text style={styles.montantText}>
            DONT QUITTANCE POUR LA SOMME DE {formatCurrency(formValues.montant)}
          </Text>
        </View>

        {/* Prix de la propriété */}
        <View style={styles.section}>
          <Text style={styles.text}>
            <Text style={styles.bold}>
              Etant précisé que le prix de la propriété objet de la présente
              quittance est de {formatCurrency(formValues.prix)}
            </Text>
          </Text>
        </View>

        {/* Clause d'ajustement */}
        <View style={styles.section}>
          <Text style={styles.text}>
            Etant entendu qu’au cas où il existerait une différence de métrage
            entre la superficie définitive telle qu’établie par le titre foncier
            et la superficie définie ci-dessus, le prix de vente sera ajusté en
            conséquence en plus ou en moins sur la base du prix de vente au
            mètre carré.
          </Text>
        </View>

        {/* Signatures */}
        <View style={styles.signature}>
          <View style={{ width: "40%" }}>
            <View
              style={{
                borderTop: "1px solid #000",
                marginTop: 40,
                paddingTop: 5,
              }}
            >
              <Text style={[styles.underline, { fontSize: 9 }]}>
                Signature du Client
              </Text>
              <Text style={{ fontSize: 8, marginTop: 3 }}>
                {formValues.clientsList.map((c, i) => (
                  <Text key={i}>
                    {c.nom} {c.prenom}
                    {i < formValues.clientsList.length - 1 ? ", " : ""}
                  </Text>
                ))}
              </Text>
            </View>
          </View>

          <View style={{ width: "40%", textAlign: "right" }}>
            <View
              style={{
                borderTop: "1px solid #000",
                marginTop: 40,
                paddingTop: 5,
              }}
            >
              <Text style={[styles.underline, { fontSize: 9 }]}>
                Signature de la Société
              </Text>
              <Text style={{ fontSize: 8, marginTop: 3 }}>
                {formValues.raison_social}
              </Text>
              <Text style={{ fontSize: 8 }}>Représentant légal</Text>
            </View>
          </View>
        </View>

        {/* Date et lieu */}
        <View style={{ marginTop: 30, textAlign: "center" }}>
          <Text style={{ fontSize: 9, fontStyle: "italic" }}>
            Fait à {societe?.ville || "........."}, le{" "}
            {new Date().toLocaleDateString("fr-FR")}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default MyDocument;