# AI Wizard Feature

The AI Wizard provides an intelligent multi-step flow for creating plants with AI-powered assistance, including plant identification and care instruction generation.

## Overview

The AI Wizard is a 7-step interactive flow for creating plants with AI assistance:

1. **PhotoUploadStep** - Capture/upload plant photo
2. **IdentifyingStep** - Processing plant image
3. **IdentificationResultStep** - Show identification results
4. **ManualNameStep** - User can manually enter plant name
5. **GeneratingCareStep** - Processing care instruction generation
6. **CarePreviewStep** - Review and edit AI-generated care instructions
7. **FeedbackStep** - Provide feedback on care instructions

Features:

- Automatic plant identification from photos
- AI-generated personalized care instructions
- User editable at each step
- Optional room assignment
- Usage limit enforcement (20 per month)
- User feedback collection on AI quality

## Architecture

### Directory Structure

```
app/features/ai-wizard/
├── components/
│   ├── Step1Upload.tsx           # Photo capture/upload
│   ├── Step2IdentifyPlant.tsx    # Plant ID results
│   ├── Step3CareInstructions.tsx # Care generation
│   ├── Step4Confirmation.tsx     # Final review
│   ├── WizardContainer.tsx       # Multi-step container
│   └── index.ts
├── hooks/
│   ├── useWizardState.ts         # Wizard state management
│   └── useAIServices.ts          # AI API calls
├── lib/
│   ├── plants.ai.server.ts       # AI operations
│   └── wizard.calculations.ts    # Helper functions
└── index.ts
```

### Server Functions

Located in `app/lib/plants.ai.server.ts`:

```typescript
// Identify plant from image using plant.id API
export async function identifyPlantFromImage(imageBuffer: Buffer): Promise<PlantIdentification>;

// Generate care instructions using OpenAI API
export async function generateCareInstructions(species: string): Promise<CareInstructions>;

// Create plant from AI wizard result
export async function createPlantFromWizard(
  userId: string,
  wizardData: WizardSubmission
): Promise<Plant>;
```

### Components

#### Step 1: Upload

Allow user to upload or capture plant photo:

**Props:**

```typescript
interface Step1UploadProps {
  onImageSelected: (file: File) => void;
  isLoading: boolean;
}
```

**Features:**

- Camera capture (mobile)
- File upload (desktop/mobile)
- Image preview
- File validation (size, format)

#### Step 2: Identify Plant

Show AI identification results:

**Props:**

```typescript
interface Step2IdentifyProps {
  imageUrl: string;
  identification: PlantIdentification;
  isLoading: boolean;
  onConfirm: (species: string) => void;
  onRetry: () => void;
}
```

**Features:**

- Display identified species and confidence
- Show alternative matches
- Allow user to override identification
- Manual entry option

#### Step 3: Care Instructions

Display and edit AI-generated care instructions:

**Props:**

```typescript
interface Step3CareProps {
  species: string;
  instructions: CareInstructions;
  isLoading: boolean;
  onEdit: (instructions: CareInstructions) => void;
  onConfirm: () => void;
}
```

**Features:**

- Display generated instructions (watering, light, soil, etc.)
- Edit instructions inline
- Regenerate if dissatisfied
- Confirm to proceed

#### Step 4: Confirmation

Final review and plant creation:

**Props:**

```typescript
interface Step4ConfirmProps {
  plant: Partial<Plant>;
  instructions: CareInstructions;
  onConfirm: () => void;
  isLoading: boolean;
}
```

**Features:**

- Review plant details
- Edit plant name and room
- Final confirmation
- Error handling

### Hooks

#### useWizardState

Manages multi-step wizard state:

```typescript
const {
  step, // Current step (1-4)
  nextStep,
  prevStep,
  state, // Wizard data
  updateState,
  reset,
} = useWizardState();
```

#### useAIServices

Manages AI API calls with loading/error states:

```typescript
const { identifyPlant, generateCare, isLoading, error } = useAIServices();
```

## Routes

### Wizard Page

```
GET  /dashboard/plants/new-ai     # Start wizard
POST /dashboard/plants/new-ai     # Submit wizard (create plant)
```

### Data Flow

1. **PhotoUploadStep**
   - User selects/captures image via file input or camera
   - Image preview shown
   - Validation: file size, format

2. **IdentifyingStep**
   - Show loading state while processing
   - Image sent to plant.id API (hybrid: mocked/real)
   - Processing indication to user

3. **IdentificationResultStep**
   - Display identified species with confidence score
   - Show alternative matches
   - User can accept, override, or manually enter name

4. **ManualNameStep**
   - User enters plant name (if not auto-identified)
   - Selects optional room assignment
   - Confirms identification

