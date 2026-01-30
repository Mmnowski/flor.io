/**
 * PlantNet API Service
 *
 * Wrapper for plant identification using PlantNet API.
 * Supports both real API calls and mocked responses via feature flag.
 *
 * Environment variables:
 * - PLANTNET_API_KEY: API key for PlantNet (required if USE_REAL_PLANTNET_API=true)
 * - USE_REAL_PLANTNET_API: Feature flag to toggle between real and mocked responses
 */
import FormData from 'form-data';

export interface PlantIdentificationResult {
  scientificName: string;
  commonNames: string[];
  confidence: number;
}

// PlantNet API response types
interface PlantNetSpecies {
  scientificName: string;
  genus: { scientificName: string };
  family: { scientificName: string };
  commonNames: string[];
}

interface PlantNetResult {
  score: number;
  species: PlantNetSpecies;
}

interface PlantNetAPIResponse {
  results: PlantNetResult[];
  bestMatch: string;
  remainingIdentificationRequests: number;
}

// Mock plant database matching PlantNet API response format
const mockPlantDatabase: Record<string, PlantNetResult> = {
  monstera: {
    score: 0.92,
    species: {
      scientificName: 'Monstera deliciosa Liebm.',
      genus: { scientificName: 'Monstera' },
      family: { scientificName: 'Araceae' },
      commonNames: ['Monstera', 'Swiss Cheese Plant', 'Splitting Philodendron'],
    },
  },
  pothos: {
    score: 0.88,
    species: {
      scientificName: 'Epipremnum aureum (Linden & André) G.S.Bunting',
      genus: { scientificName: 'Epipremnum' },
      family: { scientificName: 'Araceae' },
      commonNames: ['Pothos', "Devil's Ivy", 'Golden Pothos'],
    },
  },
  snake_plant: {
    score: 0.95,
    species: {
      scientificName: 'Dracaena trifasciata (Prain) Mabb.',
      genus: { scientificName: 'Dracaena' },
      family: { scientificName: 'Asparagaceae' },
      commonNames: ['Snake Plant', "Mother-in-law's Tongue", "Viper's Bowstring Hemp"],
    },
  },
  spider_plant: {
    score: 0.89,
    species: {
      scientificName: 'Chlorophytum comosum (Thunb.) Jacques',
      genus: { scientificName: 'Chlorophytum' },
      family: { scientificName: 'Asparagaceae' },
      commonNames: ['Spider Plant', 'Ribbon Plant', 'Airplane Plant'],
    },
  },
  philodendron: {
    score: 0.87,
    species: {
      scientificName: 'Philodendron hederaceum Schott',
      genus: { scientificName: 'Philodendron' },
      family: { scientificName: 'Araceae' },
      commonNames: ['Heartleaf Philodendron', 'Philodendron', 'Sweetheart Plant'],
    },
  },
  rubber_plant: {
    score: 0.91,
    species: {
      scientificName: 'Ficus elastica Roxb. ex Hornem.',
      genus: { scientificName: 'Ficus' },
      family: { scientificName: 'Moraceae' },
      commonNames: ['Rubber Plant', 'Rubber Fig', 'Rubber Tree'],
    },
  },
  peace_lily: {
    score: 0.86,
    species: {
      scientificName: 'Spathiphyllum wallisii Rég.',
      genus: { scientificName: 'Spathiphyllum' },
      family: { scientificName: 'Araceae' },
      commonNames: ['Peace Lily', 'Spath', 'White Flag Plant'],
    },
  },
  fiddle_leaf_fig: {
    score: 0.93,
    species: {
      scientificName: 'Ficus lyrata Warb.',
      genus: { scientificName: 'Ficus' },
      family: { scientificName: 'Moraceae' },
      commonNames: ['Fiddle Leaf Fig', 'Fiddle Fig', 'Lyre Leaf Fig'],
    },
  },
  zz_plant: {
    score: 0.9,
    species: {
      scientificName: 'Zamioculcas zamiifolia (Lodd.) Engl.',
      genus: { scientificName: 'Zamioculcas' },
      family: { scientificName: 'Araceae' },
      commonNames: ['ZZ Plant', 'Zamioculcas', 'Lucky Plant'],
    },
  },
  pilea: {
    score: 0.84,
    species: {
      scientificName: 'Pilea peperomioides Diels',
      genus: { scientificName: 'Pilea' },
      family: { scientificName: 'Urticaceae' },
      commonNames: ['Chinese Money Plant', 'Pilea', 'Pancake Plant'],
    },
  },
  calathea: {
    score: 0.82,
    species: {
      scientificName: 'Calathea orbifolia (Linden) H.Kennedy',
      genus: { scientificName: 'Calathea' },
      family: { scientificName: 'Marantaceae' },
      commonNames: ['Calathea', 'Prayer Plant', 'Zebra Plant'],
    },
  },
  palm: {
    score: 0.85,
    species: {
      scientificName: 'Dypsis lutescens (H.Wendl.) Beentje & J.Dransf.',
      genus: { scientificName: 'Dypsis' },
      family: { scientificName: 'Arecaceae' },
      commonNames: ['Areca Palm', 'Golden Cane Palm', 'Butterfly Palm'],
    },
  },
  succulent: {
    score: 0.79,
    species: {
      scientificName: 'Echeveria pulvinata Rose',
      genus: { scientificName: 'Echeveria' },
      family: { scientificName: 'Crassulaceae' },
      commonNames: ['Echeveria', 'Succulent', 'Flapjack'],
    },
  },
  orchid: {
    score: 0.88,
    species: {
      scientificName: 'Phalaenopsis amabilis (L.) Blume',
      genus: { scientificName: 'Phalaenopsis' },
      family: { scientificName: 'Orchidaceae' },
      commonNames: ['Moth Orchid', 'Phalaenopsis', 'Orchid'],
    },
  },
  fern: {
    score: 0.81,
    species: {
      scientificName: 'Nephrolepis exaltata (L.) Schott',
      genus: { scientificName: 'Nephrolepis' },
      family: { scientificName: 'Nephrolepidaceae' },
      commonNames: ['Boston Fern', 'Sword Fern', 'Fern'],
    },
  },
  dracaena: {
    score: 0.86,
    species: {
      scientificName: 'Dracaena fragrans (Lindl.) Goepp. ex Engl.',
      genus: { scientificName: 'Dracaena' },
      family: { scientificName: 'Asparagaceae' },
      commonNames: ['Corn Plant', 'Dracaena', 'Dragon Tree'],
    },
  },
  aloe: {
    score: 0.94,
    species: {
      scientificName: 'Aloe barbadensis Mill.',
      genus: { scientificName: 'Aloe' },
      family: { scientificName: 'Xanthorrhoeaceae' },
      commonNames: ['Aloe Vera', 'Aloe', 'Medicinal Aloe'],
    },
  },
  bamboo_palm: {
    score: 0.83,
    species: {
      scientificName: 'Chamaedorea seifrizii Burret',
      genus: { scientificName: 'Chamaedorea' },
      family: { scientificName: 'Arecaceae' },
      commonNames: ['Bamboo Palm', 'Reed Palm', 'Parlor Palm'],
    },
  },
  anthurium: {
    score: 0.89,
    species: {
      scientificName: 'Anthurium andraeanum Linden ex André',
      genus: { scientificName: 'Anthurium' },
      family: { scientificName: 'Araceae' },
      commonNames: ['Anthurium', 'Flamingo Flower', 'Laceleaf'],
    },
  },
  bonsai: {
    score: 0.87,
    species: {
      scientificName: 'Ficus retusa L.',
      genus: { scientificName: 'Ficus' },
      family: { scientificName: 'Moraceae' },
      commonNames: ['Ficus Bonsai', 'Bonsai', 'Dwarf Fig'],
    },
  },
};

