import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";
import format from "date-fns/format";

// Create styles - identiques au compromis
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    color: "#2a2c3e",
  },
  container: {
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    padding: 20,
  },
  companyHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 20,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 2,
    gap: 12,
  },
  logoContainer: {
    width: 50,
    height: 50,
    marginTop: 4,
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: 'contain',
  },
  companyInfo: {
    flexDirection: "column",
    flex: 1,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  companyDetailText: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 2,
  },
  companyDetails: {
    flexDirection: "column",
    marginTop: 2,
  },
  metaInfo: {
    flexDirection: "column",
    alignItems: "flex-end",
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "center",
  },
  metaLabel: {
    fontSize: 10,
    color: "#6B7280",
    width: 50,
    marginRight: 8,
  },
  metaValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
  },
  titleSection: {
    textAlign: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4F46E5",
    marginBottom: 8,
  },
  titleDivider: {
    height: 2,
    backgroundColor: "#A5B4FC",
    marginTop: 8,
    marginHorizontal: "auto",
    width: "80%",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4F46E5",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 6,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 10,
    textAlign: "justify",
    color: "#2a2c3e",
  },
  boldText: {
    fontWeight: "bold",
  },
  clientInfoContainer: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
   clientInfoContainer2: {
    backgroundColor: "#F0F7FF",
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#5A5FE0",
  },
  articleTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textDecoration: "underline",
    marginBottom: 8,
    color: "#2a2c3e",
  },
  signatureContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
  },
  signatureBox: {
    width: "45%",
  },
  signatureLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2a2c3e",
  },
  signaturePlaceholder: {
    height: 60,
    border: "1px solid #D1D5DB",
    borderRadius: 4,
  },
  badge: {
    width: 24,
    height: 24,
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
  },
  partieTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4F46E5",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    width: "40%",
    color: "#444444",
  },
  financialValue: {
    fontSize: 10,
    width: "60%",
    fontWeight: "bold",
    color: "#4F46E5",
  },
  signatureLine: {
    height: 1,
    width: "100%",
    backgroundColor: "#D1D5DB",
    marginBottom: 5,
  },
  signatureText: {
    fontSize: 10,
    color: "#666666",
    textAlign: "center",
  },
});

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

