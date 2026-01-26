# Terms & Conditions API - Complete Implementation

## Overview

This document describes the complete implementation of the Terms & Conditions and Privacy Policy system, including:
- Database model
- Backend API (GET and POST endpoints)
- Frontend integration
- Seeding dummy data via API

---

## Backend Implementation

### 1. Database Model

**File**: `sapien_backend/models/termsConditions.model.js`

**Schema**:
```javascript
{
  type: {
    type: String,
    enum: ['terms', 'privacy'],
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: Array,
    required: true,
    default: []
  },
  version: {
    type: String,
    required: true,
    default: '1.0'
  },
  effectiveDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}
```

**Content Structure**:
```javascript
content: [
  {
    title: "Section Title",
    content: "Section description text",
    bullets: ["Bullet point 1", "Bullet point 2"] // Optional
  }
]
```

---

### 2. API Endpoints

**File**: `sapien_backend/routes/termsConditions.routes.js`

#### **GET /node/api/terms/:type**

Get Terms & Conditions or Privacy Policy by type.

**Parameters**:
- `type` (path parameter): `'terms'` or `'privacy'`

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "67abc123...",
    "type": "terms",
    "title": "Terms & Conditions",
    "content": [
      {
        "title": "1. Acceptance of Terms",
        "content": "By accessing and using...",
        "bullets": []
      }
    ],
    "version": "1.0",
    "effectiveDate": "2025-01-01T00:00:00.000Z",
    "isActive": true
  }
}
```

**Example**:
```bash
# Get Terms & Conditions
curl http://localhost:5000/node/api/terms/terms

