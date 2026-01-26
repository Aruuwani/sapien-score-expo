# React Native to React Web Conversion Guide - SapienScore Application

## 📋 Executive Summary

This document provides a comprehensive, point-to-point breakdown of converting the SapienScore React Native application to a React web application. The app is a social scoring platform where users can rate and score other people based on various relationship types and traits.

---

## 🏗️ Application Architecture Overview

### Current Stack (React Native)
- **Framework**: Expo (React Native)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API + Local State
- **Storage**: AsyncStorage (@react-native-async-storage)
- **HTTP Client**: Axios
- **Real-time**: Socket.io-client, react-use-websocket
- **Notifications**: Expo Notifications + Native Notify
- **Fonts**: Expo Font (Poppins family)
- **UI Components**: React Native core components
- **Platform**: iOS, Android, Web (via Expo)

### Target Stack (React Web)
- **Framework**: React (Create React App / Vite / Next.js)
- **Navigation**: React Router v6
- **State Management**: React Context API + Local State (or Redux Toolkit)
- **Storage**: localStorage / sessionStorage
- **HTTP Client**: Axios (same)
- **Real-time**: Socket.io-client (same)
- **Notifications**: Web Push API / React-Toastify
- **Fonts**: Google Fonts / Local fonts via CSS
- **UI Components**: Custom CSS / Material-UI / Tailwind CSS
- **Platform**: Web browsers

---

## 📁 Module Breakdown & Conversion Strategy

## MODULE 1: PROJECT SETUP & CONFIGURATION

### 1.1 Initialize React Project
**React Native**: Uses Expo with `app.json` configuration
**React Web**: 
```bash
# Option 1: Create React App
npx create-react-app sapienscore-web --template typescript

# Option 2: Vite (Recommended for better performance)
npm create vite@latest sapienscore-web -- --template react-ts

# Option 3: Next.js (if SSR needed)
npx create-next-app@latest sapienscore-web --typescript
```

### 1.2 Dependencies Installation
**React Native packages** → **React Web equivalents**:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",        // replaces expo-router
    "axios": "^1.9.0",                     // same
    "socket.io-client": "^4.8.1",          // same
    "@tanstack/react-query": "^5.0.0",     // optional: for data fetching
    "react-toastify": "^9.1.3",            // replaces expo-notifications
    "uuid": "^9.0.0",                      // replaces react-native-uuid
    "date-fns": "^2.30.0",                 // date utilities
    "framer-motion": "^10.16.0"            // replaces react-native-reanimated
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"                       // if using Vite
  }
}
```

### 1.3 TypeScript Configuration
**File**: `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 1.4 Folder Structure
```
sapienscore-web/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
│       ├── images/
│       └── fonts/
├── src/
│   ├── api/                    # API client & endpoints
│   ├── components/             # Reusable components
│   │   ├── screens/           # Page-level components
│   │   ├── ui/                # UI components
│   │   └── types/             # Type definitions
│   ├── hooks/                 # Custom hooks
│   ├── context/               # Context providers
│   ├── utils/                 # Utility functions
│   ├── styles/                # Global styles
│   ├── routes/                # Route configuration
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Entry point
│   └── vite-env.d.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## MODULE 2: ROUTING & NAVIGATION

### 2.1 Navigation System Conversion
**React Native**: Expo Router (file-based)
```typescript
// app/_layout.tsx
<Stack>
  <Stack.Screen name="index" />
  <Stack.Screen name="user" />
</Stack>
```

**React Web**: React Router v6
```typescript
// src/routes/AppRoutes.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/signup" element={<SignupScreen />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
      <Route path="/user-selection" element={<ProtectedRoute><UserSelectionScreen /></ProtectedRoute>} />
      <Route path="/relation-selection" element={<ProtectedRoute><RelationshipSelectionScreen /></ProtectedRoute>} />
      <Route path="/scoring" element={<ProtectedRoute><ScoringFlowScreen /></ProtectedRoute>} />
      <Route path="/sapien-score" element={<ProtectedRoute><SapienScoreScreen /></ProtectedRoute>} />
      <Route path="/scores-received" element={<ProtectedRoute><ScoresReceivedScreen /></ProtectedRoute>} />
      <Route path="/sapiens-scored" element={<ProtectedRoute><SapiensScoredSentScreen /></ProtectedRoute>} />
      <Route path="/sapiens-requests" element={<ProtectedRoute><SapiensRequests /></ProtectedRoute>} />
      <Route path="/sapiens-blocked" element={<ProtectedRoute><SapiensBlocked /></ProtectedRoute>} />
      <Route path="/echo-rooms" element={<ProtectedRoute><EchoRoomsScreen /></ProtectedRoute>} />
      <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
      <Route path="/verify-reset" element={<VerifyResetEmailScreen />} />
      <Route path="/reset-password" element={<ResetPasswordScreen />} />
      <Route path="*" element={<NotFoundScreen />} />
    </Routes>
  </BrowserRouter>
);
```

### 2.2 Protected Routes Implementation
```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

