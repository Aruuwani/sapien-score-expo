# Update Score Fix - Relation ID vs Relation Name

## Problem

When clicking "Update Score" in the Sapiens You Scored screen, the following error occurred:

```json
{
  "error": "Cast to ObjectId failed for value \"friend\" (type string) at path \"_id\" for model \"Relation\""
}
```

**Error URL**: `https://sapio.one/node/api/relations/friend`

## Root Cause

The webapp was using the **relation name** (e.g., "friend") instead of the **relation ID** (ObjectId) when setting the selected relation for the update flow.

### Code Analysis

**Rating Object Structure** (from backend):
```javascript
{
  _id: "rating_id",
  sender_id: "user_id",
  receiver_id: "user_id",
  sender_relation: "relation_id",        // ← This is the ID (ObjectId)
  sender_relation_name: "friend",        // ← This is the name (string)
  rating_data: [...],
  status: "approved",
  created_at: "2024-01-01",
  updated_at: "2024-01-01"
}
```

**Webapp Code (BEFORE - WRONG):**
```typescript
// Line 105 in SapiensScoredSentScreen.tsx
setSelectedRelation(rating?.sender_relation_name || null);  // ❌ Using NAME
```

This caused the scoring flow to try to fetch relation details using the name "friend" as an ID:
```
GET /relations/friend  // ❌ WRONG - "friend" is not a valid ObjectId
```

**Mobile App Code (CORRECT):**
```typescript
// Line 522 in mobile app's SapiensScoredSentScreen.tsx
relationId={item?.sender_relation}  // ✅ Using ID
```

## Solution Applied

Changed the webapp to use `sender_relation` (ID) instead of `sender_relation_name` (name):

**Webapp Code (AFTER - CORRECT):**
```typescript
// Line 106 in SapiensScoredSentScreen.tsx
setSelectedRelation(rating?.sender_relation || null);  // ✅ Using ID
```

Now the scoring flow will correctly fetch relation details:
```
GET /relations/{relation_id}  // ✅ CORRECT - valid ObjectId
```

## Files Modified

1. ✅ `webapp/src/components/screens/SapiensScoredSentScreen.tsx` (Line 106)

## Testing

After applying the fix, test the following:

1. **Navigate to Dashboard → Sapiens You Scored**
2. **Click on a score card** to expand it
3. **Wait 24 hours** (or modify the date in DB for testing)
4. **Click "Update Score"** button
5. **Expected Result**: 
   - ✅ Should navigate to scoring flow
   - ✅ Should pre-fill person data
   - ✅ Should pre-fill relation (showing relation name in UI)
   - ✅ Should pre-fill rating data
   - ✅ No error about "Cast to ObjectId failed"

## Key Learnings

### Relation Data Structure

- **`sender_relation`**: The relation **ID** (ObjectId) - used for API calls
- **`sender_relation_name`**: The relation **name** (string) - used for display only

### When to Use Each

- **For API calls**: Always use `sender_relation` (ID)
- **For display**: Use `sender_relation_name` (name)
- **For context/state**: Use `sender_relation` (ID) - the UI components will fetch the name

### Mobile App Pattern

The mobile app consistently uses `sender_relation` (ID) for:
- Setting selected relation in context
- Passing to scoring flow
- API calls to fetch relation details

The webapp should follow the same pattern.

## Related Code

### Backend Controller (GetWhomIScored)

```javascript
// sapien_backend/controllers/rating.controller.js (lines 680-695)
const ratingsWithRelations = await Promise.all(ratings.map(async (rating) => {
  // Case 1: sender_relation is already a string name (like "Family")
  if (typeof rating.sender_relation === 'string' &&
    !mongoose.Types.ObjectId.isValid(rating.sender_relation)) {
    return {
      ...rating.toObject ? rating.toObject() : rating,
      sender_relation_name: rating.sender_relation  // Name for display
    };
  }
  
  // Case 2: sender_relation is an ObjectId - fetch the relation name
  // ... (fetches relation from DB and adds sender_relation_name)
}));
```

The backend ensures both fields are available:
- `sender_relation`: Original ID (for API calls)
- `sender_relation_name`: Resolved name (for display)

