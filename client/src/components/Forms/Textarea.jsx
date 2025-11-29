import React from "react";

export default function Textarea({ label, error, className = "", ...props }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-text-secondary/50 resize-none font-medium
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
              : "border-border-light focus:border-primary focus:ring-1 focus:ring-primary/20 hover:border-primary/50"
          }
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 font-medium ml-1">{error}</p>
      )}
    </div>
  );
}
