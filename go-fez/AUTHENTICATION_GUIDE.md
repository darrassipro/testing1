# GO-FEZ Mobile App - Authentication Implementation

## Overview
This document describes the authentication system implementation in the React Native mobile app, mirroring the functionality of the Next.js web frontend.

## Features Implemented

### 1. **Authentication System**
- ✅ Login modal with email/password
- ✅ Sign-up modal with complete user registration
- ✅ Redux state management for user authentication
- ✅ Token-based authentication (JWT)
- ✅ Automatic token refresh on 401 errors
- ✅ Persistent authentication (AsyncStorage)
- ✅ Modal displays on app launch for unauthenticated users

### 2. **User Interface**
- ✅ User avatar display in tab bar when authenticated
- ✅ Language selector (English, French, Arabic)
- ✅ Profile screen with user information
- ✅ Logout functionality
- ✅ Responsive modals for auth flows

### 3. **State Management**
- ✅ Redux Toolkit for global state
- ✅ RTK Query for API calls
- ✅ AsyncStorage for persistent data

## File Structure

```
go-fez/
├── lib/
│   ├── config.ts                 # API configuration
│   ├── store.ts                  # Redux store setup
│   ├── types.ts                  # TypeScript types
│   ├── validationSchemas.ts      # Form validation schemas
│   └── constants/
│       └── languages.ts          # Language configuration
│
├── services/
│   ├── BaseQuery.ts              # API base query with auth
│   ├── slices/
│   │   └── authSlice.ts         # Auth state management
│   └── api/
│       └── UserApi.ts           # User API endpoints
│
├── components/
│   ├── auth/
│   │   ├── LoginModal.tsx       # Login modal component
│   │   └── SignUpModal.tsx      # Sign-up modal component
│   ├── UserAvatar.tsx           # User avatar component
│   └── LanguageSelector.tsx     # Language selector component
│
└── app/
    ├── _layout.tsx              # Root layout with Redux Provider
    └── (tabs)/
        ├── _layout.tsx          # Tab layout with avatar
        └── profile.tsx          # Profile screen
```

## Configuration

### API Base URL
Update the API URL in `lib/config.ts`:

```typescript
export const API_BASE_URL = 'http://your-backend-url:8080';
```

For local development:
- **Android Emulator**: Use `http://10.0.2.2:8080`
- **iOS Simulator**: Use `http://localhost:8080`
- **Physical Device**: Use your computer's IP address (e.g., `http://192.168.1.100:8080`)

## Usage

### 1. Authentication Flow

#### On App Launch
- App checks for stored authentication credentials
- If no credentials found, displays login modal
- User can switch between login and sign-up

#### Login
```typescript
// User enters email and password
// On success:
// - User data saved to Redux store
// - Tokens saved to AsyncStorage
// - Modal closes automatically
```

#### Sign Up
```typescript
// User fills registration form
// On success:
// - Account created
// - Switches to login modal
```

### 2. Accessing User Data

```typescript
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

const { user, token } = useSelector((state: RootState) => state.auth);

// Check if user is authenticated
const isAuthenticated = !!user && !!token;
```

### 3. Making Authenticated API Calls

```typescript
import { useGetUserProfileQuery } from '@/services/api/UserApi';

const { data: profile, isLoading, error } = useGetUserProfileQuery();
```

### 4. Logout

```typescript
import { useDispatch } from 'react-redux';
import { logOut } from '@/services/slices/authSlice';

const dispatch = useDispatch();

const handleLogout = () => {
  dispatch(logOut());
  // User data and tokens are automatically cleared
};
```

### 5. Language Selection

```typescript
import LanguageSelector from '@/components/LanguageSelector';

const [currentLanguage, setCurrentLanguage] = useState('en');

<LanguageSelector
  currentLanguage={currentLanguage}
  onLanguageChange={setCurrentLanguage}
/>
```

## Dependencies

The following packages were installed:

```json
{
  "@reduxjs/toolkit": "^2.x.x",
  "react-redux": "^9.x.x",
  "formik": "^2.x.x",
  "yup": "^1.x.x"
}
```

Note: `@react-native-async-storage/async-storage` was already installed.

## API Integration

### Endpoints Used

1. **POST /api/auth/login** - User login
2. **POST /api/auth/register** - User registration
3. **POST /api/auth/refresh** - Refresh authentication token
4. **GET /api/users/profile** - Get user profile
5. **PUT /api/users/profile** - Update user profile

### Request Headers

All authenticated requests automatically include:
```
Authorization: Bearer <token>
```

## Security Features

1. **Token Management**
   - Access tokens stored securely in AsyncStorage
   - Automatic token refresh on expiration
   - Tokens cleared on logout

2. **Form Validation**
   - Email format validation
   - Password strength requirements (min 6 characters)
   - Matching password confirmation

3. **Error Handling**
   - Network error handling
   - Invalid credentials feedback
   - User-friendly error messages

## Testing

To test the authentication system:

1. **Start the backend server** (ensure it's running on the configured URL)
2. **Launch the mobile app**
3. **Test login flow**:
   - Enter valid credentials
   - Verify successful login
   - Check that avatar appears in profile tab
4. **Test sign-up flow**:
   - Create a new account
   - Verify account creation
   - Test login with new credentials
5. **Test logout**:
   - Navigate to profile
   - Click logout
   - Verify auth modal appears again

## Troubleshooting

### Connection Issues

1. **Cannot connect to server**:
   - Verify backend server is running
   - Check API_BASE_URL in `lib/config.ts`
   - For Android emulator, use `http://10.0.2.2:8080`
   - For physical device, ensure phone and computer are on same network

2. **401 Unauthorized errors**:
   - Check if token is expired
   - Verify token refresh logic is working
   - Clear AsyncStorage and login again

3. **Modal not showing**:
   - Check if authentication was restored from AsyncStorage
   - Clear app data and reinstall

### Development Tips

1. **Clear AsyncStorage** (for testing):
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clear all data
await AsyncStorage.clear();
```

2. **Check stored data**:
```typescript
const user = await AsyncStorage.getItem('user');
const token = await AsyncStorage.getItem('token');
console.log('User:', user);
console.log('Token:', token);
```

## Next Steps

Potential enhancements:

1. **OTP Verification** - Add email/phone verification
2. **Social Login** - Implement Google/Facebook authentication
3. **Forgot Password** - Add password reset flow
4. **Biometric Auth** - Add fingerprint/face ID support
5. **Push Notifications** - Notify users of account activities
6. **Multi-language Support** - Implement i18n for all text content

## Support

For issues or questions:
- Check the backend API documentation
- Review Redux DevTools for state debugging
- Check network requests in React Native Debugger
