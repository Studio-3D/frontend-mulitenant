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

// Créez des styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 20,
  },
  logoContainer: {
    textAlign: "center",
    marginBottom: 20,
  },
  logo: {
    width: 50, // Ajustez la taille ici
    height: "auto",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
    textDecoration: "underline",
    fontStyle: "italic",
  },

  section: {
    fontSize: 14,
    marginBottom: 18,
    textAlign: "left",
    paddingLeft: 20,
    textIndent: 30, // Ajouter un peu de retrait à gauche
  },
  label: {
    fontWeight: "bold",
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: "#000", // Couleur de la barre (noire ici)
    marginBottom: 20, // Espace entre la barre et le titre
  },
  erpText: {
    color: "red", // Couleur rouge
    //textAlign: 'center',
    //marginBottom: 10, // Espace entre "ERP_IMMOBILIER" et la barre
  },
  TextHeader: {
    color: "green",
    textAlign: "left",
    fontSize: 17,
    fontWeight: "bold",

    //textAlign: 'center',
    //marginBottom: 10, // Espace entre "ERP_IMMOBILIER" et la barre
  },
  bold: {
    fontWeight: "bold",
    fontSize: 13,
  },
  underline: {
    textDecoration: "underline",
  },
  highlight: {
    fontSize: 10,
    color: "red",
  },
  companyName: {
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: 12,
  },
  normalText: {
    textAlign: "justify",
    fontSize: 11,
    fontWeight: 50,
    textIndent: 30, // Ajout d'un texte plus fin
  },
  TextFin: {
    textAlign: "right",
    fontSize: 15,
    fontWeight: "bold",
    textDecoration: "underline",
    marginTop: 15,
  },
  boldIndentedText: {
    fontWeight: "bold",
    fontSize: 13, // Ajuste selon tes besoins
    textIndent: 20, // Ajoute le retrait ici
    marginBottom: 10, // Optionnel, espace entre paragraphes
  },
});

