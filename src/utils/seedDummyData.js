import axios from 'axios';
import { APIURL } from '../configs/api';
import { addMonths, format } from 'date-fns';

/**
 * Seed dummy projects for testing purposes
 * @param {Object} societe - The société to associate projects with
 * @returns {Promise<Array>} - Array of created projects
 */
export async function seedDummyProjects(societe) {
  if (!societe || !societe.id) {
    console.error('No société provided for seeding projects');
    return [];
  }

  const token = localStorage.getItem('accessToken');
  const createdProjects = [];

  // Get project types first
  let projectTypes = [];
  try {
    console.log("Fetching existing project types...");
    const response = await axios.get(APIURL.TYPEPROJETS, {
      headers: { Authorization: `Bearer ${token}` }
    });
    projectTypes = response.data.typesprojets || [];
    console.log(`Found ${projectTypes.length} existing project types`);
    
    // If we need to add missing types, do it one by one
    if (projectTypes.length < 4) {
      const defaultTypes = ['Résidentiel', 'Commercial', 'Industriel', 'Mixte'];
      const existingTypeNames = projectTypes.map(t => t.type.toLowerCase());
      
      for (const typeName of defaultTypes) {
        // Only create types that don't already exist (case-insensitive check)
        if (!existingTypeNames.includes(typeName.toLowerCase())) {
          try {
            console.log(`Creating missing project type: ${typeName}`);
            const typeResponse = await axios.post(APIURL.TYPEPROJETS, 
              { type: typeName },
              { headers: { 
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            projectTypes.push(typeResponse.data.typeprojet);
            console.log(`Successfully created project type: ${typeName}`);
          } catch (error) {
            console.warn(`Couldn't create project type ${typeName}:`, 
              error.response?.data?.message || error.message);
            // Continue with other types even if one fails
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching project types:', error);
    return [];
  }

  if (projectTypes.length === 0) {
    console.error('No project types available for seeding projects');
    return [];
  }

  // Get users to associate with projects
  let users = [];
  try {
    const response = await axios.get(APIURL.UTILISATEURS, {
      headers: { Authorization: `Bearer ${token}` }
    });
    users = response.data.users || [];
  } catch (error) {
    console.error('Error fetching users:', error);
  }

  // If no users are found, can't proceed
  if (users.length === 0) {
    console.error('No users available for seeding projects');
    return [];
  }

  // Define dummy projects
  const dummyProjects = [
    {
      nom: "Résidence Les Jardins",
      code: "RJ-2023",
      adresse: "123 Avenue des Fleurs",
      type_id: findMatchingTypeId(projectTypes, "Résidentiel"),
      nbre_tranches: 3,
      nbre_blocs: 6,
      nbre_immeubles: 12,
      max_etages: 5,
      surface_terrain: 10000,
      prix_acquisition: 5000000,
      limite_annulation_reservation: 30,
      biens: [
        { value: "Appartement" },
        { value: "Studio" },
        { value: "Duplex" }
      ],
      vues: [
        { value: "Vue Mer" },
        { value: "Vue Jardin" },
        { value: "Vue Ville" }
      ],
      typologies: [
        { value: "T1" },
        { value: "T2" },
        { value: "T3" },
        { value: "T4" }
      ]
    },
    {
      nom: "Parc Business Center",
      code: "PBC-2023",
      adresse: "456 Boulevard Commercial",
      type_id: findMatchingTypeId(projectTypes, "Commercial"),
      nbre_tranches: 1,
      nbre_blocs: 4,
      nbre_immeubles: 4,
      max_etages: 10,
      surface_terrain: 8000,
      prix_acquisition: 12000000,
      limite_annulation_reservation: 45,
      biens: [
        { value: "Bureau" },
        { value: "Magasin" },
        { value: "Entrepôt" }
      ],
      vues: [
        { value: "Vue Panoramique" },
        { value: "Vue Parc" }
      ],
      typologies: [
        { value: "Small" },
        { value: "Medium" },
        { value: "Large" }
      ]
    },
    {
      nom: "Les Villas du Paradis",
      code: "VP-2023",
      adresse: "789 Route du Soleil",
      type_id: findMatchingTypeId(projectTypes, "Résidentiel"),
      nbre_tranches: 0,
      nbre_blocs: 0,
      nbre_immeubles: 0,
      max_etages: 2,
      surface_terrain: 20000,
      prix_acquisition: 8000000,
      limite_annulation_reservation: 30,
      biens: [
        { value: "Villa" },
        { value: "Maison" }
      ],
      vues: [
        { value: "Vue Piscine" },
        { value: "Vue Golf" },
        { value: "Vue Montagne" }
      ],
      typologies: [
        { value: "S" },
        { value: "M" },
        { value: "L" },
        { value: "XL" }
      ]
    },
    {
      nom: "Zone Industrielle Moderne",
      code: "ZIM-2023",
      adresse: "101 Avenue Industrielle",
      type_id: findMatchingTypeId(projectTypes, "Industriel"),
      nbre_tranches: 2,
      nbre_blocs: 8,
      nbre_immeubles: 0,
      max_etages: 3,
      surface_terrain: 50000,
      prix_acquisition: 15000000,
      limite_annulation_reservation: 60,
      biens: [
        { value: "Hangar" },
        { value: "Usine" },
        { value: "Atelier" }
      ]
    }
  ];

  // Create each dummy project
  for (const project of dummyProjects) {
    try {
      const today = new Date();
      const requestData = {
        ...project,
        date_autorisation_construction: format(today, 'yyyy-MM-dd'),
        date_permis_habiter: format(addMonths(today, 6), 'yyyy-MM-dd'),
        titre_foncier: `TF-${Math.floor(10000 + Math.random() * 90000)}`,
        societe_id: societe.id,
        selectedUsers: users.slice(0, 2).map(user => user.id), // First 2 users
        donneesTypeBien: (project.biens || []).map(x => x.value),
        donneesVue: (project.vues || []).map(x => x.value),
        donneesTypologie: (project.typologies || []).map(x => x.value),
        partenaires: project.partenaires || [],
        nbre_biens: (project.biens || []).length,
        prolongation_reservation: 15
      };

      console.log(`Creating project: ${project.nom}`);
      const response = await axios.post(APIURL.PROJETS, requestData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      createdProjects.push(response.data.projet);
      console.log(`Successfully created project: ${project.nom}`);
    } catch (error) {
      console.error(`Error creating project ${project.nom}:`, 
        error.response?.data?.message || error.message);
    }
  }

  return createdProjects;
}

/**
 * Helper function to find a matching type ID from available types
 * Uses case-insensitive matching and fallback to the first available type
 */
function findMatchingTypeId(types, typeName) {
  // Try to find exact match first (case insensitive)
  const matchingType = types.find(t => t.type.toLowerCase() === typeName.toLowerCase());
  
  // If found, use its ID
  if (matchingType) {
    return matchingType.id;
  }
  
  // If no match, use the first available type ID
  if (types.length > 0) {
    console.warn(`No matching type found for "${typeName}", using "${types[0].type}" instead`);
    return types[0].id;
  }
  
  // Last resort - shouldn't happen if we validated earlier
  console.error(`No project types available at all`);
  return null;
}

/**
 * Button component to trigger seeding of dummy data
 */
export function SeedDummyDataButton({ societe, onComplete }) {
  const handleClick = async () => {
    // Confirm before proceeding
    if (!confirm(`Êtes-vous sûr de vouloir créer des projets de test pour la société ${societe.nom || societe.raison_sociale}?`)) {
      return;
    }
    
    try {
      const projects = await seedDummyProjects(societe);
      if (projects.length > 0) {
        alert(`${projects.length} projets de test ont été créés avec succès!`);
        if (onComplete) onComplete(projects);
      } else {
        alert('Aucun projet n\'a été créé. Veuillez vérifier la console pour plus d\'informations.');
      }
    } catch (error) {
      console.error('Error seeding dummy data:', error);
      alert('Une erreur est survenue lors de la création des projets de test: ' + 
        (error.response?.data?.message || error.message));
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
    >
      Créer des projets de test
    </button>
  );
}
