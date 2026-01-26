# Quick Reference: React Native to React Web Conversion

## 🔄 Component Mapping

| React Native | React Web |
|--------------|-----------|
| `View` | `div` |
| `Text` | `span`, `p`, `h1-h6` |
| `ScrollView` | `div` with `overflow: auto` |
| `TouchableOpacity` | `button` or `div` with `onClick` |
| `TextInput` | `input` or `textarea` |
| `Image` | `img` |
| `SafeAreaView` | `div` with padding |
| `FlatList` | `div` with `.map()` |
| `ActivityIndicator` | Custom spinner |
| `Modal` | Custom modal component |
| `KeyboardAvoidingView` | Not needed |
| `StatusBar` | Not applicable |

## 📦 Package Replacements

| React Native Package | React Web Package |
|---------------------|-------------------|
| `@react-native-async-storage/async-storage` | `localStorage` (native) |
| `expo-router` | `react-router-dom` |
| `expo-notifications` | `react-toastify` + Web Push API |
| `react-native-reanimated` | `framer-motion` |
| `@react-native-community/netinfo` | `navigator.onLine` (native) |
| `expo-font` | CSS `@font-face` |
| `expo-image-picker` | HTML `<input type="file">` |
| `expo-haptics` | Vibration API (limited) |
| `expo-contacts` | Not available (manual input) |
| `react-native-uuid` | `uuid` (same) |
| `axios` | `axios` (same) |
| `socket.io-client` | `socket.io-client` (same) |

## 🎨 Styling Conversion

### React Native StyleSheet
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#FF8541',
    padding: 15,
  },
});
```

### React Web CSS
```css
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 20px;
  background-color: #fff;
}

.button {
  background-color: #FF8541;
  padding: 15px;
  border: none;
  cursor: pointer;
}
```

## 🔐 Storage

### React Native
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save
await AsyncStorage.setItem('key', 'value');

// Get
const value = await AsyncStorage.getItem('key');

// Remove
await AsyncStorage.removeItem('key');

// Clear all
await AsyncStorage.clear();
```

### React Web
```typescript
// Save
localStorage.setItem('key', 'value');

// Get
const value = localStorage.getItem('key');

// Remove
localStorage.removeItem('key');

// Clear all
localStorage.clear();
```

## 🧭 Navigation

### React Native (Expo Router)
```typescript
import { Stack } from 'expo-router';

<Stack>
  <Stack.Screen name="index" />
  <Stack.Screen name="dashboard" />
</Stack>
```

### React Web (React Router)
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
  </Routes>
</BrowserRouter>
```

## 🔔 Notifications

### React Native
```typescript
import * as Notifications from 'expo-notifications';

await Notifications.scheduleNotificationAsync({
  content: {
    title: "Title",
    body: "Body",
  },
  trigger: null,
});
```

### React Web
```typescript
import { toast } from 'react-toastify';

toast.success("Success message");
toast.error("Error message");
toast.info("Info message");
```

## 🌐 Network Status

### React Native
```typescript
import NetInfo from '@react-native-community/netinfo';

const unsubscribe = NetInfo.addEventListener(state => {
  console.log('Is connected?', state.isConnected);
});
```

### React Web
```typescript
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
```

## 📁 File Upload

### React Native
```typescript
import * as ImagePicker from 'expo-image-picker';

const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
});
```

### React Web
```typescript
<input 
  type="file" 
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0];
    // Handle file
  }}
/>
```

## 🎭 Event Handlers

| React Native | React Web |
|--------------|-----------|
| `onPress` | `onClick` |
| `onChangeText` | `onChange` |
| `onFocus` | `onFocus` |
| `onBlur` | `onBlur` |
| `onSubmitEditing` | `onSubmit` (form) |

## 📏 Dimensions

### React Native
```typescript
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
```

### React Web
```typescript
const width = window.innerWidth;
const height = window.innerHeight;

// Or with hook
const [dimensions, setDimensions] = useState({
  width: window.innerWidth,
  height: window.innerHeight,
});

useEffect(() => {
  const handleResize = () => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };
  
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

---

For detailed conversion guide, see [REACT_CONVERSION_GUIDE.md](./REACT_CONVERSION_GUIDE.md)

