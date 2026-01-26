# Rating Flow with New Authentication System

## Overview

This document explains how the rating system works with the new password-based authentication, specifically handling the case where users can be rated **before** they register.

---

## Key Concepts

### 1. **Pending Users**
- Users who have been rated but haven't registered yet
- Created automatically when someone rates them
- Have email/phone but **NO password** (password field is `undefined`)
- Can receive ratings and notifications
- When they register, their account is "activated" and they can see all pending ratings

### 2. **Registered Users**
- Users who have completed registration with password
- Have email/phone **AND password**
- Can login and view all their ratings

---

## Rating Flow Scenarios

### Scenario 1: Rating a Registered User

**Flow:**
1. User A (logged in) wants to rate User B
2. User A enters User B's email or phone number
3. System finds User B in database (has password)
4. Rating is created with `receiver_id` = User B's ID
5. Notification is created in database
6. Push notification sent (if User B has push tokens)
7. Email sent to User B (if email was provided)
8. User B logs in and sees the rating request

**Example Request:**
```json
POST /node/api/ratings
{
  "emailOrPhone": "userb@example.com",
  "rating_data": [...],
  "sender_relation": "Friend"
}
```

---

### Scenario 2: Rating a Non-Registered User (Email)

**Flow:**
1. User A (logged in) wants to rate User C (not registered)
2. User A enters User C's email: `userc@example.com`
3. System doesn't find User C in database
4. System creates a **pending user** for User C:
   ```javascript
   {
     email: "userc@example.com",
     work_email: "userc@example.com",
     password: undefined,  // NO PASSWORD
     agreedTerms: false,
     invited: "true"
   }
   ```
5. Rating is created with `receiver_id` = User C's pending ID
6. Notification is created in database (linked to pending user ID)
7. Email sent to `userc@example.com` with invitation to register
8. User C receives email: "Someone scored you! Register to view."

**Email Content:**
```
Hello,

New score request received from [Username]

You don't have an account yet. Register now to view your score!

Register at: [Your App URL]
Use this email: userc@example.com

Once registered, you'll be able to see all the scores you've received.

Best regards,
SapienScore Team
```

**When User C Registers:**
1. User C goes to app and registers with `userc@example.com`
2. System finds existing pending user with that email
3. System updates the pending user record:
   - Sets password (hashed)
   - Sets agreedTerms = true
   - Keeps the same user ID
4. User C logs in and sees all pending ratings/notifications
5. Response includes: `hasPendingNotifications: true`

---

### Scenario 3: Rating a Non-Registered User (Phone Number)

**Flow:**
1. User A wants to rate User D (not registered)
2. User A enters User D's phone: `+1234567890`
3. System doesn't find User D in database
4. System creates a **pending user** for User D:
   ```javascript
   {
     phone_number: "+1234567890",
     password: undefined,  // NO PASSWORD
     agreedTerms: false,
     invited: "true"
   }
   ```
5. Rating is created with `receiver_id` = User D's pending ID
6. Notification is created in database
7. **NO SMS sent** (Twilio is disabled)
8. User D won't receive any notification until they register

**Important:** 
- Phone-only ratings do NOT send any notifications
- User must register to discover they've been rated
- This is by design (Twilio disabled)

**When User D Registers:**
1. User D registers with phone number `+1234567890`
2. System finds existing pending user with that phone
3. System updates the pending user record with password
4. User D logs in and sees all pending ratings

---

## API Endpoints

### Create Rating

