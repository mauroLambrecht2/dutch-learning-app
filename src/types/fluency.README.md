# Fluency Level System - Data Models and Constants

This directory contains the TypeScript type definitions, constants, and utility functions for the CEFR-based fluency level tracking system.

## Files Created

### 1. Type Definitions (`src/types/fluency.ts`)

Defines the core TypeScript interfaces for the fluency level system:

- **`FluencyLevelCode`**: Type union for valid CEFR levels (A1, A2, B1, B2, C1)
- **`FluencyLevel`**: Interface for fluency level metadata (code, name, description, color, icon)
- **`Certificate`**: Interface for achievement certificates
- **`FluencyHistoryEntry`**: Interface for tracking level changes
- **`UserProfileWithFluency`**: Extended user profile with fluency fields

### 2. Constants (`src/constants/fluencyLevels.ts`)

Defines the fluency level metadata and configuration:

- **`FLUENCY_LEVELS`**: Complete metadata for all CEFR levels (A1-C1)
  - Each level includes: code, name, description, color, and icon
- **`FLUENCY_LEVEL_ORDER`**: Ordered array of level codes for progression
- **`DEFAULT_FLUENCY_LEVEL`**: Default level for new users (A1)
- **`MIN_FLUENCY_LEVEL`**: Minimum level (A1)
- **`MAX_FLUENCY_LEVEL`**: Maximum level (C1)

### 3. Utility Functions (`src/utils/fluencyLevelUtils.ts`)

Provides validation and transition logic:

- **`isValidFluencyLevel(level)`**: Validates if a string is a valid fluency level code
- **`getNextLevel(currentLevel)`**: Gets the next level in progression (upgrade)
- **`getPreviousLevel(currentLevel)`**: Gets the previous level (downgrade)
- **`canUpgradeTo(current, target)`**: Checks if upgrade is valid
- **`canDowngradeTo(current, target)`**: Checks if downgrade is valid
- **`isValidTransition(current, target)`**: Validates any level transition
- **`getFluencyLevelMetadata(level)`**: Retrieves level metadata
- **`formatFluencyLevel(level, includeDescription)`**: Formats level for display
- **`compareFluencyLevels(level1, level2)`**: Compares two levels

## Usage Examples

### Importing Types

```typescript
import type { FluencyLevelCode, Certificate } from '@/types/fluency';
```

### Using Constants

```typescript
import { FLUENCY_LEVELS, DEFAULT_FLUENCY_LEVEL } from '@/constants/fluencyLevels';

// Get metadata for a level
const a1Info = FLUENCY_LEVELS['A1'];
console.log(a1Info.name); // "Beginner"
console.log(a1Info.icon); // "🌱"
```

### Using Utilities

```typescript
import {
  isValidFluencyLevel,
  getNextLevel,
  canUpgradeTo,
  formatFluencyLevel
} from '@/utils/fluencyLevelUtils';

// Validate a level
if (isValidFluencyLevel('A1')) {
  console.log('Valid level');
}

// Get next level
const next = getNextLevel('A1'); // Returns 'A2'

// Check if upgrade is valid
if (canUpgradeTo('A1', 'A2')) {
  console.log('Can upgrade');
}

// Format for display
const formatted = formatFluencyLevel('A1'); // "A1 - Beginner"
const withDesc = formatFluencyLevel('A1', true); // "A1 - Beginner: Can understand..."
```

## Level Progression

The system enforces strict level progression:

```
A1 (Beginner) → A2 (Elementary) → B1 (Intermediate) → B2 (Upper Intermediate) → C1 (Advanced)
```

### Rules:
- Users start at A1 by default
- Can only upgrade/downgrade one level at a time
- Cannot downgrade below A1
- Cannot upgrade beyond C1

## Testing

Unit tests are provided in `src/utils/__tests__/fluencyLevelUtils.test.ts`.

To run tests (once testing framework is configured):
```bash
npm test
```

Manual validation script:
```bash
npx tsx src/utils/__tests__/fluencyLevelUtils.manual-test.ts
```

## Integration

These data models and utilities are used by:
- Backend endpoints for fluency management
- Frontend components for displaying levels
- Certificate generation system
- Admin controls for level changes
- User profile display

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:
- **Requirement 1.1**: Default A1 level assignment
- **Requirement 1.5**: Level metadata with descriptive labels