/**
 * Identify a plant from an image URL using PlantNet API.
 * Supports both real API calls and mocked responses via USE_REAL_PLANTNET_API flag.
 *
 * @param imageUrl - URL to the plant image (stored in Supabase)
 * @returns Plant identification result with name and confidence
 * @throws Error if PlantNet API fails or image is invalid
 *
 * @example
 * const result = await identifyPlant('https://...');
 * // Returns: { scientificName: "Monstera deliciosa Liebm.", commonNames: [...], confidence: 0.92 }
 */
export async function identifyPlant(imageBuffer: Buffer): Promise<PlantIdentificationResult> {
  const useRealApi = process.env.USE_REAL_PLANTNET_API === 'true';

  if (useRealApi) {
    return identifyPlantWithApi(imageBuffer);
  }

  return identifyPlantMocked(imageBuffer);
}

/**
 * Create multipart form data buffer and headers for PlantNet API request
 */
function createPlantNetRequest(imageBuffer: Buffer): {
  buffer: Buffer;
  headers: Record<string, string>;
} {
  const form = new FormData();
  form.append('images', imageBuffer, { filename: 'plant.jpg' });
  form.append('organs', 'leaf,flower,fruit,bark');
  form.append('lang', 'en');
  form.append('include-related-images', 'false');

  const buffer = form.getBuffer();
  const headers = {
    ...form.getHeaders(),
    'Content-Length': buffer.length.toString(),
  };

  return { buffer, headers };
}

