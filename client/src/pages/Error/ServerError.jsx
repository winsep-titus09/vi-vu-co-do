import React from "react";
import { IconWarning } from "../../icons/IconCommon";

export default function ServerError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-main p-4 text-center">
      <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <IconWarning className="w-12 h-12 text-red-500" />
      </div>
      <h2 className="text-3xl font-heading font-bold text-text-primary mb-3">
        Lỗi hệ thống (500)
      </h2>
      <p className="text-text-secondary mb-8 max-w-md mx-auto">
        Đã có lỗi xảy ra từ phía máy chủ. Chúng tôi đang khắc phục sự cố này.
        Vui lòng thử lại sau.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-8 py-3 border border-border-light bg-white text-text-primary rounded-xl font-bold hover:bg-gray-50 transition-all"
      >
        Tải lại trang
      </button>
    </div>
  );
}
