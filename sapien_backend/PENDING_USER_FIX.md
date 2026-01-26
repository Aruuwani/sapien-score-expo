# Pending User Registration Fix

## Problem Statement

When a user (User A) rates another user (User B) who doesn't have an account yet, the system creates a "pending user" entry for User B with their email or phone number but no password.

**The Issue**: When User B later tries to sign up with their email/phone and password, the system was creating a NEW user entry instead of updating the existing pending user entry, resulting in:
- Duplicate user entries in the database
- User B losing access to their pending ratings
- Broken relationships between ratings and users

---

## Root Cause

The signup logic had the following issues:

1. **Incomplete field updates**: When a pending user (created with email only) signed up with both email AND phone, the phone number wasn't being added to their existing record.

2. **Missing backward compatibility**: The system wasn't properly handling the `work_email` field used in older versions.

3. **Insufficient logging**: No visibility into whether the pending user activation flow was working correctly.

---

## Solution

### 1. **Enhanced Pending User Detection**

**File**: `sapien_backend/services/auth.service.js`

The system now properly searches for existing users across all identifier fields:

```javascript
const queryConditions = [];
if (email) {
    queryConditions.push({ email });
    queryConditions.push({ work_email: email }); // Backward compatibility
}
if (phone_number) {
    queryConditions.push({ phone_number });
}

const existingUser = await User.findOne({ $or: queryConditions });
```

### 2. **Improved Field Updates**

When a pending user is found, the system now:

**Before** (Problematic):
```javascript
// Only updated if field was missing
if (email && !existingUser.email) {
    existingUser.email = email;
}
if (phone_number && !existingUser.phone_number) {
    existingUser.phone_number = phone_number;
}
```

**After** (Fixed):
```javascript
// Always update provided fields
if (email) {
    existingUser.email = email;
    // Also update work_email for backward compatibility
    if (!existingUser.work_email) {
        existingUser.work_email = email;
    }
}

if (phone_number) {
    existingUser.phone_number = phone_number;
}
```

This handles all scenarios:
- ✅ User created with email, signs up with email + phone
- ✅ User created with phone, signs up with email + phone
- ✅ User created with work_email, signs up with email field
- ✅ User created with email, signs up with same email (no change)

### 3. **Added Comprehensive Logging**

```javascript
// Log when existing user is found
if (existingUser) {
    console.log('Found existing user:', {
        id: existingUser._id,
        email: existingUser.email,
        work_email: existingUser.work_email,
        phone_number: existingUser.phone_number,
        hasPassword: !!existingUser.password,
        isPending: !existingUser.password
    });
}

// Log when activating pending user
console.log('🔄 Activating pending user account:', {
    userId: existingUser._id,
    existingEmail: existingUser.email,
    existingWorkEmail: existingUser.work_email,
    existingPhone: existingUser.phone_number,
    newEmail: email,
    newPhone: phone_number
});

// Log successful activation
console.log('✅ Pending user activated successfully:', {
    userId: updatedUser._id,
    email: updatedUser.email,
    phone: updatedUser.phone_number,
    hasPassword: !!updatedUser.password
});
```

---

## Flow Diagrams

### **Scenario 1: User rated via EMAIL, signs up with EMAIL + PHONE**

```
Step 1: User A rates User B (pending.user@test.com)
┌─────────────────────────────────────────────────┐
│ Rating System creates pending user:             │
│ - email: "pending.user@test.com"                │
│ - work_email: "pending.user@test.com"           │
│ - phone_number: undefined                       │
│ - password: undefined                           │
│ - agreedTerms: false                            │
└─────────────────────────────────────────────────┘
                      ↓
Step 2: User B signs up with email + phone
┌─────────────────────────────────────────────────┐
│ Signup request:                                 │
│ - email: "pending.user@test.com"                │
│ - phone_number: "+919876543210"                 │
│ - password: "SecurePass123"                     │
│ - agreedTerms: true                             │
└─────────────────────────────────────────────────┘
                      ↓
Step 3: System finds existing user by email
┌─────────────────────────────────────────────────┐
│ Query: { $or: [                                 │
│   { email: "pending.user@test.com" },           │
│   { work_email: "pending.user@test.com" }       │
│   { phone_number: "+919876543210" }             │
│ ]}                                              │
│ Result: Found existing user (no password)       │
└─────────────────────────────────────────────────┘
                      ↓
Step 4: Update existing user (NOT create new)
┌─────────────────────────────────────────────────┐
│ Updated user:                                   │
│ - email: "pending.user@test.com"                │
│ - work_email: "pending.user@test.com"           │
│ - phone_number: "+919876543210" ← ADDED         │
│ - password: "hashed..." ← ADDED                 │
│ - agreedTerms: true ← UPDATED                   │
│ - isPendingUserActivated: true                  │
└─────────────────────────────────────────────────┘
```

