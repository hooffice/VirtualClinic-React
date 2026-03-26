/**
 * Device Helper
 * Handles device ID generation and retrieval for device trust features
 */

/**
 * Generate or retrieve a unique device ID
 * Creates a UUID and stores it in localStorage under 'vc_app_device_id'
 * @returns {string} The device ID
 */
export const getDeviceId = (): string => {
  const DEVICE_ID_KEY = 'vc_app_device_id';

  // Check if device ID already exists in localStorage
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  // If not, generate a new UUID
  if (!deviceId) {
    deviceId = generateUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
    console.log('[DeviceHelper] Generated new device ID:', deviceId);
  } else {
    console.log('[DeviceHelper] Retrieved existing device ID');
  }

  return deviceId;
};

/**
 * Clear device ID from localStorage
 * Called on logout to remove device trust
 */
export const clearDeviceId = (): void => {
  const DEVICE_ID_KEY = 'vc_app_device_id';
  localStorage.removeItem(DEVICE_ID_KEY);
  console.log('[DeviceHelper] Device ID cleared');
};

/**
 * Get device information including ID, user agent, and timestamp
 * @returns {Object} Device information object
 */
export const getDeviceInfo = (): {
  deviceId: string;
  userAgent: string;
  timestamp: number;
} => {
  return {
    deviceId: getDeviceId(),
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  };
};

/**
 * Generate a UUID v4
 * @returns {string} Generated UUID
 */
function generateUUID(): string {
  // Use crypto.randomUUID if available (most modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: Manual UUID v4 generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
