"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function TermsConditions() {
  const [currentSection, setCurrentSection] = useState("introduction");

  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "definitions", title: "Définitions" },
    { id: "access", title: "Accès au Service" },
    { id: "account", title: "Comptes Utilisateur" },
    { id: "intellectual", title: "Propriété Intellectuelle" },
    { id: "data", title: "Données Utilisateur" },
    { id: "termination", title: "Résiliation" },
    { id: "liability", title: "Limitation de Responsabilité" },
    { id: "updates", title: "Modifications des Conditions" },
    { id: "law", title: "Loi Applicable" }
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
          <h1 className="text-3xl font-bold">Conditions Générales d'Utilisation</h1>
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
                  Bienvenue sur Immo Gestion. Les présentes conditions générales régissent votre utilisation de notre application 
                  de gestion immobilière et constituent un accord juridiquement contraignant entre vous et notre société.
                </p>
                <p>
                  En accédant à notre service ou en l'utilisant, vous acceptez d'être lié par ces conditions. Si vous n'acceptez pas 
                  ces conditions, vous ne devez pas accéder à notre application ni l'utiliser.
                </p>
              </section>

              <section id="definitions" className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Définitions</h2>
                <p>Dans ces Conditions Générales d'Utilisation:</p>
                <ul>
                  <li><strong>Service</strong> désigne l'application Immo Gestion.</li>
                  <li><strong>Utilisateur</strong> désigne toute personne qui accède à ou utilise le Service.</li>
                  <li><strong>Compte</strong> désigne un compte unique créé pour un Utilisateur permettant d'accéder à notre Service.</li>
                  <li><strong>Contenu</strong> désigne l'ensemble des informations, textes, images, vidéos, et toute autre donnée que nous mettons à disposition via notre Service.</li>
                  <li><strong>Données Utilisateur</strong> désigne toutes les informations entrées par l'Utilisateur dans le système, y compris mais sans s'y limiter, les informations sur les biens immobiliers, les clients, et les transactions.</li>
                </ul>
              </section>

              <section id="access" className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Accès au Service</h2>
                <p>
                  Nous nous réservons le droit de modifier, suspendre ou interrompre, temporairement ou définitivement, 
                  tout ou partie de notre Service, avec ou sans préavis, et nous ne serons pas responsables envers vous ou un tiers 
                  pour toute modification, suspension ou interruption du Service.
                </p>
                <p>
                  Vous êtes responsable de prendre toutes les dispositions nécessaires pour avoir accès à notre Service, 
                  y compris l'accès à un ordinateur, une connexion Internet, et tout autre équipement nécessaire.
                </p>
              </section>

              <section id="account" className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Comptes Utilisateur</h2>
                <p>
                  Lorsque vous créez un compte, vous devez fournir des informations exactes, complètes et à jour. 
                  L'absence de le faire constitue une violation de ces conditions et peut entraîner la résiliation immédiate de votre compte.
                </p>
                <p>
                  Vous êtes responsable de la sauvegarde du mot de passe que vous utilisez pour accéder au Service et de toutes 
                  les activités ou actions effectuées avec votre mot de passe, que votre mot de passe soit utilisé avec notre Service 
                  ou un service tiers.
                </p>
                <p>
                  Vous acceptez de ne pas divulguer votre mot de passe à un tiers. Vous devez nous informer immédiatement si vous prenez 
                  connaissance d'une violation de la sécurité ou d'une utilisation non autorisée de votre compte.
                </p>
              </section>

              <section id="intellectual" className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Propriété Intellectuelle</h2>
                <p>
                  Le Service et son contenu original, fonctionnalités et fonctionnalité sont et resteront la propriété exclusive 
                  d'Immo Gestion et ses concédants. Le Service est protégé par le droit d'auteur, la marque et d'autres lois.
                </p>
                <p>
                  Nos marques commerciales et notre habillage commercial ne peuvent être utilisés en relation avec 
                  un produit ou un service sans notre consentement écrit préalable.
                </p>
              </section>

              <section id="data" className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Données Utilisateur</h2>
                <p>
                  Vous conservez tous les droits sur les Données Utilisateur que vous soumettez à notre Service. 
                  En soumettant des Données Utilisateur, vous nous accordez une licence mondiale, non exclusive, 
                  sans royalties, pour utiliser, copier, traiter, adapter, modifier et distribuer ces Données 
                  Utilisateur dans le seul but de vous fournir notre Service.
                </p>
                <p>
                  Vous êtes entièrement responsable de vos Données Utilisateur et des conséquences de leur soumission 
                  ou publication. Vous déclarez et garantissez que vous avez tous les droits nécessaires pour soumettre 
                  les Données Utilisateur à notre Service.
                </p>
                <p>
                  Nous prenons la sécurité de vos données très au sérieux. Pour plus d'informations sur la façon dont 
                  nous collectons, utilisons et partageons vos données personnelles, veuillez consulter notre 
                  <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-800 mx-1">
                    Politique de Confidentialité
                  </Link>.
                </p>
              </section>

              <section id="termination" className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Résiliation</h2>
                <p>
                  Nous pouvons résilier ou suspendre votre compte immédiatement, sans préavis ni responsabilité, 
                  pour quelque raison que ce soit, y compris, mais sans s'y limiter, si vous violez ces Conditions Générales.
                </p>
                <p>
                  À la résiliation, votre droit d'utiliser le Service cessera immédiatement. Si vous souhaitez résilier 
                  votre compte, vous pouvez simplement cesser d'utiliser le Service ou nous contacter pour demander 
                  la suppression de votre compte.
                </p>
              </section>

              <section id="liability" className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Limitation de Responsabilité</h2>
                <p>
                  En aucun cas, Immo Gestion, ses dirigeants, administrateurs, employés ou agents ne seront 
                  responsables envers vous pour tout dommage direct, indirect, accessoire, spécial, punitif 
                  ou consécutif de quelque nature que ce soit, résultant de:
                </p>
                <ol>
                  <li>Votre utilisation ou incapacité à utiliser notre Service;</li>
                  <li>Tout accès non autorisé ou altération de vos transmissions ou données;</li>
                  <li>Toute déclaration ou conduite d'un tiers sur notre Service;</li>
                  <li>Tout contenu obtenu de notre Service;</li>
                  <li>Toute autre question liée à notre Service.</li>
                </ol>
              </section>

              <section id="updates" className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Modifications des Conditions</h2>
                <p>
                  Nous nous réservons le droit de modifier ces conditions à tout moment. Si une modification 
                  est importante, nous ferons des efforts raisonnables pour fournir au moins 30 jours de préavis avant 
                  que les nouvelles conditions n'entrent en vigueur.
                </p>
                <p>
                  En continuant à accéder à ou à utiliser notre Service après que ces révisions deviennent effectives, 
                  vous acceptez d'être lié par les conditions révisées. Si vous n'acceptez pas les nouvelles conditions, 
                  veuillez arrêter d'utiliser le Service.
                </p>
              </section>

              <section id="law" className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Loi Applicable</h2>
                <p>
                  Ces conditions sont régies et interprétées conformément aux lois du pays où Immo Gestion est établi, 
                  sans égard à ses principes de conflit de lois.
                </p>
                <p>
                  Notre échec à faire valoir un droit ou une disposition de ces conditions ne sera pas considéré comme une 
                  renonciation à ces droits. Si une disposition de ces conditions est jugée invalide ou inapplicable par un 
                  tribunal, les dispositions restantes de ces conditions resteront en vigueur.
                </p>
              </section>

              <div className="mt-12 pt-6 border-t border-gray-200">
                <p className="text-center text-gray-600 text-sm">
                  Si vous avez des questions concernant ces Conditions Générales, veuillez nous contacter à&nbsp;
                  <a href="mailto:contact@immogestion.com" className="text-blue-600 hover:underline">
                    contact@immogestion.com
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
