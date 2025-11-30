import React, { useState } from "react";
import { IconCheck, IconClock } from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";
import { IconX } from "../../../icons/IconX";
import { IconUser } from "../../../icons/IconUser";
import IconMail from "../../../icons/IconMail";
import {
  IconBell,
  IconEdit,
  IconFilter,
  IconSend,
  IconTemplate,
} from "../../../icons/IconCommon";

// ============================================================================
// MOCK DATA
// ============================================================================
// Mock data: Email templates
const emailTemplates = [
  {
    id: 1,
    name: "Xác nhận đặt tour",
    subject: "Đặt tour thành công: {tour_name}",
    lastUpdated: "20/05/2025",
    variables: ["{name}", "{tour_name}", "{date}", "{price}"],
  },
  {
    id: 2,
    name: "Thanh toán thành công",
    subject: "Hóa đơn thanh toán #{booking_id}",
    lastUpdated: "15/04/2025",
    variables: ["{name}", "{amount}", "{method}"],
  },
  {
    id: 3,
    name: "Quên mật khẩu",
    subject: "Yêu cầu đặt lại mật khẩu",
    lastUpdated: "10/01/2025",
    variables: ["{name}", "{reset_link}"],
  },
  {
    id: 4,
    name: "Chào mừng thành viên mới",
    subject: "Chào mừng đến với Vi Vu Cố Đô",
    lastUpdated: "01/01/2025",
    variables: ["{name}"],
  },
];

// Mock data: Notification history
const notificationHistory = [
  {
    id: 101,
    title: "Bảo trì hệ thống 02:00 AM",
    audience: "Toàn bộ người dùng",
    channel: "In-App",
    sentAt: "22/05/2025 10:00",
    status: "sent",
  },
  {
    id: 102,
    title: "Khuyến mãi Hè 2025",
    audience: "Du khách",
    channel: "Email + Push",
    sentAt: "20/05/2025 09:00",
    status: "sent",
  },
  {
    id: 103,
    title: "Cập nhật chính sách phí",
    audience: "Hướng dẫn viên",
    channel: "Email",
    sentAt: "15/05/2025 14:30",
    status: "sent",
  },
];

