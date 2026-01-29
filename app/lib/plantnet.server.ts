/**
 * PlantNet API Service (Mocked)
 *
 * Wrapper for plant identification using PlantNet API.
 * Currently returns mock data to simulate the service.
 *
 * To integrate real PlantNet API:
 * 1. Add PLANTNET_API_KEY to environment variables
 * 2. Replace mock implementation with actual HTTP request
 * 3. Add rate limiting and error handling
 */

interface PlantIdentificationResult {
  scientificName: string;
  commonNames: string[];
  confidence: number;
}

// Mock plant database for consistent, realistic responses
const mockPlantDatabase: Record<string, PlantIdentificationResult> = {
  monstera: {
    scientificName: "Monstera deliciosa",
    commonNames: ["Monstera", "Swiss Cheese Plant", "Splitting Philodendron"],
    confidence: 0.92,
  },
  pothos: {
    scientificName: "Epipremnum aureum",
    commonNames: ["Pothos", "Devil's Ivy", "Golden Pothos"],
    confidence: 0.88,
  },
  snake_plant: {
    scientificName: "Sansevieria trifasciata",
    commonNames: ["Snake Plant", "Mother-in-law's Tongue", "Viper's Bowstring Hemp"],
    confidence: 0.95,
  },
  spider_plant: {
    scientificName: "Chlorophytum comosum",
    commonNames: ["Spider Plant", "Ribbon Plant", "Airplane Plant"],
    confidence: 0.89,
  },
  philodendron: {
    scientificName: "Philodendron hederaceum",
    commonNames: ["Heartleaf Philodendron", "Philodendron", "Sweetheart Plant"],
    confidence: 0.87,
  },
  rubber_plant: {
    scientificName: "Ficus elastica",
    commonNames: ["Rubber Plant", "Rubber Fig", "Rubber Tree"],
    confidence: 0.91,
  },
  peace_lily: {
    scientificName: "Spathiphyllum wallisii",
    commonNames: ["Peace Lily", "Spath", "White Flag Plant"],
    confidence: 0.86,
  },
  fiddle_leaf_fig: {
    scientificName: "Ficus lyrata",
    commonNames: ["Fiddle Leaf Fig", "Fiddle Fig", "Lyre Leaf Fig"],
    confidence: 0.93,
  },
  zz_plant: {
    scientificName: "Zamioculcas zamiifolia",
    commonNames: ["ZZ Plant", "Zamioculcas", "Lucky Plant"],
    confidence: 0.90,
  },
  pilea: {
    scientificName: "Pilea peperomioides",
    commonNames: ["Chinese Money Plant", "Pilea", "Pancake Plant"],
    confidence: 0.84,
  },
  calathea: {
    scientificName: "Calathea orbifolia",
    commonNames: ["Calathea", "Prayer Plant", "Zebra Plant"],
    confidence: 0.82,
  },
  palm: {
    scientificName: "Areca lutescens",
    commonNames: ["Areca Palm", "Golden Cane Palm", "Butterfly Palm"],
    confidence: 0.85,
  },
  succulent: {
    scientificName: "Echeveria pulvinata",
    commonNames: ["Echeveria", "Succulent", "Flapjack"],
    confidence: 0.79,
  },
  orchid: {
    scientificName: "Phalaenopsis amabilis",
    commonNames: ["Moth Orchid", "Phalaenopsis", "Orchid"],
    confidence: 0.88,
  },
  fern: {
    scientificName: "Nephrolepis exaltata",
    commonNames: ["Boston Fern", "Sword Fern", "Fern"],
    confidence: 0.81,
  },
  dracaena: {
    scientificName: "Dracaena fragrans",
    commonNames: ["Corn Plant", "Dracaena", "Dragon Tree"],
    confidence: 0.86,
  },
  aloe: {
    scientificName: "Aloe barbadensis",
    commonNames: ["Aloe Vera", "Aloe", "Medicinal Aloe"],
    confidence: 0.94,
  },
  bamboo_palm: {
    scientificName: "Chamaedorea seifrizii",
    commonNames: ["Bamboo Palm", "Reed Palm", "Parlor Palm"],
    confidence: 0.83,
  },
  anthurium: {
    scientificName: "Anthurium andraeanum",
    commonNames: ["Anthurium", "Flamingo Flower", "Laceleaf"],
    confidence: 0.89,
  },
  bonsai: {
    scientificName: "Ficus retusa",
    commonNames: ["Ficus Bonsai", "Bonsai", "Dwarf Fig"],
    confidence: 0.87,
  },
};

/**
 * Identify a plant from an image URL using PlantNet API (mocked).
 *
 * @param imageUrl - URL to the plant image (stored in Supabase)
 * @returns Plant identification result with name and confidence
 *
 * @example
 * const result = await identifyPlant('https://...');
 * // Returns: { scientificName: "Monstera deliciosa", commonNames: [...], confidence: 0.92 }
 */
export async function identifyPlant(
  imageUrl: string
): Promise<PlantIdentificationResult> {
  // Simulate API call delay (2 seconds)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // In production, this would make an actual API call to PlantNet:
  // const response = await fetch('https://api.plantnet.org/v2/identify', {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     images: [imageUrl],
  //     organs: ['leaf', 'flower', 'fruit'],
  //     apiKey: process.env.PLANTNET_API_KEY,
  //   }),
  // });

  // Mock: Select a random plant from database
  // In real scenario, we'd parse imageUrl or use other heuristics
  const plantKeys = Object.keys(mockPlantDatabase);
  const randomKey = plantKeys[Math.floor(Math.random() * plantKeys.length)];
  const result = mockPlantDatabase[randomKey];

  // Add slight variance to confidence (0.5-1 range, realistic spread)
  const varianceMultiplier = 0.95 + Math.random() * 0.08;
  const confidence = Math.min(
    1,
    Math.max(0.5, result.confidence * varianceMultiplier)
  );

  return {
    scientificName: result.scientificName,
    commonNames: result.commonNames,
    confidence: Math.round(confidence * 100) / 100,
  };
}

/**
 * Get mock plant identification without the delay.
 * Useful for testing step 2-3 transitions.
 *
 * @internal For testing only
 */
export async function identifyPlantInstant(
  imageUrl: string
): Promise<PlantIdentificationResult> {
  // Same as above but without delay
  const plantKeys = Object.keys(mockPlantDatabase);
  const randomKey = plantKeys[Math.floor(Math.random() * plantKeys.length)];
  const result = mockPlantDatabase[randomKey];

  const varianceMultiplier = 0.95 + Math.random() * 0.08;
  const confidence = Math.min(
    1,
    Math.max(0.5, result.confidence * varianceMultiplier)
  );

  return {
    scientificName: result.scientificName,
    commonNames: result.commonNames,
    confidence: Math.round(confidence * 100) / 100,
  };
}
