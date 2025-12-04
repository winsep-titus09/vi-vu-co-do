import React from "react";
import { Link } from "react-router-dom";
import { IconList } from "../../icons/IconCommon";

export default function EmptyState({
  title = "Không có dữ liệu",
  message = "Danh sách hiện tại đang trống.",
  icon: Icon,
  actionText,
  actionLink,
}) {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border border-dashed border-border-light">
      <div className="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mb-4 text-text-secondary">
        {Icon ? (
          <Icon className="w-8 h-8" />
        ) : (
          <IconList className="w-8 h-8" />
        )}
      </div>
      <h3 className="text-lg font-heading font-bold text-text-primary mb-1">
        {title}
      </h3>
      <p className="text-sm text-text-secondary max-w-xs mx-auto mb-6">
        {message}
      </p>

      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}
