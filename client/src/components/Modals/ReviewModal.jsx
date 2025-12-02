import React, { useState } from "react";
import { useToast } from "../Toast/useToast";
import { IconStar, IconCheck } from "../../icons/IconBox";
import { IconX } from "../../icons/IconX";

// Inline Icon Upload
const IconUploadCloud = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export default function ReviewModal({ isOpen, onClose, booking, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const toast = useToast();

  if (!isOpen || !booking) return null;

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // Mockup: Tạo URL preview
    const newImages = files.map((file) => URL.createObjectURL(file));
    setImages([...images, ...newImages]);
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({ rating, comment, images });
    } else {
      // Fallback if no onSubmit provided
      console.log({
        bookingId: booking.id,
        rating,
        comment,
        images,
      });
      toast.success("Cảm ơn bạn!", "Đánh giá của bạn đã được ghi nhận.");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-light flex justify-between items-center bg-bg-main/30">
          <h3 className="text-lg font-heading font-bold text-text-primary">
            Viết đánh giá
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IconX className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Tour Info Summary */}
          <div className="flex gap-4 items-center">
            <img
              src={booking.image}
              alt={booking.tourName}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div>
              <p className="text-xs text-text-secondary font-bold uppercase mb-1">
                Bạn đang đánh giá
              </p>
              <h4 className="text-sm font-bold text-text-primary line-clamp-2">
                {booking.tourName}
              </h4>
            </div>
          </div>

          {/* Star Rating */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-text-secondary">
              Bạn cảm thấy chuyến đi thế nào?
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <IconStar
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-secondary text-secondary"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-primary h-4">
              {rating === 5 && "Tuyệt vời!"}
              {rating === 4 && "Rất tốt"}
              {rating === 3 && "Tạm ổn"}
              {rating === 2 && "Chưa hài lòng"}
              {rating === 1 && "Tệ"}
            </p>
          </div>

          {/* Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase">
              Nhận xét của bạn
            </label>
            <textarea
              rows="4"
              placeholder="Hãy chia sẻ những trải nghiệm thú vị hoặc điều bạn chưa hài lòng..."
              className="w-full p-4 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm resize-none transition-all"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase">
              Thêm hình ảnh (Tùy chọn)
            </label>
            <div className="flex gap-3 overflow-x-auto py-1">
              {/* Upload Button */}
              <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-border-light rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all shrink-0">
                <IconUploadCloud className="w-6 h-6 text-text-secondary mb-1" />
                <span className="text-[10px] font-bold text-text-secondary">
                  Thêm ảnh
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>

              {/* Image Previews */}
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="w-20 h-20 relative rounded-xl overflow-hidden border border-border-light shrink-0 group"
                >
                  <img
                    src={img}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() =>
                      setImages(images.filter((_, i) => i !== idx))
                    }
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <IconX className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border-light bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-border-light text-sm font-bold text-text-secondary hover:bg-white transition-all"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            className={`
                 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg
                 ${
                   rating > 0
                     ? "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                     : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                 }
              `}
          >
            <IconCheck className="w-4 h-4" /> Gửi đánh giá
          </button>
        </div>
      </div>
    </div>
  );
}
