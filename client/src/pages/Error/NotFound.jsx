import React from "react";
import { Link } from "react-router-dom";
import IconArrowRight from "../../icons/IconArrowRight";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-main p-4 text-center">
      <h1 className="text-9xl font-heading font-bold text-primary/20 select-none">
        404
      </h1>
      <div className="-mt-12 relative z-10">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-4">
          Không tìm thấy trang
        </h2>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          Trang bạn đang tìm kiếm có thể đã bị xóa, chuyển đi hoặc không tồn
          tại.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
        >
          Về trang chủ <IconArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
