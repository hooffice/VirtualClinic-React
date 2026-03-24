# 🔐 Virtual Clinic - Complete OAuth 2 & MFA Production Plan

**Status**: ✅ READY FOR TESTING
**Last Updated**: 2026-03-24
**Version**: 1.0

---

## 📋 Executive Summary

This document outlines the complete OAuth 2 Authorization Code Flow implementation with MFA (Multi-Factor Authentication) support for Virtual Clinic React frontend. The system handles 4 distinct login scenarios with proper token management, error handling, and user experience.

---

## 🎯 Implementation Overview

### Technology Stack
- **Frontend Framework**: React 18 + TypeScript
- **State Management**: Redux (auth state) + Zustand (JWT storage)
- **HTTP Client**: Axios with interceptors
- **Authentication**: OAuth 2 Authorization Code Flow + JWT
- **MFA Methods**: TOTP (Time-based One-Time Password)

### Architecture Pattern
```
Login Page
   ↓
Redux Thunk (loginuser)
   ↓
AuthService.login() → POST /api/oauth/login
   ↓
Router Check (MFA required?)
├─ YES → MfaVerification Page
├─ NO  → OAuthCallback Page
   ↓
OAuthCallback/MfaVerification
   ↓
AuthService.exchangeCodeForToken() → POST /api/oauth/callback
   ↓
Zustand Store (JWT + RefreshToken)
   ↓
Dashboard
```

---

## 📱 Login Scenarios

### SCENARIO 1: Traditional Login WITHOUT MFA ✅

**User Profile**: Email/Password only, MFA disabled
**Example**: `virtualclinic@access.md` / `vc@2025`

**Flow**:
```
1️⃣ Login Page
   └─ Email: virtualclinic@access.md
   └─ Password: vc@2025
   └─ [Disabled] Remember Me (hidden during login)
   └─ [Disabled] Social buttons (hidden during login)
   └─ Click "Log In" → Button shows "⟳ Signing in..."

2️⃣ Redux Thunk (loginuser)
   └─ dispatch(setLoading()) → Loading state = true
   └─ Call authService.login(email, password)

3️⃣ Backend: POST /api/oauth/login
   └─ Validate user exists + active + email confirmed
   └─ Check: user.MfaEnabled?
   └─ Response: {
       Success: true,
       Code: "auth_code_xxx",
       State: "guid_xxx",
       Message: "MFA verified. Authorization code generated."
     }

4️⃣ Login Thunk Routes
   └─ Check response status
   └─ ✓ Code received → Redirect to /oauth-callback?code=xxx&state=yyy&provider=webapi
   └─ ✗ MFA required → Redirect to /mfa-verification

5️⃣ OAuthCallback Page (Loader + Company Name)
   ├─ Shows: Virtual Clinic logo + spinner
   ├─ Progress: 0% → 100%
   ├─ Message: "Processing your login..."
   └─ Extract: code, state from URL

6️⃣ AuthService.exchangeCodeForToken()
   └─ POST /api/oauth/callback { code, state, provider: "webapi" }
   └─ Backend returns: {
       Success: true,
       Status: "Authenticated",
       AccessToken: "jwt_token_xxxx...",
       RefreshToken: "refresh_token_xxxx...",
       User: {
         id: "user_id",
         email: "virtualclinic@access.md",
         userName: "virtualclinic",
         ...
       }
     }

7️⃣ Token Storage
   └─ Zustand: authStore.setTokens(accessToken, refreshToken)
   └─ localStorage: authUser = {user object}
   └─ axios interceptor: Authorization: Bearer jwt_token

8️⃣ Redirect
   └─ Wait 2 seconds for visual feedback
   └─ Navigate to /dashboard
```

**Time**: ~2-3 seconds
**Status Codes**: 200 OK, 401 if invalid credentials

---

### SCENARIO 2: Traditional Login WITH MFA ✅

**User Profile**: Email/Password + MFA (TOTP) enabled
**Example**: User has MFA setup during onboarding