5. **GeneratingCareStep**
   - Show loading state while processing
   - Plant name/species sent to OpenAI API (hybrid: mocked/real)
   - Processing indication to user

6. **CarePreviewStep**
   - Display AI-generated care instructions:
     - Light requirements
     - Watering frequency (in days)
     - Fertilizing tips
     - Pruning tips
     - Troubleshooting guide
   - User can edit each field
   - Option to regenerate

7. **FeedbackStep**
   - Plant created and saved
   - Prompt for feedback on AI quality
   - Thumbs up/down with optional comment
   - Redirect to plant detail page

### Server-Side Processing

- **Image Processing:** Server compresses and resizes image
- **Storage:** Image uploaded to Supabase Storage
- **Plant Creation:** Plant record created with `created_with_ai: true`
- **Usage Tracking:** AI generation count incremented
- **Feedback Storage:** Feedback saved to `ai_feedback` table

## Data Model

### Wizard Data State

```typescript
interface WizardState {
  step: 1 | 2 | 3 | 4;
  imageFile?: File;
  imageUrl?: string;
  identification?: PlantIdentification;
  species?: string;
  careInstructions?: CareInstructions;
  plant?: Partial<Plant>;
}

interface PlantIdentification {
  species: string;
  commonName?: string;
  confidence: number; // 0-1
  alternatives: Array<{
    species: string;
    confidence: number;
  }>;
}

interface CareInstructions {
  light_requirements: string; // Lighting needs
  watering_frequency: number; // Days between watering
  fertilizing_tips: string; // Fertilizer guidance
  pruning_tips: string; // Pruning instructions
  troubleshooting: string; // Common issues & solutions
}
```

## API Integrations

### plant.id API

**Location:** `app/lib/ai/plantnet.server.ts`

**Implementation Type:** HYBRID (Mocked by default, real API available)

**Feature Flag:** `USE_REAL_PLANT_ID_API`

**Default Mode (Mocked):**

- Uses internal database of 20 common houseplants
- Functions: `identifyPlantMocked()`, `identifyPlantInstant()`
- Fast response (< 100ms with simulated 2s delay for realism)
- Suitable for development and testing

**Real API Mode:**

- Requires environment variable: `PLANT_ID_API_KEY`
- Uses actual plant.id API for unlimited species identification
- Function: `identifyPlant()`
- Computer vision based identification from photos
- Endpoint: `https://api.plant.id/v2/identify`

**Mock Database Examples:**

- Monstera, Pothos, Philodendron, Snake Plant, Spider Plant, Cactus, Aloe, ZZ Plant, Rubber Plant, Peace Lily, Bamboo Palm, Dracaena, Fiddle Leaf Fig, Bird of Paradise, Boston Fern, African Violet, Anthurium, Succulent, Begonia

**Response Format:**

```typescript
{
  confidence: number;        // 0-1
  probabilities: [{
    name: string;            // Scientific name
    probability: number;
  }];
}
```

### OpenAI API

**Location:** `app/lib/ai/openai.server.ts`

**Implementation Type:** HYBRID (Mocked by default, real API available)

**Feature Flag:** `USE_REAL_OPENAI_API`

**Default Mode (Mocked):**

- Uses internal database of 11 plant care profiles
- Function: `generateCareInstructionsMocked()`
- Fast response (< 100ms)
- Suitable for development and testing

**Real API Mode:**

- Requires environment variable: `OPENAI_API_KEY`
- Uses GPT-4o-mini model for dynamic instruction generation
- Function: `generateCareInstructions()`
- Generates personalized care instructions per plant

**Mock Database Examples:**
Includes profiles for: Monstera, Pothos, Snake Plant, Cactus, Succulent, Fern, Palm, Orchid, Ivy, Begonia, Violet

**Response Format:**

```typescript
{
  light_requirements: string; // Lighting needs
  watering_frequency: number; // Days between watering
  fertilizing_tips: string; // Fertilizer schedule
  pruning_tips: string; // Pruning guidance
  troubleshooting: string; // Common problems
}
```

## Type Safety

AI Wizard types:

```typescript
export interface PlantIdentification {
  species: string;
  confidence: number;
  alternatives: Array<{ species: string; confidence: number }>;
}

export interface CareInstructions {
  light_requirements: string;
  watering_frequency: number;
  fertilizing_tips: string;
  pruning_tips: string;
  troubleshooting: string;
}

export interface WizardSubmission {
  name: string; // Plant name
  watering_frequency_days: number; // Days between watering
  light_requirements: string; // Light care
  fertilizing_tips: string; // Fertilizer tips
  pruning_tips: string; // Pruning guidance
  troubleshooting: string; // Problem solving
  photoFile?: File; // Optional photo
  room_id?: string; // Optional room
}
```

