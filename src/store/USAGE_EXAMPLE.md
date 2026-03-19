# Zustand Auth Store Usage Guide

## Overview
The Zustand auth store (`useAuthStore`) stores JWT tokens and user information with automatic persistence to localStorage.

## Installation
Zustand has been added to package.json. Run:
```bash
npm install
```

---

## Usage in Login Thunk

### Update your login thunk (`src/slices/auth/login/thunk.tsx`):

```typescript
import { useAuthStore } from 'config/auth/store';

export const loginuser = (user: any, history: any) => async (dispatch: any) => {
    try {
        let response: any;
        if (ENV.REACT_APP_DEFAULTAUTH === "firebase") {
            // Firebase login...
        } else if (ENV.REACT_APP_DEFAULTAUTH === "jwt") {
            response = await postJwtLogin({
                email: user.email,
                password: user.password
            });

            // Store JWT and user info in Zustand
            const authStore = useAuthStore.getState();
            authStore.setAuth(response.data.token, {
                username: response.data.username,
                email: response.data.email,
                uid: response.data.id,
            });

            dispatch(loginSuccess(response.data));
        } else if (ENV.REACT_APP_DEFAULTAUTH === "fake") {
            // Fake login...
        }
    } catch (error) {
        dispatch(apiError(error));
    }
};
```

---

## Usage in Components

### Example 1: Get JWT Token
```typescript
import { useAuth } from 'store/useAuth';

export const MyComponent = () => {
  const { jwt, user } = useAuth();

  return (
    <div>
      <p>User: {user?.username}</p>
      <p>Token: {jwt?.substring(0, 20)}...</p>
    </div>
  );
};
```

### Example 2: Logout
```typescript
import { useAuth } from 'store/useAuth';
import { useNavigate } from 'react-router-dom';

export const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clears JWT and user info
    navigate('/login');
  };

  return <button onClick={handleLogout}>Logout</button>;
};
```

### Example 3: Protected Route
```typescript
import { useAuth } from 'store/useAuth';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};
```

### Example 4: API Interceptor
```typescript
import axios from 'axios';
import { useAuthStore } from 'store/useAuthStore';

// Setup axios interceptor to add JWT to all requests
axios.interceptors.request.use((config) => {
  const token = useAuthStore.getState().getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear auth
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Store API

### State
- `jwt` - JWT token string (null if not authenticated)
- `user` - User object with username, email, etc. (null if not authenticated)
- `isAuthenticated` - Boolean flag indicating authentication status

### Actions
- `setAuth(jwt, user)` - Set both JWT and user info
- `setJwt(jwt)` - Set JWT token only
- `setUser(user)` - Set user info only
- `logout()` - Clear all auth data
- `clearAuth()` - Clear all auth data (same as logout)
- `getToken()` - Get current JWT token
- `getUser()` - Get current user info

---

## Features

✅ **Automatic Persistence** - JWT and user data persist in localStorage
✅ **Easy to Use** - Simple hooks-based API
✅ **Type Safe** - Full TypeScript support
✅ **Lightweight** - Zustand is much smaller than Redux
✅ **Auto-clear on Logout** - All data is cleared when logout is called

---

## Migration from Redux

### Before (Redux):
```typescript
const { user } = useSelector(selectProfileProperties);
dispatch(loginSuccess(userData));
```

### After (Zustand):
```typescript
const { user, setAuth } = useAuth();
setAuth(token, userData);
```

---

## Notes

- The store uses `localStorage` to persist data, so JWT and user info survive page refreshes
- On logout, all data is cleared from both memory and localStorage
- You can still use Redux for other state management alongside Zustand
- The auth store is independent and doesn't conflict with Redux
