import { toast, ToastOptions } from 'react-toastify';

/**
 * Toast Service - Centralized notification management
 * Usage: toastService.success("Message"), toastService.error("Error message")
 */

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
};

const successOptions: ToastOptions = {
  ...defaultOptions,
  autoClose: 3000,
};

const errorOptions: ToastOptions = {
  ...defaultOptions,
  autoClose: 5000,
};

const infoOptions: ToastOptions = {
  ...defaultOptions,
  autoClose: 4000,
};

const warningOptions: ToastOptions = {
  ...defaultOptions,
  autoClose: 4000,
};

class ToastService {
  /**
   * Show success notification
   * @param message - Toast message
   * @param options - Optional ToastOptions override
   */
  success(message: string, options?: ToastOptions) {
    toast.success(message, { ...successOptions, ...options });
  }

  /**
   * Show error notification
   * @param message - Toast message
   * @param options - Optional ToastOptions override
   */
  error(message: string, options?: ToastOptions) {
    toast.error(message, { ...errorOptions, ...options });
  }

  /**
   * Show info notification
   * @param message - Toast message
   * @param options - Optional ToastOptions override
   */
  info(message: string, options?: ToastOptions) {
    toast.info(message, { ...infoOptions, ...options });
  }

  /**
   * Show warning notification
   * @param message - Toast message
   * @param options - Optional ToastOptions override
   */
  warning(message: string, options?: ToastOptions) {
    toast.warning(message, { ...warningOptions, ...options });
  }

  /**
   * Dismiss all active toasts
   */
  dismissAll() {
    toast.dismiss();
  }

  /**
   * Dismiss a specific toast by ID
   * @param toastId - Toast ID to dismiss
   */
  dismiss(toastId: string | number) {
    toast.dismiss(toastId);
  }

  /**
   * Update an existing toast
   * @param toastId - Toast ID to update
   * @param options - Updated options
   */
  update(toastId: string | number, options: ToastOptions) {
    toast.update(toastId, options);
  }
}

export const toastService = new ToastService();
export default toastService;
