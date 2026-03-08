# New Authentication Screens

This document describes the new authentication screens created for the SapienScore app.

## Screens Created

### 1. NewLoginScreen.tsx
- **Purpose**: Main login screen with password-based authentication
- **Features**:
  - Phone number input (10 digits, auto-formatted with +91)
  - Password input with show/hide toggle
  - "Forgot Password" link
  - "Keep me signed in" checkbox
  - SapienScore logo header (black background)
  - Error handling with visual feedback
  - Responsive design with keyboard handling
- **API**: Uses `loginWithPassword` from `authApi.ts`

### 2. NewSignupScreen.tsx
- **Purpose**: User registration screen
- **Features**:
  - Phone number input (10 digits, auto-formatted with +91)
  - Email address input
  - Password input with show/hide toggle
  - Confirm password input with show/hide toggle
  - Terms and conditions checkbox
  - Back button navigation
  - "Sign in here" link to login
  - Responsive design with keyboard handling
- **API**: Uses `signupWithPassword` from `authApi.ts`

### 3. ForgotPasswordScreen.tsx
- **Purpose**: Initiate password reset flow
- **Features**:
  - Email address input
  - Submit button to send reset code
  - "Login to your account" link
  - Responsive design with keyboard handling
- **API**: Uses `sendPasswordResetEmail` from `authApi.ts`

### 4. VerifyResetEmailScreen.tsx
- **Purpose**: Verify email with 6-digit code for password reset
- **Features**:
  - 6 individual input boxes for OTP code
  - Auto-focus to next input on digit entry
  - Backspace navigation between inputs
  - "Verify & Reset" button
  - "Resend" link to request new code
  - Responsive design with keyboard handling
- **API**: Uses `verifyPasswordResetCode` and `sendPasswordResetEmail` from `authApi.ts`

### 5. ResetPasswordScreen.tsx
- **Purpose**: Set new password after verification
- **Features**:
  - Email address display (read-only)
  - New password input with show/hide toggle
  - Confirm password input with show/hide toggle
  - Terms and conditions checkbox
  - "Update Password" button
  - Responsive design with keyboard handling
- **API**: Uses `resetPassword` from `authApi.ts`

### 6. AuthFlowManager.tsx
- **Purpose**: Manages navigation between all auth screens
- **Features**:
  - Centralized state management for auth flow
  - Handles screen transitions
  - Passes data between screens (email, verification code)
  - Provides callbacks for successful authentication

## API Functions Added (authApi.ts)

### Password-based Authentication
- `loginWithPassword(phone_number, password)` - Login with phone and password
- `signupWithPassword(phone_number, work_email, password)` - Register new user

### Password Reset Flow
- `sendPasswordResetEmail(work_email)` - Send reset code to email
- `verifyPasswordResetCode(work_email, code)` - Verify the reset code
- `resetPassword(work_email, code, new_password)` - Update password

## Design Specifications

### Colors
- Background: `#F3F3F3` (light gray)
- Primary Button: `#FF8541` (orange)
- Input Background: `#FFFFFF` (white)
- Text: `#000` (black)
- Placeholder: `#B0B0B0` (gray)
- Error: `#FF0000` (red)
- Checkbox Active: `#4CD964` (green) for login, `#FF8541` (orange) for signup/reset
- Logo Background: `#000` (black)
- Logo "Sapien": `#FFF` (white)
- Logo "Score": `#FF8541` (orange)

### Typography
- Font Family: Poppins (Light, Regular, Medium, SemiBold, Bold)
- Input Font Size: 16px
- Button Font Size: 18px
- Title Font Size: 24-28px
- Label Font Size: 16px

### Layout
- Padding Horizontal: 25px
- Input Border Radius: 10px
- Button Border Radius: 30px
- Input Padding: 14px vertical, 18px horizontal

## Responsive Design Features

All screens include:
- `KeyboardAvoidingView` for iOS and Android
- `ScrollView` with keyboard dismiss on tap
- Dynamic padding adjustments when keyboard is visible
- Proper keyboard type for each input (phone-pad, email-address, etc.)
- Auto-capitalization disabled for email inputs
- Max length constraints on inputs

## Integration with Existing App

### Option 1: Replace Existing LoginScreen
In `app/index.tsx`, replace:
```typescript
import LoginScreen from '@/components/screens/LoginScreen';
```
with:
```typescript
import AuthFlowManager from '@/components/screens/AuthFlowManager';
```

And update the login screen rendering:
```typescript
{currentScreen === 'login' && (
  <AuthFlowManager
    onAuthSuccess={(data) => handleLogin(data)}
  />
)}
```

### Option 2: Use Alongside Existing LoginScreen
Keep both implementations and switch based on a feature flag or user preference.

## Testing Checklist

- [ ] Login with valid credentials
- [ ] Login with invalid credentials (error handling)
- [ ] Signup with all fields filled
- [ ] Signup with missing fields (validation)
- [ ] Signup with mismatched passwords
- [ ] Forgot password flow (send email)
- [ ] Verify reset code (6 digits)
- [ ] Reset password successfully
- [ ] Keyboard handling on different screen sizes
- [ ] Navigation between screens
- [ ] "Keep me signed in" functionality
- [ ] Terms checkbox validation
- [ ] Responsive design on various Android devices

## Notes

- All screens use the same Poppins font family as the existing app
- Error states are indicated with red borders on inputs
- Loading states show ActivityIndicator in buttons
- All API calls include proper error handling
- Phone numbers are auto-formatted with +91 country code
- Email validation uses regex pattern
- Password minimum length is 6 characters

