import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    color: '#2a2c3e', // Dark blue-gray text color
  },
  header: {
    backgroundColor: '#4F46E5',
    padding: 20,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    borderRadius: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    padding: 20,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'space-between',
    marginBottom: 20,
  },
  companyInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  companyInfo: {
    flexDirection: 'column',
  },
  companyAddress: {
    fontSize: 10,
    color: '#6B7280',
    flexDirection: 'row', // This makes address display horizontally
    flexWrap: 'wrap', // Allows text to wrap if needed
  },
  metaInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    minWidth: 150,
  },
  companyIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    padding: 8,
    marginRight: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  companyAddress: {
    fontSize: 10,
    color: '#6B7280',
  },
  metaInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 10,
    color: '#6B7280',
    width: 60,
    marginRight: 8,
  },
  metaValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
  },
  titleSection: {
    textAlign: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 8,
  },
  titleDivider: {
    height: 2,
    backgroundColor: '#A5B4FC',
    marginTop: 8,
    marginHorizontal: 'auto',
    width: '80%',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 6,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 10,
    textAlign: 'justify',
    color: '#2a2c3e',
  },
  boldText: {
    fontWeight: 'bold',
  },
  clientInfoContainer: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  articleTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textDecoration: 'underline',
    marginBottom: 8,
    color: '#2a2c3e',
  },
  signatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  signatureBox: {
    width: '45%',
  },
  signatureLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2a2c3e',
  },
  signaturePlaceholder: {
    height: 60,
    border: '1px solid #D1D5DB',
    borderRadius: 4,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
});

