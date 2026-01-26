# Update Rating Fix - Using `createRating` for Both Create and Update

## Problem

When clicking "Update Score" in the Sapiens You Scored screen, the webapp was:
1. ❌ **NOT** passing the `existing_rating_id` to the backend API
2. ❌ Using `submitRating` from `ratingApi.ts` instead of `createRating` from `scoreSapien.ts`
3. ❌ This caused the backend to create a **new rating** instead of **updating the existing rating**

### Root Cause Analysis

**Issue 1: Missing `updatedRatingId` in Context**

The webapp's `SapiensScoredSentScreen.tsx` was missing the step to set `updatedRatingId` in the AppContext when clicking "Update Score". The mobile app sets this on line 176:

```typescript
// Mobile app - update with notification/components/screens/SapiensScoredSentScreen.tsx:176
setUpdatedraingId(ratingId)
```

But the webapp was missing this entirely.

**Issue 2: Wrong API Function**

The webapp was using `submitRating` from `ratingApi.ts`, but the mobile app uses `createRating` from `scoreSapien.ts`. The mobile app's implementation:

```typescript
// Mobile app - update with notification/components/screens/SapienScoreScreen.tsx:142
const response = await createRating({
  ...parsedData,
  sender_relation: relation,
  emailOrPhone: person.id || person,
  existing_rating_id: updatedRatingId  // ✅ Passed for update flow
});
```

### Backend Behavior

The backend's `createRating` function (in `sapien_backend/controllers/rating.controller.js`) **does** support updating existing ratings via the `existing_rating_id` parameter:

```javascript
// Lines 284-310
if (existing_rating_id) {
  // Verify the existing rating belongs to this sender-receiver pair
  rating = await Rating.findOne({
    _id: existing_rating_id,
    sender_id,
    receiver_id: receiver._id
  });

  if (rating) {
    // Update existing rating
    rating.rating_data = rating_data;
    rating.sender_relation = sender_relation;
    rating.updated_at = new Date();
    await rating.save();

    return res.status(200).json({
      message: 'Rating updated successfully',
      data: rating
    });
  }
}
```

So the backend was ready to handle updates, but the webapp wasn't sending the `existing_rating_id`.

## Solution

Added `updatedRatingId` to the AppContext and set it when clicking "Update Score".

### Changes Made

#### 1. Updated AppContext.tsx

**Added `updatedRatingId` state:**

```typescript
// Interface
interface AppContextType {
  // ... existing fields
  updatedRatingId: string | null;
  setUpdatedRatingId: (id: string | null) => void;
}

// State
const [updatedRatingId, setUpdatedRatingId] = useState<string | null>(null);

// Provider value
value={{
  // ... existing fields
  updatedRatingId,
  setUpdatedRatingId,
}}
```

#### 2. Updated SapiensScoredSentScreen.tsx

**Added `setUpdatedRatingId` to context destructuring:**

```typescript
const { setSelectedPerson, setSelectedRelation, setScoringData, setReceiverID, setUpdatedRatingId } = useAppContext();
```

**Set the rating ID in `handleUpdateScore`:**

```typescript
const handleUpdateScore = () => {
  if (!is24HoursPassed) {
    setShowUpdateModal(true);
    return;
  }

  // ... existing code

  // ✅ SET THE RATING ID FOR UPDATE FLOW
  setUpdatedRatingId(rating?._id || null);

  // ... rest of the code
};
```

#### 3. Updated SapienScoreScreen.tsx

**Changed import to use `createRating` from `scoreSapien.ts`:**

```typescript
// BEFORE
import { submitRating } from '@/api/ratingApi';
import { updateRating } from '@/api/scoreSapien';

// AFTER
import { createRating } from '@/api/scoreSapien';
```

**Get `updatedRatingId` from context instead of local state:**

```typescript
// BEFORE
const [updatedRatingId, setUpdatedRatingId] = useState<string | null>(null);

// AFTER
const { ..., updatedRatingId, setUpdatedRatingId } = useApp();
```

**Updated `handleShare` to use `createRating` (matching mobile app):**

