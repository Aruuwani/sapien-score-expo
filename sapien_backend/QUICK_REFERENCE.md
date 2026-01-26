# Quick Reference Guide

## Authentication & Rating System

---

## 🔐 Authentication Endpoints

### Register
```bash
POST /node/api/auth/register
{
  "email": "user@example.com",
  "phone_number": "+1234567890",  # Optional
  "password": "SecurePass123!",
  "agreedTerms": true
}
```

### Login
```bash
POST /node/api/auth/login
{
  "identifier": "user@example.com",  # Email OR phone
  "password": "SecurePass123!"
}
```

### Forgot Password (3 steps)
```bash
# Step 1: Request reset
POST /node/api/auth/forgot-password
{ "email": "user@example.com" }

# Step 2: Verify code
POST /node/api/auth/verify-reset-code
{ "email": "user@example.com", "otp": "123456" }

# Step 3: Reset password
POST /node/api/auth/reset-password
{ "email": "user@example.com", "newPassword": "NewPass123!" }
```

---

## ⭐ Rating Endpoints

### Create Rating
```bash
POST /node/api/ratings
Authorization: Bearer <token>
{
  "emailOrPhone": "receiver@example.com",
  "rating_data": [
    {
      "topic": "Awareness & Emotional Intelligence",
      "traits": [
        { "trait": "Self-Belief", "score": 8 }
      ],
      "comment": "Great person!"
    }
  ],
  "sender_relation": "Friend"
}
```

### Get My Ratings (Who Scored Me)
```bash
GET /node/api/ratings/whoscoredme
Authorization: Bearer <token>
```

### Get Whom I Scored
```bash
GET /node/api/ratings/whomiscored
Authorization: Bearer <token>
```

---

## 🔔 Notification Endpoints

### Get My Notifications
```bash
GET /node/api/notifications/my
Authorization: Bearer <token>
```

### Mark All as Read
```bash
POST /node/api/notifications/markallread
Authorization: Bearer <token>
```

---

## 📊 User States

### Pending User (Rated but Not Registered)
```javascript
{
  email: "user@example.com",
  password: undefined,  // NO PASSWORD
  agreedTerms: false
}
```
- ❌ Cannot login
- ✅ Can receive ratings
- ✅ Can receive email notifications
- ✅ Notifications stored in database

### Registered User
```javascript
{
  email: "user@example.com",
  password: "$2b$10$...",  // HAS PASSWORD
  agreedTerms: true
}
```
- ✅ Can login
- ✅ Can see all ratings
- ✅ Can see all notifications
- ✅ Can create ratings

---

## 🎯 Common Scenarios

### Scenario 1: Rate Someone Who Hasn't Registered (Email)
1. User A rates `newuser@example.com`
2. System creates pending user
3. Email sent: "Someone scored you! Register to view."
4. Later, user registers with `newuser@example.com`
5. System activates pending account
6. User sees all pending ratings

### Scenario 2: Rate Someone Who Hasn't Registered (Phone)
1. User A rates `+1234567890`
2. System creates pending user
3. **NO notification sent** (Twilio disabled)
4. Later, user registers with `+1234567890`
5. System activates pending account
6. User discovers ratings

### Scenario 3: Rate a Registered User
1. User A rates `registered@example.com`
2. System finds registered user
3. Email sent: "New score request!"
4. Push notification sent (if tokens exist)
5. Database notification created
6. User B logs in and sees notification

---

## 🚨 Important Notes

### ✅ What Works:
- Rating users before they register
- Email notifications for email-based ratings
- Pending users activated on registration
- All data preserved (same user ID)

### ❌ What Doesn't Work:
- SMS notifications (Twilio disabled)
- Phone-only ratings don't send notifications
- Pending users cannot login

### 🔒 Security:
- Passwords hashed with bcrypt
- JWT tokens expire in 30 days
- Pending users have no password
- OTP codes expire in 10 minutes

---

## 📱 Frontend Integration

### After Registration
```javascript
const response = await register(email, password, agreedTerms);

if (response.hasPendingNotifications) {
  // User has pending ratings/notifications
  showMessage("You have pending score requests!");
  fetchNotifications();
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
  
  return response.json();
};
```

---

## 🔧 Environment Variables

### Required:
```env
JWT_SECRET=your_secret_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
MONGO_URI=mongodb://...
PORT=5000
```

### Not Required (Twilio Disabled):
```env
# TWILIO_ACCOUNT_SID
# TWILIO_AUTH_TOKEN
# TWILIO_PHONE_NUMBER
```

---

## 📚 Documentation Files

- **`AUTHENTICATION_GUIDE.md`** - Complete auth API documentation
- **`RATING_FLOW_GUIDE.md`** - Detailed rating flow with examples
- **`RATING_SYSTEM_CHANGES.md`** - Summary of all changes
- **`MIGRATION_SUMMARY.md`** - Migration from old system
- **`QUICK_REFERENCE.md`** - This file

---

## 🧪 Testing

### Test Registration
```bash
curl -X POST http://localhost:5000/node/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "agreedTerms": true
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/node/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "Test123!"
  }'
```

### Test Rating
```bash
curl -X POST http://localhost:5000/node/api/ratings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "newuser@example.com",
    "rating_data": [...],
    "sender_relation": "Friend"
  }'
```

---

## 🆘 Troubleshooting

### Issue: "Email already registered"
**Solution:** User already exists. Use login or forgot password.

### Issue: "Invalid credentials"
**Solution:** Check email/phone and password. Use forgot password if needed.

### Issue: User rated but didn't receive email
**Possible causes:**
1. Phone number used (no email sent)
2. Email in spam folder
3. EMAIL_USER/EMAIL_PASS not configured

### Issue: Pending user can't login
**Expected behavior:** Pending users have no password. They must register first.

---

## 📞 Support

For questions or issues, contact the development team.