### **Scenario 2: User rated via PHONE, signs up with EMAIL + PHONE**

```
Step 1: User A rates User B (+919876543210)
┌─────────────────────────────────────────────────┐
│ Rating System creates pending user:             │
│ - email: undefined                              │
│ - work_email: undefined                         │
│ - phone_number: "+919876543210"                 │
│ - password: undefined                           │
│ - agreedTerms: false                            │
└─────────────────────────────────────────────────┘
                      ↓
Step 2: User B signs up with email + phone
┌─────────────────────────────────────────────────┐
│ Signup request:                                 │
│ - email: "pending.user@test.com"                │
│ - phone_number: "+919876543210"                 │
│ - password: "SecurePass123"                     │
│ - agreedTerms: true                             │
└─────────────────────────────────────────────────┘
                      ↓
Step 3: System finds existing user by phone
┌─────────────────────────────────────────────────┐
│ Query: { $or: [                                 │
│   { email: "pending.user@test.com" },           │
│   { work_email: "pending.user@test.com" }       │
│   { phone_number: "+919876543210" }             │
│ ]}                                              │
│ Result: Found existing user (no password)       │
└─────────────────────────────────────────────────┘
                      ↓
Step 4: Update existing user (NOT create new)
┌─────────────────────────────────────────────────┐
│ Updated user:                                   │
│ - email: "pending.user@test.com" ← ADDED        │
│ - work_email: "pending.user@test.com" ← ADDED   │
│ - phone_number: "+919876543210"                 │
│ - password: "hashed..." ← ADDED                 │
│ - agreedTerms: true ← UPDATED                   │
│ - isPendingUserActivated: true                  │
└─────────────────────────────────────────────────┘
```

---

## Testing

### **Automated Test Script**

Run the test script to verify the fix:

```bash
cd sapien_backend
node test_pending_user_flow.js
```

**Expected Output**:
```
✅ Connected to MongoDB

═══════════════════════════════════════════════════════
TEST CASE 1: Pending user created with EMAIL
═══════════════════════════════════════════════════════

Step 1: Creating pending user (via rating flow)...
✅ Pending user created: { id: '...', email: 'pending.user@test.com', phone: undefined, hasPassword: false }

Step 2: User signing up with email + phone...
🔄 Activating pending user account: { ... }
✅ Pending user activated successfully: { ... }
✅ Signup result: { isPendingUserActivated: true, ... }

Step 3: Verifying no duplicate users...
Found 1 user(s) with this email/phone
✅ SUCCESS: No duplicate users created!

═══════════════════════════════════════════════════════
TEST CASE 2: Pending user created with PHONE
═══════════════════════════════════════════════════════

[Similar output for phone-based pending user]

✅ Test data cleaned up

═══════════════════════════════════════════════════════
ALL TESTS COMPLETED
═══════════════════════════════════════════════════════
```

### **Manual Testing**

1. **Create a pending user via rating**:
   ```bash
   curl -X POST http://localhost:5000/node/api/ratings \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "emailOrPhone": "newuser@test.com",
       "rating_data": {
         "communication": 4,
         "reliability": 5,
         "quality": 4,
         "professionalism": 5
       },
       "sender_relation": "colleague"
     }'
   ```

2. **Check database** - verify pending user was created:
   ```javascript
   db.users.findOne({ email: "newuser@test.com" })
   // Should show: password: undefined
   ```

