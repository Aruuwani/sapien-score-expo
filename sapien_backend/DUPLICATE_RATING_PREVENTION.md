# Duplicate Rating Prevention

## Overview

This document describes the implementation of duplicate rating prevention, ensuring that a user can only rate another user **once per relation type**.

---

## Business Rules

### ✅ **Allowed**
- User A can rate User B as "friend" → **Once**
- User A can rate User B as "colleague" → **Once**
- User A can rate User B as "family" → **Once**
- User A can rate User B as "other" → **Once**

### ❌ **Not Allowed**
- User A rates User B as "friend" → ✅ Allowed
- User A rates User B as "friend" **again** → ❌ **Blocked**

### 🔄 **Special Cases**
- If a rating is **rejected** or **blocked**, the user can submit a new rating with the same relation
- Only **pending** and **approved** ratings count toward the uniqueness constraint

---

## Implementation

### 1. Database Level (Compound Unique Index)

**File**: `sapien_backend/models/Rating.model.js`

A compound unique index ensures database-level enforcement:

```javascript
ratingSchema.index(
  { 
    sender_id: 1, 
    receiver_id: 1, 
    sender_relation: 1 
  }, 
  { 
    unique: true,
    partialFilterExpression: { 
      status: { $in: ['pending', 'approved'] } 
    }
  }
);
```

**How it works**:
- Creates a unique constraint on the combination of `sender_id`, `receiver_id`, and `sender_relation`
- Only applies to ratings with status `pending` or `approved`
- Rejected/blocked ratings don't count toward uniqueness
- MongoDB will throw error code `11000` if duplicate is attempted

---

### 2. Application Level (Pre-Check)

**File**: `sapien_backend/controllers/rating.controller.js`

Before creating a new rating, check if one already exists:

```javascript
const createRating = async (req, res) => {
    const sender_id = req.userId;
    const { emailOrPhone, rating_data, sender_relation } = req.body;

    // ... find or create receiver ...

    // Check if user has already rated this receiver with the same relation
    const existingRating = await Rating.findOne({
      sender_id,
      receiver_id: receiver._id,
      sender_relation,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingRating) {
      console.log('⚠️ Duplicate rating attempt blocked:', {
        sender: sender_id,
        receiver: receiver._id,
        relation: sender_relation,
        existingRatingId: existingRating._id
      });
      
      return res.status(400).json({
        error: 'You have already rated this user with this relation',
        message: `You have already rated this user as "${sender_relation}". You can only rate once per relation type.`,
        alreadyScored: true,
        existingRating: existingRating
      });
    }

    // Create new rating...
};
```

**Benefits**:
- Returns user-friendly error message
- Prevents unnecessary database operation
- Logs duplicate attempts for monitoring
- Returns existing rating details

---

### 3. Frontend Check (AlreadyScored API)

**Endpoint**: `GET /node/api/ratings/already-scored`

**Query Parameters**:
- `receiver_id`: ID of the user being rated
- `sender_relation`: Relation type (e.g., "friend", "colleague")

**Response**:
```json
{
  "alreadyScored": true,
  "existingRating": {
    "_id": "67abc123...",
    "sender_id": "67def456...",
    "receiver_id": "67ghi789...",
    "sender_relation": "friend",
    "status": "pending",
    "rating_data": [...]
  }
}
```

**Usage in Frontend**:
```typescript
// Before showing rating form
const checkIfAlreadyScored = async (receiverId: string, relation: string) => {
  const response = await fetch(
    `/node/api/ratings/already-scored?receiver_id=${receiverId}&sender_relation=${relation}`
  );
  const data = await response.json();
  
  if (data.alreadyScored) {
    // Show message: "You have already rated this user as [relation]"
    // Optionally show "Edit Rating" button instead of "Submit"
  }
};
```

---

## Error Handling

### **Scenario 1: Application-Level Check**

**Request**:
```bash
POST /node/api/ratings
{
  "emailOrPhone": "user@example.com",
  "sender_relation": "friend",
  "rating_data": [...]
}
```

**Response** (if duplicate):
```json
{
  "error": "You have already rated this user with this relation",
  "message": "You have already rated this user as \"friend\". You can only rate once per relation type.",
  "alreadyScored": true,
  "existingRating": {
    "_id": "67abc123...",
    "sender_relation": "friend",
    "status": "pending"
  }
}
```

**HTTP Status**: `400 Bad Request`

---

### **Scenario 2: Database-Level Enforcement**

