# Review Screen Flow Implementation

## Overview

Implemented the complete scoring flow matching the mobile app:
1. **ScoringFlowScreen** - User scores traits across multiple steps
2. **SapienScoreScreen** (NEW) - Review screen showing all scores with progress bars and comments
3. **ShareScreen** - Success screen after submission

## Problem

The webapp was submitting ratings directly from the ScoringFlowScreen when clicking "Finish", without showing a review screen. The mobile app has an intermediate review screen (SapienScoreScreen) where users can:
- See all their scores visualized with progress bars
- Review all comments
- Click "Share" to actually submit the rating

## Mobile App Flow

```
ScoringFlowScreen (Finish) 
  → SapienScoreScreen (Review + Share button)
    → API Submission
      → ShareScreen (Success)
        → Dashboard
```

## Webapp Flow (Before)

```
ScoringFlowScreen (Finish)
  → API Submission (immediate)
    → ShareScreen (Success)
      → Dashboard
```

## Webapp Flow (After - Matching Mobile App)

```
ScoringFlowScreen (Finish)
  → SapienScoreScreen (Review + Share button)
    → API Submission
      → ShareScreen (Success)
        → Dashboard
```

## Changes Made

### 1. Updated ScoringFlowScreen.tsx

**Changed:** `handleFinish` function to navigate to review screen instead of submitting

**Before:**
```typescript
const handleFinish = async () => {
  // Prepare rating data
  const ratingData = ...;
  
  // Submit immediately
  await submitRating({...});
  
  toast.success('Score submitted successfully!');
  navigate('/sapien-score');
};
```

**After:**
```typescript
const handleFinish = async () => {
  // Prepare rating data
  const ratingData = steps.steps.map((step, index) => {
    const stepTraits = step.traits.map((trait) => ({
      trait: trait.name,
      score: hiddenTraits[trait.key] ? null : (traitsData[trait.key] || null),
    }));

    return {
      topic: step.title,
      traits: stepTraits,
      comment: stepComments[index + 1] || '',
    };
  });

  // Store in context for review screen
  setScoringData({ rating_data: ratingData });

  // Navigate to review screen (NOT submitting yet)
  navigate('/sapien-score');
};
```

**Key Changes:**
- Removed `submitRating` API call
- Removed `submitRating` import
- Store rating data in context using `setScoringData`
- Navigate to `/sapien-score` for review
- Include hidden traits as `null` scores (matching mobile app)

### 2. Updated SapienScoreScreen.tsx

**Changed:** `handleShare` function to actually submit the rating

**Before:**
```typescript
const handleShare = async () => {
  // Just navigate (rating already submitted)
  toast.success('Score shared successfully!');
  navigate('/share-screen');
};
```

**After:**
```typescript
const handleShare = async () => {
  if (overallScore === 0) {
    setShowModal(true);
    return;
  }

  setLoading(true);

  try {
    // Actually submit the rating here
    const response = await submitRating({
      ...parsedData,
      receiver_id: receiverID,
      emailOrPhone: contactInfo.email || contactInfo.phone,
      relation: selectedRelation,
      sender_relation: selectedRelation,
      existing_rating_id: updatedRatingId
    });

    toast.success('Score shared successfully!');
    
    // Navigate to success screen
    setTimeout(() => {
      navigate('/share-screen');
    }, 500);
  } catch (error: any) {
    // Handle errors (duplicate rating, network errors, etc.)
    const errorMessage = error.response?.data?.message || ...;
    setCustomMessage(errorMessage);
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};
```

**Key Changes:**
- Added `submitRating` and `updateRating` imports
- Added `selectedRelation`, `receiverID` from context
- Added `updatedRatingId` state for update flow
- Actually submit rating to API
- Handle errors (duplicate rating, network errors)
- Show loading state during submission
- Only navigate to ShareScreen on success

### 3. ShareScreen (No Changes Needed)

The ShareScreen and ShareScreenWrapper were already correctly implemented:
- Shows success message with person's name
- "Select your next Sapien" → navigates to `/user-selection`
- "Dismiss" → navigates to `/dashboard`
- Clears scoring data on navigation

## Files Modified

1. ✅ `webapp/src/components/screens/ScoringFlowScreen.tsx`
   - Removed `submitRating` import (line 5)
   - Updated `handleFinish` to navigate instead of submit (lines 186-215)

2. ✅ `webapp/src/components/screens/SapienScoreScreen.tsx`
   - Added `submitRating`, `updateRating` imports (line 5)
   - Added `selectedRelation`, `receiverID` from context (line 11)
   - Added `updatedRatingId` state (line 15)
   - Updated `handleShare` to submit rating (lines 48-128)

## User Flow

### Creating New Score

1. **User Selection** → Select person to score
2. **Relationship Selection** → Select relationship
3. **Scoring Flow** → Score traits across multiple steps
4. **Click "Finish"** → Navigate to Review Screen
5. **Review Screen** → See all scores, progress bars, comments
6. **Click "Share"** → Submit rating to API
7. **Success Screen** → "SapienScore shared with [Name]"
8. **Click "Dismiss"** → Return to Dashboard

### Updating Existing Score

1. **Sapiens You Scored** → Click "Update Score"
2. **Scoring Flow** → Pre-filled scores, modify as needed
3. **Click "Finish"** → Navigate to Review Screen
4. **Review Screen** → See updated scores
5. **Click "Share"** → Update rating via API
6. **Success Screen** → "SapienScore shared with [Name]"
7. **Click "Dismiss"** → Return to Dashboard

## Testing Checklist

- [ ] Create new score flow works end-to-end
- [ ] Update existing score flow works end-to-end
- [ ] Review screen shows correct scores and progress bars
- [ ] Review screen shows correct comments
- [ ] Share button submits rating successfully
- [ ] Error handling works (duplicate rating, network errors)
- [ ] Loading state shows during submission
- [ ] Success screen appears after submission
- [ ] Navigation works correctly from success screen
- [ ] Scoring data is cleared after completion

## Key Benefits

1. **User Confidence** - Users can review all scores before submitting
2. **Error Prevention** - Users can catch mistakes before submission
3. **Better UX** - Matches mobile app flow exactly
4. **Clear Separation** - Review vs Submit are separate steps
5. **Error Handling** - Errors shown on review screen, not after navigation

