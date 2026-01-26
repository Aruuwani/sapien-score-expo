# Scoring Flow Pre-fill Fix - Update Score Feature

## Problem

When clicking "Update Score" in the Sapiens You Scored screen, the scoring flow screen did not pre-fill the existing scores, comments, and hidden traits. Users had to re-enter all scores from scratch when updating.

## Expected Behavior (Mobile App)

When updating a score in the mobile app:
1. ✅ Navigate to scoring flow
2. ✅ **Pre-fill all trait scores** from the existing rating
3. ✅ **Pre-fill all comments** for each step
4. ✅ **Pre-fill hidden traits** (traits that were marked as "not applicable")
5. ✅ User can modify scores and submit the update

## Root Cause

The webapp's `ScoringFlowScreen.tsx` was missing the initialization logic to read `scoringData` from the AppContext and pre-fill the form fields.

### Mobile App Implementation

The mobile app has a `useEffect` hook (lines 210-269 in `ScoringFlowScreen.tsx`) that:

```typescript
useEffect(() => {
  if (scoringData && scoringData?.rating_data && steps?.steps && steps.steps.length > 0) {
    const newTraitsData: any = {};
    const newStepComments: { [stepId: number]: string } = {};
    const newHiddenTraits: { [key: string]: boolean } = {};

    scoringData?.rating_data?.forEach((step: any, index: number) => {
      const stepId = index + 1;
      newStepComments[stepId] = step.comment || '';

      // Map traits and scores
      step.traits?.forEach((trait: any) => {
        if (trait.score === null) {
          newHiddenTraits[traitKey] = true;  // Hidden trait
        } else {
          newTraitsData[traitKey] = trait.score;  // Score value
        }
      });
    });

    setTraitsData(newTraitsData);
    setStepComments(newStepComments);
    setHiddenTraits(newHiddenTraits);
  }
}, [scoringData, steps]);
```

### Webapp Implementation (Before - Missing)

The webapp had **NO** initialization logic - it always started with empty scores.

## Solution Applied

Added the same initialization logic to the webapp's `ScoringFlowScreen.tsx`:

### 1. Added `scoringData` to Context Destructuring

```typescript
// Line 34 - Added scoringData
const { selectedPerson, selectedRelation, receiverID, scoringData, setScoringData } = useApp();
```

### 2. Added Initialization useEffect

```typescript
// Lines 99-155 - Initialize scoring data when updating
useEffect(() => {
  if (scoringData && scoringData?.rating_data && steps?.steps && steps.steps.length > 0) {
    const newTraitsData: any = {};
    const newStepComments: { [stepId: number]: string } = {};
    const newHiddenTraits: { [key: string]: boolean } = {};

    scoringData?.rating_data?.forEach((ratingStep: any, index: number) => {
      const stepId = index + 1;
      newStepComments[stepId] = ratingStep.comment || '';

      const currentStepData = steps?.steps[stepId - 1];
      if (!currentStepData || !Array.isArray(currentStepData.traits)) {
        return;
      }

      // Map traits from rating_data to traitsData
      ratingStep.traits?.forEach((ratingTrait: any) => {
        // Find matching trait by name
        const matchingTrait = currentStepData.traits.find(
          (t: Trait) => t.name === ratingTrait.trait || t.description === ratingTrait.trait
        );

        if (matchingTrait) {
          if (ratingTrait.score === null || ratingTrait.score === undefined) {
            newHiddenTraits[matchingTrait.key] = true;  // Hidden trait
          } else {
            newTraitsData[matchingTrait.key] = ratingTrait.score;  // Score value
          }
        }
      });
    });

    setTraitsData(newTraitsData);
    setStepComments(newStepComments);
    setHiddenTraits(newHiddenTraits);
  }
}, [scoringData, steps]);
```

### 3. Added Comment Update useEffect

```typescript
// Lines 157-160 - Update current comment when step changes
useEffect(() => {
  setCurrentComment(stepComments[currentStep] || '');
}, [currentStep, stepComments]);
```

## How It Works

### Data Flow

1. **User clicks "Update Score"** in `SapiensScoredSentScreen.tsx`
2. **Set context data**:
   ```typescript
   setSelectedPerson(receiverData);
   setSelectedRelation(rating?.sender_relation);  // Relation ID
   setScoringData({ rating_data: rating?.rating_data });  // Existing scores
   setReceiverID(receiver._id);
   ```
3. **Navigate to `/scoring-flow`**
4. **ScoringFlowScreen loads**:
   - Fetches relation topics (steps/traits structure)
   - Waits for both `scoringData` and `steps` to be available
5. **Initialization useEffect triggers**:
   - Maps `rating_data` to `traitsData` (scores)
   - Maps comments to `stepComments`
   - Maps null scores to `hiddenTraits`
6. **UI displays pre-filled scores**:
   - Sliders show existing scores
   - Comments show existing text
   - Hidden traits are marked with minus icon

### Trait Matching Logic

The code matches traits from `rating_data` to the current step's traits by comparing:
- `trait.name` (e.g., "Self-Belief")
- `trait.description` (e.g., "Empathy")

This ensures scores are correctly mapped even if the trait structure changes slightly.

## Files Modified

1. ✅ `webapp/src/components/screens/ScoringFlowScreen.tsx`
   - Line 34: Added `scoringData` to context destructuring
   - Lines 99-155: Added initialization useEffect
   - Lines 157-160: Added comment update useEffect

## Testing

### Test Update Score Flow

1. **Navigate to Dashboard → Sapiens You Scored**
2. **Click on a score card** to expand
3. **Wait 24 hours** (or modify DB for testing)
4. **Click "Update Score"** button
5. **Expected Results**:
   - ✅ Navigate to scoring flow
   - ✅ **All sliders show existing scores** (not 0)
   - ✅ **Comments are pre-filled** (if any)
   - ✅ **Hidden traits show minus icon** (if any were hidden)
   - ✅ User can modify scores
   - ✅ User can navigate between steps
   - ✅ Clicking "Finish" submits updated scores

### Console Logs

When updating a score, you should see:
```
📊 useEffect - Initialize scoring data
   scoringData: { rating_data: [...] }
   steps: { steps: [...], metadata: {...} }
✅ Initialized scoring data:
   traitsData: { trait_id_1: 8, trait_id_2: 7, ... }
   stepComments: { 1: "Great person!", 2: "", ... }
   hiddenTraits: { trait_id_3: true, ... }
```

## Key Learnings

### Scoring Data Structure

**From API (rating_data):**
```javascript
[
  {
    topic: "Emotional Intelligence",
    traits: [
      { trait: "Empathy", score: 8 },
      { trait: "Self-awareness", score: null }  // Hidden
    ],
    comment: "Great person!"
  }
]
```

**Transformed to UI State:**
```javascript
traitsData = { "trait_id_1": 8 }
hiddenTraits = { "trait_id_2": true }
stepComments = { 1: "Great person!" }
```

### Update vs Create Flow

- **Create**: `scoringData` is `null` → Start with empty scores
- **Update**: `scoringData` has `rating_data` → Pre-fill scores

The same `ScoringFlowScreen` handles both flows seamlessly.

