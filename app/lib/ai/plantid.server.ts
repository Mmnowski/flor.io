/**
 * Plant Identification API Service
 *
 * Wrapper for plant identification using plant.id API.
 * Supports both real API calls and mocked responses via feature flag.
 *
 * Environment variables:
 * - PLANT_ID_API_KEY: API key for plant.id (required if USE_REAL_PLANT_ID_API=true)
 * - USE_REAL_PLANT_ID_API: Feature flag to toggle between real and mocked responses
 */

export interface PlantIdentificationResult {
  scientificName: string;
  commonNames: string[];
  confidence: number;
}

// plant.id API response types
interface PlantIdResult {
  id: number;
  probability: number;
  confirmed: boolean;
  name: string;
  images: {
    value: string;
  }[];
}

interface PlantIdSuggestion {
  id: number;
  similar_images: string[];
  plant_name: string;
  probability?: number; // Confidence score 0-1 (optional for mock data)
  plant_details: {
    description?: string;
    common_names?: string[];
  };
}

interface PlantIdAPIResponse {
  access_token: string;
  model_version: string;
  custom_id: string;
  suggestions: PlantIdSuggestion[];
}

// Mock plant database matching plant.id API response format
const mockPlantDatabase: Record<string, PlantIdSuggestion> = {
  monstera: {
    id: 1,
    similar_images: [],
    plant_name: 'Monstera deliciosa',
    plant_details: {
      description: 'Monstera deliciosa Liebm.',
      common_names: ['Monstera', 'Swiss Cheese Plant', 'Splitting Philodendron'],
    },
  },
  pothos: {
    id: 2,
    similar_images: [],
    plant_name: 'Epipremnum aureum',
    plant_details: {
      description: 'Epipremnum aureum (Linden & André) G.S.Bunting',
      common_names: ['Pothos', "Devil's Ivy", 'Golden Pothos'],
    },
  },
  snake_plant: {
    id: 3,
    similar_images: [],
    plant_name: 'Dracaena trifasciata',
    plant_details: {
      description: 'Dracaena trifasciata (Prain) Mabb.',
      common_names: ['Snake Plant', "Mother-in-law's Tongue", "Viper's Bowstring Hemp"],
    },
  },
  spider_plant: {
    id: 4,
    similar_images: [],
    plant_name: 'Chlorophytum comosum',
    plant_details: {
      description: 'Chlorophytum comosum (Thunb.) Jacques',
      common_names: ['Spider Plant', 'Ribbon Plant', 'Airplane Plant'],
    },
  },
  philodendron: {
    id: 5,
    similar_images: [],
    plant_name: 'Philodendron hederaceum',
    plant_details: {
      description: 'Philodendron hederaceum Schott',
      common_names: ['Heartleaf Philodendron', 'Philodendron', 'Sweetheart Plant'],
    },
  },
  rubber_plant: {
    id: 6,
    similar_images: [],
    plant_name: 'Ficus elastica',
    plant_details: {
      description: 'Ficus elastica Roxb. ex Hornem.',
      common_names: ['Rubber Plant', 'Rubber Fig', 'Rubber Tree'],
    },
  },
  peace_lily: {
    id: 7,
    similar_images: [],
    plant_name: 'Spathiphyllum wallisii',
    plant_details: {
      description: 'Spathiphyllum wallisii Rég.',
      common_names: ['Peace Lily', 'Spath', 'White Flag Plant'],
    },
  },
  fiddle_leaf_fig: {
    id: 8,
    similar_images: [],
    plant_name: 'Ficus lyrata',
    plant_details: {
      description: 'Ficus lyrata Warb.',
      common_names: ['Fiddle Leaf Fig', 'Fiddle Fig', 'Lyre Leaf Fig'],
    },
  },
  zz_plant: {
    id: 9,
    similar_images: [],
    plant_name: 'Zamioculcas zamiifolia',
    plant_details: {
      description: 'Zamioculcas zamiifolia (Lodd.) Engl.',
      common_names: ['ZZ Plant', 'Zamioculcas', 'Lucky Plant'],
    },
  },
  pilea: {
    id: 10,
    similar_images: [],
    plant_name: 'Pilea peperomioides',
    plant_details: {
      description: 'Pilea peperomioides Diels',
      common_names: ['Chinese Money Plant', 'Pilea', 'Pancake Plant'],
    },
  },
  calathea: {
    id: 11,
    similar_images: [],
    plant_name: 'Calathea orbifolia',
    plant_details: {
      description: 'Calathea orbifolia (Linden) H.Kennedy',
      common_names: ['Calathea', 'Prayer Plant', 'Zebra Plant'],
    },
  },
  palm: {
    id: 12,
    similar_images: [],
    plant_name: 'Dypsis lutescens',
    plant_details: {
      description: 'Dypsis lutescens (H.Wendl.) Beentje & J.Dransf.',
      common_names: ['Areca Palm', 'Golden Cane Palm', 'Butterfly Palm'],
    },
  },
  succulent: {
    id: 13,
    similar_images: [],
    plant_name: 'Echeveria pulvinata',
    plant_details: {
      description: 'Echeveria pulvinata Rose',
      common_names: ['Echeveria', 'Succulent', 'Flapjack'],
    },
  },
  orchid: {
    id: 14,
    similar_images: [],
    plant_name: 'Phalaenopsis amabilis',
    plant_details: {
      description: 'Phalaenopsis amabilis (L.) Blume',
      common_names: ['Moth Orchid', 'Phalaenopsis', 'Orchid'],
    },
  },
  fern: {
    id: 15,
    similar_images: [],
    plant_name: 'Nephrolepis exaltata',
    plant_details: {
      description: 'Nephrolepis exaltata (L.) Schott',
      common_names: ['Boston Fern', 'Sword Fern', 'Fern'],
    },
  },
  dracaena: {
    id: 16,
    similar_images: [],
    plant_name: 'Dracaena fragrans',
    plant_details: {
      description: 'Dracaena fragrans (Lindl.) Goepp. ex Engl.',
      common_names: ['Corn Plant', 'Dracaena', 'Dragon Tree'],
    },
  },
  aloe: {
    id: 17,
    similar_images: [],
    plant_name: 'Aloe barbadensis',
    plant_details: {
      description: 'Aloe barbadensis Mill.',
      common_names: ['Aloe Vera', 'Aloe', 'Medicinal Aloe'],
    },
  },
  bamboo_palm: {
    id: 18,
    similar_images: [],
    plant_name: 'Chamaedorea seifrizii',
    plant_details: {
      description: 'Chamaedorea seifrizii Burret',
      common_names: ['Bamboo Palm', 'Reed Palm', 'Parlor Palm'],
    },
  },
  anthurium: {
    id: 19,
    similar_images: [],
    plant_name: 'Anthurium andraeanum',
    plant_details: {
      description: 'Anthurium andraeanum Linden ex André',
      common_names: ['Anthurium', 'Flamingo Flower', 'Laceleaf'],
    },
  },
  bonsai: {
    id: 20,
    similar_images: [],
    plant_name: 'Ficus retusa',
    plant_details: {
      description: 'Ficus retusa L.',
      common_names: ['Ficus Bonsai', 'Bonsai', 'Dwarf Fig'],
    },
  },
};

