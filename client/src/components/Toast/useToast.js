import { createContext, useContext } from "react";

// Toast Context
export const ToastContext = createContext(null);

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