export default function AdminNotifications() {
  const [activeTab, setActiveTab] = useState("broadcast"); // broadcast | templates | history
  const [selectedTemplate, setSelectedTemplate] = useState(null); // For Modal Edit

  // State cho form Broadcast
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    audience: "all", // all, tourist, guide
    channels: { inApp: true, email: false },
  });

  const handleSendBroadcast = () => {
    alert(
      `Đã gửi thông báo "${broadcastForm.title}" đến nhóm ${broadcastForm.audience}`
    );
    // Reset form...
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Hệ thống Thông báo
        </h1>
        <p className="text-text-secondary text-sm">
          Gửi thông báo đẩy và cấu hình mẫu email tự động.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-white border border-border-light rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("broadcast")}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "broadcast"
              ? "bg-bg-main text-primary shadow-sm"
              : "text-text-secondary hover:bg-gray-50"
          }`}
        >
          <IconBell className="w-4 h-4" /> Gửi thông báo
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "templates"
              ? "bg-bg-main text-primary shadow-sm"
              : "text-text-secondary hover:bg-gray-50"
          }`}
        >
          <IconMail className="w-4 h-4" /> Mẫu Email
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "history"
              ? "bg-bg-main text-primary shadow-sm"
              : "text-text-secondary hover:bg-gray-50"
          }`}
        >
          <IconClock className="w-4 h-4" /> Lịch sử gửi
        </button>
      </div>

      {/* --- TAB 1: BROADCAST (Gửi thủ công) --- */}
      {activeTab === "broadcast" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-border-light shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">
                Tiêu đề thông báo
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary outline-none text-sm font-bold"
                placeholder="VD: Thông báo bảo trì hệ thống..."
                value={broadcastForm.title}
                onChange={(e) =>
                  setBroadcastForm({ ...broadcastForm, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">
                Nội dung
              </label>
              <textarea
                rows="5"
                className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary outline-none text-sm resize-none"
                placeholder="Nhập nội dung chi tiết..."
                value={broadcastForm.message}
                onChange={(e) =>
                  setBroadcastForm({
                    ...broadcastForm,
                    message: e.target.value,
                  })
                }
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Đối tượng nhận
                </label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm cursor-pointer"
                  value={broadcastForm.audience}
                  onChange={(e) =>
                    setBroadcastForm({
                      ...broadcastForm,
                      audience: e.target.value,
                    })
                  }
                >
                  <option value="all">Toàn bộ người dùng (1.240)</option>
                  <option value="tourist">Chỉ Du khách (1.150)</option>
                  <option value="guide">Chỉ Hướng dẫn viên (90)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Kênh gửi
                </label>
                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={broadcastForm.channels.inApp}
                      onChange={(e) =>
                        setBroadcastForm({
                          ...broadcastForm,
                          channels: {
                            ...broadcastForm.channels,
                            inApp: e.target.checked,
                          },
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium">
                      In-App Notification
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={broadcastForm.channels.email}
                      onChange={(e) =>
                        setBroadcastForm({
                          ...broadcastForm,
                          channels: {
                            ...broadcastForm.channels,
                            email: e.target.checked,
                          },
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium">Gửi Email</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSendBroadcast}
                className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg flex items-center gap-2"
              >
                <IconSend className="w-4 h-4" /> Gửi ngay
              </button>
            </div>
          </div>

          <div className="lg:col-span-1 bg-blue-50 p-6 rounded-3xl border border-blue-100 h-fit">
            <h3 className="font-bold text-blue-800 mb-2">
              Lưu ý khi gửi Broadcast
            </h3>
            <ul className="list-disc list-inside text-sm text-blue-700/80 space-y-2">
              <li>Hạn chế gửi quá nhiều thông báo gây phiền cho người dùng.</li>
              <li>
                Nội dung quan trọng (Bảo trì, Sự cố) nên gửi qua cả Email và
                In-App.
              </li>
              <li>
                Kiểm tra kỹ chính tả và tiêu đề trước khi gửi vì{" "}
                <strong>không thể thu hồi</strong> sau khi phát tán.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* --- TAB 2: EMAIL TEMPLATES (Cấu hình mẫu) --- */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {emailTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white p-6 rounded-3xl border border-border-light hover:border-primary/50 hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-bg-main text-primary flex items-center justify-center border border-border-light">
                    <IconTemplate className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary">{tpl.name}</h3>
                    <p className="text-xs text-text-secondary">
                      Cập nhật: {tpl.lastUpdated}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTemplate(tpl)}
                  className="p-2 rounded-xl bg-bg-main text-text-secondary hover:bg-primary hover:text-white transition-colors"
                >
                  <IconEdit className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-bg-main/50 p-3 rounded-xl border border-border-light mb-3">
                <p className="text-xs font-bold text-text-secondary uppercase mb-1">
                  Subject:
                </p>
                <p className="text-sm font-medium text-text-primary">
                  {tpl.subject}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {tpl.variables.map((v, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-[10px] font-mono border border-blue-100"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- TAB 3: HISTORY --- */}
      {activeTab === "history" && (
        <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm animate-fade-in">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-bg-main/50 text-text-secondary font-bold text-xs uppercase border-b border-border-light">
              <tr>
                <th className="p-4 pl-6">Tiêu đề</th>
                <th className="p-4">Đối tượng</th>
                <th className="p-4">Kênh gửi</th>
                <th className="p-4">Thời gian gửi</th>
                <th className="p-4 pr-6 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {notificationHistory.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border-light last:border-0 hover:bg-bg-main/20 transition-colors"
                >
                  <td className="p-4 pl-6 font-bold text-text-primary">
                    {item.title}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded bg-bg-main text-text-secondary text-xs border border-border-light">
                      {item.audience}
                    </span>
                  </td>
                  <td className="p-4 text-text-secondary">{item.channel}</td>
                  <td className="p-4 text-text-secondary text-xs">
                    {item.sentAt}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <span className="inline-flex items-center gap-1 text-green-600 font-bold text-xs">
                      <IconCheck className="w-3 h-3" /> Đã gửi
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL EDIT TEMPLATE */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-border-light flex justify-between items-center bg-bg-main/30">
              <h3 className="font-bold text-lg">
                Chỉnh sửa mẫu: {selectedTemplate.name}
              </h3>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Tiêu đề Email (Subject)
                </label>
                <input
                  type="text"
                  defaultValue={selectedTemplate.subject}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light focus:border-primary outline-none text-sm font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Nội dung Email (HTML)
                </label>
                <div className="border border-border-light rounded-xl overflow-hidden">
                  {/* Fake Toolbar */}
                  <div className="bg-gray-50 border-b border-border-light px-3 py-2 flex gap-2">
                    <button className="w-6 h-6 rounded hover:bg-gray-200 font-bold text-xs">
                      B
                    </button>
                    <button className="w-6 h-6 rounded hover:bg-gray-200 italic text-xs">
                      I
                    </button>
                    <button className="w-6 h-6 rounded hover:bg-gray-200 underline text-xs">
                      U
                    </button>
                  </div>
                  <textarea
                    rows="10"
                    className="w-full p-4 outline-none text-sm font-mono text-text-secondary resize-none"
                    defaultValue={`Xin chào {name},\n\nBạn vừa đặt tour {tour_name} thành công. Vui lòng kiểm tra thông tin bên dưới...`}
                  ></textarea>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-800 mb-2">
                  Biến số khả dụng (Click để copy):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.variables.map((v, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded bg-white text-blue-600 text-xs font-mono border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                      title="Sao chép"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border-light flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-5 py-2.5 rounded-xl border border-border-light bg-white font-bold text-sm text-text-secondary hover:bg-bg-main"
              >
                Hủy
              </button>
              <button className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg">
                Lưu mẫu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
