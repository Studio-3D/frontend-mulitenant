import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import format from 'date-fns/format';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#5A5FE0',
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
  },
  section: {
    marginBottom: 15, // Réduit de 20 à 15 pour tous
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8, // Réduit de 10 à 8
    color: '#5A5FE0',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    width: '40%',
    color: '#444444',
  },
  value: {
    fontSize: 12,
    width: '60%',
    color: '#333333',
  },
  cardContainer: {
    // Nouveau style unifié pour toutes les cartes
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderLeftColor: '#5A5FE0',
    padding: 12,
    marginBottom: 12, // Marge unifiée
    borderRadius: 4,
  },
  compositionItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  compositionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    width: '60%',
    color: '#444444',
  },
  compositionValue: {
    fontSize: 12,
    width: '40%',
    color: '#333333',
  },
  signatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40, // Réduit de 50 à 40
    paddingTop: 15, // Réduit de 20 à 15
  },
  signatureLine: {
    height: 1,
    width: '70%',
    backgroundColor: '#000000',
    marginBottom: 5,
  },
  signatureText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  badge: {
    width: 24,
    height: 24,
    backgroundColor: '#5A5FE0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
  },
  partieTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5A5FE0',
  },
  partieContent: {
    fontSize: 12,
    marginTop: 5,
    lineHeight: 1.4, // Ajouté pour un meilleur espacement des lignes
  },
  financialValue: {
    fontSize: 12,
    width: '60%',
    fontWeight: 'bold',
    color: '#5A5FE0',
  },
});

