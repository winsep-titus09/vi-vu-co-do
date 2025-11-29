import React from "react";

export default function Badge({ count, className = "" }) {
  if (!count) return null;
  return (
    <span
      className={`
      absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white
      ${className}
    `}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