**Flow**:
```
1️⃣ Login Page (Same as Scenario 1)

2️⃣ Backend: POST /api/oauth/login
   └─ Validate user exists + active + email confirmed
   └─ Check: user.MfaEnabled? YES ✓
   └─ Response: {
       Success: true,
       Status: "RequiresMfa",
       UserId: "user_id_xxx",
       Message: "MFA verification required"
     }

3️⃣ Login Thunk Routes
   └─ Check response status
   └─ ✓ Status: "RequiresMfa" → Redirect to /mfa-verification?userId=xxx
   └─ Zustand: authStore.setMfaRequired(userId)

4️⃣ MFA Verification Page
   ├─ Shows: Virtual Clinic logo + MFA input
   ├─ Input: 6-digit TOTP code
   ├─ Auto-submits on 6th digit
   ├─ Timeout: 5 minutes
   ├─ Max attempts: 3
   └─ Features:
       └─ Shows remaining time: "4:32 remaining"
       └─ Attempts: "2 attempts remaining"
       └─ [Checkbox] Remember this device (optional)

5️⃣ User enters code: "123456"

6️⃣ AuthService.verifyMfa()
   └─ POST /api/mfa/verify {
       userId: "user_id",
       code: "123456",
       method: "totp",
       rememberDevice: false
     }
   └─ Backend returns: {
       Success: true,
       Status: "RequiresMfa",
       Code: "auth_code_yyy",
       State: "guid_yyy",
       UserId: "user_id",
       Message: "MFA verified successfully"
     }
   └─ NOTE: Returns authorization code (NOT JWT yet)

7️⃣ MFA Verification Routes
   └─ Check response has Code + State
   └─ ✓ Code received → Redirect to /oauth-callback?code=yyy&state=zzz&provider=mfa
   └─ ✗ No code → Show error "No authorization code received"

8️⃣ OAuthCallback Page (Same as Scenario 1)
   └─ Extract: code, state, provider=mfa
   └─ POST /api/oauth/callback { code, state, provider: "mfa" }
   └─ Receive JWT + User

9️⃣ Token Storage + Redirect
   └─ Same as Scenario 1
```

**Time**: ~3-5 seconds (includes MFA entry time)
**Error Cases**:
- ❌ Invalid code: "Incorrect code. 2 attempts remaining"
- ❌ Code expired: "MFA code has expired. Request new code"
- ❌ 3 failed attempts: "Too many attempts. Try again later"

---

### SCENARIO 3: WebAPI OAuth WITHOUT MFA ✅

**Same as Scenario 1** - Uses OAuth 2 flow directly

**Differences**:
```
- Provider param: provider=webapi (instead of direct credentials)
- Uses same /api/oauth/login endpoint
- Response format identical to Scenario 1
```

---

### SCENARIO 4: WebAPI OAuth WITH MFA ✅

**Same as Scenario 2** - Uses OAuth 2 + MFA

**Differences**:
```
- Provider param: provider=mfa in callback URL
- MFA verification required before code exchange
- Same MFA flow as Scenario 2
```

---

## 🔑 Token Management

### JWT Token Storage

**Zustand Store (`useAuthStore`)**:
```typescript
{
  jwt: "eyJhbGc...",                    // Access token
  refreshToken: "refresh_token_xxx",    // Refresh token
  user: {                               // User object
    id: "user_id",
    email: "user@example.com",
    userName: "username",
    displayName: "User Name"
  },
  isAuthenticated: true,                // Auth status
  mfaRequired: false,                   // MFA pending
  mfaUserId: null                       // MFA user context
}
```

**localStorage**:
```javascript
localStorage.getItem('authUser') // User object for recovery
```

### Token Injection (Axios Interceptor)

**All requests** automatically include:
```
Authorization: Bearer eyJhbGc...
Content-Type: application/json
```

**Example**:
```
GET /api/auth/profile
Authorization: Bearer jwt_token_xxx
```

### Token Refresh (Automatic)

**When 401 received**:
```
1. Intercept 401 response
2. POST /api/auth/refresh-token { refreshToken }
3. Get new accessToken
4. Update Zustand store
5. Retry original request with new token
6. If refresh fails → Logout user
```

### Token Cleanup

**On Logout**:
```
1. POST /api/auth/logout (best effort, may fail)
2. Clear Zustand: authStore.logout()
3. Clear localStorage: localStorage.removeItem('authUser')
4. Clear axios headers
5. Redirect to /login
```

---

## 📁 File Structure

```
src/
├── services/
│   ├── authService.ts          ✅ OAuth 2 & MFA logic
│   └── apiClient.ts            ✅ Typed HTTP client
├── config/
│   └── axiosInstance.ts        ✅ JWT + token refresh
├── store/
│   └── useAuthStore.ts         ✅ Zustand auth state
├── slices/
│   └── auth/login/
│       ├── thunk.tsx           ✅ Redux login flow
│       └── reducer.tsx         ✅ Redux state
├── pages/Authentication/
│   ├── login.tsx               ✅ Login form
│   ├── OAuthCallback.tsx       ✅ Code exchange
│   ├── MfaVerification.tsx     ✅ MFA code entry
│   ├── MfaSetup.tsx            ✅ MFA QR setup
│   └── Logout.tsx              ✅ Logout page
├── types/
│   ├── api.types.ts            ✅ API request/response
│   └── errors.ts               ✅ Error handling
├── helpers/
│   └── errorSerializer.ts      ✅ Redux error storage
└── Routes/
    └── allRoutes.tsx           ✅ Route definitions

.env (Updated):
├── VITE_DEFAULTAUTH=jwt
└── VITE_API_BASE_URL=http://localhost:7202
```

