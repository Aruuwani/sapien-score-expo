# Pending User Login Fix

## Problem Statement

When a temporary/pending user (created via rating but hasn't registered yet) tries to login, the system was throwing a cryptic error:

```
data and hash arguments required
```

This error occurred because:
1. Pending users have `email` or `phone_number` but **NO password** (`password: undefined`)
2. The login function tried to compare the entered password with `undefined`
3. bcrypt's `compare()` function requires both arguments to be defined, hence the error

---

## User Flow

### **Scenario: Pending User Created via Rating**

1. **User A rates User B** (who doesn't have an account)
   - User A enters User B's email: `userb@example.com`
   - System creates a "pending user" entry for User B:
     ```javascript
     {
       email: "userb@example.com",
       password: undefined,  // ← NO PASSWORD
       agreedTerms: false
     }
     ```

2. **User B receives notification**: "Someone has rated you!"

3. **User B tries to login** (before signing up)
   - Enters email: `userb@example.com`
   - Enters password: `anything123`
   - **OLD BEHAVIOR**: Error: "data and hash arguments required" ❌
   - **NEW BEHAVIOR**: Error: "Account not activated. Please sign up..." ✅

4. **User B clicks "Sign Up Now"**
   - Goes to signup screen
   - Enters email, phone, password
   - System **updates** existing pending user (doesn't create duplicate)
   - User B can now login and see their pending ratings

---

## Solution

### **Backend Fix** (`sapien_backend/services/auth.service.js`)

Added a check for pending users BEFORE attempting password comparison:

```javascript
const login = async (identifier, password) => {
    // Find user by email, phone, or work_email
    const user = await User.findOne({
        $or: [
            { email: identifier },
            { phone_number: identifier },
            { work_email: identifier }
        ]
    });

    if (!user) {
        throw new Error('Invalid credentials');
    }

    // ✅ NEW: Check if this is a pending user
    if (!user.password) {
        console.log('⚠️ Pending user attempted login:', {
            identifier,
            userId: user._id,
            hasPassword: false
        });
        throw new Error('Account not activated. Please sign up to activate your account and access your pending ratings.');
    }

    // Verify password (only if user has a password)
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    // Generate token and return
    const token = generateToken(user);
    return { user: {...}, token };
};
```

**Key Changes**:
1. Added `work_email` to the search query (backward compatibility)
2. Check if `user.password` exists before calling `comparePassword()`
3. Return a user-friendly error message for pending users
4. Log pending user login attempts for debugging

---

### **Frontend Fix** (`update with notification/components/screens/NewLoginScreen.tsx`)

Enhanced error handling to detect pending users and show a "Sign Up" button:

```typescript
const handleLogin = async () => {
    setErrorMessage('');
    setIsPendingUser(false);
    
    // ... validation ...

    try {
        const response = await loginWithPassword(formattedPhone, password);
        // ... handle success ...
    } catch (error: any) {
        const errorMsg = error.error || error.message || 'Please enter correct password';
        
        // ✅ NEW: Check if this is a pending user error
        if (errorMsg.includes('Account not activated') || errorMsg.includes('Please sign up')) {
            setIsPendingUser(true);
            setErrorMessage('Your account is not activated yet. Someone has rated you! Please sign up to activate your account and view your ratings.');
        } else {
            setErrorMessage(errorMsg);
        }
        
        setPasswordError(true);
    }
};
```

**UI Changes**:
```tsx
{errorMessage && (
  <View style={styles.errorMessageContainer}>
    <View style={styles.errorContainer}>
      <Feather 
        name={isPendingUser ? "info" : "alert-triangle"} 
        size={16} 
        color={isPendingUser ? "#FF8541" : "#FF0000"} 
      />
      <Text style={[styles.errorText, isPendingUser && styles.pendingUserText]}>
        {errorMessage}
      </Text>
    </View>
    {isPendingUser && (
      <TouchableOpacity 
        style={styles.signupPromptButton}
        onPress={onSignup}
      >
        <Text style={styles.signupPromptButtonText}>Sign Up Now</Text>
      </TouchableOpacity>
    )}
  </View>
)}
```

**Key Changes**:
1. Added `isPendingUser` state to track if error is for pending user
2. Show info icon (🛈) instead of warning icon for pending users
3. Show orange color instead of red for pending user messages
4. Display "Sign Up Now" button that navigates to signup screen
5. Pre-fill signup form with the email/phone they tried to login with

---

## Error Messages Comparison

### **Before Fix**

| User Type | Error Message |
|-----------|---------------|
| Non-existent user | "Invalid credentials" ✅ |
| Registered user (wrong password) | "Invalid credentials" ✅ |
| Pending user | "data and hash arguments required" ❌ |

### **After Fix**

| User Type | Error Message |
|-----------|---------------|
| Non-existent user | "Invalid credentials" ✅ |
| Registered user (wrong password) | "Invalid credentials" ✅ |
| Pending user | "Account not activated. Please sign up to activate your account and access your pending ratings." ✅ |

---

## User Experience Flow

### **Before Fix**

```
Pending User tries to login
         ↓
Error: "data and hash arguments required"
         ↓
User is confused 😕
         ↓
User doesn't know what to do
```

### **After Fix**

```
Pending User tries to login
         ↓
Error: "Your account is not activated yet. Someone has rated you!"
         ↓
"Sign Up Now" button appears
         ↓
User clicks button
         ↓
Goes to signup screen
         ↓
Signs up successfully
         ↓
Account activated! Can now login and see ratings 🎉
```

---

## Testing

### **Test Case 1: Pending User Login**

**Setup**:
1. Create a pending user via rating:
   ```javascript
   // In rating flow
   const pendingUser = await User.create({
       email: 'pending@test.com',
       password: undefined,
       agreedTerms: false
   });
   ```

**Test**:
1. Go to login screen
2. Enter email: `pending@test.com`
3. Enter password: `anything123`
4. Click "Login"

**Expected Result**:
- ✅ Error message: "Your account is not activated yet..."
- ✅ Info icon (orange) instead of warning icon (red)
- ✅ "Sign Up Now" button appears
- ✅ Clicking button navigates to signup screen

---

### **Test Case 2: Registered User Login (Wrong Password)**

**Setup**:
1. User has registered account with password

**Test**:
1. Go to login screen
2. Enter correct email/phone
3. Enter **wrong** password
4. Click "Login"

**Expected Result**:
- ✅ Error message: "Invalid credentials"
- ✅ Warning icon (red)
- ✅ NO "Sign Up Now" button

---

### **Test Case 3: Non-Existent User Login**

**Setup**:
1. User doesn't exist in database

**Test**:
1. Go to login screen
2. Enter email: `nonexistent@test.com`
3. Enter password: `anything123`
4. Click "Login"

**Expected Result**:
- ✅ Error message: "Invalid credentials"
- ✅ Warning icon (red)
- ✅ NO "Sign Up Now" button

---

### **Test Case 4: Pending User Signup**

**Setup**:
1. Pending user exists in database

**Test**:
1. Click "Sign Up Now" from login error
2. Enter email (same as pending user)
3. Enter phone number
4. Enter password
5. Accept terms
6. Click "Sign Up"

**Expected Result**:
- ✅ Existing pending user is **updated** (not duplicated)
- ✅ Password is added to existing user
- ✅ User can now login successfully
- ✅ User can see their pending ratings

---

## Backend Logs

### **Pending User Login Attempt**

```
⚠️ Pending user attempted login: {
  identifier: 'pending@test.com',
  userId: '67abc123...',
  hasPassword: false
}
```

### **Pending User Activation (Signup)**

```
🔄 Activating pending user account: {
  userId: '67abc123...',
  existingEmail: 'pending@test.com',
  existingWorkEmail: 'pending@test.com',
  existingPhone: null,
  newEmail: 'pending@test.com',
  newPhone: '+919876543210'
}

✅ Pending user activated successfully: {
  userId: '67abc123...',
  email: 'pending@test.com',
  phone: '+919876543210',
  hasPassword: true
}
```

---

## Files Modified

### **Backend**
1. ✅ `sapien_backend/services/auth.service.js`
   - Added pending user check in `login()` function
   - Added `work_email` to search query
   - Added logging for pending user login attempts

### **Frontend**
1. ✅ `update with notification/components/screens/NewLoginScreen.tsx`
   - Added `isPendingUser` state
   - Enhanced error handling to detect pending users
   - Added "Sign Up Now" button for pending users
   - Added styles for pending user UI

---

## Benefits

✅ **Clear Error Messages**: Users know exactly what to do  
✅ **Better UX**: "Sign Up Now" button guides users to the right action  
✅ **No Crashes**: No more cryptic bcrypt errors  
✅ **Consistent Behavior**: All login errors are handled gracefully  
✅ **Logging**: Backend logs help debug pending user issues  
✅ **Visual Feedback**: Orange info icon vs red warning icon  

---

## Related Documentation

- **Pending User Registration Fix**: `sapien_backend/PENDING_USER_FIX.md`
- **Rating System**: How pending users are created
- **Signup Flow**: How pending users are activated

---

**Status**: ✅ Fixed and tested  
**Last Updated**: January 2025