### 2.3 Navigation Hook
```typescript
// src/hooks/useNavigation.ts
import { useNavigate } from 'react-router-dom';

export const useAppNavigation = () => {
  const navigate = useNavigate();

  return {
    navigateToScreen: (screen: string) => {
      const routeMap: Record<string, string> = {
        'home': '/',
        'login': '/login',
        'signup': '/signup',
        'dashboard': '/dashboard',
        'userSelection': '/user-selection',
        'relationSelection': '/relation-selection',
        'scoring': '/scoring',
        'sapienScore': '/sapien-score',
        'scoresReceived': '/scores-received',
        'sapiensScored': '/sapiens-scored',
        'sapiensrequests': '/sapiens-requests',
        'sapiensblocked': '/sapiens-blocked',
        'echoroom': '/echo-rooms',
        'forgotPassword': '/forgot-password',
        'verifyReset': '/verify-reset',
        'resetPassword': '/reset-password',
      };
      navigate(routeMap[screen] || '/');
    },
    goBack: () => navigate(-1),
  };
};
```

---

## MODULE 3: API CLIENT & AUTHENTICATION

### 3.1 API Client Setup
**File**: `src/api/apiClient.ts`

**React Native**: Uses AsyncStorage for token storage
```typescript
// update with notification/api/apiClient.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
const token = await AsyncStorage.getItem('auth_token');
```

**React Web**: Use localStorage
```typescript
// src/api/apiClient.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://sapio.one/node/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      console.log('🌐 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.baseURL + config.url,
        hasAuth: !!token
      });
    } catch (error) {
      console.error('Error retrieving token', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      dataKeys: Object.keys(response.data || {})
    });
    return response;
  },
  (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Request timeout:', {
        url: error.config?.url,
        timeout: error.config?.timeout
      });
    } else if (error.code === 'ERR_NETWORK') {
      console.error('❌ Network error:', {
        message: 'Cannot reach server',
        url: error.config?.url,
      });
    } else if (error.response) {
      console.error('❌ API Error Response:', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data
      });

      // Handle 401 Unauthorized - redirect to login
      if (error.response.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 3.2 Environment Variables
**React Native**: Uses `app.json` and Expo constants
**React Web**: Use `.env` files

Create `.env` file:
```env
VITE_API_BASE_URL=https://sapio.one/node/api
VITE_NATIVE_NOTIFY_APP_ID=31062
VITE_NATIVE_NOTIFY_TOKEN=7RdWCdEyTymqvoJ5DblY5V
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

### 3.3 Authentication API
**File**: `src/api/authApi.ts` (mostly same, just import changes)

```typescript
import axios from 'axios';
import apiClient from './apiClient';

// Email OTP
export const sendEmailOTP = async (work_email: string) => {
  try {
    const response = await apiClient.post('otp/send-email-otp', { work_email });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { error: 'Something went wrong' };
  }
};

export const verifyEmailOTP = async (work_email: string, otp: string) => {
  try {
    const response = await apiClient.post('otp/verify-email-otp', { work_email, otp });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { error: 'Something went wrong' };
  }
};

// Phone OTP
export const SendPhoneOTP = async (phone_number: string) => {
  try {
    const response = await apiClient.post('otp/send-phone-otp', { phone_number });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { error: 'Something went wrong' };
  }
};

export const verifyPhoneOTP = async (phone_number: string, otp: string) => {
  try {
    const response = await apiClient.post('otp/verify-phone-otp', { phone_number, otp });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { error: 'Something went wrong' };
  }
};

// Password-based authentication
export const loginWithPassword = async (identifier: string, password: string) => {
  try {
    const response = await apiClient.post('auth/login', { identifier, password });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw { error: 'Request timeout. Please check your internet connection.' };
      } else if (error.code === 'ERR_NETWORK') {
        throw { error: 'Cannot reach server. Please check your internet connection.' };
      } else if (error.response) {
        throw error.response.data || { error: 'Login failed. Please try again.' };
      }
    }
    throw { error: 'Something went wrong' };
  }
};

export const signupWithPassword = async (
  phone_number: string,
  email: string,
  password: string,
  agreedTerms: boolean = true
) => {
  try {
    const response = await apiClient.post('auth/register', {
      phone_number,
      email,
      password,
      agreedTerms
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { error: 'Something went wrong' };
  }
};
```

### 3.4 Other API Files
Create similar files for:
- `src/api/userApi.ts` - User profile operations
- `src/api/ratingApi.ts` - Rating/scoring operations
- `src/api/relationApi.ts` - Relationship types
- `src/api/notificationApi.ts` - Notifications
- `src/api/chatRoomApi.ts` - Echo rooms
- `src/api/messageApi.ts` - Messages

**Key changes**: Remove React Native specific imports, keep logic same.

---

## MODULE 4: STATE MANAGEMENT & CONTEXT

### 4.1 Auth Context
**File**: `src/context/AuthContext.tsx`

**React Native**: Uses AsyncStorage
```typescript
// hooks/AuthContext.js
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('auth_token', token);
```

**React Web**: Use localStorage
```typescript
// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  authToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          setAuthToken(token);
        }
      } catch (error) {
        console.error('Error checking auth state', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (token: string) => {
    try {
      localStorage.setItem('auth_token', token);
      setAuthToken(token);
    } catch (error) {
      console.error('Error saving token to storage', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.clear();
      setAuthToken(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Error clearing storage', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authToken,
        isAuthenticated: !!authToken,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 4.2 App State Context (Optional)
For managing global app state (selected person, scoring data, etc.)

```typescript
// src/context/AppContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Person {
  id?: string;
  name?: string;
  email?: string;
}

