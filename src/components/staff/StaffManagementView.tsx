'use client';

import React, { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { User, Role } from '@/types';
import {
  Shield,
  Users,
  UserCheck,
  Plus,
  Trash2,
  KeyRound,
  RotateCcw,
  Download,
  Upload,
  Check,
  X,
} from 'lucide-react';

export default function StaffManagementView() {
  const {
    users,
    currentUser,
    switchUser,
    addUser,
    deleteUser,
    resetToDefaultData,
    exportDataJSON,
    importDataJSON,
  } = useCafe();

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<Role>('cashier');
  const [newPin, setNewPin] = useState('1234');
  const [newPhone, setNewPhone] = useState('');

  const [importStatus, setImportStatus] = useState<string>('');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addUser({
      name: newName,
      role: newRole,
      pin: newPin,
      phone: newPhone,
    });
    setNewName('');
    setIsAddUserOpen(false);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `coffeehub_backup_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataJSON(content);
      if (success) {
        setImportStatus('Khôi phục dữ liệu thành công!');
        setTimeout(() => setImportStatus(''), 3000);
      } else {
        alert('File dữ liệu không đúng cấu trúc!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
      {/* Top Banner */}
      <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Quản Lý Nhân Viên & Cài Đặt Hệ Thống
          </h1>
          <p className="text-xs text-zinc-500">
            Phân quyền vai trò (Admin, Thu ngân, Pha chế) và quản trị sao lưu dữ liệu
          </p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus size={16} />
          <span>Thêm nhân viên mới</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Phân quyền & Chuyển đổi tài khoản */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-amber-600" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Danh Sách Nhân Viên & Đổi Tài Khoản Nhanh
              </h3>
            </div>
            <span className="text-xs text-zinc-500">
              Đang hoạt động: <strong className="text-amber-600">{currentUser.name}</strong> (
              {currentUser.role.toUpperCase()})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {users.map((u) => {
              const isCurrent = currentUser.id === u.id;

              return (
                <div
                  key={u.id}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-black flex items-center justify-center text-sm">
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {u.name}
                        </h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
                              : u.role === 'cashier'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          }`}
                        >
                          {u.role === 'admin'
                            ? 'Chủ quán (Admin)'
                            : u.role === 'cashier'
                            ? 'Thu ngân (Cashier)'
                            : 'Pha chế (Barista)'}
                        </span>
                      </div>
                    </div>

                    {users.length > 1 && !isCurrent && (
                      <button
                        onClick={() => {
                          if (confirm(`Xóa nhân viên ${u.name}?`)) deleteUser(u.id);
                        }}
                        className="p-1 text-zinc-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-zinc-400 flex items-center gap-1 font-mono">
                      <KeyRound size={12} /> PIN: {u.pin}
                    </span>

                    {isCurrent ? (
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                        <UserCheck size={14} /> Đang đăng nhập
                      </span>
                    ) : (
                      <button
                        onClick={() => switchUser(u.id)}
                        className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Chuyển sang tài khoản này
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bảng phân quyền chi tiết */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-amber-600" />
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Chi Tiết Phân Quyền Vai Trò
            </h3>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 font-bold text-zinc-600 dark:text-zinc-400">
                <tr>
                  <th className="p-3">Chức năng</th>
                  <th className="p-3 text-center">Chủ quán (Admin)</th>
                  <th className="p-3 text-center">Thu ngân (Cashier)</th>
                  <th className="p-3 text-center">Pha chế (Barista)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                <tr>
                  <td className="p-3 font-medium">Bán hàng POS & Đổi / Gộp bàn</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="p-3 text-center text-zinc-400">-</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Thanh toán & In hóa đơn</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="p-3 text-center text-zinc-400">-</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Màn hình Barista (KDS) & Đổi trạng thái món</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Quản lý thực đơn & Định lượng công thức</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="p-3 text-center text-zinc-400">-</td>
                  <td className="p-3 text-center text-zinc-400">-</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Quản lý kho & Nhập hàng / Kiểm kê</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="p-3 text-center text-zinc-400">-</td>
                  <td className="p-3 text-center text-zinc-400">-</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Báo cáo doanh thu & Lợi nhuận</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="p-3 text-center text-zinc-400">-</td>
                  <td className="p-3 text-center text-zinc-400">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quản trị dữ liệu: Sao lưu / Khôi phục / Reset Demo */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <RotateCcw size={20} className="text-amber-600" />
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Quản Trị Dữ Liệu & Sao Lưu (Backup / Restore)
            </h3>
          </div>

          <p className="text-xs text-zinc-500">
            Dữ liệu quán cà phê của bạn được lưu trữ an toàn trong trình duyệt (LocalStorage). Bạn có thể xuất ra file JSON để sao lưu hoặc chuyển sang máy tính khác bất kỳ lúc nào.
          </p>

          {importStatus && (
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Check size={16} />
              <span>{importStatus}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleDownloadBackup}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Download size={15} />
              <span>Tải file sao lưu (Export JSON)</span>
            </button>

            <label className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-2 cursor-pointer">
              <Upload size={15} />
              <span>Khôi phục từ file (Import JSON)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={() => {
                if (confirm('Khôi phục toàn bộ dữ liệu mẫu ban đầu của quán cà phê? Dữ liệu hiện tại sẽ được thay thế bằng dữ liệu demo.')) {
                  resetToDefaultData();
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center gap-2 cursor-pointer ml-auto"
            >
              <RotateCcw size={15} />
              <span>Khôi phục dữ liệu mẫu ban đầu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Thêm nhân viên */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3 border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Thêm Nhân Viên Mới
              </h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Họ và tên nhân viên</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Hoàng Minh Nhật..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Vai trò công việc</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-bold"
                >
                  <option value="cashier">Thu ngân (Cashier) - POS & Bán hàng</option>
                  <option value="barista">Pha chế (Barista) - KDS Quầy bar</option>
                  <option value="admin">Quản lý / Chủ quán (Admin) - Toàn quyền</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Mã PIN đăng nhập nhanh</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-center font-mono font-bold tracking-widest"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
