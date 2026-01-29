/**
 * Compatibility layer for plant-related operations
 * Re-exports functions from split modules for backward compatibility
 *
 * New code should import directly from the specific modules:
 * - plants.crud.server.ts (create, read, update, delete)
 * - plants.queries.server.ts (queries and calculations)
 * - plants.ai.server.ts (AI-specific operations)
 */

// Re-export CRUD operations
export { createPlant, deletePlant, updatePlant } from './crud.server';

// Re-export query operations
export {
  getLastWateredDate,
  getNextWateringDate,
  getPlantById,
  getUserPlants,
  getWateringHistory,
} from './queries.server';

// Re-export AI operations
export { createAIPlant, recordAIFeedback } from './ai.server';
