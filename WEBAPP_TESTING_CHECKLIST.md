# SapienScore Web App - Testing Checklist

## 🧪 Manual Testing Guide

### Prerequisites
- Dev server running at http://localhost:3000/
- Backend API available at https://sapio.one/node/api

---

## 1. Authentication Flow Testing

### ✅ Login Screen (`/login`)
- [ ] Navigate to http://localhost:3000/login
- [ ] Enter phone number (10 digits)
- [ ] Enter password
- [ ] Click "Login" button
- [ ] Verify redirect to dashboard on success
- [ ] Test "Forgot Password" link
- [ ] Test "Sign Up" link
- [ ] Test "Keep me signed in" checkbox
- [ ] Test error handling (wrong password)

### ✅ Signup Screen (`/signup`)
- [ ] Navigate to http://localhost:3000/signup
- [ ] Enter phone number (10 digits)
- [ ] Enter email address
- [ ] Enter password
- [ ] Confirm password
- [ ] Accept terms and conditions
- [ ] Click "Sign Up" button
- [ ] Verify success animation
- [ ] Verify redirect to login
- [ ] Test "Sign In" link
- [ ] Test validation errors

### ✅ Forgot Password Flow
**Step 1: Request Reset (`/forgot-password`)**
- [ ] Navigate to http://localhost:3000/forgot-password
- [ ] Enter email address
- [ ] Click "Send Reset Code"
- [ ] Verify success message
- [ ] Verify redirect to verify screen

**Step 2: Verify Code (`/verify-reset`)**
- [ ] Enter 6-digit code
- [ ] Click "Verify Code"
- [ ] Verify redirect to reset password screen
- [ ] Test resend code functionality

**Step 3: Reset Password (`/reset-password`)**
- [ ] Enter new password
- [ ] Confirm new password
- [ ] Click "Update Password"
- [ ] Verify success message
- [ ] Verify redirect to login

### ✅ Registration Screen (`/registration`)
- [ ] Complete signup first
- [ ] Enter name
- [ ] Click "Choose Username"
- [ ] Select from available usernames
- [ ] Click "Complete Registration"
- [ ] Verify redirect to dashboard

---

## 2. Main App Testing

### ✅ Dashboard Screen (`/dashboard`)
- [ ] Verify user profile displays
- [ ] Test username show/hide toggle
- [ ] Verify score statistics cards
- [ ] Verify aggregated topic scores
- [ ] Verify progress bars
- [ ] Test "Show All" / "Hide" toggle for topics
- [ ] Test navigation to different sections
- [ ] Verify bottom navigation bar

### ✅ Scoring Flow
**Step 1: User Selection (`/user-selection`)**
- [ ] Navigate from dashboard "Score" tab
- [ ] Enter email address OR phone number
- [ ] Click "Continue"
- [ ] Verify validation (email format, phone digits)
- [ ] Verify redirect to relationship selection

**Step 2: Relationship Selection (`/relationship-selection`)**
- [ ] Select a relationship type (Friend, Family, etc.)
- [ ] Click "Continue"
- [ ] Verify redirect to scoring flow

**Step 3: Scoring Flow (`/scoring-flow`)**
- [ ] Verify first topic displays (Casual Topics)
- [ ] Adjust sliders for each trait (1-10)
- [ ] Enter optional comment
- [ ] Click "Next" to go to next topic
- [ ] Repeat for all 4 topics
- [ ] Click "Submit Score" on last topic
- [ ] Verify success message
- [ ] Verify redirect to dashboard

### ✅ Navigation Testing
- [ ] Test "PROFILE" tab (dashboard)
- [ ] Test "Echoroom" tab (chat rooms)
- [ ] Test "Score" tab (user selection)
- [ ] Verify active tab highlighting
- [ ] Test navigation on mobile viewport

---

## 3. Secondary Screens Testing

### ✅ Scores & Requests
- [ ] Navigate to `/scores-received`
- [ ] Navigate to `/sapiens-scored`
- [ ] Navigate to `/sapiens-requests`
- [ ] Navigate to `/sapiens-blocked`
- [ ] Navigate to `/sapien-score`

### ✅ Communication
- [ ] Navigate to `/echo-rooms`
- [ ] Navigate to `/chat/:roomId`

### ✅ User Management
- [ ] Navigate to `/profile`
- [ ] Navigate to `/settings`
- [ ] Navigate to `/notifications`

---

## 4. Responsive Design Testing

### ✅ Desktop (> 768px)
- [ ] Test all screens at 1920x1080
- [ ] Verify max-width constraint (480px)
- [ ] Verify centered layout

### ✅ Mobile (< 768px)
- [ ] Test all screens at 375x667 (iPhone SE)
- [ ] Test all screens at 414x896 (iPhone 11)
- [ ] Verify padding adjustments
- [ ] Verify bottom navigation fixed position
- [ ] Test touch interactions

---

## 5. Error Handling Testing

### ✅ Network Errors
- [ ] Test with backend offline
- [ ] Verify offline detection screen
- [ ] Verify error toast notifications

### ✅ Validation Errors
- [ ] Test empty form submissions
- [ ] Test invalid email formats
- [ ] Test invalid phone numbers
- [ ] Test password mismatch
- [ ] Test short passwords (< 6 chars)

### ✅ API Errors
- [ ] Test with invalid credentials
- [ ] Test with expired tokens
- [ ] Test with duplicate email/phone
- [ ] Verify error messages display

---

## 6. State Management Testing

### ✅ Authentication State
- [ ] Login and verify token stored
- [ ] Refresh page and verify still logged in
- [ ] Logout and verify token removed
- [ ] Test protected route access when logged out

### ✅ App State
- [ ] Start scoring flow
- [ ] Verify selectedPerson persists
- [ ] Verify selectedRelation persists
- [ ] Complete scoring and verify state reset

---

## 7. Browser Compatibility

### ✅ Chrome
- [ ] Test all features

### ✅ Firefox
- [ ] Test all features

### ✅ Safari
- [ ] Test all features

### ✅ Edge
- [ ] Test all features

---

## 📊 Test Results Summary

| Category | Tests | Passed | Failed |
|----------|-------|--------|--------|
| Authentication | 0 | 0 | 0 |
| Main App | 0 | 0 | 0 |
| Secondary Screens | 0 | 0 | 0 |
| Responsive Design | 0 | 0 | 0 |
| Error Handling | 0 | 0 | 0 |
| State Management | 0 | 0 | 0 |
| Browser Compatibility | 0 | 0 | 0 |
| **TOTAL** | **0** | **0** | **0** |

---

**Testing Date**: ___________
**Tested By**: ___________
**Status**: ⏳ Pending

