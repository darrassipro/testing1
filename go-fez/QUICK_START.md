# 🚀 Quick Start - Authentication Setup

## ✅ What Was Implemented

The React Native mobile app now has **complete authentication functionality** matching the Next.js web frontend:

### Features
- ✅ Login/Sign-up modals on app launch
- ✅ User avatar in profile tab when authenticated  
- ✅ Language selector (English, French, Arabic)
- ✅ Logout functionality
- ✅ Token-based authentication with auto-refresh
- ✅ Persistent sessions using AsyncStorage

---

## 🔧 Configuration Required

### 1. Update API URL

Edit `go-fez/lib/config.ts`:

```typescript
// For local development:
export const API_BASE_URL = 'http://10.0.2.2:8080'; // Android Emulator
// export const API_BASE_URL = 'http://localhost:8080'; // iOS Simulator

// For production:
// export const API_BASE_URL = 'https://your-production-api.com';
```

**Important**: 
- Android Emulator uses `10.0.2.2` to access localhost
- Physical devices need your computer's IP (e.g., `http://192.168.1.100:8080`)

---

## 📱 How to Test

### 1. Start Backend Server
```bash
cd server-go-fez
node index.js
```

### 2. Start Mobile App
```bash
cd go-fez
npm start
```

### 3. Test Authentication Flow

#### First Launch (Not Authenticated)
- App shows login modal automatically
- Try logging in with existing credentials
- Or click "Sign Up" to create new account

#### After Login
- Avatar appears in the profile tab
- User info displayed in profile screen
- Can switch languages from profile

#### Test Logout
- Go to Profile tab
- Scroll to bottom
- Click "Log out"
- Confirms logout, then shows login modal again

---

## 📂 Key Files Created

```
go-fez/
├── lib/
│   ├── config.ts              ← Configure API URL here
│   ├── store.ts               ← Redux store
│   ├── types.ts               ← TypeScript types
│   ├── validationSchemas.ts   ← Form validation
│   └── constants/languages.ts ← Language options
│
├── services/
│   ├── BaseQuery.ts           ← API with auto auth
│   ├── slices/authSlice.ts    ← Auth state management
│   └── api/UserApi.ts         ← User endpoints
│
├── components/
│   ├── auth/
│   │   ├── LoginModal.tsx     ← Login form
│   │   └── SignUpModal.tsx    ← Registration form
│   ├── UserAvatar.tsx         ← Profile picture
│   └── LanguageSelector.tsx   ← Language picker
│
└── app/
    ├── _layout.tsx            ← Redux Provider + auth check
    └── (tabs)/
        ├── _layout.tsx        ← Tab bar with avatar
        └── profile.tsx        ← Profile with logout
```

---

## 🎯 User Flow

### New User Journey
1. **App Launch** → Login modal appears
2. **Click "Sign Up"** → Fill registration form
3. **Submit** → Account created → Switches to login
4. **Login** → Avatar appears in tab bar
5. **Profile Tab** → See user info, language selector, logout

### Returning User Journey
1. **App Launch** → Auth restored from AsyncStorage
2. **No modal** → Goes directly to app
3. **Profile visible** → Can logout or change language

---

## 🔐 Security Features

- ✅ Passwords validated (min 6 chars)
- ✅ Email format validation
- ✅ JWT tokens stored securely in AsyncStorage
- ✅ Automatic token refresh on 401 errors
- ✅ Tokens cleared completely on logout

---

## 🐛 Troubleshooting

### "Cannot connect to server"
```typescript
// Check API_BASE_URL in lib/config.ts
// For Android Emulator, must use:
export const API_BASE_URL = 'http://10.0.2.2:8080';
```

### "Login not working"
1. Verify backend server is running
2. Check server logs for errors
3. Clear app data: Settings → Apps → GO-FEZ → Clear data

### "Modal shows every time"
This is expected if not logged in. AsyncStorage might be cleared.

### Clear AsyncStorage (for testing)
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();
```

---

## 🎨 Customization

### Change Modal Colors
Edit `components/auth/LoginModal.tsx` and `SignUpModal.tsx`:
```typescript
// Change primary color from green to your brand color
backgroundColor: '#10b981' // ← Change this
```

### Add More Languages
Edit `lib/constants/languages.ts`:
```typescript
{
  code: 'es',
  name: 'Español',
  country: 'Spain',
  flag: 'https://flagcdn.com/w40/es.png',
}
```

---

## 📚 Additional Documentation

- **Full Guide**: See `AUTHENTICATION_GUIDE.md`
- **API Endpoints**: Check `services/api/UserApi.ts`
- **State Management**: See `services/slices/authSlice.ts`

---

## ✨ What's Next?

Consider adding:
- [ ] OTP email verification
- [ ] Social login (Google/Facebook)
- [ ] Forgot password flow
- [ ] Biometric authentication
- [ ] Push notifications
- [ ] Profile editing

---

## 🆘 Support

If you encounter issues:
1. Check backend server is running
2. Verify API URL configuration
3. Clear app data and reinstall
4. Check React Native debugger for errors

**Backend must be running on the configured URL for auth to work!**