interface AppContextType {
  selectedPerson: Person | null;
  setSelectedPerson: (person: Person | null) => void;
  selectedRelation: string | null;
  setSelectedRelation: (relation: string | null) => void;
  scoringData: any;
  setScoringData: (data: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedRelation, setSelectedRelation] = useState<string | null>(null);
  const [scoringData, setScoringData] = useState<any>(null);

  return (
    <AppContext.Provider
      value={{
        selectedPerson,
        setSelectedPerson,
        selectedRelation,
        setSelectedRelation,
        scoringData,
        setScoringData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
```

---

## MODULE 5: UI COMPONENTS CONVERSION

### 5.1 React Native to React Web Component Mapping

| React Native Component | React Web Equivalent |
|------------------------|----------------------|
| `View` | `div` |
| `Text` | `span`, `p`, `h1-h6` |
| `ScrollView` | `div` with `overflow: auto` |
| `TouchableOpacity` | `button` or `div` with onClick |
| `TextInput` | `input` or `textarea` |
| `Image` | `img` |
| `SafeAreaView` | `div` with padding |
| `KeyboardAvoidingView` | Not needed (web handles keyboard) |
| `FlatList` | `div` with `.map()` or virtualized list library |
| `ActivityIndicator` | Custom spinner component |
| `Modal` | Custom modal or library (react-modal) |
| `StatusBar` | Not applicable (browser chrome) |

### 5.2 Example Component Conversion

**React Native Login Screen** (simplified):
```tsx
// React Native
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
      />
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
  },
  button: {
    backgroundColor: '#FF8541',
    padding: 15,
  },
  buttonText: {
    color: 'white',
  },
});
```

**React Web Version**:
```tsx
// React Web
import React from 'react';
import './LoginScreen.css';

const LoginScreen = () => {
  return (
    <div className="container">
      <h1 className="title">Login</h1>
      <input
        className="input"
        type="text"
        placeholder="Phone Number"
      />
      <button className="button">
        <span className="button-text">Login</span>
      </button>
    </div>
  );
};

export default LoginScreen;
```

**CSS File** (`LoginScreen.css`):
```css
.container {
  display: flex;
  flex-direction: column;
  padding: 20px;
  min-height: 100vh;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.input {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
  font-size: 16px;
}

.button {
  background-color: #FF8541;
  padding: 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button:hover {
  background-color: #e67535;
}

.button-text {
  color: white;
  font-weight: 600;
}
```

### 5.3 Styling Approaches

**Option 1: CSS Modules** (Recommended)
```tsx
import styles from './LoginScreen.module.css';

<div className={styles.container}>
```

**Option 2: Styled Components**
```tsx
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const Button = styled.button`
  background-color: #FF8541;
  padding: 15px;
  border: none;
  cursor: pointer;
`;
```

**Option 3: Tailwind CSS**
```tsx
<div className="flex flex-col p-5 min-h-screen">
  <h1 className="text-2xl font-bold mb-5">Login</h1>
  <input className="border border-gray-300 p-2.5 mb-4 rounded" />
  <button className="bg-orange-500 p-4 text-white rounded hover:bg-orange-600">
    Login
  </button>
</div>
```

---

## MODULE 6: SCREEN COMPONENTS CONVERSION

### 6.1 Login Screen
**File**: `src/components/screens/NewLoginScreen.tsx`

**Key Changes**:
- Replace `View` → `div`
- Replace `Text` → `span`, `p`, `h1`
- Replace `TextInput` → `input`
- Replace `TouchableOpacity` → `button`
- Replace `SafeAreaView` → `div`
- Replace `KeyboardAvoidingView` → Remove (not needed)
- Replace `ScrollView` → `div` with overflow
- Replace `Dimensions.get('window')` → `window.innerWidth/innerHeight`
- Replace `Keyboard.addListener` → Not needed
- Replace `useFonts` → Import fonts via CSS

**React Web Implementation**:
```tsx
// src/components/screens/NewLoginScreen.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; // or use react-icons
import { loginWithPassword } from '@/api/authApi';
import { useAuth } from '@/context/AuthContext';
import './NewLoginScreen.css';

interface NewLoginScreenProps {
  onProceed?: (data: { phone?: string; password?: string }) => void;
  onForgotPassword?: () => void;
  onSignup?: () => void;
}

const NewLoginScreen: React.FC<NewLoginScreenProps> = ({
  onProceed,
  onForgotPassword,
  onSignup,
}) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (phone) setPhoneError(false);
  }, [phone]);

  useEffect(() => {
    if (password) setPasswordError(false);
  }, [password]);

  const validatePhone = (phone: string): boolean => {
    return phone.length === 10;
  };

