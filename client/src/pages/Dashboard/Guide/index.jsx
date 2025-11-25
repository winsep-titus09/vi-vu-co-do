import React from "react";

export default function GuideDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Bảng điều khiển Hướng dẫn viên
        </h1>
        <p className="text-text-secondary">
          Quản lý tour và lịch trình của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
          <h3 className="font-bold text-primary mb-2">Booking mới</h3>
          <p className="text-3xl font-bold">
            3{" "}
            <span className="text-sm font-normal text-text-secondary">
              yêu cầu chờ duyệt
            </span>
          </p>
        </div>
        <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
          <h3 className="font-bold text-green-700 mb-2">Thu nhập tháng này</h3>
          <p className="text-3xl font-bold">
            8.5M{" "}
            <span className="text-sm font-normal text-text-secondary">VND</span>
          </p>
        </div>
      </div>
    </div>
  );
}