## Usage Limits

The AI Wizard enforces usage limits to manage API costs and ensure fair access:

### Rate Limits

**Monthly Limit:** 20 AI plant creations per user

**Enforcement:**

- Checked in loader before allowing access to wizard
- Tracked in `usage_limits` table with `month_year` field
- Hardcoded limit in `app/lib/usage-limits/usage-limits.server.ts`

**User Feedback:**

- Shows remaining AI generations in wizard UI
- Prevents form submission if limit reached
- Error message: "AI generation limit reached: 20 per month"

### Plant Limits

**Overall Limit:** 100 plants per user

**Enforcement:**

- Checked before AI wizard access
- Enforced before any plant creation (manual or AI)

**User Feedback:**

- Error message: "Plant limit reached: 100 max plants"

## User Feedback & Analytics

### AI Feedback Collection

After plant creation, users are prompted to provide feedback on the AI-generated care instructions:

**Feedback Form:**

- **Thumbs Up** - Instructions were helpful and accurate
- **Thumbs Down** - Instructions were inaccurate or unhelpful
- **Optional Comment** - Why the feedback (max 500 chars)

**Storage:**

```typescript
interface AIFeedback {
  id: string; // UUID
  user_id: string; // User providing feedback
  plant_id: string; // Plant feedback is about
  feedback_type: 'thumbs_up' | 'thumbs_down';
  comment: string | null; // Optional user comment
  ai_response_snapshot: JSON; // Snapshot of care instructions
  created_at: string; // Timestamp
}
```

**Database:** `ai_feedback` table

**Use Cases:**

- Improve AI model training
- Identify problematic identifications
- Track plant.id/OpenAI quality
- Understand user preferences

### Analytics Tracked

Future enhancements will track:

- Wizard completion rate
- Plant identification acceptance rate
- Care instruction quality (via feedback)
- Common edit patterns
- API usage and costs

---

## Performance

- **Code Splitting**: Wizard lazy-loaded only on `/new-ai` route
- **Image Processing**: Images processed on client before upload
- **API Calls**: Mocked with 2-3 second delays for UX realism
- **State Management**: useWizardState keeps data in memory

## Error Handling

**Possible errors:**

1. **Image Upload**
   - File too large
   - Invalid format
   - Storage quota exceeded

2. **Plant Identification**
   - API timeout
   - Unrecognized plant
   - Low confidence result

3. **Care Generation**
   - API timeout
   - Unknown species
   - Generation failed

**User feedback:**

- Toast notifications for errors
- Retry buttons available
- Clear error messages
- Fallback to manual entry

## Testing

Component tests:

- Step rendering
- Navigation between steps
- Form validation
- Image preview

Server function tests:

- Image processing
- API mocking
- Plant creation with AI data
- Error handling

See [../guides/TESTING.md](../guides/TESTING.md) for testing patterns.

## Accessibility

All wizard components follow WCAG 2.1 AA:

- Step progress indicator
- Keyboard navigation
- Form labels associated
- Error messages announced
- Camera access disclosure

## User Experience Features

- **Progress Indicator**: Shows current step (1/4, 2/4, etc.)
- **Back Button**: Navigate to previous step
- **Save Draft**: Auto-saves state to session (future)
- **Estimated Time**: "This takes 2 minutes"
- **Skip AI**: Manual plant entry fallback
- **Feedback**: Modal on successful creation

## Usage Analytics (Future)

- Track wizard completion rate
- Monitor plant identification acceptance
- Measure care instruction edits
- Identify common errors

## Constraints & Limitations

- **Image Size**: Max 10MB (validated client-side)
- **API Timeouts**: 30 seconds per API call
- **Confidence Threshold**: Show results if confidence > 0.3
- **plant.id Database**: 20 plants (mocked) or 500k+ species (real API)
- **OpenAI Model**: GPT-4o-mini (mocked profiles or dynamic generation)
- **Monthly Limit**: 20 AI generations per user
- **Overall Limit**: 100 plants per user
- **Storage**: Plant photos max 10MB client-side, compressed server-side
- **Feedback**: Optional but encouraged for improving AI quality

## Future Enhancements

- [ ] Barcode scanning for store-bought plants
- [ ] Computer vision for plant health assessment
- [ ] Video tutorials for specific species
- [ ] Integration with Plant ID database
- [ ] Multi-language care instructions
- [ ] Care instructions in augmented reality
- [ ] Sharing plant profile template with friends
- [ ] Automatic care reminders based on instructions
