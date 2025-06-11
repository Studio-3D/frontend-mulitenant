import axios from "axios";

/**
 * Generate a prompt for the LLM based on property details
 */
function generatePromptFromProperty(property) {
  if (!property) return "Veuillez fournir les détails du bien.";
  
  // Define what's important for a good property description
  const typeBien = property.type?.type || "";
  const typologieLabel = property.typologie?.typologie || "";
  const superficie = property.superficie_habitable ? `${property.superficie_habitable} m²` : "";
  const chambres = property.nbre_chambres ? `${property.nbre_chambres} chambre(s)` : "";
  const salons = property.nbre_salons ? `${property.nbre_salons} salon(s)` : "";
  const sallesDeBain = property.nbre_sdb ? `${property.nbre_sdb} salle(s) de bain` : "";
  const etage = property.niveau !== null && property.niveau !== undefined ? 
    `au ${property.niveau}${property.niveau === 0 ? ' (rez-de-chaussée)' : 'e étage'}` : "";
  const orientation = property.orientation || "";
  const vue = property.vue?.vue || "";
  const caracteristiques = [];
  
  // Add terraces, balconies, etc if they exist (check both 0 and null)
  if (property.superficie_terrasse > 0) caracteristiques.push(`terrasse de ${property.superficie_terrasse} m²`);
  if (property.superficie_balcon > 0) caracteristiques.push(`balcon de ${property.superficie_balcon} m²`);
  if (property.superficie_jardin > 0) caracteristiques.push(`jardin de ${property.superficie_jardin} m²`);
  
  // Add parking or box if they exist
  if (property.num_parking) caracteristiques.push("avec parking");
  if (property.num_box) caracteristiques.push("avec box");
  
  // Location details
  const localisation = [];
  if (property.projet?.nom) localisation.push(`dans le projet ${property.projet.nom}`);
  if (property.tranche?.nom) localisation.push(`tranche ${property.tranche.nom}`);
  if (property.bloc?.nom) localisation.push(`bloc ${property.bloc.nom}`);
  if (property.immeuble?.nom) localisation.push(`immeuble ${property.immeuble.nom}`);
  
  // Build the prompt
  return `Rédigez une description commerciale attrayante et détaillée pour un bien immobilier avec les caractéristiques suivantes:

Type de bien: ${typeBien}
Typologie: ${typologieLabel}
Superficie habitable: ${superficie}
Composition: ${[chambres, salons, sallesDeBain].filter(Boolean).join(", ")}
Situation: ${etage}
Orientation: ${orientation}
Vue: ${vue}
${caracteristiques.length > 0 ? `Caractéristiques: ${caracteristiques.join(", ")}` : ""}
${localisation.length > 0 ? `Localisation: ${localisation.join(", ")}` : ""}

La description doit être en français, entre 100 et 200 mots, et mettre en valeur les points forts du bien. N'inventez pas de détails qui ne sont pas mentionnés ci-dessus.`;
}

/**
 * Service for generating text using OpenAI's GPT API
 */
