import React from "react";

export default function App() {
  return (
    <div className="container-main space-y-8">
      <header className="nav-elevated rounded-card px-4 py-3">
        <div className="flex items-center justify-between">
          <h1>Khám phá Huế</h1>
          <div className="flex gap-2">
            <button className="btn-outline btn-sm">Đăng nhập</button>
            <button className="btn-primary btn-sm">Đặt tour</button>
          </div>
        </div>
      </header>

      <section className="card p-6 space-y-4">
        <img
          src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuathienmu1.jpg"
          alt=""
        />
        <h2>Tour nổi bật</h2>
        <p className="text-text-secondary">
          Sử dụng palette Tím Huế, Vàng Cung Đình, Xanh Sông Hương theo chuẩn
          token.
        </p>

        <div className="flex flex-wrap gap-2">
          <span className="chip-secondary">Gia đình</span>
          <span className="chip-accent">Văn hoá</span>
          <span className="chip">Ẩm thực</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <input className="input-base px-3 py-2" placeholder="Tìm tour..." />
          <select className="select-base px-3 py-2 bg-[image:var(--tw-select-chevron,none)]">
            <option>Tuần này</option>
            <option>Tháng này</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button className="btn-primary btn-md">Tìm kiếm</button>
          <button className="btn-ghost btn-md">Bộ lọc</button>
          <button className="btn-icon" aria-label="Yêu thích">
            {/* ví dụ icon */}
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
              <path d="M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.53C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>

        <p className="help-text">
          Nhập từ khóa để lọc theo tên tour, danh mục…
        </p>
      </section>
    </div>
  );
}
