import React from "react";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Tổng quan hệ thống
        </h1>
        <p className="text-text-secondary">
          Chào mừng quay trở lại, Quản trị viên.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-border-light shadow-sm">
          <p className="text-xs text-text-secondary uppercase font-bold">
            Tổng người dùng
          </p>
          <p className="text-3xl font-bold text-primary mt-2">1,240</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border-light shadow-sm">
          <p className="text-xs text-text-secondary uppercase font-bold">
            Doanh thu tháng
          </p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            45.2M{" "}
            <span className="text-sm text-text-secondary font-normal">VND</span>
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border-light shadow-sm">
          <p className="text-xs text-text-secondary uppercase font-bold">
            Tour đang chạy
          </p>
          <p className="text-3xl font-bold text-secondary mt-2">8</p>
        </div>
      </div>

      {/* Recent Activity (Placeholder) */}
      <div className="bg-white rounded-2xl border border-border-light p-6 h-64 flex items-center justify-center text-text-secondary">
        Biểu đồ thống kê sẽ hiển thị ở đây
      </div>
    </div>
  );
}