const Document_Contrat = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.container}>
        {/* Company Header - identique au compromis */}
        <View style={styles.companyHeader}>
          <View style={styles.leftSection}>
            {data.societe?.logo && (
              <View style={styles.logoContainer}>
                <Image
                  src={`/images/${data.societe?.raison_sociale_concatene}_${data.societe?.id}/logos/${data.societe?.logo}`}
                  style={styles.logo}
                />
              </View>
            )}
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>
                {data.societe?.raison_sociale}
              </Text>
              <View style={styles.companyDetails}>
                <Text style={styles.companyDetailText}>
                  Adresse:{data.societe?.adresse || 'Adresse non disponible'}
                </Text>
                {data.societe?.tel && (
                  <Text style={styles.companyDetailText}>
                    Tél: {data.societe?.tel}
                  </Text>
                )}
                {data.societe?.email && (
                  <Text style={styles.companyDetailText}>
                    Email: {data.societe?.email}
                  </Text>
                )}
                {data.societe?.rc && (
                  <Text style={styles.companyDetailText}>
                    RC: {data.societe?.rc}
                  </Text>
                )}
                {data.societe?.ice && (
                  <Text style={styles.companyDetailText}>
                    ICE: {data.societe?.ice}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.metaInfo}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>N°:</Text>
              <Text style={styles.metaValue}>{data.num_recu}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date:</Text>
              <Text style={styles.metaValue}>
                {new Date().toLocaleDateString("fr-FR")}
              </Text>
            </View>
          </View>
        </View>

        {/* Title - identique au compromis */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>CONTRAT DE VENTE</Text>
          <View style={styles.titleDivider} />
        </View>

        {/* Document Content */}
        <View>
          {/* Parties Section */}
          <View>
            <Text style={styles.sectionTitle}>LES PARTIES</Text>
            
            {/* Vendeur */}
            <View style={styles.clientInfoContainer2}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>V</Text>
                </View>
                <Text style={styles.partieTitle}>Vendeur</Text>
              </View>
              <Text style={styles.paragraph}>
                {data.societe?.raison_sociale}, société à responsabilité limitée de
                droit Marocain, au capital social de 100.000,00 de dirhams, ayant
                son siège social à {data.societe?.adresse}, immatriculée au registre du commerce
                sous n° {data.societe?.rc} et dont le numéro de l{"'"}identifiant fiscal est le n° {data.societe?.ice}.
              </Text>
            </View>

            {/* Acheteur */}
            <View style={styles.clientInfoContainer}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>A</Text>
                </View>
                <Text style={styles.partieTitle}>Acheteur(s)</Text>
              </View>
              {data.aquereurs ? (
                Object.keys(data.aquereurs).map((key) => (
                  <View key={key} style={{ marginBottom: 10 }}>
                    <Text style={[styles.paragraph, { fontWeight: "bold" }]}>
                      {formatCivilite(data.aquereurs[key].client.civilite)}{" "}
                      {data.aquereurs[key].client.nom}{" "}
                      {data.aquereurs[key].client.prenom}
                    </Text>
                    <Text style={styles.paragraph}>
                      CIN: {data.aquereurs[key].client.cin || "Non renseigné"}
                      {data.aquereurs[key].client.adresse && 
                        `, domicilié à ${data.aquereurs[key].client.adresse}, ${data.aquereurs[key].client.ville || ""}`
                      }
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.paragraph}>Aucun acheteur renseigné</Text>
              )}
            </View>
          </View>

          {/* Détails du bien */}
          <View style={{ marginTop: 15 }}>
            <Text style={styles.sectionTitle}>DÉTAILS DU BIEN</Text>
            <View style={styles.clientInfoContainer}>
              <Text style={styles.paragraph}>
                Ce bien immobilier est un{" "}
                {data.bien?.type_bien?.type || "type non spécifié"}, identifié par
                le numéro <Text style={styles.boldText}>{data.bien?.numero || "non renseigné"}</Text>.
                Il est situé au{" "}
                <Text style={styles.boldText}>
                  {data.bien?.niveau == 0
                    ? 'RDC'
                    : data.bien?.niveau == 1
                    ? '1er étage'
                    : data.bien?.niveau + 'ème étage'}
                </Text>
                , d{"'"}une superficie habitable de{" "}
                <Text style={styles.boldText}>{data.bien?.superficie_habitable || "0"} m²</Text>.
                {data.bien?.superficie_balcon > 0 &&
                  ` Le bien comprend un balcon de ${data.bien.superficie_balcon} m².`}
                {data.bien?.superficie_terrasse > 0 &&
                  ` Il dispose également d'une terrasse de ${data.bien.superficie_terrasse} m².`}
              </Text>
                {data.bien?.composition_bien?.length > 0 && (
                <Text style={[styles.paragraph, { marginTop: 8 }]}>
                                La composition du bien comprend :{" "}
                                {data.bien?.composition_bien?.length > 0
                                  ? (() => {
                                      const summedComposition = data.bien.composition_bien.reduce(
                                        (acc, curr) => ({
                                          nbre_halls:
                                            (acc.nbre_halls || 0) + (curr.nbre_halls || 0),
                                          nbre_salons:
                                            (acc.nbre_salons || 0) + (curr.nbre_salons || 0),
                                          nbre_chambres:
                                            (acc.nbre_chambres || 0) + (curr.nbre_chambres || 0),
                                          nbre_cuisines:
                                            (acc.nbre_cuisines || 0) + (curr.nbre_cuisines || 0),
                                          nbre_sdb: (acc.nbre_sdb || 0) + (curr.nbre_sdb || 0),
                                          nbre_balcons:
                                            (acc.nbre_balcons || 0) + (curr.nbre_balcons || 0),
                                          nbre_buanderies:
                                            (acc.nbre_buanderies || 0) +
                                            (curr.nbre_buanderies || 0),
                                          nbre_placards:
                                            (acc.nbre_placards || 0) + (curr.nbre_placards || 0),
                                          nbre_receptions:
                                            (acc.nbre_receptions || 0) +
                                            (curr.nbre_receptions || 0),
                                        }),
                                        {}
                                      );

                                      const parts = [];
                                      if (summedComposition.nbre_halls > 0)
                                        parts.push(
                                          `${summedComposition.nbre_halls} hall${
                                            summedComposition.nbre_halls > 1 ? "s" : ""
                                          }`
                                        );
                                      if (summedComposition.nbre_salons > 0)
                                        parts.push(
                                          `${summedComposition.nbre_salons} salon${
                                            summedComposition.nbre_salons > 1 ? "s" : ""
                                          }`
                                        );
                                      if (summedComposition.nbre_chambres > 0)
                                        parts.push(
                                          `${summedComposition.nbre_chambres} chambre${
                                            summedComposition.nbre_chambres > 1 ? "s" : ""
                                          }`
                                        );
                                      if (summedComposition.nbre_cuisines > 0)
                                        parts.push(
                                          `${summedComposition.nbre_cuisines} cuisine${
                                            summedComposition.nbre_cuisines > 1 ? "s" : ""
                                          }`
                                        );
                                      if (summedComposition.nbre_sdb > 0)
                                        parts.push(
                                          `${summedComposition.nbre_sdb} salle${
                                            summedComposition.nbre_sdb > 1 ? "s" : ""
                                          } de bain`
                                        );
                                      if (summedComposition.nbre_balcons > 0)
                                        parts.push(
                                          `${summedComposition.nbre_balcons} balcon${
                                            summedComposition.nbre_balcons > 1 ? "s" : ""
                                          }`
                                        );
                                      if (summedComposition.nbre_buanderies > 0)
                                        parts.push(
                                          `${summedComposition.nbre_buanderies} buanderie${
                                            summedComposition.nbre_buanderies > 1 ? "s" : ""
                                          }`
                                        );
                                      if (summedComposition.nbre_placards > 0)
                                        parts.push(
                                          `${summedComposition.nbre_placards} placard${
                                            summedComposition.nbre_placards > 1 ? "s" : ""
                                          }`
                                        );
                                      if (summedComposition.nbre_receptions > 0)
                                        parts.push(
                                          `${summedComposition.nbre_receptions} réception${
                                            summedComposition.nbre_receptions > 1 ? "s" : ""
                                          }`
                                        );

                                      if (parts.length > 0) {
                                        let text = parts.join(", ");
                                        const lastCommaIndex = text.lastIndexOf(", ");
                                        if (lastCommaIndex !== -1) {
                                          text =
                                            text.substring(0, lastCommaIndex) +
                                            " et " +
                                            text.substring(lastCommaIndex + 2);
                                        }
                                        return text + ".";
                                      }
                                      return "Non spécifiée.";
                                    })()
                                  : "Non spécifiée."}
                                {data.bien?.num_parking != null &&
                                  ` Le bien dispose de ${data.bien.num_parking} place${
                                    data.bien.num_parking > 1 ? "s" : ""
                                  } de parking au sous-sol.`}
                                {data.bien?.num_box != null &&
                                  ` Il comprend également un box numéro ${data.bien.num_box}.`}
                              </Text>
                )}
              
            </View>
          </View>

          {/* Conditions financières */}
          <View style={{ marginTop: 15 }}>
            <Text style={styles.sectionTitle}>CONDITIONS FINANCIÈRES</Text>
            <View style={styles.clientInfoContainer2}>
              <View style={styles.row}>
                <Text style={styles.label}>Prix global (DHS):</Text>
                <Text style={styles.financialValue}>
                  {data?.prix
                    ? `${data.prix.toLocaleString("fr-FR")}`
                    : "N/A"}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Acompte versé (DHS):</Text>
                <Text style={styles.financialValue}>
                  {data.sum_avances_valides
                    ? `${data.sum_avances_valides.toLocaleString("fr-FR")}`
                    : "0"}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Reste à payer (DHS):</Text>
                <Text style={styles.financialValue}>
                  {data?.prix && data.sum_avances_valides
                    ? `${(data.prix - data.sum_avances_valides).toLocaleString(
                        "fr-FR"
                      )}`
                    : "N/A"}
                </Text>
              </View>
            </View>
          </View>

          {/* Dates Section */}
          <View style={{ marginTop: 15 }}>
            <Text style={styles.sectionTitle}>DATES DU CONTRAT</Text>
            <View style={styles.clientInfoContainer2}>
              <Text style={styles.paragraph}>
                Il est énoncé que le client a signé le contrat en{" "}
                <Text style={styles.boldText}>
                  {data.date_sign_client
                    ? format(new Date(data.date_sign_client), "dd/MM/yyyy")
                    : "date non renseignée"}
                </Text>{" "}
                et le Maitre d{"'"}Ouvrage en{" "}
                <Text style={styles.boldText}>
                  {data.date_sign_mo
                    ? format(new Date(data.date_sign_mo), "dd/MM/yyyy")
                    : "date non renseignée"}
                </Text>{" "}
                et enregistré en{" "}
                <Text style={styles.boldText}>
                  {data.date_enreg
                    ? format(new Date(data.date_enreg), "dd/MM/yyyy")
                    : "date non renseignée"}
                </Text>
                .
              </Text>
            </View>
          </View>

          {/* Signatures */}
          <View style={styles.signatureContainer}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Signature Client :</Text>
              <View style={styles.signaturePlaceholder} />
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Signature Responsable:</Text>
              <View style={styles.signaturePlaceholder} />
            </View>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

export default Document_Contrat;