3. **Sign up with that email**:
   ```bash
   curl -X POST http://localhost:5000/node/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "newuser@test.com",
       "phone_number": "+919876543210",
       "password": "TestPassword123",
       "agreedTerms": true
     }'
   ```

4. **Verify response**:
   ```json
   {
     "success": true,
     "message": "Account activated successfully! You can now view your pending score requests.",
     "user": {
       "id": "...",
       "email": "newuser@test.com",
       "phone_number": "+919876543210"
     },
     "token": "..."
   }
   ```

5. **Check database again**:
   ```javascript
   db.users.find({ email: "newuser@test.com" }).count()
   // Should return: 1 (not 2!)
   
   db.users.findOne({ email: "newuser@test.com" })
   // Should show: password: "hashed...", phone_number: "+919876543210"
   ```

---

## Database Schema

### **Pending User** (Created via Rating)
```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",        // OR
  phone_number: "+919876543210",    // OR both
  work_email: "user@example.com",   // Backward compatibility
  password: undefined,              // ← KEY: No password
  agreedTerms: false,
  invited: "true",
  createdAt: ISODate("...")
}
```

### **Activated User** (After Signup)
```javascript
{
  _id: ObjectId("..."),             // ← SAME ID (not new)
  email: "user@example.com",
  phone_number: "+919876543210",
  work_email: "user@example.com",
  password: "$2b$10$...",            // ← ADDED
  agreedTerms: true,                // ← UPDATED
  invited: "true",
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")         // ← UPDATED
}
```

---

## API Response

### **Successful Pending User Activation**

```json
{
  "success": true,
  "message": "Account activated successfully! You can now view your pending score requests.",
  "user": {
    "id": "67abc123...",
    "email": "user@example.com",
    "phone_number": "+919876543210",
    "username": null,
    "name": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note**: The message is different from regular signup to inform the user they had pending ratings.

---

## Files Modified

1. **`sapien_backend/services/auth.service.js`**
   - Enhanced pending user detection query
   - Improved field update logic
   - Added comprehensive logging

2. **`sapien_backend/test_pending_user_flow.js`** (NEW)
   - Automated test script for pending user flow

3. **`sapien_backend/PENDING_USER_FIX.md`** (NEW)
   - This documentation file

---

## Benefits

✅ **No Duplicate Users**: System correctly updates existing pending users instead of creating duplicates

✅ **Complete Profile**: Users get both email AND phone added to their profile during signup

✅ **Preserved Ratings**: Users can access all ratings they received before signing up

✅ **Better UX**: Users see a special message acknowledging their pending ratings

✅ **Backward Compatible**: Works with both `email` and `work_email` fields

✅ **Observable**: Comprehensive logging makes it easy to debug issues

---

## Monitoring

Check server logs for these messages:

**When pending user is found**:
```
Found existing user: {
  id: '67abc...',
  email: 'user@example.com',
  work_email: 'user@example.com',
  phone_number: null,
  hasPassword: false,
  isPending: true
}
```

**When activating pending user**:
```
🔄 Activating pending user account: {
  userId: '67abc...',
  existingEmail: 'user@example.com',
  existingWorkEmail: 'user@example.com',
  existingPhone: null,
  newEmail: 'user@example.com',
  newPhone: '+919876543210'
}
```

**When activation succeeds**:
```
✅ Pending user activated successfully: {
  userId: '67abc...',
  email: 'user@example.com',
  phone: '+919876543210',
  hasPassword: true
}
```

---

## Edge Cases Handled

1. ✅ User created with email, signs up with email + phone
2. ✅ User created with phone, signs up with email + phone
3. ✅ User created with work_email, signs up with email field
4. ✅ User created with email, signs up with same email only
5. ✅ User created with phone, signs up with same phone only
6. ✅ Multiple ratings to same pending user before they sign up
7. ✅ Backward compatibility with old `work_email` field

---

## Future Enhancements

1. **Notification**: Send email/SMS to pending users informing them they've been rated
2. **Dashboard**: Show pending users in admin panel
3. **Analytics**: Track conversion rate of pending users to registered users
4. **Cleanup**: Periodic cleanup of old pending users who never registered

---

**Status**: ✅ Fixed and tested
**Last Updated**: January 2025