export const LLMService = {
  /**
   * Generate a property description using OpenAI's API
   * @param {Object} property - The property object with all details
   * @returns {Promise<string>} - The generated description
   */
  generatePropertyDescription: async (property) => {
    try {
      // Default API key from environment or use provided key
      const key = apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      
      if (!key) {
        throw new Error("OpenAI API key is required");
      }
      
      // Format property data for the prompt
      const prompt = generatePromptFromProperty(property);
      
      console.log("Sending request to OpenAI with prompt:", prompt);
      
      // Make API call to OpenAI
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Vous êtes un expert immobilier professionnel qui écrit des descriptions attrayantes pour les biens immobiliers."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`
          }
        }
      );
      
      // Check for valid response structure
      if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
        console.error("Unexpected API response format:", response.data);
        throw new Error("Format de réponse API inattendu");
      }
      
      // Extract and return the generated text
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error("Error generating property description:", error);
      
      // Provide more helpful error messages based on common issues
      if (error.response?.status === 401) {
        throw new Error("Clé API OpenAI invalide");
      } else if (error.response?.status === 429) {
        throw new Error("Limite de requêtes OpenAI dépassée");
      } else if (error.response?.data?.error) {
        throw new Error(`Erreur OpenAI: ${error.response.data.error.message}`);
      }
      
      throw error;
    }
  },

  /**
   * Generate a refined description based on user feedback
   * @param {string} prompt - The prompt containing the original description and user feedback
   * @returns {Promise<string>} - The refined description
   */
  generateRefinedDescription: async (prompt) => {
    try {
      // Default API key from environment
      const key = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      
      if (!key) {
        throw new Error("OpenAI API key is required");
      }
      
      console.log("Sending refinement request to OpenAI");
      
      // Make API call to OpenAI
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Vous êtes un expert immobilier professionnel qui écrit des descriptions attrayantes pour les biens immobiliers."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`
          }
        }
      );
      
      // Check for valid response structure
      if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
        console.error("Unexpected API response format:", response.data);
        throw new Error("Format de réponse API inattendu");
      }
      
      // Extract and return the generated text
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error("Error generating refined description:", error);
      
      // Provide more helpful error messages based on common issues
      if (error.response?.status === 401) {
        throw new Error("Clé API OpenAI invalide");
      } else if (error.response?.status === 429) {
        throw new Error("Limite de requêtes OpenAI dépassée");
      } else if (error.response?.data?.error) {
        throw new Error(`Erreur OpenAI: ${error.response.data.error.message}`);
      }
      
      throw error;
    }
  },

  // Alternative function that uses a mock for testing or when no API key is available
  generateMockDescription: (property) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`
Magnifique ${property.type?.type || "appartement"} ${property.typologie?.typologie || ""} 
d'une superficie de ${property.superficie_habitable || "N/A"} m², idéalement situé 
${property.immeuble?.nom ? `dans l'immeuble ${property.immeuble.nom}` : ""} 
${property.projet?.nom ? `au sein du projet ${property.projet.nom}` : ""}.

Ce bien lumineux et spacieux offre ${property.nbre_chambres || 0} chambre(s), 
${property.nbre_salons || 0} salon(s) et ${property.nbre_sdb || 0} salle(s) de bain. 
Les finitions sont soignées et les espaces bien agencés pour votre confort.

À découvrir rapidement !
        `);
      }, 1000);
    });
  },
  
  // Improved mock refinement function that actually modifies the description based on feedback
  generateMockRefinedDescription: (originalDescription, feedback) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Parse the feedback to determine how to modify the description
        const lowerFeedback = feedback.toLowerCase();
        let refinedDescription = originalDescription;
        
        // Add superficies details if requested
        if (lowerFeedback.includes('superficies') || lowerFeedback.includes('superficie')) {
          refinedDescription += "\n\nCe bien dispose de superficies généreuses et bien pensées. La superficie habitable offre un espace de vie confortable, complété par des espaces extérieurs bien aménagés qui prolongent agréablement l'espace de vie.";
        }
        
        // Add more details about the view if requested
        if (lowerFeedback.includes('vue') || lowerFeedback.includes('panorama')) {
          refinedDescription += "\n\nLa vue exceptionnelle depuis ce bien est un véritable atout, offrant un panorama dégagé qui apporte luminosité et sérénité au quotidien.";
        }
        
        // Add more details about the location if requested
        if (lowerFeedback.includes('localisation') || lowerFeedback.includes('emplacement') || lowerFeedback.includes('quartier')) {
          refinedDescription += "\n\nL'emplacement de ce bien est idéal, à proximité des commerces et services essentiels, tout en étant dans un environnement calme et verdoyant. Les transports en commun et les principaux axes routiers sont facilement accessibles.";
        }

        // Add more details about finishes if requested
        if (lowerFeedback.includes('finition') || lowerFeedback.includes('matériaux') || lowerFeedback.includes('qualité')) {
          refinedDescription += "\n\nLes finitions de ce bien sont soignées, avec des matériaux de qualité sélectionnés avec goût. Les aménagements intérieurs reflètent une attention particulière au confort et à l'esthétique.";
        }
        
        resolve(refinedDescription);
      }, 1000);
    });
  }
};

export default LLMService;
