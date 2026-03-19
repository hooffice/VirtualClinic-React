# Zustand JWT Authentication Setup Guide

## Overview
This guide explains how to use Zustand for managing JWT tokens and user information with automatic persistence.

---

## Installation

```bash
npm install
```

This installs Zustand (^4.4.7) along with other dependencies.

---

## Step 1: Initialize App with Axios Interceptors

Update your `src/index.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from './slices';
import { initializeApp } from './initializeApp';  // Add this

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const store = configureStore({ reducer: rootReducer, devTools: true });

// Initialize app (setup axios interceptors)
initializeApp();  // Add this

root.render(
  <Provider store={store}>
    <React.Fragment>
      <BrowserRouter basename={import.meta.env.BASE_URL} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
    </React.Fragment>
  </Provider>
);
```

---

## Step 2: Use Zustand in Login Flow

The login thunk has already been updated to use Zustand! It now:

✅ Stores JWT token in Zustand
✅ Stores user information in Zustand
✅ Persists data to localStorage
✅ Clears all data on logout

No additional changes needed for login flow.

---

## Step 3: Use in Components

### Get Auth Info
```typescript
import { useAuth } from 'store/useAuth';

const MyComponent = () => {
  const { jwt, user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.username}!</p>
    </div>
  );
};
```

### Logout
```typescript
import { useAuth } from 'store/useAuth';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return <button onClick={handleLogout}>Logout</button>;
};
```

---

## Step 4: Protect Routes

Use the `ProtectedRoute` component in your routing:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from 'Routes/ProtectedRoute';
import Dashboard from 'pages/Dashboard';
import Login from 'pages/Login';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

### With Role-Based Access
```typescript
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>
```

---

## Step 5: Automatic JWT in API Requests

The axios interceptor automatically adds JWT to all requests:

```typescript
// All requests automatically include:
// Authorization: Bearer <token>

const response = await axios.get('/api/user/profile');
// JWT is added automatically!
```

### Handle Token Expiration

When a request returns 401 (Unauthorized):
1. User is automatically logged out
2. Auth store is cleared
3. User is redirected to login page

---

## File Structure

```
src/
├── store/
│   ├── useAuthStore.ts          # Zustand store definition
│   ├── useAuth.ts               # Hook for easy access
│   └── USAGE_EXAMPLE.md         # Detailed usage examples
├── config/
│   └── axios.ts                 # Axios interceptors setup
├── Routes/
│   └── ProtectedRoute.tsx        # Protected route component
├── initializeApp.ts             # App initialization
└── index.tsx                    # Main entry point (updated)
```

---

## Features

✅ **Automatic Persistence** - JWT and user data persist in localStorage
✅ **Automatic JWT in Requests** - All API requests include Authorization header
✅ **Auto-Logout on 401** - Expired tokens trigger logout and redirect
✅ **Role-Based Routes** - Protect routes by role
✅ **Type Safe** - Full TypeScript support
✅ **Lightweight** - Much smaller than Redux for auth
✅ **Works with Redux** - Can be used alongside Redux for other state

---

## Zustand Store API

### State
```typescript
jwt: string | null                    // JWT token
user: User | null                     // User object
isAuthenticated: boolean              // Auth status flag
```

### Actions
```typescript
setAuth(jwt, user)                    // Set both JWT and user
setJwt(jwt)                           // Set JWT only
setUser(user)                         // Set user only
logout()                              // Clear all auth data
clearAuth()                           // Clear all auth data
getToken()                            // Get current token
getUser()                             // Get current user
```

---

## Environment Variables

No additional environment variables needed for Zustand. It works with your existing setup.

---

## Data Persistence

Zustand automatically persists to localStorage with key `auth-storage`:

```javascript
// In browser localStorage:
localStorage.getItem('auth-storage')
// Returns: {jwt: "...", user: {...}, isAuthenticated: true}
```

Data persists across:
✅ Page refreshes
✅ Browser restarts
✅ Tab closures

Data clears on:
✅ Logout
✅ Token expiration (401 response)

---

## Migration from Redux Auth

### Old (Redux):
```typescript
const { user } = useSelector(selectProfileProperties);
dispatch(loginSuccess(userData));
```

### New (Zustand):
```typescript
const { user, setAuth } = useAuth();
setAuth(token, userData);
```

---

## Troubleshooting

### Token not being sent in requests
- Ensure `initializeApp()` is called in `index.tsx`
- Check that axios interceptor is set up: `setupAxiosInterceptors()`

### Logout not working
- Verify `logoutUser()` calls `authStore.logout()`
- Check localStorage is cleared after logout

### Not persisting after refresh
- Verify Zustand `persist` middleware is configured
- Check localStorage has `auth-storage` key

### 401 redirects not working
- Ensure response interceptor is set up
- Check browser console for errors

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Update `src/index.tsx` with `initializeApp()`
3. ✅ Start using `useAuth()` hook in components
4. ✅ Use `ProtectedRoute` for protected pages
5. ✅ All API requests automatically include JWT

You're all set! 🎉