# Get Privacy Policy
curl http://localhost:5000/node/api/terms/privacy
```

---

#### **POST /node/api/terms**

Create or update Terms & Conditions or Privacy Policy.

**Request Body**:
```json
{
  "type": "terms",
  "title": "Terms & Conditions",
  "content": [
    {
      "title": "1. Acceptance of Terms",
      "content": "By accessing and using Sapien Score...",
      "bullets": []
    }
  ],
  "version": "1.0"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Terms & Conditions created successfully",
  "data": {
    "_id": "67abc123...",
    "type": "terms",
    "title": "Terms & Conditions",
    "content": [...],
    "version": "1.0",
    "effectiveDate": "2025-01-01T00:00:00.000Z",
    "isActive": true
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:5000/node/api/terms \
  -H "Content-Type: application/json" \
  -d '{
    "type": "terms",
    "title": "Terms & Conditions",
    "content": [...],
    "version": "1.0"
  }'
```

**Behavior**:
- If a document with the same `type` exists, it will be **updated**
- If no document exists, a new one will be **created**
- Uses `findOneAndUpdate` with `upsert: true`

---

#### **GET /node/api/terms/all/:type**

Get all versions of Terms & Conditions or Privacy Policy (for admin/history).

**Parameters**:
- `type` (path parameter): `'terms'` or `'privacy'`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "67abc123...",
      "type": "terms",
      "title": "Terms & Conditions",
      "version": "1.0",
      "effectiveDate": "2025-01-01T00:00:00.000Z",
      "isActive": true
    }
  ]
}
```

---

### 3. Controller

**File**: `sapien_backend/controllers/termsConditions.controller.js`

**Functions**:
- `getTermsConditions(req, res)` - Get active terms by type
- `createOrUpdateTerms(req, res)` - Create or update terms
- `getAllVersions(req, res)` - Get all versions (for history)

---

## Frontend Implementation

### 1. API Integration

**File**: `update with notification/api/termsApi.ts`

**Functions**:
```typescript
// Get Terms & Conditions
export const getTermsConditions = async () => {
  const response = await fetch(`${API_URL}/node/api/terms/terms`);
  return await response.json();
};

// Get Privacy Policy
export const getPrivacyPolicy = async () => {
  const response = await fetch(`${API_URL}/node/api/terms/privacy`);
  return await response.json();
};

// Get by type
export const getTermsByType = async (type: 'terms' | 'privacy') => {
  const response = await fetch(`${API_URL}/node/api/terms/${type}`);
  return await response.json();
};
```

---

### 2. Modal Component

**File**: `update with notification/components/ui/TermsConditionsModal.tsx`

**Features**:
- ✅ Fetches content from API dynamically
- ✅ Loading state with spinner
- ✅ Error state with retry button
- ✅ Empty state handling
- ✅ Scrollable content
- ✅ Close button and "I Understand" button
- ✅ Supports both 'terms' and 'privacy' types

**Usage**:
```tsx
import TermsConditionsModal from '@/components/ui/TermsConditionsModal';

const [showModal, setShowModal] = useState(false);
const [modalType, setModalType] = useState<'terms' | 'privacy'>('terms');

// Show Terms
<TouchableOpacity onPress={() => {
  setModalType('terms');
  setShowModal(true);
}}>
  <Text>View Terms</Text>
</TouchableOpacity>

// Show Privacy
<TouchableOpacity onPress={() => {
  setModalType('privacy');
  setShowModal(true);
}}>
  <Text>View Privacy Policy</Text>
</TouchableOpacity>

// Modal
<TermsConditionsModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  type={modalType}
/>
```

---

### 3. Integration in Screens

#### **NewSignupScreen**
- Clickable "terms of Use" link → Opens Terms modal
- Clickable "Privacy Policy" link → Opens Privacy modal

#### **ResetPasswordScreen**
- Same as NewSignupScreen

#### **SettingsScreen**
- Clickable "privacy policy" → Opens Privacy modal
- Clickable "terms & conditions" → Opens Terms modal

---

## Seeding Data

### Seed Script

**File**: `sapien_backend/seedTermsConditions.js`

**How it works**:
1. Uses the **POST API** to insert data (not direct database insertion)
2. Sends dummy Terms & Conditions content
3. Sends dummy Privacy Policy content
4. Uses `node-fetch` for HTTP requests

**Run the script**:
```bash
cd sapien_backend
node seedTermsConditions.js
```

**Expected Output**:
```
🚀 Starting to seed Terms & Conditions via API...

📝 Inserting Terms & Conditions...
✅ Terms & Conditions inserted: 67abc123...

📝 Inserting Privacy Policy...
✅ Privacy Policy inserted: 67def456...

═══════════════════════════════════════════════════════
📄 Seeding completed successfully!
═══════════════════════════════════════════════════════

Terms ID: 67abc123...
Privacy ID: 67def456...

You can now access them via:
GET http://localhost:5000/node/api/terms/terms
GET http://localhost:5000/node/api/terms/privacy
```

**Important**: Make sure the backend server is running before executing the seed script!

---

## Dummy Content

### Terms & Conditions (11 sections)

1. Acceptance of Terms
2. Use License
3. User Account
4. User Conduct
5. Rating System
6. Content Ownership
7. Disclaimer
8. Limitations
9. Modifications
10. Governing Law
11. Contact Information

### Privacy Policy (6 sections)

1. Information We Collect
2. How We Use Your Information
3. Information Sharing
4. Data Security
5. Your Rights
6. Contact Us

---

## Testing

### 1. Test Backend API

**Start the server**:
```bash
cd sapien_backend
npm start
```

**Test GET endpoint**:
```bash
# Get Terms
curl http://localhost:5000/node/api/terms/terms

# Get Privacy
curl http://localhost:5000/node/api/terms/privacy
```

**Test POST endpoint**:
```bash
curl -X POST http://localhost:5000/node/api/terms \
  -H "Content-Type: application/json" \
  -d '{
    "type": "terms",
    "title": "Terms & Conditions",
    "content": [
      {
        "title": "1. Test Section",
        "content": "This is a test",
        "bullets": ["Point 1", "Point 2"]
      }
    ],
    "version": "1.0"
  }'
```

---

### 2. Test Frontend

**Start the app**:
```bash
cd "update with notification"
npx expo start
```

**Test flows**:
1. Go to NewSignupScreen
2. Click "terms of Use" → Should open Terms modal
3. Click "Privacy Policy" → Should open Privacy modal
4. Verify content loads from API
5. Test in ResetPasswordScreen
6. Test in SettingsScreen

---

## File Structure

```
sapien_backend/
├── models/
│   └── termsConditions.model.js       # Database model
├── controllers/
│   └── termsConditions.controller.js  # API logic
├── routes/
│   └── termsConditions.routes.js      # API routes
├── seedTermsConditions.js             # Seed script (uses POST API)
├── app.js                             # Routes registered here
└── TERMS_CONDITIONS_API.md            # This file

update with notification/
├── api/
│   └── termsApi.ts                    # API integration
├── components/
│   ├── ui/
│   │   └── TermsConditionsModal.tsx   # Modal component
│   └── screens/
│       ├── NewSignupScreen.tsx        # Integrated
│       ├── ResetPasswordScreen.tsx    # Integrated
│       └── SettingsScreen.tsx         # Integrated
```

---

## Summary

✅ **Database Model**: Created with proper schema  
✅ **GET API**: Fetch terms by type (`/node/api/terms/:type`)  
✅ **POST API**: Create/update terms (`/node/api/terms`)  
✅ **Seed Script**: Uses POST API to insert dummy data  
✅ **Frontend Modal**: Fetches content dynamically from API  
✅ **Screen Integration**: NewSignup, ResetPassword, Settings  
✅ **Error Handling**: Loading, error, and empty states  
✅ **Documentation**: Complete API and usage docs  

---

**Status**: ✅ Complete and ready to use!

