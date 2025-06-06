"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPolicy() {
  const [currentSection, setCurrentSection] = useState("introduction");

  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "collection", title: "Collecte des Données" },
    { id: "usage", title: "Utilisation des Données" },
    { id: "sharing", title: "Partage des Données" },
    { id: "cookies", title: "Cookies et Technologies" },
    { id: "security", title: "Sécurité des Données" },
    { id: "rights", title: "Vos Droits" },
    { id: "children", title: "Enfants" },
    { id: "changes", title: "Modifications" },
    { id: "contact", title: "Nous Contacter" }
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setCurrentSection(sectionId);
    }
  };

  // Determine if a section is active for styling the navigation
  const isActive = (sectionId) => currentSection === sectionId;

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <Link href="/" className="inline-flex items-center text-white hover:text-blue-100 mb-6">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Retour à l'accueil
          </Link>
          <h1 className="text-3xl font-bold">Politique de Confidentialité</h1>
          <p className="mt-2 text-blue-100">Dernière mise à jour: 1 Juin 2023</p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 mt-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Navigation Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <h2 className="font-semibold text-lg mb-3 pb-2 border-b border-gray-200">Table des Matières</h2>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive(section.id)
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:w-3/4">
            <div className="bg-white rounded-lg shadow-sm p-6 prose max-w-none">
              <section id="introduction" className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Introduction</h2>
                <p>
                  Chez Immo Gestion, nous prenons la protection de vos données personnelles très au sérieux. 
                  Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons 
                  vos informations lorsque vous utilisez notre application de gestion immobilière.
                </p>
                <p>
                  En utilisant notre service, vous consentez à la collecte et à l'utilisation de vos informations 
                  conformément à cette politique. Si vous n'acceptez pas cette politique, veuillez ne pas utiliser notre service.
                </p>
              </section>

              <section id="collection" className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Collecte des Données</h2>
                <p>Nous collectons plusieurs types d'informations vous concernant, notamment:</p>
                <ul>
                  <li>
                    <strong>Informations d'identification:</strong> nom, prénom, adresse e-mail, numéro de téléphone, 
                    et autres informations similaires que vous nous fournissez lors de la création d'un compte ou 
                    de l'utilisation de notre service.
                  </li>
                  <li>
                    <strong>Données professionnelles:</strong> informations concernant votre entreprise, votre rôle, 
                    et autres détails professionnels pertinents pour la gestion immobilière.
                  </li>
                  <li>
                    <strong>Informations sur les biens immobiliers:</strong> détails sur les propriétés que vous gérez 
                    via notre plateforme, y compris les adresses, les caractéristiques, les prix, et les documents associés.
                  </li>
                  <li>
                    <strong>Données des clients:</strong> informations sur les clients et les prospects que vous gérez, 
                    qui peuvent inclure leurs coordonnées et leurs préférences immobilières.
                  </li>
                  <li>
                    <strong>Données d'utilisation:</strong> informations sur la façon dont vous interagissez avec notre service, 
                    y compris les fonctionnalités que vous utilisez, les pages que vous visitez, et votre activité générale sur la plateforme.
                  </li>
                  <li>
                    <strong>Informations techniques:</strong> adresse IP, type d'appareil, type de navigateur, système d'exploitation, 
                    et d'autres données techniques concernant votre connexion à notre service.
                  </li>
                </ul>
              </section>

              <section id="usage" className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Utilisation des Données</h2>
                <p>Nous utilisons vos données personnelles pour les finalités suivantes:</p>
                <ul>
                  <li>Fournir, maintenir et améliorer notre service</li>
                  <li>Gérer votre compte et vous permettre d'utiliser les différentes fonctionnalités de notre plateforme</li>
                  <li>Personnaliser votre expérience et vous proposer du contenu et des fonctionnalités adaptés à vos besoins</li>
                  <li>Communiquer avec vous concernant votre compte, les mises à jour de notre service, et d'autres informations importantes</li>
                  <li>Vous envoyer des notifications, des alertes et des rappels relatifs à votre activité de gestion immobilière</li>
                  <li>Analyser l'utilisation de notre service pour améliorer nos fonctionnalités et notre expérience utilisateur</li>
                  <li>Détecter, prévenir et résoudre les problèmes techniques ou de sécurité</li>
                  <li>Se conformer aux obligations légales et réglementaires</li>
                </ul>
              </section>

              <section id="sharing" className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Partage des Données</h2>
                <p>
                  Nous ne vendons pas vos données personnelles. Nous pouvons partager vos informations 
                  dans les circonstances suivantes:
                </p>
                <ul>
                  <li>
                    <strong>Avec des prestataires de services:</strong> nous travaillons avec des entreprises tierces qui 
                    nous fournissent des services tels que l'hébergement, la maintenance, et l'analyse de données. 
                    Ces entreprises ont accès à vos informations uniquement pour exécuter ces tâches en notre nom et 
                    sont contractuellement tenues de ne pas les divulguer ou les utiliser à d'autres fins.
                  </li>
                  <li>
                    <strong>Avec votre consentement:</strong> nous pouvons partager vos informations avec des tiers 
                    si vous nous avez donné votre consentement pour le faire.
                  </li>
                  <li>
                    <strong>Pour des raisons légales:</strong> nous pouvons divulguer vos informations si nous sommes 
                    légalement tenus de le faire, notamment pour se conformer à une ordonnance du tribunal, à une procédure 
                    légale, ou à une demande gouvernementale.
                  </li>
                  <li>
                    <strong>En cas de fusion ou d'acquisition:</strong> si notre entreprise est impliquée dans une fusion, 
                    une acquisition ou une vente d'actifs, vos données peuvent être transférées dans le cadre de cette transaction.
                  </li>
                </ul>
              </section>

              <section id="cookies" className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Cookies et Technologies Similaires</h2>
                <p>
                  Nous utilisons des cookies et des technologies de suivi similaires pour suivre l'activité sur notre 
                  service et conserver certaines informations. Les cookies sont des fichiers contenant une petite 
                  quantité de données qui peuvent inclure un identifiant unique anonyme.
                </p>
                <p>
                  Vous pouvez configurer votre navigateur pour refuser tous les cookies ou pour indiquer quand un 
                  cookie est envoyé. Cependant, si vous n'acceptez pas les cookies, il est possible que vous ne 
                  puissiez pas utiliser certaines parties de notre service.
                </p>
                <p>
                  Nous utilisons les cookies pour les finalités suivantes:
                </p>
                <ul>
                  <li>
                    <strong>Cookies essentiels:</strong> nécessaires au fonctionnement de notre service, 
                    comme l'authentification et la sécurité.
                  </li>
                  <li>
                    <strong>Cookies de préférences:</strong> pour mémoriser vos préférences et divers paramètres.
                  </li>
                  <li>
                    <strong>Cookies statistiques:</strong> pour comprendre comment vous utilisez notre service.
                  </li>
                </ul>
              </section>

              <section id="security" className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Sécurité des Données</h2>
                <p>
                  La sécurité de vos données est importante pour nous, mais rappelez-vous qu'aucune méthode de 
                  transmission sur Internet ou méthode de stockage électronique n'est 100% sécurisée. Bien que nous 
                  nous efforcions d'utiliser des moyens commercialement acceptables pour protéger vos données personnelles, 
                  nous ne pouvons garantir leur sécurité absolue.
                </p>
                <p>
                  Nous avons mis en place des mesures de sécurité techniques et organisationnelles pour protéger vos données, 
                  notamment:
                </p>
                <ul>
                  <li>Chiffrement des données sensibles</li>
                  <li>Accès restreint aux données personnelles</li>
                  <li>Surveillance continue de nos systèmes pour détecter d'éventuelles vulnérabilités</li>
                  <li>Formation régulière de notre personnel sur les meilleures pratiques en matière de sécurité des données</li>
                </ul>
              </section>

              <section id="rights" className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Vos Droits</h2>
                <p>
                  Selon votre lieu de résidence, vous pouvez bénéficier de certains droits concernant vos données personnelles, 
                  notamment:
                </p>
                <ul>
                  <li>
                    <strong>Droit d'accès:</strong> vous pouvez demander une copie des données personnelles que nous détenons vous concernant.
                  </li>
                  <li>
                    <strong>Droit de rectification:</strong> vous pouvez demander la correction de données inexactes ou incomplètes.
                  </li>
                  <li>
                    <strong>Droit à l'effacement:</strong> vous pouvez demander la suppression de vos données personnelles 
                    dans certaines circonstances.
                  </li>
                  <li>
                    <strong>Droit à la limitation du traitement:</strong> vous pouvez demander la limitation du traitement 
                    de vos données dans certaines circonstances.
                  </li>
                  <li>
                    <strong>Droit à la portabilité des données:</strong> vous pouvez demander le transfert de vos données 
                    à un autre service dans un format structuré, couramment utilisé et lisible par machine.
                  </li>
                  <li>
                    <strong>Droit d'opposition:</strong> vous pouvez vous opposer au traitement de vos données personnelles 
                    dans certaines circonstances.
                  </li>
                </ul>
                <p>
                  Pour exercer ces droits, veuillez nous contacter en utilisant les coordonnées fournies à la fin de cette politique.
                </p>
              </section>

              <section id="children" className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Protection des Enfants</h2>
                <p>
                  Notre service ne s'adresse pas aux personnes de moins de 18 ans. Nous ne collectons pas sciemment 
                  des données personnelles auprès d'enfants de moins de 18 ans. Si vous êtes un parent ou un tuteur et 
                  que vous savez que votre enfant nous a fourni des données personnelles, veuillez nous contacter. 
                  Si nous apprenons que nous avons collecté des données personnelles auprès d'enfants sans vérification 
                  du consentement parental, nous prenons des mesures pour supprimer ces informations de nos serveurs.
                </p>
              </section>

              <section id="changes" className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Modifications de cette Politique</h2>
                <p>
                  Nous pouvons mettre à jour notre politique de confidentialité de temps à autre. Nous vous informerons 
                  de tout changement en publiant la nouvelle politique de confidentialité sur cette page et, si les 
                  changements sont significatifs, nous vous fournirons un avis plus visible.
                </p>
                <p>
                  Nous vous conseillons de consulter régulièrement cette politique de confidentialité pour prendre 
                  connaissance de tout changement. Les modifications apportées à cette politique de confidentialité 
                  sont effectives lorsqu'elles sont publiées sur cette page.
                </p>
              </section>

              <section id="contact" className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Nous Contacter</h2>
                <p>
                  Si vous avez des questions concernant cette politique de confidentialité ou nos pratiques en matière 
                  de protection des données, veuillez nous contacter:
                </p>
                <ul>
                  <li>Par e-mail: <a href="mailto:privacy@immogestion.com" className="text-blue-600 hover:underline">privacy@immogestion.com</a></li>
                  <li>Par téléphone: +212 522 000 000</li>
                  <li>Par courrier: Immo Gestion, 123 Boulevard Mohammed V, Casablanca, Maroc</li>
                </ul>
                <p>
                  Nous nous efforcerons de répondre à vos questions et préoccupations dans les meilleurs délais.
                </p>
              </section>

              <div className="mt-12 pt-6 border-t border-gray-200">
                <p className="text-center text-gray-600 text-sm">
                  Si vous avez des questions concernant cette Politique de Confidentialité, veuillez nous contacter à&nbsp;
                  <a href="mailto:privacy@immogestion.com" className="text-blue-600 hover:underline">
                    privacy@immogestion.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
