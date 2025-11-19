// src/components/Forms/DatePicker.jsx

import React, { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import { IconCalendar } from "../../icons/IconCalendar";

/**
 * Component DatePicker (sử dụng react-day-picker)
 * @param {object} props
 * @param {string} props.label - Chữ hiển thị (placeholder)
 */
export default function DatePicker({ label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(undefined);
  const wrapperRef = useRef(null);

  // Logic đóng khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelect = (date) => {
    setSelected(date);
    setIsOpen(false);
  };

  return (
    // CẬP NHẬT: Di chuyển 'ref' và 'relative'
    <div className="relative w-full lg:w-auto" ref={wrapperRef}>
      {/* Nút bấm hiển thị */}
      <button
        type="button"
        className="flex items-center gap-2 p-2 w-full text-left btn-ghost flex-shrink-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        <IconCalendar className="h-5 w-5 text-text-secondary" />
        <span
          className={selected ? "text-text-primary" : "text-text-secondary"}
        >
          {selected ? format(selected, "PPP", { locale: vi }) : label}
        </span>
      </button>

      {/* Bảng lịch (Dropdown) */}
      {isOpen && (
        <div
          className="
            absolute top-full left-0 mt-5.5 /* <-- Sát rìa (mt-0) */
            card shadow-card z-30
            bg-bg-card
          "
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            locale={vi}
            modifiersClassNames={{
              selected: "rdp-day-selected",
              today: "rdp-day-today",
            }}
          />
        </div>
      )}
    </div>
  );
}