  const handleLogin = async () => {
    setErrorMessage('');
    let hasError = false;

    if (!phone || !validatePhone(phone)) {
      setPhoneError(true);
      hasError = true;
    }

    if (!password) {
      setPasswordError(true);
      hasError = true;
    }

    if (hasError) {
      setErrorMessage('Please enter correct password');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const response = await loginWithPassword(formattedPhone, password);

      if (response.token) {
        await login(response.token);

        if (keepSignedIn) {
          localStorage.setItem('keep_signed_in', 'true');
        }

        if (onProceed) {
          onProceed({ phone: formattedPhone, password });
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorMessage('Login failed. Please try again.');
        setPasswordError(true);
      }
    } catch (error: any) {
      let errorMsg = 'Please enter correct password';
      if (error.error) {
        errorMsg = error.error;
      } else if (error.message) {
        errorMsg = error.message;
      }
      setErrorMessage(errorMsg);
      setPasswordError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <img src="/assets/images/logo.png" alt="Logo" className="logo" />
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to continue</p>
        </div>

        <div className="login-form">
          <div className="input-group">
            <label className="input-label">Phone Number</label>
            <input
              type="tel"
              className={`input ${phoneError ? 'input-error' : ''}`}
              placeholder="Enter 10-digit phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={10}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`input ${passwordError ? 'input-error' : ''}`}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="error-message">{errorMessage}</div>
          )}

          <div className="options-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
              />
              <span>Keep me signed in</span>
            </label>
            <button
              type="button"
              className="forgot-password-link"
              onClick={onForgotPassword || (() => navigate('/forgot-password'))}
            >
              Forgot Password?
            </button>
          </div>

          <button
            className="login-button"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="signup-prompt">
            <span>Don't have an account? </span>
            <button
              type="button"
              className="signup-link"
              onClick={onSignup || (() => navigate('/signup'))}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewLoginScreen;
```

### 6.2 Dashboard Screen
**File**: `src/components/screens/DashboardScreen.tsx`

**Key Changes**:
- Replace `SafeAreaView` → `div`
- Replace `ScrollView` → `div` with overflow
- Replace `TouchableOpacity` → `button` or `div` with onClick
- Replace `Feather` icons → Use `react-icons` or `lucide-react`
- Replace `useSafeAreaInsets()` → CSS padding
- Replace drawer animation → CSS transitions or framer-motion

**React Web Implementation** (simplified):
```tsx
// src/components/screens/DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Plus } from 'lucide-react';
import { getUserProfile } from '@/api/userApi';
import { getRatingsForMe } from '@/api/ratingApi';
import Navigation from '@/components/ui/Navigation';
import './DashboardScreen.css';

interface DashboardProps {
  onStartScoring: () => void;
  receivedScroretotal: number;
  pendingScroretotal: number;
  sapienIScoredLength: number;
  blockedScoreLength: number;
  setUpdated: (updated: boolean) => void;
}

const DashboardScreen: React.FC<DashboardProps> = ({
  onStartScoring,
  receivedScroretotal,
  pendingScroretotal,
  sapienIScoredLength,
  blockedScoreLength,
  setUpdated,
}) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfile();
        setUserData(response?.user);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

  const StatCard = ({ title, value, notification, onPress }: any) => (
    <div className="stat-card" onClick={onPress}>
      <span className="stat-card-title">{title}</span>
      <div className="stat-card-right">
        <span className="stat-card-value">{value}</span>
        {notification && <span className="notification">{notification}</span>}
        <ChevronRight size={22} />
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Welcome, {userData?.name || 'User'}</p>
      </div>

      <div className="dashboard-content">
        <div className="stats-section">
          <StatCard
            title="Scores Received"
            value={receivedScroretotal}
            onPress={() => navigate('/scores-received')}
          />
          <StatCard
            title="Pending Requests"
            value={pendingScroretotal}
            notification={pendingScroretotal > 0 ? `${pendingScroretotal} new` : undefined}
            onPress={() => navigate('/sapiens-requests')}
          />
          <StatCard
            title="Sapiens Scored"
            value={sapienIScoredLength}
            onPress={() => navigate('/sapiens-scored')}
          />
          <StatCard
            title="Blocked"
            value={blockedScoreLength}
            onPress={() => navigate('/sapiens-blocked')}
          />
        </div>

        <button className="score-button" onClick={onStartScoring}>
          <Plus size={24} />
          <span>Score a Sapien</span>
        </button>
      </div>

      <Navigation currentScreen={currentScreen} onNavigate={setCurrentScreen} />
    </div>
  );
};

export default DashboardScreen;
```

### 6.3 User Selection Screen
**File**: `src/components/screens/UserSelectionScreen.tsx`

**Key Changes**:
- Replace `expo-contacts` → Web Contacts API (limited support) or manual input only
- Replace `FlatList` → `div` with `.map()`
- Replace `KeyboardAvoidingView` → Not needed

**Note**: Web doesn't have native contact access like mobile. Options:
1. Manual email/phone input only
2. Use browser's Contact Picker API (limited browser support)
3. Import contacts via file upload

### 6.4 Scoring Flow Screen
**File**: `src/components/screens/ScoringFlowScreen.tsx`

**Key Changes**:
- Replace `expo-haptics` → Web Vibration API or remove
- Replace slider components → HTML5 range input or custom slider
- Replace `BackHandler` → Browser back button handling

```tsx
// Handle browser back button
useEffect(() => {
  const handlePopState = (e: PopStateEvent) => {
    e.preventDefault();
    onBack();
  };

  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, [onBack]);
```

---

## MODULE 7: NOTIFICATIONS

### 7.1 Push Notifications Conversion

**React Native**: Uses Expo Notifications + Native Notify
```typescript
import * as Notifications from 'expo-notifications';
import registerNNPushToken from 'native-notify';
```

**React Web**: Use Web Push API + Service Workers

**Step 1**: Create Service Worker
```javascript
// public/service-worker.js
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/assets/images/logo.png',
    badge: '/assets/images/badge.png',
    data: data.data,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
```

**Step 2**: Register Service Worker & Request Permission
```typescript
// src/utils/notifications.ts
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return null;
  }