---

## 🔌 API Endpoints

### OAuth Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/oauth/login` | Get authorization code | ❌ None |
| POST | `/api/oauth/callback` | Exchange code for JWT | ❌ None |

### MFA Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/mfa/setup` | Generate QR code + secret | ✅ Required |
| POST | `/api/mfa/enable` | Enable MFA after scan | ✅ Required |
| POST | `/api/mfa/verify` | Verify MFA code at login | ❌ None |
| POST | `/api/mfa/disable` | Disable MFA | ✅ Required |

### Auth Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/auth/profile` | Get user profile | ✅ JWT |
| POST | `/api/auth/refresh-token` | Refresh JWT | ❌ None |
| POST | `/api/auth/logout` | Logout | ✅ JWT |

---

## 🧪 Testing Checklist

### Scenario 1: Traditional Login WITHOUT MFA

```
✓ Start dev server: npm run dev
✓ Open: http://localhost:5173/login
✓ Credentials: virtualclinic@access.md / vc@2025 (MFA disabled account)
✓ Click "Log In"
  ├─ [Wait] Button shows "⟳ Signing in..."
  ├─ [Wait] OAuthCallback page shows loader
  ├─ [Wait] 2 seconds for feedback
  └─ [Verify] Redirected to /dashboard
✓ Check console logs:
  ├─ [AuthService] login() called
  ├─ [AxiosInstance] Request: POST /api/oauth/login hasToken: false
  ├─ [Thunk] Authorization code received
  ├─ [OAuthCallback] Exchanging code for tokens
  ├─ [AuthService] Tokens stored in Zustand
  └─ [OAuthCallback] ✅ Authentication complete
✓ Check Zustand store:
  ├─ jwt: ✅ Present (XXX chars)
  ├─ refreshToken: ✅ Present
  └─ user: ✅ Present with email/userName
✓ Check localStorage:
  ├─ authUser: ✅ Present with user object
✓ Try accessing protected endpoint:
  ├─ [AxiosInstance] Request: GET /api/auth/profile hasToken: true
  └─ Authorization: Bearer jwt_token ✅
```

### Scenario 2: Traditional Login WITH MFA

```
✓ Credentials: user_with_mfa@example.com / password (MFA enabled)
✓ Click "Log In"
  ├─ [Wait] OAuthCallback NOT shown
  └─ [Verify] Redirected to /mfa-verification?userId=xxx
✓ On MFA Verification page:
  ├─ [Verify] Shows "Virtual Clinic" logo
  ├─ [Verify] Shows 6-digit input field
  ├─ [Verify] Shows countdown timer "5:00"
  ├─ [Verify] Shows attempt counter
  └─ [Enter] 6-digit TOTP code from authenticator
✓ Auto-submit on 6th digit (or click Verify)
  ├─ [Wait] Request: POST /api/mfa/verify
  └─ [Wait] Redirected to OAuthCallback with authorization code
✓ OAuthCallback processes code
  ├─ [Wait] Loader shows progress 0→100%
  └─ [Verify] Redirected to /dashboard
✓ Check Zustand store:
  ├─ jwt: ✅ Present
  ├─ refreshToken: ✅ Present
  ├─ mfaRequired: false
  └─ mfaUserId: null
```

### Scenario 3: Invalid Credentials

```
✓ Credentials: virtualclinic@access.md / wrongpassword
✓ Click "Log In"
  ├─ [Wait] Button shows "⟳ Signing in..."
  └─ [Verify] Error shown: "Username and password are invalid"
✓ Form NOT submitted twice
✓ Inputs re-enabled
✓ Check console:
  ├─ [AxiosInstance] Response error: {status: 401, ...}
  └─ [Thunk] Login error: ApiError
```

### Scenario 4: MFA Verification Failure

```
✓ On MFA Verification page
✓ Enter: "000000" (invalid code)
✓ Error shown: "Incorrect code. 2 attempts remaining"
✓ Input cleared
✓ Can retry
✓ After 3 attempts: "Too many attempts. Try again later"
✓ Disabled: Cannot submit more codes
```

### Scenario 5: Token Refresh