/**
 * Identify a plant from an image buffer using plant.id API.
 * Supports both real API calls and mocked responses via USE_REAL_PLANT_ID_API flag.
 *
 * @param imageBuffer - Buffer containing plant image data
 * @returns Plant identification result with name and confidence
 * @throws Error if plant.id API fails or image is invalid
 *
 * @example
 * const result = await identifyPlant(imageBuffer);
 * // Returns: { scientificName: "Monstera deliciosa Liebm.", commonNames: [...], confidence: 0.92 }
 */
export async function identifyPlant(imageBuffer: Buffer): Promise<PlantIdentificationResult> {
  const useRealApi = process.env.USE_REAL_PLANT_ID_API === 'true';

  if (useRealApi) {
    return identifyPlantWithApi(imageBuffer);
  }

  return identifyPlantMocked(imageBuffer);
}

/**
 * Create JSON request body for plant.id API.
 * Converts image buffer to base64 and structures request according to API spec.
 */
function createPlantIdRequest(imageBuffer: Buffer): string {
  const base64Image = imageBuffer.toString('base64');
  const requestBody = {
    images: [base64Image],
    modifiers: ['similar_images'],
    plant_details: ['common_names', 'url', 'wiki_description'],
  };
  return JSON.stringify(requestBody);
}

/**
 * Call the real plant.id API to identify a plant.
 * Requires PLANT_ID_API_KEY environment variable.
 */
async function identifyPlantWithApi(imageBuffer: Buffer): Promise<PlantIdentificationResult> {
  const apiKey = process.env.PLANT_ID_API_KEY;

  if (!apiKey) {
    throw new Error(
      'PLANT_ID_API_KEY environment variable is not set. Set USE_REAL_PLANT_ID_API=false to use mocked data.'
    );
  }

  // Create JSON request body with base64 encoded image
  const jsonBody = createPlantIdRequest(imageBuffer);

  // Call plant.id API "create identification" endpoint
  const response = await fetch('https://api.plant.id/v2/identify', {
    method: 'POST',
    body: jsonBody,
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`plant.id API error: ${response.statusText} - ${errorText}`);
  }

  const data: PlantIdAPIResponse = await response.json();

  if (!data.suggestions || data.suggestions.length === 0) {
    throw new Error('No plant identification results from plant.id API');
  }

  // Use the best match (top result)
  const topResult = data.suggestions[0];
  return {
    scientificName: topResult.plant_details?.description || topResult.plant_name,
    commonNames: topResult.plant_details?.common_names || [],
    confidence: Math.round((topResult.probability || 0.5) * 100) / 100, // Use actual probability (0-1)
  };
}

/**
 * Get plant identification using mocked data.
 * Adds a 2-second delay to simulate plant.id API latency.
 */
async function identifyPlantMocked(_imageBuffer: Buffer): Promise<PlantIdentificationResult> {
  // Simulate API call delay (2 seconds)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Select a random plant from database
  const plantKeys = Object.keys(mockPlantDatabase);
  const randomKey = plantKeys[Math.floor(Math.random() * plantKeys.length)];
  const result = mockPlantDatabase[randomKey];

  // Generate realistic confidence score (0.85-1.0 range)
  const confidence = 0.85 + Math.random() * 0.15;

  return {
    scientificName: result.plant_details?.description || result.plant_name,
    commonNames: result.plant_details?.common_names || [],
    confidence: Math.round(confidence * 100) / 100,
  };
}

/**
 * Get plant identification without delay (instant mock).
 * Useful for testing step 2-3 transitions in development.
 *
 * @internal For testing only
 */
export async function identifyPlantInstant(
  _imageBuffer: Buffer
): Promise<PlantIdentificationResult> {
  // Same as mocked but without delay
  const plantKeys = Object.keys(mockPlantDatabase);
  const randomKey = plantKeys[Math.floor(Math.random() * plantKeys.length)];
  const result = mockPlantDatabase[randomKey];

  // Generate realistic confidence score (0.85-1.0 range)
  const confidence = 0.85 + Math.random() * 0.15;

  return {
    scientificName: result.plant_details?.description || result.plant_name,
    commonNames: result.plant_details?.common_names || [],
    confidence: Math.round(confidence * 100) / 100,
  };
}