const MyDocument = ({ data }) => {
  const formValues = data[0];
  const selectedProjet = JSON.parse(localStorage.getItem("selectedProjet"));

  const imageUrl = `/docs/${formValues.user.societe.raison_sociale_concatene}_${formValues.user.societe.id}/logos/${formValues.user.societe.logo}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image src={imageUrl} style={styles.logo} />

          <Text style={styles.TextHeader}>{formValues.raison_social}</Text>
        </View>

        {/* Barre sous le logo */}
        <View style={styles.line}></View>

        {/* Titre du document */}
        <Text style={styles.title}>QUITTANCE</Text>

        <View style={styles.section}>
          <Text style={[styles.bold, styles.underline]}>LE SOUSSIGNÉ:</Text>
        </View>

        {/* Section 2: LA SOCIÉTÉ */}
        <View style={styles.section}>
          <Text style={styles.normalText}>
            LA SOCIÉTÉ{" "}
            <Text style={styles.bold}>« {formValues.raison_social}»</Text>,
            société à responsabilité limitée de droit Marocain, au capital
            social de{" "}
            <Text style={styles.bold}>{formValues.capital} de dirhams</Text>,
            ayant son siège social à&nbsp;{formValues.adresse}, immatriculée au
            registre du commerce sous n°
            <Text style={styles.bold}>{formValues.registre_commerce}</Text> et
            dont le numéro de l’identifiant fiscal est le n°{" "}
            <Text style={styles.bold}>{formValues.id_fiscal}</Text>.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.normalText}>
            Lequel reconnaît avoir reçu de&nbsp;
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
                    {clientData.civilite == '1'
                      ? "Mr"
                      : clientData.civilite == '2'
                      ? "Mme"
                      : "Mlle"}{" "}
                    {clientData.nom} {clientData.prenom}
                  </Text>
                  {separator}
                </React.Fragment>
              );
            })}
            &nbsp; la somme de&nbsp;
            <Text style={styles.bold}>
              {formValues.montant.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              DIRHAMS
            </Text>
            &nbsp;
            {formValues.mode_paiement != 1 ? (
              <>
                au moyen {"d'"}un&nbsp;
                <Text style={styles.bold}>
                  {MODE_PAIEMENT[formValues.mode_paiement]?.label}
                </Text>
                &nbsp;émis sur&nbsp;
                <Text style={styles.bold}>«{formValues.banque}»</Text>
                &nbsp;portant N°&nbsp;
                <Text style={styles.bold}>{formValues.numero_paiement}</Text>.
              </>
            ) : (
              <>
                en&nbsp;
                <Text style={styles.bold}>
                  {MODE_PAIEMENT[formValues.mode_paiement]?.label}
                </Text>
                .
              </>
            )}
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.normalText}>
            Représentant partie du prix d’acquisition de la propriété sise
            {selectedProjet?.nbre_tranches !== 0 && (
              <Text style={styles.bold}>
                {" "}
                à la tranche «{formValues.tranche}»
              </Text>
            )}
            {selectedProjet?.nbre_blocs !== 0 && (
              <Text style={styles.bold}> au bloc «{formValues.bloc}»</Text>
            )}
            {selectedProjet?.nbre_immeubles !== 0 && (
              <Text style={styles.bold}>
                {" "}
                à l’immeuble «{formValues.immeuble}»
              </Text>
            )}
            ,
            <Text style={styles.bold}>
              {" "}
              {formValues.etage != 0
                ? `à l'étage ${formValues.etage} `
                : " RDC "}
            </Text>
            &nbsp;
            <Text style={styles.bold}>
              {formValues.propriete_dite_bien}
            </Text>{" "}
            numéro&nbsp;
            <Text style={styles.bold}>{formValues.numero}</Text> situé à&nbsp;
            <Text style={styles.bold}>{formValues.adresse_projet}</Text>,
            consistant en un&nbsp;
            <Text style={styles.bold}>{formValues.type}</Text> en copropriété à
            usage d’habitation d’une superficie approximative&nbsp; de{" "}
            <Text style={styles.bold}>
              {" "}
              {formValues.superficie_habitable} m²
            </Text>
            {formValues.isParkingAvailable && (
              <>
                , avec un parking de superficie{" "}
                <Text style={styles.bold}>
                  {formValues.superficie_parking} m²
                </Text>{" "}
                de prix&nbsp;
                <Text style={styles.bold}>
                  {formValues.prix_parking.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  DH
                </Text>
              </>
            )}
            , le bien faisant partie {"d'"}un ensemble immobilier actuellement
            en futur {"d'"}achèvement, faisant {"l'"}objet{"d'"}un titre foncier
            mère Numéro{" "}
            <Text style={styles.bold}> {formValues.titre_foncier}</Text>, et
            donne en conséquence quittance définitive et entière pour la dite
            somme.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={[styles.underline, styles.boldIndentedText]}>
            DONT QUITTANCE POUR LA SOMME DE (
            <Text style={styles.bold}>
              {formValues.montant.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              &nbsp; DH
            </Text>{" "}
            )
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={[styles.boldIndentedText]}>
            Etant précisé que le prix de la propriété objet de la présente
            quittance est de{" "}
            <Text style={styles.bold}>
              {formValues.prix.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>{" "}
            <Text style={[styles.erpText]}>DIRHAMS</Text>
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={[styles.boldIndentedText]}>
            Etant entendu {"qu'"}au cas où il existerait une différence de
            métrage entre la superficie définitive telle {"qu'"}établie par le
            titre foncier et la superficie définie ci-dessus, le prix de vente
            sera ajusté en conséquence en plus ou en moins sur la base du prix
            de vente au mètre carré.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={[styles.TextFin]}>NORD AFRIQUE IMMOBILIER</Text>
          <Text style={[styles.TextFin]}>Es qualité</Text>
        </View>
      </Page>
    </Document>
  );
};

export default MyDocument;
