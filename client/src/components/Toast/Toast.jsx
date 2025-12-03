import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ToastContext } from "./useToast";

// Icons
const IconCheck = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const IconX = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const IconInfo = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const IconWarning = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

// Toast styles configuration
const TOAST_STYLES = {
  success: {
    bg: "bg-gradient-to-r from-green-500 to-emerald-500",
    icon: IconCheck,
    iconBg: "bg-white/20",
  },
  error: {
    bg: "bg-gradient-to-r from-red-500 to-rose-500",
    icon: IconX,
    iconBg: "bg-white/20",
  },
  info: {
    bg: "bg-gradient-to-r from-blue-500 to-indigo-500",
    icon: IconInfo,
    iconBg: "bg-white/20",
  },
  warning: {
    bg: "bg-gradient-to-r from-amber-500 to-orange-500",
    icon: IconWarning,
    iconBg: "bg-white/20",
  },
};

// Single Toast Component
function ToastItem({
  id,
  type = "success",
  title,
  message,
  onClose,
  duration = 4000,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const style = TOAST_STYLES[type] || TOAST_STYLES.info;
  const Icon = style.icon;

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  useEffect(() => {
    // Auto dismiss
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => onClose(id), 300);
  }, [id, onClose]);

  return (
    <div
      className={`
        ${style.bg} text-white rounded-2xl shadow-2xl overflow-hidden
        transform transition-all duration-300 ease-out min-w-[320px] max-w-[420px]
        ${
          isVisible && !isLeaving
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }
      `}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className={`${style.iconBg} p-2 rounded-xl shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          {title && <p className="font-bold text-sm">{title}</p>}
          {message && <p className="text-sm text-white/90 mt-0.5">{message}</p>}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors"
        >
          <IconX className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/20">
        <div
          className="h-full bg-white/40 rounded-full"
          style={{
            animation: `shrink ${duration}ms linear forwards`,
          }}
        />
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

// Toast Container
function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onClose={removeToast} />
      ))}
    </div>
  );
}

// Toast Provider
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((options) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, ...options }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useMemo(
    () => ({
      success: (title, message) =>
        addToast({ type: "success", title, message }),
      error: (title, message) => addToast({ type: "error", title, message }),
      info: (title, message) => addToast({ type: "info", title, message }),
      warning: (title, message) =>
        addToast({ type: "warning", title, message }),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export default ToastProvider;
