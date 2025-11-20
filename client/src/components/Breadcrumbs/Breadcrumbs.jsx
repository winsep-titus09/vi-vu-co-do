// src/components/Breadcrumbs/Breadcrumbs.jsx

import React from "react";
import { Link } from "react-router-dom";
import IconChevronRight from "../../icons/IconChevronRight";

export default function Breadcrumbs({ items }) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="text-xs font-medium text-text-secondary hover:text-primary transition-colors"
          >
            Trang chủ
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <IconChevronRight className="w-4 h-4 text-text-secondary/50" />
              {item.href ? (
                <Link
                  to={item.href}
                  className="ml-1 text-xs font-medium text-text-secondary hover:text-primary transition-colors md:ml-2"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="ml-1 text-xs font-bold text-text-primary md:ml-2">
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