/**
 * Call the real PlantNet API to identify a plant.
 * Requires PLANTNET_API_KEY environment variable.
 */
async function identifyPlantWithApi(imageBuffer: Buffer): Promise<PlantIdentificationResult> {
  const apiKey = process.env.PLANTNET_API_KEY;

  if (!apiKey) {
    throw new Error(
      'PLANTNET_API_KEY environment variable is not set. Set USE_REAL_PLANTNET_API=false to use mocked data.'
    );
  }

  // Create multipart form data
  const { buffer, headers } = createPlantNetRequest(imageBuffer);

  // Call PlantNet API with proper endpoint format
  const response = await fetch(
    `https://my-api.plantnet.org/v2/identify/all?api-key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: buffer as any,
      headers,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PlantNet API error: ${response.statusText} - ${errorText}`);
  }

  const data: PlantNetAPIResponse = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error('No plant identification results from PlantNet API');
  }

  // Use the best match (top result)
  const topResult = data.results[0];
  return {
    scientificName: topResult.species.scientificName,
    commonNames: topResult.species.commonNames || [],
    confidence: Math.round(topResult.score * 100) / 100,
  };
}

/**
 * Get plant identification using mocked data.
 * Adds a 2-second delay to simulate API latency.
 */
async function identifyPlantMocked(_imageBuffer: Buffer): Promise<PlantIdentificationResult> {
  // Simulate API call delay (2 seconds)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Select a random plant from database
  const plantKeys = Object.keys(mockPlantDatabase);
  const randomKey = plantKeys[Math.floor(Math.random() * plantKeys.length)];
  const result = mockPlantDatabase[randomKey];

  // Add slight variance to confidence (0.8-1.0 range, realistic spread)
  const varianceMultiplier = 0.95 + Math.random() * 0.08;
  const confidence = Math.min(1, Math.max(0.8, result.score * varianceMultiplier));

  return {
    scientificName: result.species.scientificName,
    commonNames: result.species.commonNames || [],
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

  const varianceMultiplier = 0.95 + Math.random() * 0.08;
  const confidence = Math.min(1, Math.max(0.8, result.score * varianceMultiplier));

  return {
    scientificName: result.species.scientificName,
    commonNames: result.species.commonNames || [],
    confidence: Math.round(confidence * 100) / 100,
  };
}