**Endpoint:** `POST /node/api/ratings`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "emailOrPhone": "user@example.com",  // or "+1234567890"
  "rating_data": [
    {
      "topic": "Awareness & Emotional Intelligence",
      "traits": [
        { "trait": "Self-Belief", "score": 8 }
      ],
      "comment": "Great person!"
    }
  ],
  "sender_relation": "Friend",
  "existing_rating_id": "optional_rating_id"  // For updates
}
```

**Success Response (201):**
```json
{
  "message": "Rating created successfully",
  "data": {
    "_id": "rating_id",
    "sender_id": "sender_user_id",
    "receiver_id": "receiver_user_id",  // Works for both pending and registered users
    "rating_data": [...],
    "sender_relation": "Friend",
    "status": "pending",
    "created_at": "2025-10-07T...",
    "updated_at": "2025-10-07T..."
  }
}
```

---

## Registration with Pending Account

### Register Endpoint

**Endpoint:** `POST /node/api/auth/register`

**Request Body:**
```json
{
  "email": "userc@example.com",  // Email that was rated
  "password": "SecurePass123!",
  "agreedTerms": true
}
```

**Success Response (201) - Pending User Activated:**
```json
{
  "message": "Account activated successfully! You can now view your pending score requests.",
  "user": {
    "id": "user_id",  // Same ID as pending user
    "email": "userc@example.com",
    "phone_number": null,
    "username": null,
    "name": null
  },
  "token": "jwt_token",
  "hasPendingNotifications": true  // Frontend should show notifications
}
```

**Success Response (201) - New User:**
```json
{
  "message": "User registered successfully",
  "user": {...},
  "token": "jwt_token",
  "hasPendingNotifications": false
}
```

---

## Database Schema

### User Model (Pending vs Registered)

**Pending User (Created via Rating):**
```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",
  phone_number: null,
  password: undefined,  // NO PASSWORD
  agreedTerms: false,
  invited: "true",
  created_at: Date,
  updated_at: Date
}
```

**Registered User:**
```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",
  phone_number: "+1234567890",
  password: "$2b$10$hashed...",  // HAS PASSWORD
  agreedTerms: true,
  username: "cooluser",
  name: "John Doe",
  invited: "true",
  created_at: Date,
  updated_at: Date
}
```

### Rating Model

```javascript
{
  _id: ObjectId("..."),
  sender_id: ObjectId("sender_user_id"),
  receiver_id: ObjectId("receiver_user_id"),  // Can be pending or registered user
  sender_relation: "Friend",
  rating_data: [...],
  status: "pending",  // or "approved", "rejected"
  created_at: Date,
  updated_at: Date
}
```

### Notification Model

```javascript
{
  _id: ObjectId("..."),
  user_id: ObjectId("receiver_user_id"),  // Can be pending or registered user
  created_by: ObjectId("sender_user_id"),
  message: "New score request received from Username",
  type: "rating",
  is_read: false,
  created_at: Date
}
```

---

## Notification System

### For Registered Users:
1. **Push Notification** (if they have push tokens)
2. **Email Notification** (if email provided)
3. **Database Notification** (always created)

### For Pending Users:
1. **Email Notification** (if email provided) - with registration invitation
2. **Database Notification** (created, visible after registration)
3. **NO Push Notification** (no push tokens yet)
4. **NO SMS** (Twilio disabled)

---

## Frontend Implementation Guide

### After Registration

```javascript
// Check if user has pending notifications
if (response.hasPendingNotifications) {
  // Fetch notifications
  const notifications = await fetch('/node/api/notifications/my', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  // Show notification badge or modal
  showNotificationBadge(notifications.data.length);
}
```

### Creating a Rating

```javascript
const createRating = async (emailOrPhone, ratingData, relation) => {
  const response = await fetch('/node/api/ratings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      emailOrPhone,
      rating_data: ratingData,
      sender_relation: relation
    })
  });
  
  if (response.ok) {
    // Rating created successfully
    // User will be notified (if email) or see it when they register
  }
};
```

---

## Important Notes

### ✅ What Works:
- Rating users before they register
- Pending users receive email notifications (if email provided)
- Pending users see all ratings when they register
- Same user ID maintained (pending → registered)
- All notifications preserved

### ❌ What Doesn't Work:
- SMS notifications (Twilio disabled)
- Phone-only ratings don't send any notification
- Users rated by phone only won't know until they register

### 🔒 Security:
- Pending users cannot login (no password)
- Pending users cannot access API (no token)
- Ratings are safe (linked to user ID)
- When pending user registers, they get full access

---

## Migration from Old System

### Old Flow (Invite-based):
1. User created with `invited: "true"`
2. User receives OTP via Twilio/Email
3. User verifies OTP and logs in

### New Flow (Password-based):
1. User can be created as "pending" (via rating)
2. User receives email invitation
3. User registers with password
4. User logs in with password

### Backward Compatibility:
- `invited` field still exists (always "true")
- `work_email` field still used for backward compatibility
- Old users can use forgot password to set password

---

## Testing

### Test Case 1: Rate Non-Registered User (Email)
```bash
# 1. Create rating for non-registered user
curl -X POST http://localhost:5000/node/api/ratings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "newuser@example.com",
    "rating_data": [...],
    "sender_relation": "Friend"
  }'

# 2. Check email - should receive invitation
# 3. Register with that email
curl -X POST http://localhost:5000/node/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "agreedTerms": true
  }'

# Response should include: "hasPendingNotifications": true

# 4. Fetch notifications
curl -X GET http://localhost:5000/node/api/notifications/my \
  -H "Authorization: Bearer <new_token>"

# Should see the rating notification
```

---

## Support

For questions or issues, contact the development team.

