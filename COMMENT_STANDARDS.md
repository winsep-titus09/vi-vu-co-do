# Tiêu chuẩn Comment Code - Vi Vu Cố Đô

## Mục đích

Tài liệu này định nghĩa tiêu chuẩn cho việc viết comment trong dự án để đảm bảo:

- Tính nhất quán across toàn bộ codebase
- Dễ đọc và bảo trì
- Hỗ trợ tốt cho developer mới tham gia dự án

## 1. File Header Comments

### Format

```javascript
// src/path/to/file.jsx
/**
 * ComponentName - Mô tả ngắn gọn
 * @description Mô tả chi tiết (optional)
 */
```

### Ví dụ

```javascript
// src/components/Cards/GuideCard.jsx
/**
 * GuideCard - Card component for displaying guide information
 * @description Portrait-style card with hover reveal bio animation
 */
```

## 2. Section Dividers

### Top-level Sections (trong file .js/.jsx)

```javascript
// ============================================================================
// SECTION NAME (uppercase)
// ============================================================================
```

### Ví dụ

```javascript
// ============================================================================
// CONSTANTS
// ============================================================================
const API_URL = "...";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function formatDate() { ... }

// ============================================================================
// COMPONENT
// ============================================================================
export default function MyComponent() { ... }
```

## 3. JSX Comments

### Structural Comments

```jsx
{
  /* Section description */
}
<div>
  {/* Sub-section or element description */}
  <Component />
</div>;
```

### Ví dụ

```jsx
return (
  <div className="container">
    {/* Header section */}
    <header>
      {/* Logo */}
      <img src="..." alt="Logo" />

      {/* Navigation menu */}
      <nav>...</nav>
    </header>

    {/* Main content */}
    <main>...</main>

    {/* Footer */}
    <footer>...</footer>
  </div>
);
```

### ❌ Tránh

```jsx
{
  /* === HEADER === */
} // Quá dài, không cần thiết trong JSX
{
  /* 1. Header */
} // Không dùng numbering
{
  /* CẬP NHẬT: ... */
} // Không dùng status tags
{
  /* [NEW] ... */
} // Không dùng markers
{
  /* [EDIT] ... */
} // Không dùng markers
```

### ✅ Nên dùng

```jsx
{
  /* Header */
}
{
  /* Header section */
}
{
  /* Language badges */
}
{
  /* Background decoration */
}
```

## 4. Mock Data Comments

### Format

```javascript
// Mock data: Mô tả dữ liệu
const mockData = [...];
```

### Ví dụ

```javascript
// Mock data: Tour guides
const guides = [
  {
    id: 1,
    name: "Minh Hương",
    specialty: "Chuyên gia Lịch sử",
  },
];

// Mock data: Featured tours
const tours = [...];

// Mock data: User reviews
const reviews = [...];
```

### ❌ Tránh inline comments trong data

```javascript
const data = {
  id: 1,
  name: "Test", // Tên người dùng  ❌ Không cần
};
```

### ✅ Chỉ giữ inline comment khi cần giải thích logic

```javascript
const data = {
  amount: -1800000, // Negative = expense, Positive = refund
  status: "confirmed", // Status: confirmed | pending | cancelled
};
```

## 5. Inline Comments

### Business Logic

```javascript
// Calculate discount based on user tier
const discount = userTier === "premium" ? 0.2 : 0.1;

// Filter bookings by status
const activeBookings = bookings.filter((b) => b.status === "confirmed");
```

### Technical Implementation

```javascript
// Use grid-rows animation for smooth height transition
<div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr]">

// Prevent text overflow with truncate
<span className="truncate">{longText}</span>
```

## 6. TODO/FIXME/NOTE Tags

### Format

```javascript
// TODO: Implement pagination
// FIXME: Memory leak in useEffect cleanup
// NOTE: This workaround is needed for Safari compatibility
```

### ❌ Tránh

```javascript
// [TODO]: ...    ❌ Không dùng brackets
// ToDo: ...      ❌ Không dùng mixed case
```

## 7. Function/Method Documentation

### Format (JSDoc style)

```javascript
/**
 * Calculate total price with tax
 * @param {number} subtotal - Subtotal amount
 * @param {number} taxRate - Tax rate (0-1)
 * @returns {number} Total amount including tax
 */
function calculateTotal(subtotal, taxRate) {
  return subtotal * (1 + taxRate);
}
```

## 8. Ngôn ngữ

### Nguyên tắc

- **Technical comments**: Tiếng Anh
- **Business logic**: Tiếng Việt (vì domain-specific)
- **Component descriptions**: Tiếng Anh
- **Data descriptions**: Tiếng Việt

### Ví dụ

```javascript
// Mock data: Hướng dẫn viên ✅ (business domain)
const guides = [...];

// Calculate discount ✅ (technical)
const discount = ...;

/**
 * GuideCard - Portrait-style card component ✅ (component)
 */
```

## 9. Loại bỏ Comments không cần thiết

### ❌ Tránh

```javascript
// Import React
import React from "react";

// Export component
export default function MyComponent() {

// Return JSX
return (
```

### ✅ Code tự giải thích

```javascript
import React from "react";

export default function MyComponent() {
  return (
```

## 10. Checklist Chuẩn hóa

Khi review code, kiểm tra:

- [ ] File header có đúng format
- [ ] Sections được phân chia rõ ràng
- [ ] JSX comments ngắn gọn, không dùng markers
- [ ] Mock data có mô tả rõ ràng
- [ ] Inline comments giải thích "why", không giải thích "what"
- [ ] Không có TODO/FIXME cũ không còn valid
- [ ] Không có comments dư thừa
- [ ] Ngôn ngữ nhất quán (Anh/Việt theo nguyên tắc)

## 11. Ví dụ File Hoàn chỉnh

```javascript
// src/components/Cards/GuideCard.jsx
/**
 * GuideCard - Portrait-style card component
 * @description Displays guide information with hover reveal bio animation
 */

import React from "react";
import { Link } from "react-router-dom";
import IconStarSolid from "../../icons/IconStarSolid.jsx";
import IconVerify from "../../icons/IconVerify.jsx";

// ============================================================================
// COMPONENT
// ============================================================================
export default function GuideCard({ guide }) {
  return (
    <Link to={`/guides/${guide.id}`} className="group relative block h-full">
      {/* Image container */}
      <div className="relative aspect-[3/4]">
        <img src={guide.image} alt={guide.name} />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60" />

        {/* Language badges */}
        <div className="absolute top-3 right-3">
          {guide.languages.map((lang) => (
            <span key={lang}>{lang}</span>
          ))}
        </div>
      </div>

      {/* Floating info card */}
      <div className="absolute bottom-4">
        {/* Name and rating */}
        <h3>{guide.name}</h3>

        {/* Bio (visible on hover) */}
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr]">
          <p>{guide.bio}</p>
        </div>
      </div>
    </Link>
  );
}
```

---

**Lưu ý**: Tài liệu này là living document và sẽ được cập nhật khi có thêm conventions mới.
