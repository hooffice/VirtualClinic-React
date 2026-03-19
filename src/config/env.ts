// Environment configuration for Vite
// Converts import.meta.env to the expected format

export const ENV = {
  // PUBLIC_URL for routing (defaults to "/" in Vite)
  PUBLIC_URL: import.meta.env.BASE_URL || "/",

  // Auth method: 'firebase' | 'jwt' | 'fake'
  REACT_APP_DEFAULTAUTH: import.meta.env.VITE_DEFAULTAUTH || "fake",

  // Firebase config
  REACT_APP_APIKEY: import.meta.env.VITE_APIKEY || "",
  REACT_APP_AUTHDOMAIN: import.meta.env.VITE_AUTHDOMAIN || "",
  REACT_APP_DATABASEURL: import.meta.env.VITE_DATABASEURL || "",
  REACT_APP_PROJECTID: import.meta.env.VITE_PROJECTID || "",
  REACT_APP_STORAGEBUCKET: import.meta.env.VITE_STORAGEBUCKET || "",
  REACT_APP_MESSAGINGSENDERID: import.meta.env.VITE_MESSAGINGSENDERID || "",
  REACT_APP_APPID: import.meta.env.VITE_APPID || "",
  REACT_APP_MEASUREMENTID: import.meta.env.VITE_MEASUREMENTID || "",
};
