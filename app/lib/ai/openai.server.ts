/**
 * OpenAI API Service
 *
 * Wrapper for AI-powered care instruction generation.
 * Supports both real API calls and mocked responses via feature flag.
 *
 * Environment variables:
 * - OPENAI_API_KEY: API key for OpenAI (required if USE_REAL_OPENAI_API=true)
 * - USE_REAL_OPENAI_API: Feature flag to toggle between real and mocked responses
 */

export interface CareInstructions {
  wateringFrequencyDays: number;
  wateringAmount: 'low' | 'mid' | 'heavy';
  lightRequirements: string;
  fertilizingTips: string[];
  pruningTips: string[];
  troubleshooting: string[];
}

// Mock care database for realistic, plant-specific responses
const mockCareDatabase: Record<string, CareInstructions> = {
  'Monstera deliciosa': {
    wateringFrequencyDays: 7,
    wateringAmount: 'mid',
    lightRequirements:
      'Bright indirect light, 6-8 hours daily. Avoid direct sun which can scorch leaves.',
    fertilizingTips: [
      'Fertilize every 4-6 weeks during growing season (spring/summer)',
      'Use balanced liquid fertilizer (10-10-10 NPK) diluted to half strength',
      'Reduce fertilizing in fall and winter months',
      'Apply fertilizer to moist soil to prevent root burn',
    ],
    pruningTips: [
      'Prune yellow or damaged leaves at the base of the petiole',
      'Trim aerial roots if they become unruly',
      'Best time to prune is in spring or early summer',
      'Use clean, sharp scissors to prevent tearing',
    ],
    troubleshooting: [
      'Yellow leaves: Usually caused by overwatering or too much direct sun',
      'Brown leaf tips: Low humidity or underwatering',
      'Slow growth: Insufficient light or nutrients',
      'Pests: Watch for spider mites, mealybugs, and scale insects',
      'No fenestration: Ensure plant gets adequate light to develop holes',
    ],
  },

  'Epipremnum aureum': {
    wateringFrequencyDays: 7,
    wateringAmount: 'mid',
    lightRequirements:
      'Tolerates low to bright indirect light. Grows faster in brighter conditions.',
    fertilizingTips: [
      'Fertilize every 4 weeks during growing season',
      'Use diluted balanced fertilizer or fertilizer for houseplants',
      'Can tolerate some neglect with fertilizer compared to other plants',
      'Stop fertilizing during winter months',
    ],
    pruningTips: [
      'Prune regularly to encourage bushier growth',
      'Remove dead or yellowing leaves',
      'Can be cut back to any point on the vine',
      'Use prunings for propagation in water',
    ],
    troubleshooting: [
      'Yellowing leaves: Usually overwatering, check soil moisture',
      'Slow growth: May need more light or fertilizer',
      'Brown tips: Low humidity, mist leaves regularly',
      'Leggy growth: Insufficient light, move closer to light source',
    ],
  },

  'Sansevieria trifasciata': {
    wateringFrequencyDays: 14,
    wateringAmount: 'low',
    lightRequirements:
      'Very adaptable. Prefers bright indirect light but tolerates low light well.',
    fertilizingTips: [
      'Fertilize once during spring and once in summer',
      'Use half-strength, general-purpose fertilizer',
      'Over-fertilizing can damage the plant',
      'Does not need frequent feeding',
    ],
    pruningTips: [
      'Remove dead or damaged leaves at soil level',
      'Trim brown leaf tips with clean scissors',
      'Rarely needs pruning due to slow growth',
      'Can be propagated from leaf cuttings',
    ],
    troubleshooting: [
      'Root rot: Most common issue from overwatering',
      'Yellow leaves: Usually indicates root rot or poor drainage',
      'Brown tips: Potentially low humidity or water quality issues',
      'Pests: Rarely affected, but watch for spider mites in dry conditions',
    ],
  },

  'Chlorophytum comosum': {
    wateringFrequencyDays: 5,
    wateringAmount: 'mid',
    lightRequirements:
      'Bright, indirect light is best. Can tolerate some shade but prefers brighter conditions.',
    fertilizingTips: [
      'Fertilize every 2-3 weeks during growing season',
      'Use balanced, water-soluble fertilizer',
      'Less frequent feeding in winter',
      'Can tolerate infrequent fertilizing',
    ],
    pruningTips: [
      'Remove brown leaf tips by trimming with scissors',
      'Prune dead or yellowing leaves regularly',
      'Remove plantlets (baby plants) if desired',
      'Regenerates quickly from pruning',
    ],
    troubleshooting: [
      'Brown tips: Often from tap water chemicals, try filtered water',
      'Yellow leaves: Can indicate overwatering or nutrient deficiency',
      'Sparse growth: Increase light exposure',
      'Pests: Occasionally affected by spider mites',
    ],
  },

  'Philodendron hederaceum': {
    wateringFrequencyDays: 7,
    wateringAmount: 'mid',
    lightRequirements:
      'Prefers bright, indirect light. Can survive in low light but grows more slowly.',
    fertilizingTips: [
      'Fertilize every 4-6 weeks during growing season',
      'Use diluted balanced fertilizer',
      'Apply to moist soil only',
      'Reduce frequency in winter',
    ],
    pruningTips: [
      'Pinch back regularly to encourage bushier growth',
      'Remove leggy or bare stems',
      'Can be cut back quite severely and will regrow',
      'Propagate easily from cuttings in water',
    ],
    troubleshooting: [
      'Yellowing leaves: Usually from overwatering',
      'Slow growth: May indicate low light',
      'Brown leaf tips: Low humidity, mist regularly',
      'Wilting: Check soil moisture and drainage',
    ],
  },

  'Ficus elastica': {
    wateringFrequencyDays: 10,
    wateringAmount: 'low',
    lightRequirements:
      'Bright, indirect light. Direct morning sun is acceptable. Adapts to medium light.',
    fertilizingTips: [
      'Fertilize every 2-4 weeks during growing season',
      'Use general-purpose houseplant fertilizer at half strength',
      'Can tolerate infrequent feeding',
      'Fertilize less in fall and winter',
    ],
    pruningTips: [
      'Prune to control size and encourage branching',
      'Remove dead or damaged leaves',
      'Can be cut back extensively to reshape',
      'Wear gloves as sap can irritate skin',
    ],
    troubleshooting: [
      'Leaf drop: Usually from overwatering or cold drafts',
      'Yellow leaves: Check watering and drainage',
      'Sticky residue: This is sap, use damp cloth to clean',
      'Pests: Scale insects and spider mites are common',
    ],
  },

  'Spathiphyllum wallisii': {
    wateringFrequencyDays: 5,
    wateringAmount: 'mid',
    lightRequirements:
      'Prefers moderate indirect light. Tolerates low light well. Avoid direct sun.',
    fertilizingTips: [
      'Fertilize every 4 weeks during growing season',
      'Use diluted liquid fertilizer',
      'Sensitive to over-fertilizing, go easy',
      'Reduce feeding in winter',
    ],
    pruningTips: [
      'Remove dead flowers and yellow leaves',
      'Prune near the base of the plant',
      'Regenerates quickly after pruning',
      'Rarely needs extensive pruning',
    ],
    troubleshooting: [
      'Brown leaf tips: Usually from low humidity or fluoride in water',
      'Wilting: Indicates water is needed, plant is quite dramatic',
      'No flowers: May need more light or feeding',
      'Yellow leaves: Check for overwatering or low light',
    ],
  },

  'Ficus lyrata': {
    wateringFrequencyDays: 10,
    wateringAmount: 'low',
    lightRequirements: 'Bright, indirect light. Needs 6+ hours of bright indirect light daily.',
    fertilizingTips: [
      'Fertilize once per month during growing season',
      'Use diluted balanced fertilizer',
      'Less feeding in winter months',
      'Can show signs of nutrient deficiency if under-fed',
    ],
    pruningTips: [
      'Prune to control height and width',
      'Remove dead or damaged leaves',
      'Can be cut back to encourage bushier growth',
      'Wipe large leaves with damp cloth monthly',
    ],
    troubleshooting: [
      'Leaf drop: Most common issue, can be from watering changes or cold',
      'Brown spots on leaves: Fungal issue, reduce humidity and watering',
      'Slow growth: Increase light or temperature',
      'Sticky residue: Normal sap, wipe off with damp cloth',
    ],
  },

  'Zamioculcas zamiifolia': {
    wateringFrequencyDays: 14,
    wateringAmount: 'low',
    lightRequirements: 'Tolerates low to bright indirect light. Prefers moderate indirect light.',
    fertilizingTips: [
      'Fertilize sparingly, once or twice during growing season',
      'Use very diluted fertilizer',
      'Does well with minimal feeding',
      'Can go long periods without fertilizer',
    ],
    pruningTips: [
      'Remove yellowing or dead leaflets',
      'Cut brown leaf tips with clean scissors',
      'Rarely needs pruning',
      'Extremely slow growing',
    ],
    troubleshooting: [
      'Yellow leaves: Overwatering is the primary cause',
      'Slow growth: This is normal, very slow-growing plant',
      'Root rot: Most serious issue, prevent with proper drainage',
      'Brown tips: Usually from low humidity or hard water',
    ],
  },

  'Pilea peperomioides': {
    wateringFrequencyDays: 5,
    wateringAmount: 'mid',
    lightRequirements:
      'Bright, indirect light. Rotate regularly for even growth. Some direct morning sun OK.',
    fertilizingTips: [
      'Fertilize every 2-4 weeks during growing season',
      'Use balanced, diluted fertilizer',
      'Less frequent in winter',
      'Very responsive to good feeding',
    ],
    pruningTips: [
      'Remove dead or yellowing leaves',
      'Pinch back to encourage bushier growth',
      'Remove lower leaves as plant matures',
      'Propagate easily from pups at base',
    ],
    troubleshooting: [
      'Brown spots: Can indicate fungal issue, reduce watering',
      'Yellow leaves: Usually from overwatering',
      'Uneven growth: Rotate plant regularly',
      'Wilting: May indicate underwatering despite moist soil',
    ],
  },

  'Calathea orbifolia': {
    wateringFrequencyDays: 5,
    wateringAmount: 'mid',
    lightRequirements:
      'Bright, indirect light. Sensitive to direct sun. Thrives in moderate light.',
    fertilizingTips: [
      'Fertilize every 4-6 weeks during growing season',
      'Use very diluted, balanced fertilizer',
      'Sensitive to fertilizer salts, better to under-fertilize',
      'Reduce feeding in winter',
    ],
    pruningTips: [
      'Remove dead or yellowing leaves',
      'Trim brown leaf edges with scissors',
      'Does not require significant pruning',
      'Clean leaves with soft, damp cloth',
    ],
    troubleshooting: [
      'Brown leaf tips: Low humidity or hard water',
      'Curling leaves: Underwatering or low humidity',
      'Yellow leaves: Overwatering or root issues',
      'Pests: Spider mites in dry conditions',
    ],
  },

  // Fallback for unknown plants
  'Unknown Plant': {
    wateringFrequencyDays: 7,
    wateringAmount: 'mid',
    lightRequirements: 'Prefers bright, indirect light.',
    fertilizingTips: [
      'Fertilize every 4-6 weeks during the growing season',
      'Use a balanced, water-soluble fertilizer at half strength',
    ],
    pruningTips: [
      'Remove dead or yellowing leaves regularly',
      'Prune to control size and shape as needed',
    ],
    troubleshooting: [
      'Yellow leaves: Check watering and drainage',
      'Slow growth: Ensure adequate light and nutrients',
      'Pests: Watch for common houseplant pests',
    ],
  },
};

