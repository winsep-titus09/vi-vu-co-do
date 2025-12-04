import React from "react";
import {
  IconMapPin,
  IconCalendar,
  IconClock,
  IconShare,
} from "../../icons/IconBox";
import { IconUser } from "../../icons/IconUser";
import { IconX } from "../../icons/IconX";
import { IconDownload } from "../../icons/IconCommon";

export default function TicketModal({ isOpen, onClose, booking }) {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4 py-6">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Ticket Card Container */}
      <div className="relative w-full max-w-sm bg-bg-main rounded-3xl shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
        {/* 1. Header Image (Thu nhỏ chiều cao) */}
        <div className="h-28 relative shrink-0">
          <img
            src={booking.image}
            alt={booking.tourName}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-bg-main"></div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full text-text-primary transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Scrollable Content */}
        <div className="px-5 -mt-10 relative z-10 pb-2 flex-1 overflow-y-auto custom-scrollbar">
          {/* Title Box */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-border-light mb-4 text-center">
            <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-green-200 mb-1.5 inline-block">
              Vé điện tử
            </span>
            <h3 className="text-base font-heading font-bold text-text-primary leading-tight mb-1 line-clamp-2">
              {booking.tourName}
            </h3>
            <p className="text-[10px] text-text-secondary">
              Mã đặt chỗ:{" "}
              <span className="font-mono font-bold text-primary text-xs">
                #{booking.id}
              </span>
            </p>
          </div>

          {/* Info Grid (Compact) */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center border-b border-dashed border-border-light pb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <IconCalendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-text-secondary uppercase font-bold">
                    Ngày đi
                  </p>
                  <p className="text-xs font-bold text-text-primary">
                    {booking.date}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-text-secondary uppercase font-bold">
                  Giờ đón
                </p>
                <p className="text-xs font-bold text-text-primary">
                  {booking.time}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center border-b border-dashed border-border-light pb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                  <IconUser className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-text-secondary uppercase font-bold">
                    Số khách
                  </p>
                  <p className="text-xs font-bold text-text-primary">
                    {booking.guests} Người
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-text-secondary uppercase font-bold">
                  HDV
                </p>
                <p className="text-xs font-bold text-text-primary">
                  {booking.guide}
                </p>
              </div>
            </div>
          </div>

          {/* QR Code Section (Compact) */}
          <div className="relative bg-white rounded-2xl p-4 border border-border-light text-center">
            {/* Ticket Notches */}
            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-bg-main rounded-full"></div>
            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-bg-main rounded-full"></div>

            <p className="text-[10px] text-text-secondary mb-3">
              Quét mã check-in
            </p>
            <div className="w-32 h-32 mx-auto bg-white p-2 border border-border-light rounded-xl">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.id}`}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* 3. Footer Actions (Fixed at bottom of card) */}
        <div className="p-4 bg-white border-t border-border-light flex gap-3 shrink-0">
          <button className="flex-1 py-2.5 rounded-xl border border-border-light text-text-secondary font-bold text-xs hover:bg-bg-main flex items-center justify-center gap-2 transition-all">
            <IconShare className="w-4 h-4" /> Chia sẻ
          </button>
          <button className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all">
            <IconDownload className="w-4 h-4" /> Tải vé
          </button>
        </div>
      </div>
    </div>
  );
}