const Document_Contrat = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>CONTRAT DE VENTE</Text>
        <Text style={styles.subtitle}>
          Dossier: {data.code_reservation || 'N/A'}
        </Text>
        <Text style={styles.subtitle}>N° : {data.num_recu}</Text>
      </View>

      {/* Parties Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Les parties</Text>

        {/* Vendeur */}
        <View
          style={[
            styles.cardContainer,
            { borderLeftColor: '#5A5FE0', backgroundColor: '#F0F7FF' },
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 5,
            }}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>V</Text>
            </View>
            <Text style={styles.partieTitle}>Vendeur</Text>
          </View>
          <Text style={styles.partieContent}>
            {data.societe?.raison_sociale}, société à responsabilité limitée de
            droit Marocain, au capital social de 100.000,00 de dirhams, ayant
            son siège social à Fes, 47, Boulevard Al Amir 5ème étage.
          </Text>
        </View>

        {/* Acheteur */}
        <View
          style={[
            styles.cardContainer,
            { borderLeftColor: '#5A5FE0', backgroundColor: '#F5F0FF' },
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 5,
            }}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>A</Text>
            </View>
            <Text style={styles.partieTitle}>Acheteur</Text>
          </View>
          {data.aquereurs ? (
            Object.keys(data.aquereurs).map((key) => (
              <View key={key} style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
                  {data.aquereurs[key].client.civilite}{' '}
                  {data.aquereurs[key].client.nom}{' '}
                  {data.aquereurs[key].client.prenom}
                </Text>
                <Text style={{ fontSize: 12 }}>
                  CIN: {data.aquereurs[key].client.cin || 'Non renseigné'}
                </Text>
                <Text style={{ fontSize: 12 }}>
                  Adresse:{' '}
                  {data.aquereurs[key].client.adresse || 'Non renseigné'}
                  {data.aquereurs[key].client.ville
                    ? `, ${data.aquereurs[key].client.ville}`
                    : ''}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ fontSize: 12 }}>Aucun acheteur renseigné</Text>
          )}
        </View>
      </View>

      {/* Détails du bien */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Détails du bien</Text>
        <View
          style={[
            styles.cardContainer,
            { borderLeftColor: '#5A5FE0', backgroundColor: '#F5F0F5' },
          ]}
        >
          <Text style={styles.partieContent}>
            Ce bien immobilier est un{' '}
            {data.bien?.type_bien?.type || 'type non spécifié'}, identifié par
            le numéro {data.bien?.numero || 'non renseigné'}. Il est situé au{' '}
            {data.bien?.niveau == 0
              ? 'rez-de-chaussée'
              : `${data.bien?.niveau}ème étage`}{' '}
            et offre une superficie habitable de{' '}
            {data.bien?.superficie_habitable || '0'} m².
            {data.bien?.superficie_balcon > 0 &&
              ` Le bien comprend un balcon de ${data.bien.superficie_balcon} m².`}
            {data.bien?.superficie_terrasse > 0 &&
              ` Il dispose également d'une terrasse de ${data.bien.superficie_terrasse} m².`}
          </Text>

          <Text style={[styles.partieContent, { marginTop: 8 }]}>
            La composition du bien comprend :
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
                        summedComposition.nbre_halls > 1 ? 's' : ''
                      }`
                    );
                  if (summedComposition.nbre_salons > 0)
                    parts.push(
                      `${summedComposition.nbre_salons} salon${
                        summedComposition.nbre_salons > 1 ? 's' : ''
                      }`
                    );
                  if (summedComposition.nbre_chambres > 0)
                    parts.push(
                      `${summedComposition.nbre_chambres} chambre${
                        summedComposition.nbre_chambres > 1 ? 's' : ''
                      }`
                    );
                  if (summedComposition.nbre_cuisines > 0)
                    parts.push(
                      `${summedComposition.nbre_cuisines} cuisine${
                        summedComposition.nbre_cuisines > 1 ? 's' : ''
                      }`
                    );
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
                      `${summedComposition.nbre_buanderies} buanderie${
                        summedComposition.nbre_buanderies > 1 ? 's' : ''
                      }`
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
                    return text + '.';
                  }
                  return 'Non spécifiée.';
                })()
              : 'Non spécifiée.'}
            {data.bien?.num_parking != null &&
              ` Le bien dispose de ${data.bien.num_parking} place${
                data.bien.num_parking > 1 ? 's' : ''
              } de parking au sous-sol.`}
            {data.bien?.num_box != null &&
              ` Il comprend également un box numéro ${data.bien.num_box}.`}
          </Text>
        </View>
      </View>

      {/* Conditions financières */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conditions financières</Text>
        <View
          style={[
            styles.cardContainer,
            { borderLeftColor: '#5A5FE0', backgroundColor: '#F0F7F0' },
          ]}
        >
          <View style={styles.row}>
            <Text style={styles.label}>Prix global:</Text>
            <Text style={styles.financialValue}>
              {data.bien?.prix
                ? `${data.bien.prix.toLocaleString('fr-FR')} DHS`
                : 'N/A'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Acompte versé:</Text>
            <Text style={styles.financialValue}>
              {data.sum_avances_valides
                ? `${data.sum_avances_valides.toLocaleString('fr-FR')} DHS`
                : '0 DHS'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Reste à payer:</Text>
            <Text style={styles.financialValue}>
              {data.bien?.prix && data.sum_avances_valides
                ? `${(data.bien.prix - data.sum_avances_valides).toLocaleString(
                    'fr-FR'
                  )} DHS`
                : 'N/A'}
            </Text>
          </View>
        </View>
      </View>
      {/* Dates Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dates du contrat</Text>
        <View style={[styles.cardContainer, { borderLeftColor: '#5A5FE0' }]}>
          <Text style={styles.partieContent}>
            Il est énoncé que le client a signé le contrat en{' '}
            <Text style={{ fontWeight: 'bold' }}>
              {data.date_sign_client
                ? format(new Date(data.date_sign_client), 'dd/MM/yyyy')
                : 'date non renseignée'}
            </Text>{' '}
            et le Maitre {"d'"}Ouvrage en{' '}
            <Text style={{ fontWeight: 'bold' }}>
              {data.date_sign_mo
                ? format(new Date(data.date_sign_mo), 'dd/MM/yyyy')
                : 'date non renseignée'}
            </Text>{' '}
            et enregistré en{' '}
            <Text style={{ fontWeight: 'bold' }}>
              {data.date_enreg
                ? format(new Date(data.date_enreg), 'dd/MM/yyyy')
                : 'date non renseignée'}
            </Text>
            .
          </Text>
        </View>
      </View>

      {/* Signatures */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Signatures</Text>
        <View style={styles.signatureContainer}>
          <View style={{ width: '45%', alignItems: 'center' }}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Signature du Client</Text>
          </View>
          <View style={{ width: '45%', alignItems: 'center' }}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Signature du Responsable</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

export default Document_Contrat;
