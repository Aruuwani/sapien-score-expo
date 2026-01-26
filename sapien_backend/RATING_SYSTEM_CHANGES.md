# Rating System Changes - Summary

## Date: 2025-10-07

## Overview
Updated the rating system to work with the new password-based authentication while maintaining the ability to rate users before they register.

---

## Problem Statement

**Old System:**
- Users could only login via OTP (Twilio/Email)
- Users were created with `invited: "true"` when rated
- Twilio sent SMS notifications for phone ratings
- Users could login immediately after being rated

**New System:**
- Users must register with password
- How do we handle rating non-registered users?
- How do we link ratings to users who register later?
- Twilio is disabled - no SMS notifications

---

## Solution: Pending Users

### Concept
When a user is rated but hasn't registered yet, we create a **"pending user"** entry:
- Has email/phone number
- Has **NO password** (password = undefined)
- Can receive ratings (has user ID)
- Can receive notifications (stored in database)
- Cannot login (no password)

When the user registers:
- System finds the pending user by email/phone
- Updates the same user record with password
- User ID remains the same
- All ratings and notifications are preserved
- User can now login and see everything

---

## Files Modified

### 1. **User Model** (`models/user.model.js`)
**Changes:**
- Made `password` field optional (required: false)
- Allows pending users without passwords

**Before:**
```javascript
password: {
  type: String,
  required: true
}
```

**After:**
```javascript
password: {
  type: String,
  required: false,  // Pending users won't have password
  default: undefined
}
```

---

### 2. **Rating Controller** (`controllers/rating.controller.js`)

**Changes:**
- Updated `createRating()` to create pending users
- Disabled Twilio SMS notifications
- Enhanced email notifications with registration invitation
- Updated `updateRating()` to use email only

**Key Changes:**

#### Creating Pending Users:
```javascript
// Find or create receiver
let receiver = await User.findOne({
  $or: [
    { email: emailOrPhone }, 
    { work_email: emailOrPhone }, 
    { phone_number: emailOrPhone }
  ],
});

if (!receiver) {
  // Create pending user
  const isEmail = emailOrPhone.includes('@');
  
  receiver = await User.create({
    email: isEmail ? emailOrPhone : undefined,
    phone_number: !isEmail ? emailOrPhone : undefined,
    work_email: isEmail ? emailOrPhone : undefined,
    password: undefined,  // NO PASSWORD
    agreedTerms: false,
    invited: 'true',
  });
}
```

#### Email Notifications:
```javascript
// Send email ONLY if email is provided
if (emailOrPhone.includes('@')) {
  const emailContent = receiver.password ? 
    'Login to view your score' : 
    'Register now to view your score!';
    
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: emailOrPhone,
    subject: 'New Sapien Score Request',
    text: emailContent,
  });
}
// NO SMS for phone numbers (Twilio disabled)
```

---

### 3. **Auth Service** (`services/auth.service.js`)

**Changes:**
- Updated `register()` to detect and activate pending users
- Preserves user ID when activating pending accounts
- Returns flag indicating pending user activation

**Key Logic:**
```javascript
const existingUser = await User.findOne({ $or: queryConditions });

if (existingUser) {
  // Check if this is a pending user (no password)
  if (!existingUser.password) {
    // Activate pending user
    existingUser.password = hashedPassword;
    existingUser.agreedTerms = agreedTerms;
    existingUser.email = email;
    existingUser.phone_number = phone_number;
    
    const updatedUser = await existingUser.save();
    
    return { 
      user: updatedUser,
      token: generateToken(updatedUser),
      isPendingUserActivated: true  // Flag for frontend
    };
  }
  
  // User already registered
  throw new Error('Email already registered');
}

// Create new user...
```

---

### 4. **Auth Controller** (`controllers/auth.controller.js`)

**Changes:**
- Updated registration response to indicate pending user activation
- Provides `hasPendingNotifications` flag for frontend

**Response:**
```javascript
res.status(201).json({
  message: result.isPendingUserActivated 
    ? 'Account activated successfully! You can now view your pending score requests.'
    : 'User registered successfully',
  user: result.user,
  token: result.token,
  hasPendingNotifications: result.isPendingUserActivated
});
```

---

## Flow Diagrams

### Flow 1: Rating a Non-Registered User (Email)

```
User A rates "newuser@example.com"
         ↓
System checks if user exists
         ↓
User NOT found
         ↓
Create pending user:
  - email: "newuser@example.com"
  - password: undefined
  - agreedTerms: false
         ↓
Create rating with receiver_id = pending user ID
         ↓
Create notification in database
         ↓
Send email: "Someone scored you! Register to view."
         ↓
[Later] User registers with "newuser@example.com"
         ↓
System finds pending user
         ↓
Update pending user:
  - password: hashed password
  - agreedTerms: true
  - SAME user ID
         ↓
User logs in
         ↓
User sees all pending ratings and notifications
```

