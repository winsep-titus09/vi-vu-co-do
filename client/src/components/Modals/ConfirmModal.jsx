import React from "react";
import { IconX } from "../../icons/IconX";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  confirmType = "primary", // primary | danger
  isProcessing = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={!isProcessing ? onClose : undefined}
      ></div>

      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 relative z-10 animate-scale-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-text-primary">{title}</h3>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <IconX className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <p className="text-text-secondary text-sm mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-2.5 rounded-xl border border-border-light font-bold text-sm text-text-secondary hover:bg-bg-main transition-all disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`
              flex-1 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2
              ${
                confirmType === "danger"
                  ? "bg-red-600 hover:bg-red-700 shadow-red-200"
                  : "bg-primary hover:bg-primary/90 shadow-primary/20"
              }
            `}
          >
            {isProcessing ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