  if (Notification.permission === 'granted') {
    return await registerPushNotification();
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return await registerPushNotification();
    }
  }

  return null;
};

const registerPushNotification = async () => {
  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');

    // Get push subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        import.meta.env.VITE_VAPID_PUBLIC_KEY
      ),
    });

    // Send subscription to backend
    await savePushSubscription(subscription);
    return subscription;
  } catch (error) {
    console.error('Error registering push notification:', error);
    return null;
  }
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

**Step 3**: Toast Notifications (Alternative)
For in-app notifications, use `react-toastify`:

```typescript
// src/utils/toast.ts
import { toast } from 'react-toastify';

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    position: 'top-right',
    autoClose: 5000,
  });
};

export const showInfoToast = (message: string) => {
  toast.info(message);
};
```

**Usage in App**:
```tsx
// src/App.tsx
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  );
}
```

---

## MODULE 8: REAL-TIME COMMUNICATION (WebSockets)

### 8.1 Socket.io Integration

**React Native & React Web**: Same implementation!

```typescript
// src/hooks/useSocket.ts
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');

    socketRef.current = io(url, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [url]);

  const emit = (event: string, data: any) => {
    socketRef.current?.emit(event, data);
  };

  const on = (event: string, callback: (data: any) => void) => {
    socketRef.current?.on(event, callback);
  };

  const off = (event: string) => {
    socketRef.current?.off(event);
  };

  return { socket: socketRef.current, isConnected, emit, on, off };
};
```

**Usage in Chat/Echo Rooms**:
```tsx
// src/components/screens/ChatScreen.tsx
import { useSocket } from '@/hooks/useSocket';

const ChatScreen = ({ roomId }: { roomId: string }) => {
  const { socket, isConnected, emit, on, off } = useSocket('wss://sapio.one');
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (isConnected) {
      emit('join-room', { roomId });

      on('new-message', (message) => {
        setMessages((prev) => [...prev, message]);
      });
    }

    return () => {
      off('new-message');
      emit('leave-room', { roomId });
    };
  }, [isConnected, roomId]);

  const sendMessage = (content: string) => {
    emit('send-message', { roomId, content });
  };

  return (
    <div className="chat-container">
      {/* Chat UI */}
    </div>
  );
};
```

---

## MODULE 9: ANIMATIONS

### 9.1 Animation Library Conversion

**React Native**: Uses `react-native-reanimated` and `Animated` API
**React Web**: Use `framer-motion` or CSS transitions

**Framer Motion Example**:
```tsx
import { motion } from 'framer-motion';

// Fade in animation
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// Slide in animation
<motion.div
  initial={{ x: -300 }}
  animate={{ x: 0 }}
  exit={{ x: -300 }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
>
  Drawer content
</motion.div>

// Scale animation
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

**CSS Transitions Example**:
```css
.fade-enter {
  opacity: 0;
}

.fade-enter-active {
  opacity: 1;
  transition: opacity 300ms ease-in;
}

.fade-exit {
  opacity: 1;
}

.fade-exit-active {
  opacity: 0;
  transition: opacity 300ms ease-out;
}
```

---

## MODULE 10: FONTS & ASSETS

### 10.1 Font Loading

**React Native**: Uses `expo-font`
```typescript
import { useFonts } from 'expo-font';
const [fontsLoaded] = useFonts({
  'Poppins-Regular': require('./assets/fonts/Poppins/Poppins-Regular.ttf'),
});
```

**React Web**: Use CSS `@font-face` or Google Fonts

**Option 1: Local Fonts**
```css
/* src/styles/fonts.css */
@font-face {
  font-family: 'Poppins';
  src: url('/assets/fonts/Poppins/Poppins-Light.ttf') format('truetype');
  font-weight: 300;
  font-style: normal;
}