```
✓ Login successfully
✓ Wait for token to expire (or mock with dev tools)
✓ Make any API request
✓ [AxiosInstance] Detects 401
✓ [AxiosInstance] Auto-refresh token
✓ POST /api/auth/refresh-token
✓ Receive new accessToken
✓ [AxiosInstance] Retry original request
✓ Request succeeds
```

### Scenario 6: Logout

```
✓ Login successfully
✓ Navigate to dashboard
✓ Click "Logout"
  ├─ [AxiosInstance] POST /api/auth/logout hasToken: true
  ├─ [AuthService] Clear Zustand store
  ├─ [AuthService] Clear localStorage
  └─ [Verify] Redirected to /login
✓ Check Zustand:
  ├─ jwt: null
  ├─ refreshToken: null
  └─ user: null
✓ Check localStorage:
  └─ authUser: REMOVED
```

---

## ⚙️ Configuration

### Environment Variables (`.env`)

```bash
# Authentication Mode
VITE_DEFAULTAUTH=jwt

# API Configuration
VITE_API_BASE_URL=http://localhost:7202

# Optional: Company details
VITE_COMPANY_NAME=Virtual Clinic
VITE_COMPANY_LOGO_URL=/logo.png
```

### CORS Configuration (Backend Required)

The backend must allow CORS for frontend origin:

```csharp
// In VC-API Program.cs
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .WithOrigins("http://localhost:5173", "http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});
```

---

## 🔍 Debugging Guide

### Enable Console Logging

All components log to browser console with prefixes:

```
[AuthService]    → authService.ts
[OAuthCallback]  → OAuthCallback.tsx
[MfaVerification]→ MfaVerification.tsx
[AxiosInstance]  → axiosInstance.ts
[Thunk]          → thunk.tsx
[ApiClient]      → apiClient.ts
```

**View logs in browser DevTools (F12) → Console**

### Common Issues

#### Issue 1: "Network Error" on /api/oauth/login

**Cause**: Backend not running
**Fix**: Start VC-API backend: `dotnet run`

#### Issue 2: "Cannot use namespace as a type" errors

**Cause**: TypeScript axios type issues
**Fix**: Already resolved in axiosInstance.ts and apiClient.ts

#### Issue 3: Token not in Zustand store

**Cause**: exchangeCodeForToken() not storing
**Fix**: Check OAuthCallback component calls authService.exchangeCodeForToken()

#### Issue 4: Axios interceptor not adding Authorization header

**Cause**: Token not in Zustand
**Fix**: Check if login flow properly calls authStore.setTokens()

#### Issue 5: 401 Unauthorized on logout

**Cause**: Token already expired
**Fix**: Expected behavior - code handles this gracefully

---

## 🚀 Deployment

### Production Checklist

```
✓ .env updated with production API_BASE_URL
✓ VITE_DEFAULTAUTH=jwt
✓ CORS enabled on backend for frontend domain
✓ JWT tokens have reasonable expiration (15-30 minutes)
✓ Refresh tokens configured for longer expiration
✓ HTTPS enabled (required for production)
✓ Session cookies marked as Secure + HttpOnly
✓ CSRF protection enabled on backend
✓ Rate limiting on /api/oauth/login and /api/mfa/verify
✓ Logging/monitoring configured
✓ Error pages styled for production
✓ Loading indicators show company branding
```

---

## 📊 Response Flow Diagram

```
Login Form
    │
    └─► POST /api/oauth/login
        │
        ├─ Status: "RequiresMfa"
        │   └─► /mfa-verification?userId=xxx
        │       └─► POST /api/mfa/verify
        │           └─► /oauth-callback?code=xxx&provider=mfa
        │
        └─ Code: "auth_code"
            └─► /oauth-callback?code=xxx&provider=webapi
                └─► POST /api/oauth/callback
                    └─► Store JWT
                        └─► /dashboard
```

---

## 📞 Support & Maintenance

### Monitoring Points

- Monitor login success/failure rates
- Track MFA verification attempts
- Monitor token refresh frequency
- Track logout completeness
- Monitor API response times
- Track error rates by endpoint

### Future Enhancements

- [ ] Biometric authentication (WebAuthn)
- [ ] SMS/Email MFA methods
- [ ] Remember device (skip MFA)
- [ ] Passwordless login
- [ ] Social OAuth providers (Google, GitHub)
- [ ] Session management across tabs
- [ ] Login history and device tracking
- [ ] Account recovery flows

---

**Status**: ✅ READY FOR PRODUCTION TESTING

**Next Steps**:
1. Test all 6 scenarios above
2. Run against VC-API backend
3. Fix any integration issues
4. Deploy to staging environment
5. Performance testing
6. Security audit
7. User acceptance testing
8. Production deployment
