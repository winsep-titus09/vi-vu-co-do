// src/components/Forms/ButtonSvgMask.jsx

import React from "react";

/**
 * Nút CTA dùng SVG mask (Vàng -> Tím) để tái sử dụng.
 * @param {object} props
 * @param {string} props.href - Link của nút
 * @param {string} props.children - Nội dung chữ bên trong
 * @param {string} [props.className] - Các class Tailwind bổ sung (ví dụ: 'hidden lg:inline-flex')
 */
export default function ButtonSvgMask({ href, children, className = "" }) {
  const baseClasses = `
    items-center justify-center
    h-12 px-8 text-lg font-medium text-white
    bg-secondary hover:bg-primary
    transition duration-150
    [mask-image:url('/images/uploads/button-path.svg')]
    [mask-size:100%_120%]
    [mask-repeat:no-repeat]
    [mask-position:center]
  `;

  // Kết hợp base class với class truyền vào (ví dụ: 'hidden lg:inline-flex')
  const combinedClasses = `${baseClasses} ${className}`;

  return (
    <a href={href} className={combinedClasses}>
      <span>{children}</span>
    </a>
  );
}
