import React from "react";

const VARIANTS = {
  success: "bg-green-100 text-green-700 border-green-200",
  warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  danger: "bg-red-100 text-red-700 border-red-200",
  info: "bg-blue-100 text-blue-700 border-blue-200",
  neutral: "bg-gray-100 text-gray-600 border-gray-200",
  primary: "bg-primary/10 text-primary border-primary/20",
};

export default function Chip({
  label,
  variant = "neutral",
  icon: Icon,
  className = "",
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.neutral;

  return (
    <span
      className={`
      inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider
      ${variantClass} ${className}
    `}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </span>
  );
}
