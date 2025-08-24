"use client";

import { useMemo } from "react";
import { APIURL } from "@/configs/api";
import { useSociete } from "@/context/SocieteContext";

export default function LandingPageConfigTab() {
  const { selectedSociete } = useSociete();

  const endpoint = useMemo(() => `${APIURL.ROOT}/send_landing_page`, []);
  const societeId = selectedSociete?.id ?? "<votre-societe-id>";

  const htmlForm = `
<form action="${endpoint}" method="POST" accept-charset="UTF-8">
  <input type="text" name="nom" placeholder="Nom" required />
  <input type="text" name="prenom" placeholder="Prénom" required />
  <input type="tel" name="telephone" placeholder="Téléphone" required />
  <input type="email" name="email" placeholder="Email" required />
  <!-- Optionnel: sera enregistré comme commentaire du prospect -->
  <textarea name="comment" placeholder="Commentaire (optionnel)"></textarea>

  <!-- Obligatoire: fourni par Immogestion, identifie votre société -->
  <input type="hidden" name="societe_id" value="${societeId}" />

  <button type="submit">Envoyer</button>
</form>`;

  const jsEnhancer = `
<script>
(function() {
  var API_URL = '${endpoint}';
  var SOCIETE_ID = '${societeId}';
  var FORM_SELECTOR = 'form#immogestion-landing';

  function serialize(form) {
    var fd = new FormData(form);
    return {
      nom: fd.get('nom') || '',
      prenom: fd.get('prenom') || '',
      telephone: fd.get('telephone') || '',
      email: fd.get('email') || '',
      comment: fd.get('comment') || null,
      societe_id: SOCIETE_ID
    };
  }

  function init() {
    var form = document.querySelector(FORM_SELECTOR);
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var data = serialize(form);

      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'omit'
      })
      .then(function(res) {
        if (!res.ok) throw new Error('Erreur ' + res.status);
        return res.json();
      })
      .then(function() {
        alert('Merci, votre demande a été envoyée.');
        form.reset();
      })
      .catch(function(err) {
        console.error(err);
        alert('Une erreur est survenue. Réessayez plus tard.');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>`;

  return (
    <div className="p-6 space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Landing Page</h2>
        <p className="text-gray-600 text-sm mt-1">
          Intégrez votre page externe pour créer automatiquement des prospects dans Immogestion.
        </p>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2">Option A — Formulaire HTML</h3>
        <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto"><code>{htmlForm}</code></pre>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2">Option B — Script pour un formulaire existant</h3>
        <p className="text-sm text-gray-600 mb-3">Ajoutez cet extrait et donnez l'ID immogestion-landing à votre formulaire.</p>
        <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto"><code>{jsEnhancer}</code></pre>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2">Test</h3>
        <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto"><code>{`curl -X POST ${endpoint} \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Doe",
    "prenom": "John",
    "telephone": "+212600000000",
    "email": "john@example.com",
    "comment": "Intéressé par T2",
    "societe_id": ${societeId}
  }'`}</code></pre>
      </div>
    </div>
  );
}