@font-face {
  font-family: 'Poppins';
  src: url('/assets/fonts/Poppins/Poppins-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: 'Poppins';
  src: url('/assets/fonts/Poppins/Poppins-Medium.ttf') format('truetype');
  font-weight: 500;
  font-style: normal;
}

@font-face {
  font-family: 'Poppins';
  src: url('/assets/fonts/Poppins/Poppins-SemiBold.ttf') format('truetype');
  font-weight: 600;
  font-style: normal;
}

@font-face {
  font-family: 'Poppins';
  src: url('/assets/fonts/Poppins/Poppins-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
}

body {
  font-family: 'Poppins', sans-serif;
}
```

**Option 2: Google Fonts**
```html
<!-- public/index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### 10.2 Image Assets

**React Native**:
```tsx
<Image source={require('./assets/images/logo.png')} />
```

**React Web**:
```tsx
<img src="/assets/images/logo.png" alt="Logo" />
// or with import
import logo from '@/assets/images/logo.png';
<img src={logo} alt="Logo" />
```

---

## MODULE 11: NETWORK CONNECTIVITY

### 11.1 Network Status Detection

**React Native**: Uses `@react-native-community/netinfo`
```typescript
import NetInfo from '@react-native-community/netinfo';
const unsubscribe = NetInfo.addEventListener(state => {
  setIsConnected(state.isConnected ?? true);
});
```

**React Web**: Use `navigator.onLine` and online/offline events
```typescript
// src/hooks/useNetworkStatus.ts
import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
```

**Usage**:
```tsx
// src/App.tsx
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

function App() {
  const isOnline = useNetworkStatus();

  if (!isOnline) {
    return (
      <div className="offline-container">
        <div className="offline-icon">📡</div>
        <h1>No Internet Connection</h1>
        <p>Please check your network settings</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return <AppRoutes />;
}
```

---

## MODULE 12: FILE UPLOADS

### 12.1 Image Upload Conversion

**React Native**: Uses `expo-image-picker`
```typescript
import * as ImagePicker from 'expo-image-picker';
const result = await ImagePicker.launchImageLibraryAsync({...});
```

**React Web**: Use HTML file input
```tsx
// src/components/ImageUpload.tsx
import React, { useState } from 'react';
import { UploadFile } from '@/api/userApi';

const ImageUpload: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);

      const response = await fetch('https://sapio.one/node/api/upload/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log('Upload successful:', data.location);
      return data.location;
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id="image-upload-input"
      />
      <label htmlFor="image-upload-input" className="upload-button">
        Choose Image
      </label>

      {preview && (
        <div className="preview">
          <img src={preview} alt="Preview" />
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## MODULE 13: UTILITIES & HELPERS

### 13.1 Date Utilities
**File**: `src/utils/date.ts` (Same as React Native)

```typescript
export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function formatDate(input?: string | number | Date | null): string {
  try {
    if (!input) return '';
    const d = new Date(input);
    if (isNaN(d.getTime())) return '';
    const day = pad2(d.getDate());
    const month = pad2(d.getMonth() + 1);
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return '';
  }
}

export function formatTime(input?: string | number | Date | null): string {
  try {
    if (!input) return '';
    const d = new Date(input);
    if (isNaN(d.getTime())) return '';
    const hours = pad2(d.getHours());
    const minutes = pad2(d.getMinutes());
    return `${hours}:${minutes}`;
  } catch {
    return '';
  }
}
```

### 13.2 UUID Generation

**React Native**: Uses `react-native-uuid`
**React Web**: Use `uuid` package (same)

```typescript
import { v4 as uuidv4 } from 'uuid';

const id = uuidv4();
```

---

## MODULE 14: MAIN APP SETUP

### 14.1 App Entry Point

**File**: `src/main.tsx`
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import './styles/fonts.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 14.2 Main App Component

**File**: `src/App.tsx`
```tsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { AppRoutes } from './routes/AppRoutes';
import { ToastContainer } from 'react-toastify';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const isOnline = useNetworkStatus();

  if (!isOnline) {
    return (
      <div className="offline-screen">
        <div className="offline-icon">📡</div>
        <h1>No Internet Connection</h1>
        <p>Please check your network settings</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
          <ToastContainer />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

### 14.3 Global Styles

**File**: `src/styles/index.css`
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #F3F3F3;
}

#root {
  min-height: 100vh;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Common utility classes */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.text-center {
  text-align: center;
}

/* Loading spinner */
.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #FF8541;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

---

## MODULE 15: RESPONSIVE DESIGN

### 15.1 Media Queries

**React Native**: Uses `Dimensions.get('window')` and conditional rendering
**React Web**: Use CSS media queries

```css
/* Mobile first approach */
.container {
  padding: 10px;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 20px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 40px;
    max-width: 1200px;
    margin: 0 auto;
  }
}

/* Large desktop */
@media (min-width: 1440px) {
  .container {
    max-width: 1400px;
  }
}
```

### 15.2 Responsive Hook

```typescript
// src/hooks/useResponsive.ts
import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: windowSize.width < 768,
    isTablet: windowSize.width >= 768 && windowSize.width < 1024,
    isDesktop: windowSize.width >= 1024,
    width: windowSize.width,
    height: windowSize.height,
  };
};
```

**Usage**:
```tsx
const { isMobile, isDesktop } = useResponsive();

return (
  <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
    {/* Content */}
  </div>
);
```

---

## MODULE 16: TESTING SETUP

### 16.1 Testing Libraries

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
```

### 16.2 Vitest Configuration

**File**: `vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

### 16.3 Example Test

```typescript
// src/components/screens/__tests__/LoginScreen.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import NewLoginScreen from '../NewLoginScreen';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('NewLoginScreen', () => {
  it('renders login form', () => {
    renderWithProviders(<NewLoginScreen />);
    expect(screen.getByPlaceholderText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it('shows error for invalid phone', async () => {
    renderWithProviders(<NewLoginScreen />);

    const phoneInput = screen.getByPlaceholderText(/phone number/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(phoneInput, { target: { value: '123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter correct password/i)).toBeInTheDocument();
    });
  });
});
```

---

## MODULE 17: DEPLOYMENT

### 17.1 Build Configuration

**File**: `vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          api: ['axios', 'socket.io-client'],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://sapio.one',
        changeOrigin: true,
      },
    },
  },
});
```

### 17.2 Build Commands

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint src --ext ts,tsx"
  }
}
```

### 17.3 Deployment Options

**Option 1: Vercel**
```bash
npm install -g vercel
vercel
```

**Option 2: Netlify**
```bash
npm run build
# Upload dist folder to Netlify
```

**Option 3: AWS S3 + CloudFront**
```bash
npm run build
aws s3 sync dist/ s3://your-bucket-name
```

**Option 4: Docker**
```dockerfile
# Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## MODULE 18: MIGRATION CHECKLIST

### 18.1 Pre-Migration Tasks
- [ ] Audit all React Native dependencies
- [ ] Identify platform-specific features (contacts, haptics, etc.)
- [ ] Document all API endpoints and data flows
- [ ] Review authentication flow
- [ ] List all screens and navigation paths
- [ ] Identify shared components and utilities

### 18.2 Setup Phase
- [ ] Initialize React project (Vite/CRA/Next.js)
- [ ] Configure TypeScript
- [ ] Set up folder structure
- [ ] Install core dependencies (React Router, Axios, etc.)
- [ ] Configure path aliases (@/ imports)
- [ ] Set up environment variables
- [ ] Configure ESLint and Prettier

### 18.3 Core Infrastructure
- [ ] Create API client with interceptors
- [ ] Implement Auth Context
- [ ] Set up routing system
- [ ] Create Protected Route component
- [ ] Implement network status detection
- [ ] Set up notification system (toast/push)
- [ ] Configure WebSocket connection

### 18.4 API Layer
- [ ] Convert authApi.ts
- [ ] Convert userApi.ts
- [ ] Convert ratingApi.ts
- [ ] Convert relationApi.ts
- [ ] Convert notificationApi.ts
- [ ] Convert chatRoomApi.ts
- [ ] Convert messageApi.ts
- [ ] Test all API endpoints

### 18.5 Screen Components
- [ ] Convert NewLoginScreen
- [ ] Convert NewSignupScreen
- [ ] Convert ForgotPasswordScreen
- [ ] Convert VerifyResetEmailScreen
- [ ] Convert ResetPasswordScreen
- [ ] Convert RegistrationScreen
- [ ] Convert DashboardScreen
- [ ] Convert UserSelectionScreen
- [ ] Convert RelationshipSelectionScreen
- [ ] Convert ScoringFlowScreen
- [ ] Convert SapienScoreScreen
- [ ] Convert ScoresReceivedScreen
- [ ] Convert SapiensScoredSentScreen
- [ ] Convert SapiensRequests
- [ ] Convert SapiensBlocked
- [ ] Convert EchoRoomsScreen
- [ ] Convert ChatScreen
- [ ] Convert ProfileScreen
- [ ] Convert SettingsScreen
- [ ] Convert NotificationScreen

### 18.6 UI Components
- [ ] Convert Navigation component
- [ ] Convert RatingSlider
- [ ] Convert ScoreSlider
- [ ] Convert custom modals
- [ ] Convert loading indicators
- [ ] Convert toast/notification components
- [ ] Style all components with CSS

### 18.7 Styling
- [ ] Set up global styles
- [ ] Import/configure fonts
- [ ] Create responsive breakpoints
- [ ] Style all screens
- [ ] Add hover/focus states
- [ ] Test on different screen sizes
- [ ] Ensure accessibility (ARIA labels, keyboard navigation)

### 18.8 Features
- [ ] Implement authentication flow
- [ ] Implement user registration
- [ ] Implement password reset
- [ ] Implement scoring flow
- [ ] Implement rating management
- [ ] Implement Echo Rooms (chat)
- [ ] Implement real-time messaging
- [ ] Implement notifications
- [ ] Implement profile management
- [ ] Implement settings

### 18.9 Testing
- [ ] Set up testing framework
- [ ] Write unit tests for utilities
- [ ] Write component tests
- [ ] Write integration tests
- [ ] Test API error handling
- [ ] Test authentication flows
- [ ] Test responsive design
- [ ] Cross-browser testing

### 18.10 Optimization
- [ ] Code splitting
- [ ] Lazy loading routes
- [ ] Image optimization
- [ ] Bundle size optimization
- [ ] Performance profiling
- [ ] SEO optimization (meta tags)
- [ ] PWA configuration (optional)

### 18.11 Deployment
- [ ] Configure build process
- [ ] Set up CI/CD pipeline
- [ ] Configure production environment variables
- [ ] Deploy to staging
- [ ] Test on staging
- [ ] Deploy to production
- [ ] Set up monitoring/analytics

---

## 📊 CONVERSION SUMMARY TABLE

| Feature | React Native | React Web | Complexity |
|---------|--------------|-----------|------------|
| **Routing** | Expo Router | React Router v6 | Medium |
| **Storage** | AsyncStorage | localStorage | Easy |
| **HTTP Client** | Axios | Axios | Easy |
| **Auth** | Context + AsyncStorage | Context + localStorage | Easy |
| **Notifications** | Expo Notifications | Web Push API / Toast | Hard |
| **WebSockets** | Socket.io | Socket.io | Easy |
| **Animations** | Reanimated | Framer Motion | Medium |
| **Fonts** | Expo Font | CSS @font-face | Easy |
| **Images** | Image component | img tag | Easy |
| **Contacts** | Expo Contacts | Not available | Hard |
| **Haptics** | Expo Haptics | Vibration API | Medium |
| **Network Status** | NetInfo | navigator.onLine | Easy |
| **File Upload** | ImagePicker | File input | Medium |
| **Styling** | StyleSheet | CSS/CSS Modules | Medium |
| **Navigation** | Stack/Tab Navigator | React Router | Medium |

---

## 🎯 KEY DIFFERENCES & GOTCHAS

### 1. **No Native Modules**
Web doesn't have access to:
- Device contacts
- Camera/Gallery (limited via file input)
- Haptic feedback (limited Vibration API)
- Native notifications (requires service workers)

### 2. **Styling Differences**
- No `flex: 1` - use `height: 100%` or `min-height: 100vh`
- No `StyleSheet.create()` - use CSS files or CSS-in-JS
- Different units: `px`, `rem`, `em`, `%`, `vh`, `vw`
- Hover states available (`:hover`)
- Media queries for responsive design

### 3. **Navigation**
- No native stack navigation
- Browser back button must be handled
- URL-based routing
- Deep linking works differently

### 4. **Performance**
- No native performance
- Virtual DOM overhead
- Bundle size matters
- Code splitting recommended
- Lazy loading important

### 5. **Platform-Specific Code**
Remove all:
- `Platform.OS` checks
- `Platform.select()`
- iOS/Android specific code

### 6. **Events**
- `onPress` → `onClick`
- `onChangeText` → `onChange`
- Different event objects
- No gesture handlers (use mouse events)

---

## 🚀 RECOMMENDED DEVELOPMENT WORKFLOW

### Phase 1: Foundation (Week 1)
1. Set up project structure
2. Configure build tools
3. Implement API client
4. Set up authentication
5. Create routing system

### Phase 2: Core Screens (Week 2-3)
1. Convert authentication screens
2. Convert dashboard
3. Convert user selection
4. Convert scoring flow
5. Test core user journey

### Phase 3: Features (Week 4-5)
1. Implement rating management
2. Implement Echo Rooms
3. Implement notifications
4. Implement profile/settings
5. Add real-time features

### Phase 4: Polish (Week 6)
1. Responsive design
2. Animations
3. Error handling
4. Loading states
5. Accessibility

### Phase 5: Testing & Deployment (Week 7)
1. Write tests
2. Performance optimization
3. Cross-browser testing
4. Deploy to staging
5. Production deployment

---

## 📚 RECOMMENDED LIBRARIES

### Essential
- `react-router-dom` - Routing
- `axios` - HTTP client
- `socket.io-client` - WebSockets
- `react-toastify` - Notifications

### UI/Styling
- `framer-motion` - Animations
- `lucide-react` or `react-icons` - Icons
- `tailwindcss` or `styled-components` - Styling

### Forms
- `react-hook-form` - Form management
- `zod` - Validation

### State Management (Optional)
- `@tanstack/react-query` - Server state
- `zustand` or `redux-toolkit` - Client state

### Utilities
- `date-fns` - Date manipulation
- `uuid` - ID generation
- `clsx` - Conditional classes

### Development
- `vite` - Build tool
- `vitest` - Testing
- `@testing-library/react` - Component testing
- `eslint` - Linting
- `prettier` - Formatting

---

## 🔗 USEFUL RESOURCES

### Documentation
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Socket.io](https://socket.io/docs/v4/)
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)

