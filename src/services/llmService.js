import axios from "axios";

// Create a separate axios instance for AI services to avoid auth interceptors
const aiAxios = axios.create();

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
 * Service for generating text using various AI APIs
 */
export const LLMService = {
  /**
   * Generate a property description using available AI services
   * @param {Object} property - The property object with all details
   * @returns {Promise<string>} - The generated description
   */
  generatePropertyDescription: async (property) => {
    console.log("🤖 Starting AI description generation...");
    console.log("📝 Property data:", property);

    // Try Groq first (free but requires API key)
    const groqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    console.log("🔑 Groq API key:", groqKey ? "Found" : "Missing");

    if (groqKey) {
      try {
        console.log("🚀 Attempting Groq generation...");
        return await LLMService.generateWithGroq(property);
      } catch (error) {
        console.error("❌ Groq failed:", error.message);
        console.error("Full error:", error);
        throw new Error(`AI service unavailable: ${error.message}`);
      }
    }

    // Try OpenAI if available
    const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (openaiKey) {
      try {
        return await LLMService.generateWithOpenAI(property, openaiKey);
      } catch (error) {
        console.error("OpenAI failed:", error.message);
        throw new Error("AI service unavailable. Please check your OpenAI API key.");
      }
    }

    // Try Hugging Face if available
    const hfKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
    if (hfKey) {
      try {
        return await LLMService.generateWithHuggingFace(property);
      } catch (error) {
        console.error("Hugging Face failed:", error.message);
        throw new Error("AI service unavailable. Please check your Hugging Face API key.");
      }
    }

    // No AI service available
    throw new Error("No AI service configured. Please add NEXT_PUBLIC_GROQ_API_KEY, NEXT_PUBLIC_OPENAI_API_KEY, or NEXT_PUBLIC_HUGGINGFACE_API_KEY to your environment variables.");
  },

  /**
   * Generate description using OpenAI's API
   */
  generateWithOpenAI: async (property, key) => {
    const prompt = generatePromptFromProperty(property);

    console.log("Sending request to OpenAI with prompt:", prompt);

    const response = await aiAxios.post(
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

    if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
      console.error("Unexpected API response format:", response.data);
      throw new Error("Format de réponse API inattendu");
    }

    return response.data.choices[0].message.content.trim();
  },

  /**
   * Generate description using Groq's free API (Llama models)
   */
  generateWithGroq: async (property) => {
    const groqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    console.log("🔑 Groq key in generateWithGroq:", groqKey ? `Found (${groqKey.substring(0, 10)}...)` : "Missing");

    if (!groqKey) {
      throw new Error("Groq API key not found");
    }

    const prompt = generatePromptFromProperty(property);

    console.log("📝 Sending request to Groq with prompt:", prompt);
    console.log("🌐 Making API call to Groq...");

    const response = await aiAxios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert immobilier professionnel qui écrit des descriptions attrayantes pour les biens immobiliers en français. Rédigez une description professionnelle entre 100-200 mots."
          },
          {
            role: "user",
            content: `Rédigez une description immobilière professionnelle en français pour ce bien: ${prompt}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`
        }
      }
    );

    console.log("📡 Groq API response received:", response.status);
    console.log("📄 Response data:", response.data);

    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      const content = response.data.choices[0].message.content.trim();
      console.log("✅ Generated content:", content);
      return content;
    }

    console.error("❌ Unexpected response format from Groq");
    throw new Error("Aucune réponse générée par Groq");
  },

  /**
   * Generate description using Hugging Face's inference API
   */
  generateWithHuggingFace: async (property) => {
    const prompt = generatePromptFromProperty(property);

    console.log("Sending request to Hugging Face with prompt:", prompt);

    const huggingFaceKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
    if (!huggingFaceKey) {
      throw new Error("Hugging Face API key not found");
    }

    // Use GPT-2 model which is reliably available
    const response = await aiAxios.post(
      "https://api-inference.huggingface.co/models/gpt2",
      {
        inputs: `Description immobilière professionnelle: ${prompt}. Cette propriété offre`,
        parameters: {
          max_length: 200,
          temperature: 0.7,
          do_sample: true,
          return_full_text: false,
          num_return_sequences: 1
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${huggingFaceKey}`
        },
        timeout: 30000
      }
    );

    if (response.data && response.data[0] && response.data[0].generated_text) {
      return response.data[0].generated_text.trim();
    }

    throw new Error("Aucune réponse générée par Hugging Face");
  },

  /**
   * Generate description using a completely free intelligent template system
   */
  generateWithFreeAPI: async (property) => {
    console.log("Generating description with Free Intelligent API");

    // Enhanced template system with intelligent content selection
    const typeText = property.type?.type || "bien";
    const typologie = property.typologie?.typologie || "";
    const superficie = property.superficie_habitable || "N/A";
    const chambres = property.nbre_chambres || 0;
    const salons = property.nbre_salons || 0;
    const sdb = property.nbre_sdb || 0;
    const niveau = property.niveau;
    const orientation = property.orientation;
    const vue = property.vue?.vue;
    const projet = property.projet?.nom;
    const immeuble = property.immeuble?.nom;
    const prix = property.prix;

    // Smart content generation based on property features
    let description = "";

    // Opening line variations
    const openings = [
      `Découvrez ce magnifique ${typeText} ${typologie}`,
      `Superbe ${typeText} ${typologie}`,
      `Exclusivité ! ${typeText} ${typologie} d'exception`,
      `Coup de cœur assuré pour ce ${typeText} ${typologie}`,
      `Rare sur le marché ! ${typeText} ${typologie}`
    ];

    description += openings[Math.floor(Math.random() * openings.length)];
    description += ` d'une superficie de ${superficie} m²`;

    // Location details
    if (immeuble && projet) {
      description += `, situé dans l'immeuble ${immeuble} au sein du prestigieux projet ${projet}`;
    } else if (projet) {
      description += `, idéalement situé dans le projet ${projet}`;
    } else if (immeuble) {
      description += `, dans l'immeuble ${immeuble}`;
    }

    description += ".\n\n";

    // Property composition
    if (chambres > 0 || salons > 0 || sdb > 0) {
      const compositions = [
        `Ce bien vous offre ${chambres} chambre(s), ${salons} salon(s) et ${sdb} salle(s) de bain`,
        `Cet espace de vie comprend ${chambres} chambre(s), ${salons} espace(s) de réception et ${sdb} salle(s) de bain`,
        `Cette propriété dispose de ${chambres} chambre(s), ${salons} salon(s) et ${sdb} salle(s) de bain`
      ];
      description += compositions[Math.floor(Math.random() * compositions.length)];
    }

    // Add level information
    if (niveau !== null && niveau !== undefined) {
      if (niveau === 0) {
        description += ", situé au rez-de-chaussée";
      } else {
        description += `, situé au ${niveau}e étage`;
      }
    }

    // Add orientation and view
    if (orientation || vue) {
      description += ". ";
      if (orientation && vue) {
        description += `L'orientation ${orientation} et la vue ${vue} constituent de véritables atouts`;
      } else if (orientation) {
        description += `L'orientation ${orientation} garantit une luminosité optimale`;
      } else if (vue) {
        description += `La vue ${vue} offre un cadre exceptionnel`;
      }
    }

    description += ".\n\n";

    // Quality and features
    const features = [
      "Les finitions soignées et l'agencement intelligent des espaces créent une atmosphère de confort et d'élégance",
      "L'architecture moderne et les matériaux de qualité font de ce bien une référence en matière de standing",
      "Les prestations haut de gamme et la conception optimisée garantissent un art de vivre exceptionnel",
      "Le design contemporain et les équipements modernes offrent un cadre de vie privilégié"
    ];

    description += features[Math.floor(Math.random() * features.length)] + ". ";

    // Price information
    if (prix) {
      description += `\n\nProposé à ${prix.toLocaleString()} DH, ce bien représente une opportunité unique sur le marché.`;
    } else {
      description += "\n\nPrix sur demande - Contactez-nous pour plus d'informations.";
    }

    // Closing call to action
    const closings = [
      "\n\nÀ découvrir rapidement !",
      "\n\nUne visite s'impose !",
      "\n\nN'attendez plus pour le visiter !",
      "\n\nContactez-nous dès maintenant !"
    ];

    description += closings[Math.floor(Math.random() * closings.length)];

    // Simulate realistic API processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    return description;
  },

  /**
   * Generate a refined description based on user feedback using available AI services
   * @param {string} prompt - The prompt containing the original description and user feedback
   * @returns {Promise<string>} - The refined description
   */
  generateRefinedDescription: async (prompt) => {
    // Try Groq first (free but requires API key)
    const groqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (groqKey) {
      try {
        return await LLMService.refineWithGroq(prompt);
      } catch (error) {
        console.error("Groq refinement failed:", error.message);
        throw new Error("AI service unavailable for refinement. Please check your Groq API key.");
      }
    }

    // Try OpenAI if available
    const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (openaiKey) {
      try {
        return await LLMService.refineWithOpenAI(prompt, openaiKey);
      } catch (error) {
        console.error("OpenAI refinement failed:", error.message);
        throw new Error("AI service unavailable for refinement. Please check your OpenAI API key.");
      }
    }

    // Try Hugging Face if available
    const hfKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
    if (hfKey) {
      try {
        return await LLMService.refineWithHuggingFace(prompt);
      } catch (error) {
        console.error("Hugging Face refinement failed:", error.message);
        throw new Error("AI service unavailable for refinement. Please check your Hugging Face API key.");
      }
    }

    // No AI service available
    throw new Error("No AI service configured for refinement. Please add NEXT_PUBLIC_GROQ_API_KEY, NEXT_PUBLIC_OPENAI_API_KEY, or NEXT_PUBLIC_HUGGINGFACE_API_KEY to your environment variables.");
  },

  /**
   * Refine description using OpenAI's API
   */
  refineWithOpenAI: async (prompt, key) => {
    console.log("Sending refinement request to OpenAI");

    const response = await aiAxios.post(
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

    if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
      console.error("Unexpected API response format:", response.data);
      throw new Error("Format de réponse API inattendu");
    }

    return response.data.choices[0].message.content.trim();
  },

  /**
   * Refine description using Groq's API
   */
  refineWithGroq: async (prompt) => {
    const groqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!groqKey) {
      throw new Error("Groq API key not found");
    }

    console.log("Sending refinement request to Groq");

    const response = await aiAxios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert immobilier professionnel qui écrit des descriptions attrayantes pour les biens immobiliers en français. Améliorez la description selon les instructions données."
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
          "Authorization": `Bearer ${groqKey}`
        }
      }
    );

    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      return response.data.choices[0].message.content.trim();
    }

    throw new Error("Aucune réponse générée par Groq pour le raffinement");
  },

  /**
   * Refine description using Hugging Face's API
   */
  refineWithHuggingFace: async (prompt) => {
    console.log("Sending refinement request to Hugging Face");

    const huggingFaceKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
    if (!huggingFaceKey) {
      throw new Error("Hugging Face API key not found");
    }

    const response = await aiAxios.post(
      "https://api-inference.huggingface.co/models/gpt2",
      {
        inputs: `Description immobilière améliorée: ${prompt.substring(0, 100)}...`,
        parameters: {
          max_length: 200,
          temperature: 0.7,
          do_sample: true,
          return_full_text: false,
          num_return_sequences: 1
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${huggingFaceKey}`
        },
        timeout: 30000
      }
    );

    if (response.data && response.data[0] && response.data[0].generated_text) {
      return response.data[0].generated_text.trim();
    }

    throw new Error("Aucune réponse générée par Hugging Face pour le raffinement");
  },

  /**
   * Refine description using free API
   */
  refineWithFreeAPI: async (prompt) => {
    console.log("Refining with Free API");

    // Extract original description and feedback from prompt
    const lines = prompt.split('\n');
    const originalDescLine = lines.find(line => line.includes('"') && line.length > 50) || '';
    const originalDesc = originalDescLine.replace(/"/g, '').trim();
    const feedbackLine = lines.find(line => line.includes('instructions suivantes:')) || '';
    const nextLineIndex = lines.indexOf(feedbackLine) + 1;
    const feedback = nextLineIndex < lines.length ? lines[nextLineIndex].replace(/"/g, '').trim() : '';

    // Apply intelligent refinements based on feedback
    let refinedDescription = originalDesc;
    const lowerFeedback = feedback.toLowerCase();

    // Add specific improvements based on feedback keywords
    if (lowerFeedback.includes('vue') || lowerFeedback.includes('panorama')) {
      refinedDescription += "\n\nLa vue exceptionnelle depuis ce bien constitue un véritable atout, offrant un panorama dégagé qui apporte luminosité naturelle et sérénité au quotidien.";
    }

    if (lowerFeedback.includes('luminosité') || lowerFeedback.includes('lumineux')) {
      refinedDescription = refinedDescription.replace(/lumineux/g, 'baigné de lumière naturelle');
      refinedDescription += "\n\nL'exposition optimale garantit une luminosité exceptionnelle tout au long de la journée.";
    }

    if (lowerFeedback.includes('superficie') || lowerFeedback.includes('espace')) {
      refinedDescription += "\n\nLes superficies généreuses et l'agencement intelligent des espaces créent une sensation de volume et de confort optimal.";
    }

    if (lowerFeedback.includes('localisation') || lowerFeedback.includes('quartier') || lowerFeedback.includes('proximité')) {
      refinedDescription += "\n\nIdéalement situé, ce bien bénéficie d'un emplacement privilégié à proximité des commodités, transports et services essentiels.";
    }

    if (lowerFeedback.includes('finition') || lowerFeedback.includes('qualité') || lowerFeedback.includes('matériaux')) {
      refinedDescription += "\n\nLes finitions soignées et les matériaux de qualité sélectionnés avec expertise témoignent du standing exceptionnel de cette propriété.";
    }

    if (lowerFeedback.includes('moderne') || lowerFeedback.includes('contemporain')) {
      refinedDescription = refinedDescription.replace(/moderne/g, 'au design contemporain et épuré');
      refinedDescription += "\n\nL'architecture moderne et les équipements dernière génération font de ce bien une référence en matière de confort contemporain.";
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    return refinedDescription;
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
