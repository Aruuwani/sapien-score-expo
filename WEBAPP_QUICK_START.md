# SapienScore Web App - Quick Start Guide

## 🚀 Running the App

### Start Development Server
```bash
cd webapp
npm run dev
```

The app will be available at: **http://localhost:3000/**

### Build for Production
```bash
cd webapp
npm run build
```

### Preview Production Build
```bash
cd webapp
npm run preview
```

---

## 📁 Project Structure

```
webapp/
├── src/
│   ├── api/                    # API layer (all converted ✅)
│   ├── components/
│   │   ├── screens/            # Screen components
│   │   │   ├── NewLoginScreen.tsx ✅
│   │   │   ├── NewSignupScreen.tsx ✅
│   │   │   ├── ForgotPasswordScreen.tsx ✅
│   │   │   ├── VerifyResetEmailScreen.tsx ✅
│   │   │   ├── ResetPasswordScreen.tsx ✅
│   │   │   ├── RegistrationScreen.tsx ✅
│   │   │   ├── DashboardScreen.tsx ⏳
│   │   │   └── ... (13 more screens to convert)
│   │   └── ui/                 # Reusable UI components
│   ├── context/                # React Context (Auth, App)
│   ├── hooks/                  # Custom hooks
│   ├── routes/                 # Routing configuration
│   ├── styles/                 # Global styles
│   ├── utils/                  # Utility functions
│   ├── App.tsx                 # Main app component
│   └── main.tsx                # Entry point
├── public/
│   └── assets/                 # Static assets (fonts, images)
├── .env                        # Environment variables
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🔧 How to Convert a Screen

### Step 1: View the React Native Screen
```bash
# Example: Converting DashboardScreen
cat "update with notification/components/screens/DashboardScreen.tsx"
```

### Step 2: Create React Web Version
1. Replace the placeholder in `webapp/src/components/screens/DashboardScreen.tsx`
2. Convert React Native components to HTML:
   - `View` → `div`
   - `Text` → `span`, `p`, `h1-h6`
   - `TextInput` → `input`
   - `TouchableOpacity` → `button`
   - `ScrollView` → `div` with `overflow-y: auto`
   - `SafeAreaView` → `div`

### Step 3: Convert Event Handlers
- `onPress` → `onClick`
- `onChangeText` → `onChange` (with `e.target.value`)

### Step 4: Convert Storage
- `AsyncStorage.getItem()` → `localStorage.getItem()`
- `AsyncStorage.setItem()` → `localStorage.setItem()`

### Step 5: Convert Navigation
```typescript
// React Native
import { router } from 'expo-router';
router.push('/dashboard');

// React Web
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/dashboard');
```

### Step 6: Create CSS File
- Convert `StyleSheet.create()` to CSS file
- Use same class names
- Maintain mobile-responsive design

### Step 7: Test
- Run the app
- Test all functionality
- Check mobile responsiveness

---

## 📋 Screen Conversion Checklist

For each screen, ensure:
- [ ] All imports updated (React Native → React Web)
- [ ] All components converted (View → div, etc.)
- [ ] All event handlers converted (onPress → onClick)
- [ ] Navigation converted (router → navigate)
- [ ] Storage converted (AsyncStorage → localStorage)
- [ ] CSS file created
- [ ] Mobile-responsive design
- [ ] Error handling
- [ ] Loading states
- [ ] TypeScript types
- [ ] Tested and working

---

## 🎨 Styling Guidelines

### Colors (from mobile app)
- Primary: `#FF8541`
- Background: `#F3F3F3`
- Text: `#333`
- Secondary Text: `#666`
- Border: `#E0E0E0`
- Error: `#FF0000`
- Success: `#4CAF50`

### Fonts
- Family: `'Poppins', sans-serif`
- Weights: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### Responsive Breakpoints
```css
/* Mobile */
@media (max-width: 768px) { }

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

---

## 🔌 API Usage

All API functions are ready to use:

```typescript
import { loginWithPassword } from '@/api/authApi';
import { getUserProfile } from '@/api/userApi';
import { getRatingsForMe } from '@/api/ratingApi';
// ... etc

// Example usage
const response = await loginWithPassword(phone, password);
const user = await getUserProfile();
```

---

## 🎯 Priority Screens to Convert Next

1. **DashboardScreen** - Main hub, most important
2. **UserSelectionScreen** - Core scoring flow
3. **RelationshipSelectionScreen** - Core scoring flow
4. **ScoringFlowScreen** - Core scoring flow
5. **ProfileScreen** - User profile
6. **SettingsScreen** - Settings
7. **ScoresReceivedScreen** - View scores
8. **EchoRoomsScreen** - Chat rooms
9. **ChatScreen** - Messaging
10. **NotificationScreen** - Notifications

---

## 🐛 Common Issues & Solutions

### Issue: Module not found
**Solution**: Check path alias in `tsconfig.json` and `vite.config.ts`

### Issue: CSS not loading
**Solution**: Import CSS file in component: `import './ComponentName.css'`

### Issue: API calls failing
**Solution**: Check `.env` file has correct API URL

### Issue: Navigation not working
**Solution**: Ensure component is wrapped in `<BrowserRouter>`

### Issue: Protected route redirecting
**Solution**: Check `AuthContext` - user must be authenticated

---

## 📚 Useful Commands

```bash
# Install new dependency
npm install package-name

# Check for TypeScript errors
npm run build

# Format code (if prettier is configured)
npm run format

# Lint code (if eslint is configured)
npm run lint
```

---

## 🎉 You're All Set!

The foundation is complete. Now just convert the remaining screens one by one, and you'll have a fully functional web app!

**Questions?** Check the React Native source code in `update with notification/components/screens/` for reference.

**Good luck!** 🚀