### Tutorials
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [CSS Tricks - Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [Web.dev - Progressive Web Apps](https://web.dev/progressive-web-apps/)

---

## ✅ FINAL NOTES

### What Stays the Same
- Business logic
- API endpoints
- Data structures
- State management patterns
- Most utility functions

### What Changes
- UI components (View → div, Text → span, etc.)
- Styling approach (StyleSheet → CSS)
- Navigation (Expo Router → React Router)
- Storage (AsyncStorage → localStorage)
- Platform-specific features

### Best Practices
1. **Start with core features** - Get authentication and basic navigation working first
2. **Test frequently** - Don't wait until the end to test
3. **Responsive from day 1** - Design for mobile, tablet, and desktop
4. **Accessibility matters** - Use semantic HTML and ARIA labels
5. **Performance** - Code split, lazy load, optimize images
6. **Error handling** - Handle network errors, API errors, validation errors
7. **Loading states** - Show spinners/skeletons during async operations
8. **User feedback** - Use toasts/notifications for actions

### Common Pitfalls to Avoid
- ❌ Not handling browser back button
- ❌ Forgetting to make design responsive
- ❌ Not optimizing bundle size
- ❌ Ignoring accessibility
- ❌ Not handling offline state
- ❌ Hardcoding API URLs
- ❌ Not implementing proper error boundaries

---

## 🎉 CONCLUSION

This guide provides a comprehensive, module-by-module breakdown for converting the SapienScore React Native application to React Web. The conversion is straightforward for most features, with the main challenges being:

1. **UI Components** - Converting React Native components to HTML/CSS
2. **Styling** - Adapting StyleSheet to CSS
3. **Platform Features** - Finding web alternatives for native features
4. **Notifications** - Implementing web push notifications

Follow the checklist, take it module by module, and you'll have a fully functional React web application that mirrors the React Native app's functionality.

**Estimated Timeline**: 6-8 weeks for a complete conversion with testing and deployment.

**Good luck with your conversion! 🚀**

---

*Document created: 2025*
*Last updated: 2025*
*Version: 1.0*