const Document_Compromis = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}

      {/* Content */}
      <View style={styles.container}>
        {/* Company Header */}
        <View style={styles.companyHeader}>
          <View style={styles.companyInfoContainer}>
            {/* Company Icon would go here */}
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>
                {data.user?.societe?.raison_sociale}
              </Text>
              <View style={styles.companyAddress}>
                <Text>47, Boulevard Al Amir 5ème étage, Fès</Text>
              </View>
            </View>
          </View>

          <View style={styles.metaInfo}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>N°Reçu:</Text>
              <Text style={styles.metaValue}>{data.num_recu || 'XXXX'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date:</Text>
              <Text style={styles.metaValue}>
                {new Date().toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>COMPROMIS DE VENTE</Text>
          <View style={styles.titleDivider} />
        </View>

        {/* Document Content */}
        <View>
          {/* Parties */}
          <View>
            <Text style={styles.sectionTitle}>LES SOUSSIGNES</Text>
            <Text style={styles.paragraph}>
              La Societé «{' '}
              <Text style={styles.boldText}>
                {data.user?.societe?.raison_sociale}
              </Text>{' '}
              », société à responsabilité limitée de droit Marocain, au capital
              social de 100.000,00 de dirhams, ayant son siège social à Fes, 47,
              Boulevard Al Amir 5ème étage, immatriculée au registre du commerce
              de Casablanca sous n° 526365 et dont le numéro de {"l'"}
              identifiant fiscal est le n° 55555.
            </Text>
          </View>

          {/* Client Info */}
          <View style={{ marginTop: 15 }}>
            <Text style={styles.sectionTitle}>LE RESERVANT {"D'"}UNE PART</Text>
            {data.clients?.map((client, idx) => (
              <View key={idx} style={styles.clientInfoContainer}>
                <Text style={styles.paragraph}>
                  <Text style={styles.boldText}>
                    {client.client.civilite} {client.client.nom}{' '}
                    {client.client.prenom}
                  </Text>
                  , titulaire de la carte {"d'"}identité nationale n°{' '}
                  {client.client.cin}
                  {client.client.adresse &&
                    `, domicilié à ${client.client.adresse}, ${client.client.ville}`}
                  .
                </Text>
              </View>
            ))}
          </View>

          {/* Article 1 */}
          <View style={{ marginTop: 15 }}>
            <Text style={styles.sectionTitle}>
              LE RESERVATAIRE {"D'"}AUTRE PART
            </Text>
            <Text style={styles.articleTitle}>Article 1 : OBJET</Text>
            <Text style={styles.paragraph}>
              Le réservant, {"s'"}engage à réserver, en {"s'"}obligeant à toutes
              les garanties ordinaires de fait et de droits les plus étendus en
              pareille matière ; Au réservataire qui {"s'"}engage {"d'"}
              acquérir, le bien immobilier dont la désignation suit
            </Text>
          </View>

          {/* Article 2 */}
          <View style={{ marginTop: 15 }}>
            <Text style={styles.articleTitle}>Article 2 : Designation</Text>
            <Text style={styles.paragraph}>
              Un Appartement{' '}
              <Text style={styles.boldText}>
                n° {data.reservationDetails?.bien.numero}
              </Text>{' '}
              sous le nom : <Text style={styles.boldText}>{data.bien}</Text>. en
              copropriété sis à FES, commune a, Al Amir à distraire des
              propriétés dénommées : -« » objet du titre foncier mère numéro
              82493/47 Cet Appartement sera situé au{' '}
              <Text style={styles.boldText}>
                {data.reservationDetails?.bien.etage == 0
                  ? 'RDC'
                  : data.reservationDetails?.bien.etage + 'étage'}{' '}
              </Text>
              , {"D'"}une superficie approximative de{' '}
              <Text style={styles.boldText}>
                {data.reservationDetails?.bien.superficie_habitable} m²{' '}
              </Text>{' '}
              dont un balcon et buanderie {"d'"}une superficie approximative de{' '}
              <Text style={styles.boldText}>
                {data.reservationDetails?.bien.superficie_balcon} m²
              </Text>{' '}
            </Text>

            {/* Terrasse condition */}
            {data.reservationDetails?.bien.superficie_terrasse > 0 && (
              <Text style={styles.paragraph}>
                Et une terrasse {"d'"} une superficie approximative de{' '}
                <Text style={styles.boldText}>
                  {data.reservationDetails?.bien.superficie_terrasse} m²
                </Text>
              </Text>
            )}

            {/* Composition */}
            {data.reservationDetails?.bien.composition_bien?.length > 0 && (
              <Text style={styles.paragraph}>
                Il sera composé de :{' '}
                {(() => {
                  const summedComposition =
                    data.reservationDetails.bien.composition_bien.reduce(
                      (acc, curr) => {
                        return {
                          nbre_halls:
                            (acc.nbre_halls || 0) + (curr.nbre_halls || 0),
                          nbre_salons:
                            (acc.nbre_salons || 0) + (curr.nbre_salons || 0),
                          nbre_chambres:
                            (acc.nbre_chambres || 0) +
                            (curr.nbre_chambres || 0),
                          nbre_cuisines:
                            (acc.nbre_cuisines || 0) +
                            (curr.nbre_cuisines || 0),
                          nbre_sdb: (acc.nbre_sdb || 0) + (curr.nbre_sdb || 0),
                          nbre_balcons:
                            (acc.nbre_balcons || 0) + (curr.nbre_balcons || 0),
                          nbre_buanderies:
                            (acc.nbre_buanderies || 0) +
                            (curr.nbre_buanderies || 0),
                          nbre_placards:
                            (acc.nbre_placards || 0) +
                            (curr.nbre_placards || 0),
                          nbre_receptions:
                            (acc.nbre_receptions || 0) +
                            (curr.nbre_receptions || 0),
                        };
                      },
                      {}
                    );

                  const parts = [];
                  if (summedComposition.nbre_halls > 0)
                    parts.push(
                      `${summedComposition.nbre_halls} hall${
                        summedComposition.nbre_halls > 1 ? 's' : ''
                      }`
                    );
                  if (summedComposition.nbre_salons > 0)
                    parts.push(`${summedComposition.nbre_salons} salon`);
                  if (summedComposition.nbre_chambres > 0)
                    parts.push(
                      `${summedComposition.nbre_chambres} chambre${
                        summedComposition.nbre_chambres > 1 ? 's' : ''
                      }`
                    );
                  if (summedComposition.nbre_cuisines > 0)
                    parts.push(`${summedComposition.nbre_cuisines} cuisine`);
                  if (summedComposition.nbre_sdb > 0)
                    parts.push(
                      `${summedComposition.nbre_sdb} salle${
                        summedComposition.nbre_sdb > 1 ? 's' : ''
                      } de bain`
                    );
                  if (summedComposition.nbre_balcons > 0)
                    parts.push(
                      `${summedComposition.nbre_balcons} balcon${
                        summedComposition.nbre_balcons > 1 ? 's' : ''
                      }`
                    );
                  if (summedComposition.nbre_buanderies > 0)
                    parts.push(
                      `${summedComposition.nbre_buanderies} buanderie`
                    );
                  if (summedComposition.nbre_placards > 0)
                    parts.push(
                      `${summedComposition.nbre_placards} placard${
                        summedComposition.nbre_placards > 1 ? 's' : ''
                      }`
                    );
                  if (summedComposition.nbre_receptions > 0)
                    parts.push(
                      `${summedComposition.nbre_receptions} réception${
                        summedComposition.nbre_receptions > 1 ? 's' : ''
                      }`
                    );

                  if (parts.length > 0) {
                    let text = parts.join(', ');
                    const lastCommaIndex = text.lastIndexOf(', ');
                    if (lastCommaIndex !== -1) {
                      text =
                        text.substring(0, lastCommaIndex) +
                        ' et ' +
                        text.substring(lastCommaIndex + 2);
                    }
                    return text;
                  }
                  return null;
                })()}
              </Text>
            )}

            {/* Parking & Box */}
            {data.reservationDetails?.bien.num_parking != null && (
              <Text style={styles.paragraph}>
                Et {data.reservationDetails.bien.num_parking} place
                {data.reservationDetails.bien.num_parking > 1 ? 's' : ''} de
                parking au sous-sol
              </Text>
            )}
            {data.reservationDetails?.bien.num_box != null && (
              <Text style={styles.paragraph}>
                Et {data.reservationDetails.bien.num_box} Box
              </Text>
            )}
          </View>

          {/* Article 3 */}
          <View style={{ marginTop: 15 }}>
            <Text style={styles.articleTitle}>Article 3 : Prix</Text>
            <Text style={styles.paragraph}>
              Le présent contrat de réservation est consenti et accepté
              moyennant le prix ci-après détaillé :{'\n'}
              *Soit un prix global estimatif de la somme{' '}
              <Text style={styles.boldText}>
                {data.reservationDetails?.prix} DHS
              </Text>{' '}
              Sur lequel prix de vente, le réservataire a versé à titre
              {"d'"}acompte à valoir sur le prix de vente {"d'"}une valeur de{' '}
              <Text style={styles.boldText}>
                {data.sum_avances_valides} DHS
              </Text>
              {'\n'}
              *Le reliquat soit la somme de{' '}
              <Text style={styles.boldText}>
                {data.reservationDetails?.prix - data.sum_avances_valides} DHS
              </Text>{' '}
              sera réglée le jour de la réalisation de la vente définitive.
            </Text>
          </View>

          {/* Article 4 */}
          <View style={{ marginTop: 15 }}>
            <Text style={styles.articleTitle}>Article 4 : Compromis</Text>
            <Text style={styles.paragraph}>
              Il est énoncé que le client a signé le comprimis en{' '}
              <Text style={styles.boldText}>
                {data.form?.date_sign_client &&
                  new Date(data.form.date_sign_client).toLocaleDateString(
                    'fr-FR'
                  )}
              </Text>{' '}
              et le Maitre {"d'"}Ouvrage en{' '}
              <Text style={styles.boldText}>
                {data.form?.date_sign_mo &&
                  new Date(data.form.date_sign_mo).toLocaleDateString('fr-FR')}
              </Text>{' '}
              et enregistré en{' '}
              <Text style={styles.boldText}>
                {data.form?.date_enreg &&
                  new Date(data.form.date_enreg).toLocaleDateString('fr-FR')}
              </Text>{' '}
              avec une durée {"d'"}échéance du{' '}
              {data.form?.duree_echeance == '3'
                ? '3 Mois'
                : data.form?.duree_echeance == '6'
                ? '6 Mois'
                : data.form?.duree_echeance == '12'
                ? '12 Mois'
                : null}{' '}
              correspondant le{' '}
              <Text style={styles.boldText}>
                {data.form?.date_echeance &&
                  new Date(data.form.date_echeance).toLocaleDateString('fr-FR')}
              </Text>
              .
            </Text>
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

export default Document_Compromis;