### Flow 2: Rating a Non-Registered User (Phone)

```
User A rates "+1234567890"
         ↓
System checks if user exists
         ↓
User NOT found
         ↓
Create pending user:
  - phone_number: "+1234567890"
  - password: undefined
         ↓
Create rating with receiver_id = pending user ID
         ↓
Create notification in database
         ↓
NO EMAIL/SMS sent (phone only, Twilio disabled)
         ↓
[Later] User registers with "+1234567890"
         ↓
System finds pending user
         ↓
Update pending user with password
         ↓
User logs in and discovers ratings
```

---

## Notification Strategy

### For Email Ratings:
✅ Email sent with registration invitation
✅ Database notification created
✅ Push notification (if registered user)
❌ No SMS

### For Phone Ratings:
❌ No email (no email address)
❌ No SMS (Twilio disabled)
✅ Database notification created
✅ User discovers ratings when they register

---

## Breaking Changes

### ❌ Removed:
- Twilio SMS notifications for ratings
- Automatic SMS to phone-only ratings

### ✅ Added:
- Pending user system
- Email invitations for non-registered users
- Automatic account activation on registration
- `hasPendingNotifications` flag in registration response

### 🔄 Changed:
- User model: password is now optional
- Rating creation: creates pending users
- Registration: activates pending users

---

## Database Impact

### New User States:

**State 1: Pending User (Rated but Not Registered)**
```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",
  password: undefined,  // KEY DIFFERENCE
  agreedTerms: false,
  invited: "true"
}
```

**State 2: Registered User**
```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",
  password: "$2b$10$...",  // HAS PASSWORD
  agreedTerms: true,
  invited: "true"
}
```

### Data Integrity:
- ✅ User ID preserved (pending → registered)
- ✅ All ratings preserved
- ✅ All notifications preserved
- ✅ No data loss

---

## Testing Checklist

### Test Scenarios:

- [ ] Rate a non-registered user with email
  - [ ] Pending user created
  - [ ] Email received with invitation
  - [ ] Rating created successfully
  - [ ] Notification created in database

- [ ] Rate a non-registered user with phone
  - [ ] Pending user created
  - [ ] No email/SMS sent
  - [ ] Rating created successfully
  - [ ] Notification created in database

- [ ] Register with email that was rated
  - [ ] Pending user found
  - [ ] Password set successfully
  - [ ] Same user ID maintained
  - [ ] Response includes `hasPendingNotifications: true`
  - [ ] Can fetch notifications
  - [ ] Can see ratings

- [ ] Register with phone that was rated
  - [ ] Pending user found
  - [ ] Password set successfully
  - [ ] Can see ratings

- [ ] Rate a registered user
  - [ ] Rating created
  - [ ] Email sent
  - [ ] Push notification sent (if tokens exist)
  - [ ] Database notification created

---

## Frontend Changes Needed

### 1. Registration Screen
```javascript
// After successful registration
if (response.hasPendingNotifications) {
  // Show message: "You have pending score requests!"
  // Navigate to notifications screen
  navigateToNotifications();
}
```

### 2. Rating Screen
```javascript
// No changes needed
// Works the same for both registered and non-registered users
```

### 3. Notifications
```javascript
// Fetch notifications after login/registration
const fetchNotifications = async () => {
  const response = await fetch('/node/api/notifications/my', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

---

## Environment Variables

### No Longer Required:
```env
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
```

### Still Required:
```env
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

---

## Rollback Plan

If issues arise:

1. **Revert code changes** to previous commit
2. **Database**: No migration needed (password field is optional)
3. **Pending users**: Will remain in database but won't affect old system
4. **Re-enable Twilio**: Uncomment Twilio code in rating controller

---

## Future Enhancements

### Potential Improvements:
1. **Email templates**: Use HTML email templates for better UX
2. **Reminder emails**: Send reminders to pending users after X days
3. **Bulk invitations**: Allow users to invite multiple people
4. **Social sharing**: Share registration link via social media
5. **Phone verification**: Add phone verification for phone-only users

---

## Support

For questions or issues:
- See `RATING_FLOW_GUIDE.md` for detailed flow documentation
- See `AUTHENTICATION_GUIDE.md` for auth API documentation
- Contact development team

---

## Summary

✅ **Problem Solved**: Users can be rated before registration
✅ **Data Preserved**: All ratings and notifications maintained
✅ **Twilio Disabled**: No SMS costs
✅ **Email Only**: Clear communication for email users
✅ **Seamless UX**: Users see all pending items on registration

