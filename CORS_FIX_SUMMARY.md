# CORS Fix Summary - Rating Status Update

## Problem

When trying to update rating status (Block, Accept, Reject, Unblock) in the webapp, the following CORS error occurred:

```
Access to XMLHttpRequest at 'https://sapio.one/node/api/ratings/{ratingId}/status' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
Method PATCH is not allowed by Access-Control-Allow-Methods in preflight response.
```

## Root Cause

1. **Backend Route**: The rating status update endpoint used `PATCH` method:
   ```javascript
   router.patch('/:ratingId/status', authMiddleware, ratingController.updateStatus);
   ```

2. **Production Server CORS**: The production server at `https://sapio.one` had CORS configuration that only allowed:
   ```javascript
   'Access-Control-Allow-Methods': 'PUT, POST, DELETE, GET'
   ```
   **PATCH was missing!**

3. **Webapp API Call**: The webapp was using `PATCH`:
   ```typescript
   const response = await apiClient.patch(`/ratings/${ratingId}/status`, { status });
   ```

## Solution Applied

### Option 1: Update Local Backend CORS (For Development)

Updated `sapien_backend/app.js` line 72 to include PATCH:

```javascript
// Before
res.header('Access-Control-Allow-Methods', 'PUT, POST, DELETE, GET');

// After
res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
```

### Option 2: Use PUT Instead of PATCH (For Production Compatibility)

Since the production server allows PUT, we changed the webapp to use PUT:

**1. Updated `webapp/src/api/ratingApi.ts`:**
```typescript
// Changed from PATCH to PUT
export const updateRatingStatus = async (ratingId: string, status: string) => {
  const response = await apiClient.put(`/ratings/${ratingId}/status`, { status });
  return response.data;
};
```

**2. Updated `sapien_backend/routes/rating.routes.js`:**
```javascript
// Support both PATCH and PUT for CORS compatibility
router.patch('/:ratingId/status', authMiddleware, ratingController.updateStatus);
router.put('/:ratingId/status', authMiddleware, ratingController.updateStatus);
```

## Files Modified

1. ✅ `sapien_backend/app.js` - Added PATCH to CORS allowed methods
2. ✅ `webapp/src/api/ratingApi.ts` - Changed PATCH to PUT
3. ✅ `sapien_backend/routes/rating.routes.js` - Added PUT route alongside PATCH

## Testing

After applying the fix, test the following:

1. **Dashboard → Scores Received → Block**
   - Click Block button → Confirm → Should work without CORS error

2. **Dashboard → Requests → Accept/Reject/Block**
   - Click Accept → Confirm → Should work ✅
   - Click Reject → Confirm → Should work ✅
   - Click Block → Confirm → Should work ✅

3. **Dashboard → Blocked → Unblock**
   - Click Un-Block → Confirm → Should work ✅

## Production Deployment

To fully fix this on production, you need to:

1. **Deploy updated `app.js`** to `https://sapio.one` with PATCH in CORS allowed methods
2. **Deploy updated `rating.routes.js`** to support both PATCH and PUT

OR

Just deploy the current solution which uses PUT (already allowed by production CORS).

## Notes

- PUT and PATCH are semantically different (PUT = replace, PATCH = partial update)
- For this use case (updating only the status field), both work fine
- The backend controller `updateStatus` works with both methods
- Using PUT ensures compatibility with current production CORS configuration

