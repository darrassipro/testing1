# Quick Start: OTP & Password Reset

## 🚀 Quick Setup

All components are ready to use! Just import and add to your modals.

## 📦 What's Included

### New Components (4)
1. **OTPVerificationModal** - Email verification after signup
2. **ForgotPasswordModal** - Request password reset
3. **PasswordResetOTPModal** - Verify reset code
4. **ResetPasswordModal** - Set new password

### Updated Components (2)
1. **LoginModal** - Added "Forgot Password?" flow
2. **SignUpModal** - Added OTP verification flow

### Updated API (1)
1. **UserApi.ts** - Added password reset endpoints

## ⚡ Usage

### LoginModal (Already Updated)
```tsx
<LoginModal
  visible={showLogin}
  onClose={() => setShowLogin(false)}
  onSwitchToSignUp={() => switchToSignUp()}
/>
```

**New Feature:** "Forgot Password?" link triggers 4-step reset flow automatically

---

### SignUpModal (Already Updated)
```tsx
<SignUpModal
  visible={showSignUp}
  onClose={() => setShowSignUp(false)}
  onSwitchToLogin={() => switchToLogin()}
/>
```

**New Feature:** Automatically shows OTP modal if backend requires email verification

---

## 🔄 Flows

### Email Verification Flow (Automatic)
```
Sign Up → Backend Checks Setting → OTP Modal (if enabled) → Login
```

### Password Reset Flow (Automatic)
```
Login → Forgot Password? → Enter Email → Verify OTP → Set Password → Auto Login
```

---

## 🎯 Backend Response Expected

### Sign Up Response (When Email Verification Enabled)
```json
{
  "message": "Please verify your email",
  "requiresVerification": true,
  "user": { ... }
}
```

### Sign Up Response (When Email Verification Disabled)
```json
{
  "message": "Registration successful",
  "requiresVerification": false,
  "user": { ... },
  "token": "...",
  "refreshToken": "..."
}
```

### Password Reset OTP Verify Response
```json
{
  "resetToken": "abc123...",
  "message": "OTP verified"
}
```

### Password Reset Complete Response
```json
{
  "user": { ... },
  "token": "...",
  "refreshToken": "..."
}
```

---

## 🎨 Features

### OTP Input
- ✅ 6-digit code
- ✅ Auto-focus next/previous
- ✅ 10-minute timer
- ✅ Resend after expiry

### Password Validation
- ✅ Min 8 characters
- ✅ Lowercase required
- ✅ Uppercase required
- ✅ Number required
- ✅ Visual indicators

---

## 🧪 Test Scenarios

1. **Sign up** → Should show OTP modal if admin enables verification
2. **Sign up** → Should skip OTP if admin disables verification
3. **Login** → Click "Forgot Password?" → Enter email → Verify OTP → Reset password
4. **OTP** → Wait 10 minutes → Resend button appears
5. **Reset password** → Invalid password → Shows requirement errors

---

## ⚙️ Configuration

### Enable/Disable Email Verification
Controlled by backend setting: `email_verification_enabled: true/false`

### Change OTP Timer
Edit in modal files:
```typescript
const [timer, setTimer] = useState(600); // 10 minutes
```

### Change Password Rules
Edit in `lib/validationSchemas.ts`:
```typescript
.min(8, 'Message')
.matches(/[a-z]/, 'Message')
// etc...
```

---

## 📱 Platform Notes

- ✅ Android tested and working
- ✅ Keyboard handling optimized
- ✅ Modal stacking supported
- ✅ Back navigation works

---

## 🆘 Troubleshooting

**OTP modal not showing after signup?**
- Check backend response has `requiresVerification: true`

**"Forgot Password?" not visible?**
- Make sure you're using updated LoginModal

**Password reset fails?**
- Verify backend returns `resetToken` after OTP verification

**Timer not working?**
- Check console for errors
- Verify component mounted correctly

---

## 📞 API Endpoints Used

| Action | Method | Endpoint |
|--------|--------|----------|
| Send Email OTP | POST | `/api/auth/otp/send` |
| Verify Email OTP | POST | `/api/auth/otp/verify` |
| Send Reset OTP | POST | `/api/users/password-reset/send-otp` |
| Verify Reset OTP | POST | `/api/users/password-reset/verify-otp` |
| Reset Password | POST | `/api/users/password-reset/reset` |

---

## ✅ Checklist

- [x] OTPVerificationModal created
- [x] ForgotPasswordModal created
- [x] PasswordResetOTPModal created
- [x] ResetPasswordModal created
- [x] LoginModal updated with forgot password
- [x] SignUpModal updated with OTP flow
- [x] UserApi updated with new endpoints
- [x] Documentation created

---

**Status:** ✅ Ready to Use  
**No additional setup required** - Just use the updated LoginModal and SignUpModal!
