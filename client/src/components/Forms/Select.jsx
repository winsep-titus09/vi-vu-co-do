import React from "react";
import { IconChevronDown } from "../../icons/IconChevronDown";

export default function Select({
  label,
  error,
  options = [],
  className = "",
  ...props
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`
            w-full rounded-xl border bg-white px-4 py-3 pr-10 text-sm outline-none transition-all appearance-none font-medium cursor-pointer
            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                : "border-border-light focus:border-primary focus:ring-1 focus:ring-primary/20 hover:border-primary/50"
            }
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
          <IconChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-500 font-medium ml-1">{error}</p>
      )}
    </div>
  );
}