If the application-level check is bypassed (shouldn't happen), MongoDB will enforce the constraint:

**Error**:
```javascript
{
  code: 11000,
  message: "E11000 duplicate key error collection: sapien.ratings index: sender_id_1_receiver_id_1_sender_relation_1 dup key: { sender_id: ObjectId('...'), receiver_id: ObjectId('...'), sender_relation: \"friend\" }"
}
```

**HTTP Status**: `500 Internal Server Error` (should be caught and converted to 400)

---

## User Flow Examples

### **Example 1: First Rating**

```
User A wants to rate User B as "friend"
         ↓
Frontend calls AlreadyScored API
         ↓
Response: { alreadyScored: false }
         ↓
Show rating form
         ↓
User submits rating
         ↓
Backend creates rating
         ↓
Success! ✅
```

---

### **Example 2: Duplicate Attempt**

```
User A wants to rate User B as "friend" (again)
         ↓
Frontend calls AlreadyScored API
         ↓
Response: { alreadyScored: true, existingRating: {...} }
         ↓
Show message: "You have already rated this user as friend"
         ↓
Show "Edit Rating" button instead of "Submit"
         ↓
User clicks "Edit Rating"
         ↓
Backend updates existing rating (not create new)
         ↓
Success! ✅
```

---

### **Example 3: Different Relation**

```
User A wants to rate User B as "colleague"
(User A already rated User B as "friend")
         ↓
Frontend calls AlreadyScored API with relation="colleague"
         ↓
Response: { alreadyScored: false }
         ↓
Show rating form
         ↓
User submits rating
         ↓
Backend creates new rating
         ↓
Success! ✅
         ↓
User A now has 2 ratings for User B:
  - Rating 1: relation="friend"
  - Rating 2: relation="colleague"
```

---

## Testing

### **Automated Test**

Run the test script:
```bash
cd sapien_backend
node test_duplicate_rating_prevention.js
```

**Expected Output**:
```
✅ Connected to MongoDB

═══════════════════════════════════════════════════════
TEST CASE 1: First rating with "friend" relation
═══════════════════════════════════════════════════════
✅ First rating created successfully

═══════════════════════════════════════════════════════
TEST CASE 2: Attempt duplicate rating with "friend" relation
═══════════════════════════════════════════════════════
✅ SUCCESS: Duplicate rating blocked by database index

═══════════════════════════════════════════════════════
TEST CASE 3: Create rating with "colleague" relation
═══════════════════════════════════════════════════════
✅ Second rating created successfully

═══════════════════════════════════════════════════════
ALL TESTS COMPLETED SUCCESSFULLY! 🎉
═══════════════════════════════════════════════════════

Summary:
✅ User can rate another user once per relation type
✅ Duplicate ratings with same relation are blocked
✅ User can rate same user with different relations
✅ Rejected ratings allow new ratings with same relation
```

---

### **Manual Testing**

#### **Test 1: Create First Rating**

```bash
curl -X POST http://localhost:5000/node/api/ratings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "emailOrPhone": "receiver@test.com",
    "sender_relation": "friend",
    "rating_data": [
      {
        "topic": "Communication",
        "traits": [{"trait": "Clarity", "score": 8}]
      }
    ]
  }'
```

**Expected**: `201 Created` with rating details

---

#### **Test 2: Attempt Duplicate**

```bash
curl -X POST http://localhost:5000/node/api/ratings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "emailOrPhone": "receiver@test.com",
    "sender_relation": "friend",
    "rating_data": [
      {
        "topic": "Communication",
        "traits": [{"trait": "Clarity", "score": 9}]
      }
    ]
  }'
```

**Expected**: `400 Bad Request` with error message

---

#### **Test 3: Different Relation**

```bash
curl -X POST http://localhost:5000/node/api/ratings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "emailOrPhone": "receiver@test.com",
    "sender_relation": "colleague",
    "rating_data": [
      {
        "topic": "Professionalism",
        "traits": [{"trait": "Reliability", "score": 9}]
      }
    ]
  }'
```

**Expected**: `201 Created` with rating details

---

## Database Schema

### **Rating Document**

```javascript
{
  _id: ObjectId("67abc123..."),
  sender_id: ObjectId("67def456..."),
  receiver_id: ObjectId("67ghi789..."),
  sender_relation: "friend",  // ← Part of unique constraint
  rating_data: [...],
  status: "pending",  // ← Only 'pending' and 'approved' count
  created_at: ISODate("2025-01-15T10:00:00Z"),
  updated_at: ISODate("2025-01-15T10:00:00Z")
}
```

### **Unique Constraint**

```
Index: sender_id_1_receiver_id_1_sender_relation_1
Unique: true
Partial Filter: { status: { $in: ['pending', 'approved'] } }
```

**Allowed combinations** (for same sender-receiver pair):
- ✅ `{ sender_relation: "friend", status: "pending" }`
- ✅ `{ sender_relation: "colleague", status: "pending" }`
- ✅ `{ sender_relation: "family", status: "pending" }`
- ✅ `{ sender_relation: "friend", status: "rejected" }` + `{ sender_relation: "friend", status: "pending" }`

**Blocked combinations**:
- ❌ `{ sender_relation: "friend", status: "pending" }` + `{ sender_relation: "friend", status: "pending" }`
- ❌ `{ sender_relation: "friend", status: "approved" }` + `{ sender_relation: "friend", status: "pending" }`

---

## Monitoring

### **Backend Logs**

**Duplicate attempt blocked**:
```
⚠️ Duplicate rating attempt blocked: {
  sender: '67def456...',
  receiver: '67ghi789...',
  relation: 'friend',
  existingRatingId: '67abc123...'
}
```

**New rating created**:
```
✅ Creating new rating: {
  sender: '67def456...',
  receiver: '67ghi789...',
  relation: 'colleague',
  status: 'pending'
}
```

**Rating updated**:
```
✅ Rating updated: {
  ratingId: '67abc123...',
  sender: '67def456...',
  receiver: '67ghi789...',
  relation: 'friend'
}
```

---

## Files Modified

1. ✅ `sapien_backend/models/Rating.model.js` (Already had unique index)
2. ✅ `sapien_backend/controllers/rating.controller.js` (Added duplicate check)
3. ✅ `sapien_backend/test_duplicate_rating_prevention.js` (NEW - Test script)
4. ✅ `sapien_backend/DUPLICATE_RATING_PREVENTION.md` (NEW - This file)

---

## Benefits

✅ **Data Integrity**: Prevents duplicate ratings at database level  
✅ **User Experience**: Clear error messages guide users  
✅ **Flexibility**: Users can rate same person with different relations  
✅ **Logging**: Track duplicate attempts for analytics  
✅ **Performance**: Application-level check prevents unnecessary DB operations  

---

**Status**: ✅ Implemented and tested  
**Last Updated**: January 2025