```typescript
// BEFORE
const response = await submitRating({
  ...parsedData,
  receiver_id: receiverID,
  emailOrPhone: contactInfo.email || contactInfo.phone,
  relation: selectedRelation,
  sender_relation: selectedRelation,
  existing_rating_id: updatedRatingId
});

// AFTER
const response = await createRating({
  ...parsedData,
  sender_relation: selectedRelation,
  emailOrPhone: selectedPerson?.id || selectedPerson?.email || selectedPerson?.phone_number,
  existing_rating_id: updatedRatingId  // ✅ Passed for update flow
});

if (response) {
  setLoading(false);
  console.log('✅ Rating', updatedRatingId ? 'updated' : 'shared', 'successfully!');

  // Clear the updatedRatingId after successful submission
  setUpdatedRatingId(null);

  toast.success(updatedRatingId ? 'Score updated successfully!' : 'Score shared successfully!');

  setTimeout(() => {
    navigate('/share-screen');
  }, 500);
} else {
  console.log('⚠️ No response from createRating');
  setLoading(false);
}
```

## Flow Comparison

### Mobile App Flow (Correct)

1. **Sapiens You Scored** → Click "Update Score"
2. Set `updatedRatingId` = `rating._id`
3. **Scoring Flow** → Modify scores
4. **Review Screen** → Click "Share"
5. Submit with `existing_rating_id: updatedRatingId`
6. Backend **updates** existing rating
7. **Success Screen**

### Webapp Flow (Before - WRONG)

1. **Sapiens You Scored** → Click "Update Score"
2. ❌ **Missing:** Set `updatedRatingId`
3. **Scoring Flow** → Modify scores
4. **Review Screen** → Click "Share"
5. Submit **without** `existing_rating_id`
6. Backend **creates new** rating (duplicate error)
7. ❌ Error: "You have already rated this user"

### Webapp Flow (After - CORRECT)

1. **Sapiens You Scored** → Click "Update Score"
2. ✅ Set `updatedRatingId` = `rating._id`
3. **Scoring Flow** → Modify scores
4. **Review Screen** → Click "Share"
5. Submit with `existing_rating_id: updatedRatingId`
6. Backend **updates** existing rating
7. ✅ **Success Screen**

## Files Modified

1. ✅ `webapp/src/context/AppContext.tsx`
   - Added `updatedRatingId` state to interface
   - Added `setUpdatedRatingId` function to interface
   - Added state initialization
   - Added to provider value

2. ✅ `webapp/src/components/screens/SapiensScoredSentScreen.tsx`
   - Added `setUpdatedRatingId` to context destructuring
   - Set `updatedRatingId` in `handleUpdateScore` function
   - Added console logs for debugging

3. ✅ `webapp/src/components/screens/SapienScoreScreen.tsx`
   - **Changed import:** Use `createRating` from `scoreSapien.ts` instead of `submitRating` from `ratingApi.ts`
   - **Removed unused imports:** Removed `updateRating` import
   - Get `updatedRatingId` from context instead of local state
   - **Updated API call:** Use `createRating` with `existing_rating_id` parameter
   - **Simplified parameters:** Use `emailOrPhone` and `sender_relation` (matching mobile app)
   - Clear `updatedRatingId` after successful submission
   - Show different toast message for update vs create
   - Added response check (matching mobile app)

## Testing

### Test Update Flow

1. **Login** to webapp
2. **Dashboard** → Click "Sapiens You Scored"
3. **Click score card** to expand
4. **Click "Update Score"** (after 24 hours)
5. **Open DevTools Console** → Should see:
   ```
   🔄 UPDATE SCORE FLOW INITIATED
      Rating ID: 67abc123...
   ✅ Context updated with:
      - updatedRatingId: 67abc123...
   ```
6. **Scoring Flow** → Modify some scores
7. **Click "Finish"** → Navigate to Review Screen
8. **Review Screen** → Click "Share"
9. **Open DevTools Console** → Should see:
   ```
   📤 SUBMITTING RATING
      Is Update Flow: true
      Updated Rating ID: 67abc123...
   📡 Calling submitRating API...
   Data: {
     existing_rating_id: "67abc123..."
   }
   ✅ Rating updated successfully!
   ```
10. **Success Screen** → Should show "Score updated successfully!"
11. **Verify:** Check backend logs - should say "Rating updated" not "Creating new rating"

## Key Benefits

1. ✅ **No Duplicate Ratings** - Updates existing rating instead of creating new one
2. ✅ **Matches Mobile App** - Exact same flow as mobile app
3. ✅ **Better UX** - Shows "updated" vs "shared" message
4. ✅ **Backend Ready** - Backend already supported this, just needed frontend fix