/**
 * Generate care instructions for a plant using AI.
 * Supports both real OpenAI API calls and mocked responses via USE_REAL_OPENAI_API flag.
 *
 * @param plantName - Common or scientific name of the plant
 * @returns Care instructions including watering, light, fertilizing, etc.
 * @throws Error if OpenAI API fails
 *
 * @example
 * const care = await generateCareInstructions('Monstera deliciosa');
 * // Returns: { wateringFrequencyDays: 7, lightRequirements: "...", ... }
 */
export async function generateCareInstructions(plantName: string): Promise<CareInstructions> {
  const useRealApi = process.env.USE_REAL_OPENAI_API === 'true';

  if (useRealApi) {
    return generateCareInstructionsWithApi(plantName);
  }

  return generateCareInstructionsMocked(plantName);
}

/**
 * Call the real OpenAI API to generate care instructions.
 * Requires OPENAI_API_KEY environment variable.
 */
async function generateCareInstructionsWithApi(plantName: string): Promise<CareInstructions> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY environment variable is not set. Set USE_REAL_OPENAI_API=false to use mocked data.'
    );
  }

  try {
    const prompt = `Generate comprehensive care instructions for the plant: "${plantName}"

Please respond with ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "wateringFrequencyDays": <number between 1-30>,
  "wateringAmount": <one of "low", "mid", "heavy">,
  "lightRequirements": "<string describing light needs>",
  "fertilizingTips": ["<tip1>", "<tip2>", "<tip3>", "<tip4>"],
  "pruningTips": ["<tip1>", "<tip2>", "<tip3>", "<tip4>"],
  "troubleshooting": ["<issue1>", "<issue2>", "<issue3>", "<issue4>"]
}

Be specific to this plant species. Each array should have exactly 4 items.
- "wateringAmount" should be "low" for drought-tolerant plants (like succulents, Snake plant, ZZ plant), "mid" for typical houseplants, or "heavy" for water-loving plants.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI API');
    }

    const content = data.choices[0].message.content.trim();

    // Parse JSON response - handle potential markdown code blocks
    let jsonStr = content;
    if (content.includes('```json')) {
      jsonStr = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonStr = content.split('```')[1].split('```')[0].trim();
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', {
        originalContent: content,
        extractedJsonStr: jsonStr,
        parseError: parseError instanceof Error ? parseError.message : 'Unknown error',
      });
      throw new Error(
        `Failed to parse OpenAI response as JSON. Response was: ${content.substring(0, 200)}...`
      );
    }

    // Validate required fields
    if (
      !parsedResponse.wateringFrequencyDays ||
      !parsedResponse.wateringAmount ||
      !parsedResponse.lightRequirements ||
      !Array.isArray(parsedResponse.fertilizingTips) ||
      !Array.isArray(parsedResponse.pruningTips) ||
      !Array.isArray(parsedResponse.troubleshooting)
    ) {
      throw new Error('Missing required fields in API response');
    }

    // Validate watering amount is one of the allowed values
    const validWateringAmounts = ['low', 'mid', 'heavy'];
    const wateringAmount = validWateringAmounts.includes(parsedResponse.wateringAmount)
      ? parsedResponse.wateringAmount
      : 'mid'; // Default to mid if invalid

    return {
      wateringFrequencyDays: Math.max(1, Math.min(365, parsedResponse.wateringFrequencyDays)),
      wateringAmount: wateringAmount as 'low' | 'mid' | 'heavy',
      lightRequirements: String(parsedResponse.lightRequirements),
      fertilizingTips: Array.isArray(parsedResponse.fertilizingTips)
        ? parsedResponse.fertilizingTips.map(String)
        : [],
      pruningTips: Array.isArray(parsedResponse.pruningTips)
        ? parsedResponse.pruningTips.map(String)
        : [],
      troubleshooting: Array.isArray(parsedResponse.troubleshooting)
        ? parsedResponse.troubleshooting.map(String)
        : [],
    };
  } catch (error) {
    throw new Error(
      `Care instruction generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate care instructions using mocked data.
 * Adds a 3-second delay to simulate API latency.
 */
async function generateCareInstructionsMocked(plantName: string): Promise<CareInstructions> {
  // Simulate AI generation delay (3 seconds)
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Look up plant in database or return generic care
  const normalizedName = plantName
    .toLowerCase()
    .replace(/[-_\s]+/g, ' ')
    .trim();

  // Try exact match first
  let care = mockCareDatabase[plantName];

  // Try normalized match
  if (!care) {
    for (const [key, value] of Object.entries(mockCareDatabase)) {
      if (
        key.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(key.toLowerCase())
      ) {
        care = value;
        break;
      }
    }
  }

  // Fall back to unknown plant
  if (!care) {
    care = mockCareDatabase['Unknown Plant'];
  }

  return {
    wateringFrequencyDays: care.wateringFrequencyDays,
    wateringAmount: care.wateringAmount,
    lightRequirements: care.lightRequirements,
    fertilizingTips: [...care.fertilizingTips],
    pruningTips: [...care.pruningTips],
    troubleshooting: [...care.troubleshooting],
  };
}

/**
 * Get care instructions without delay (instant mock).
 * Useful for testing step 4-5 transitions in development.
 *
 * @internal For testing only
 */
export async function generateCareInstructionsInstant(
  plantName: string
): Promise<CareInstructions> {
  // Same as mocked but without delay
  const normalizedName = plantName
    .toLowerCase()
    .replace(/[-_\s]+/g, ' ')
    .trim();

  let care = mockCareDatabase[plantName];

  if (!care) {
    for (const [key, value] of Object.entries(mockCareDatabase)) {
      if (
        key.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(key.toLowerCase())
      ) {
        care = value;
        break;
      }
    }
  }

  if (!care) {
    care = mockCareDatabase['Unknown Plant'];
  }

  return {
    wateringFrequencyDays: care.wateringFrequencyDays,
    wateringAmount: care.wateringAmount,
    lightRequirements: care.lightRequirements,
    fertilizingTips: [...care.fertilizingTips],
    pruningTips: [...care.pruningTips],
    troubleshooting: [...care.troubleshooting],
  };
}
