import React, { useState, useEffect } from "react";
import { IconX } from "../../../../icons/IconX";
import { IconMapPin } from "../../../../icons/IconBox";
import Spinner from "../../../../components/Loaders/Spinner";
import { useMyTours } from "../../../../features/guides/hooks";
import { useCreateEditRequest } from "../../../../features/tours/hooks";

export default function CreateEditRequestModal({
  isOpen,
  onClose,
  onSuccess,
  selectedTour = null,
}) {
  const [formData, setFormData] = useState({
    tour_id: "",
    request_type: "edit",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's tours
  const { tours, isLoading: toursLoading } = useMyTours({
    status: "approved",
    limit: 100,
  });

  const { create } = useCreateEditRequest();

  // Set selected tour when modal opens
  useEffect(() => {
    if (isOpen && selectedTour) {
      setFormData((prev) => ({
        ...prev,
        tour_id: selectedTour._id || selectedTour.id,
      }));
    }
  }, [isOpen, selectedTour]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        tour_id: "",
        request_type: "edit",
        description: "",
      });
      setError(null);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tour_id) {
      setError("Vui lòng chọn tour");
      return;
    }
    if (!formData.description.trim()) {
      setError("Vui lòng nhập mô tả yêu cầu");
      return;
    }
    if (formData.description.length < 20) {
      setError("Mô tả yêu cầu cần ít nhất 20 ký tự");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await create(formData);
      onSuccess();
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Không thể gửi yêu cầu"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedTourData =
    selectedTour || tours.find((t) => t._id === formData.tour_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border-light flex justify-between items-start sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              Gửi yêu cầu chỉnh sửa Tour
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Yêu cầu sẽ được gửi đến admin để xem xét.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tour selection */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">
              Chọn Tour <span className="text-red-500">*</span>
            </label>
            {toursLoading ? (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            ) : (
              <select
                name="tour_id"
                value={formData.tour_id}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm transition-all"
                disabled={!!selectedTour}
              >
                <option value="">-- Chọn tour --</option>
                {tours.map((tour) => (
                  <option key={tour._id} value={tour._id}>
                    {tour.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Show selected tour info */}
          {selectedTourData && (
            <div className="flex items-center gap-3 p-3 bg-bg-main rounded-xl border border-border-light">
              <div className="w-14 h-14 rounded-lg overflow-hidden border border-border-light shrink-0 bg-gray-100">
                {selectedTourData.cover_image_url ? (
                  <img
                    src={selectedTourData.cover_image_url}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <IconMapPin className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-text-primary truncate">
                  {selectedTourData.name}
                </p>
                <p className="text-xs text-text-secondary">
                  {selectedTourData.locations?.[0]?.locationId?.name || "Huế"}
                </p>
              </div>
            </div>
          )}

          {/* Request type */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">
              Loại yêu cầu <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  formData.request_type === "edit"
                    ? "border-primary bg-primary/5"
                    : "border-border-light hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="request_type"
                  value="edit"
                  checked={formData.request_type === "edit"}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary"
                />
                <div>
                  <p className="font-bold text-text-primary text-sm">
                    Chỉnh sửa
                  </p>
                  <p className="text-xs text-text-secondary">
                    Yêu cầu thay đổi thông tin
                  </p>
                </div>
              </label>
              <label
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  formData.request_type === "delete"
                    ? "border-red-500 bg-red-50"
                    : "border-border-light hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="request_type"
                  value="delete"
                  checked={formData.request_type === "delete"}
                  onChange={handleChange}
                  className="w-4 h-4 text-red-500"
                />
                <div>
                  <p className="font-bold text-text-primary text-sm">
                    Xóa tour
                  </p>
                  <p className="text-xs text-text-secondary">
                    Yêu cầu xóa vĩnh viễn
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">
              Mô tả yêu cầu <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={
                formData.request_type === "edit"
                  ? "Mô tả chi tiết những thay đổi bạn muốn thực hiện..."
                  : "Lý do bạn muốn xóa tour này..."
              }
              className="w-full px-4 py-3 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm transition-all resize-none"
              rows={5}
            />
            <p className="text-xs text-text-secondary mt-1">
              {formData.description.length}/500 ký tự (tối thiểu 20)
            </p>
          </div>

          {/* Warning for delete */}
          {formData.request_type === "delete" && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">
                <strong>Lưu ý:</strong> Nếu yêu cầu xóa được duyệt, tour sẽ bị
                xóa vĩnh viễn và không thể khôi phục. Tour không thể xóa nếu
                đang có booking.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-border-light text-text-secondary font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || toursLoading}
              className={`flex-1 px-4 py-3 rounded-xl text-white font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                formData.request_type === "delete"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              {isSubmitting && <Spinner className="w-4 h-4" />}
              {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
