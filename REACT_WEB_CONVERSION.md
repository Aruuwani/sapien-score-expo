# React Native to React Web - Conversion Guide

## 1. Project Initialization

```bash
npm create vite@latest sapienscore-web -- --template react-ts
cd sapienscore-web
npm install react-router-dom axios socket.io-client react-toastify framer-motion lucide-react uuid
```

**Folder Structure:**
```
src/
├── api/              # API calls
├── components/       # UI components
│   ├── screens/     # Page components
│   └── ui/          # Reusable UI
├── context/         # Context providers
├── hooks/           # Custom hooks
├── routes/          # Routing config
├── utils/           # Helper functions
└── styles/          # CSS files
```

---

## 2. Component Replacements

| React Native | React Web |
|--------------|-----------|
| `View` | `div` |
| `Text` | `span` / `p` / `h1-h6` |
| `TextInput` | `input` / `textarea` |
| `TouchableOpacity` | `button` |
| `ScrollView` | `div` with overflow |
| `FlatList` | `div` with `.map()` |
| `Image` | `img` |
| `SafeAreaView` | `div` |

---

## 3. Storage

**React Native:**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('key', 'value');
const value = await AsyncStorage.getItem('key');
```

**React Web:**
```typescript
localStorage.setItem('key', 'value');
const value = localStorage.getItem('key');
```

---

## 4. Routing

**Setup:**
```typescript
// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';

export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginScreen />} />
    <Route path="/dashboard" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
    {/* Add all routes */}
  </Routes>
);
```

**Navigation:**
```typescript
// React Native: router.push('/dashboard')
// React Web:
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/dashboard');
```

---

## 5. API Client

**File:** `src/api/apiClient.ts`

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://sapio.one/node/api',
  timeout: 30000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

---

## 6. Authentication Context

**File:** `src/context/AuthContext.tsx`

```typescript
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) setAuthToken(token);
  }, []);

  const login = (token) => {
    localStorage.setItem('auth_token', token);
    setAuthToken(token);
  };

  const logout = () => {
    localStorage.clear();
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ authToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

## 7. Styling

**React Native:**
```typescript
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  button: { backgroundColor: '#FF8541' },
});
```

**React Web (CSS):**
```css
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 20px;
}

.button {
  background-color: #FF8541;
  border: none;
  cursor: pointer;
}
```

---

## 8. Notifications

**Install:**
```bash
npm install react-toastify
```

**Usage:**
```typescript
import { toast } from 'react-toastify';

toast.success("Success!");
toast.error("Error!");
```

**Setup in App:**
```typescript
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

<ToastContainer />
```

---

## 9. WebSockets (Same as React Native)

```typescript
import { io } from 'socket.io-client';

const socket = io('wss://sapio.one', {
  auth: { token: localStorage.getItem('auth_token') }
});

socket.on('connect', () => console.log('Connected'));
socket.emit('event', data);
```

---

## 10. Network Status

```typescript
const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
  window.addEventListener('online', () => setIsOnline(true));
  window.addEventListener('offline', () => setIsOnline(false));
}, []);
```

---

## 11. File Upload

```typescript
<input 
  type="file" 
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    // Upload formData
  }}
/>
```

---

## 12. Fonts

**Create:** `src/styles/fonts.css`

```css
@font-face {
  font-family: 'Poppins';
  src: url('/assets/fonts/Poppins-Regular.ttf');
  font-weight: 400;
}

body {
  font-family: 'Poppins', sans-serif;
}
```

---

## 13. Screen Conversion Example

### Login Screen

**React Native → React Web**

```typescript
// React Web: src/components/screens/LoginScreen.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithPassword } from '@/api/authApi';
import { useAuth } from '@/context/AuthContext';
import './LoginScreen.css';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await loginWithPassword(`+91${phone}`, password);
      await login(response.token);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Welcome Back</h1>
      <input
        type="tel"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </div>
  );
};
```

---

## 14. Main App Setup

**File:** `src/App.tsx`

```typescript
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

## 15. API Files (Copy & Modify)

All API files remain the same, just update imports:

**Files to copy:**
- `api/authApi.ts` ✓ (no changes)
- `api/userApi.ts` ✓ (no changes)
- `api/ratingApi.ts` ✓ (no changes)
- `api/relationApi.ts` ✓ (no changes)
- `api/notificationApi.ts` ✓ (no changes)
- `api/chatRoomApi.ts` ✓ (no changes)
- `api/messageApi.ts` ✓ (no changes)

**Only change:** Import from `./apiClient` instead of React Native path.

---

## 16. Screens to Convert

| Screen | Priority | Complexity |
|--------|----------|------------|
| NewLoginScreen | High | Easy |
| NewSignupScreen | High | Easy |
| DashboardScreen | High | Medium |
| UserSelectionScreen | High | Medium |
| ScoringFlowScreen | High | Hard |
| ScoresReceivedScreen | Medium | Easy |
| SapiensScoredSentScreen | Medium | Easy |
| EchoRoomsScreen | Medium | Medium |
| ChatScreen | Medium | Hard |
| ProfileScreen | Low | Easy |

**Conversion Steps for Each Screen:**
1. Replace React Native components with HTML elements
2. Convert StyleSheet to CSS file
3. Replace `AsyncStorage` with `localStorage`
4. Replace `router.push()` with `navigate()`
5. Update event handlers (`onPress` → `onClick`)
6. Test functionality

---

## 17. Responsive Design

```css
/* Mobile First */
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
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

---

## 18. Build & Deploy

```bash
# Build
npm run build

# Deploy to Vercel
npm install -g vercel
vercel

# Or Netlify
netlify deploy --prod --dir=dist
```

---

## Quick Checklist

### Setup
- [ ] Initialize Vite project
- [ ] Install dependencies
- [ ] Create folder structure
- [ ] Setup API client
- [ ] Setup Auth Context
- [ ] Setup routing

### Core Features
- [ ] Convert Login screen
- [ ] Convert Signup screen
- [ ] Convert Dashboard
- [ ] Convert User Selection
- [ ] Convert Scoring Flow
- [ ] Convert Rating screens

### Additional Features
- [ ] Setup notifications (toast)
- [ ] Setup WebSockets
- [ ] Convert Chat screens
- [ ] Add responsive design
- [ ] Add loading states
- [ ] Add error handling

### Testing & Deploy
- [ ] Test all flows
- [ ] Test on mobile/tablet/desktop
- [ ] Build production
- [ ] Deploy

---

## Key Differences Summary

| Feature | React Native | React Web |
|---------|--------------|-----------|
| **Components** | View, Text, TouchableOpacity | div, span, button |
| **Storage** | AsyncStorage | localStorage |
| **Navigation** | Expo Router | React Router |
| **Styling** | StyleSheet | CSS files |
| **Events** | onPress | onClick |
| **Notifications** | Expo Notifications | react-toastify |
| **Fonts** | expo-font | CSS @font-face |

---

## Estimated Timeline

- **Week 1-2:** Setup + Auth screens
- **Week 3-4:** Core screens (Dashboard, Scoring)
- **Week 5:** Additional features (Chat, Ratings)
- **Week 6:** Polish + Testing
- **Week 7:** Deploy

**Total: 6-7 weeks**

---

## Need Help?

Refer to detailed guide: `REACT_CONVERSION_GUIDE.md`
Quick reference: `QUICK_REFERENCE.md`
Step-by-step: `STEP_BY_STEP_GUIDE.md`

