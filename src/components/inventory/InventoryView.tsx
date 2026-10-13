'use client';

import React, { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { Ingredient } from '@/types';
import { formatVND, formatDate } from '@/lib/formatters';
import {
  Package,
  AlertTriangle,
  Plus,
  ArrowDownLeft,
  SlidersHorizontal,
  History,
  Trash2,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export default function InventoryView() {
  const {
    ingredients,
    inventoryLogs,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    importInventory,
    adjustInventory,
    lowStockCount,
  } = useCafe();

  const [activeTab, setActiveTab] = useState<'stock' | 'logs'>('stock');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Nhập kho
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedIngForImport, setSelectedIngForImport] = useState<string>('');
  const [importAmount, setImportAmount] = useState<number>(1000);
  const [importCost, setImportCost] = useState<number>(0);
  const [importReason, setImportReason] = useState<string>('Nhập hàng định kỳ');

  // Modal Điều chỉnh / Kiểm kê
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedIngForAdjust, setSelectedIngForAdjust] = useState<Ingredient | null>(null);
  const [actualStock, setActualStock] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Kiểm kê cuối ngày');

  // Modal Thêm nguyên liệu mới
  const [newIngModalOpen, setNewIngModalOpen] = useState(false);
  const [newIngName, setNewIngName] = useState('');
  const [newIngUnit, setNewIngUnit] = useState('g');
  const [newIngStock, setNewIngStock] = useState(1000);
  const [newIngMin, setNewIngMin] = useState(300);
  const [newIngCost, setNewIngCost] = useState(100);
  const [newIngSupplier, setNewIngSupplier] = useState('');

  const totalInventoryValue = ingredients.reduce(
    (sum, ing) => sum + ing.stock * ing.costPerUnit,
    0
  );

  const filteredIngredients = ingredients.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenImport = (ingId?: string) => {
    setSelectedIngForImport(ingId || ingredients[0]?.id || '');
    const found = ingredients.find((i) => i.id === (ingId || ingredients[0]?.id));
    setImportCost(found ? found.costPerUnit : 0);
    setImportAmount(1000);
    setImportReason('Nhập hàng bổ sung từ nhà cung cấp');
    setImportModalOpen(true);
  };

  const handleConfirmImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngForImport || importAmount <= 0) return;
    importInventory(selectedIngForImport, importAmount, importCost, importReason);
    setImportModalOpen(false);
  };

  const handleOpenAdjust = (ing: Ingredient) => {
    setSelectedIngForAdjust(ing);
    setActualStock(ing.stock);
    setAdjustReason('Kiểm kê tồn thực tế');
    setAdjustModalOpen(true);
  };

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngForAdjust) return;
    adjustInventory(selectedIngForAdjust.id, actualStock, adjustReason);
    setAdjustModalOpen(false);
  };

  const handleCreateNewIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName.trim()) return;
    addIngredient({
      name: newIngName,
      unit: newIngUnit,
      stock: newIngStock,
      minThreshold: newIngMin,
      costPerUnit: newIngCost,
      supplier: newIngSupplier,
    });
    setNewIngName('');
    setNewIngModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
      {/* Top Banner Stats */}
      <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Quản Lý Kho & Nguyên Vật Liệu
            </h1>
            <p className="text-xs text-zinc-500">
              Theo dõi tồn kho tự động trừ khi pha chế, cảnh báo hết hàng và nhập kho
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setNewIngModalOpen(true)}
              className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} />
              <span>Thêm nguyên liệu</span>
            </button>
            <button
              onClick={() => handleOpenImport()}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <ArrowDownLeft size={15} />
              <span>Tạo phiếu nhập kho</span>
            </button>
          </div>
        </div>

        {/* 3 Thẻ thống kê */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500">Tổng mặt hàng nguyên liệu</p>
              <p className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                {ingredients.length} loại
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600">
              <Package size={20} />
            </div>
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500">Mặt hàng chạm ngưỡng cảnh báo</p>
              <p className={`text-lg font-black ${lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {lowStockCount} mặt hàng
              </p>
            </div>
            <div className={`p-2.5 rounded-lg ${lowStockCount > 0 ? 'bg-rose-100 dark:bg-rose-950 text-rose-600' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'}`}>
              <AlertTriangle size={20} />
            </div>
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500">Ước tính giá trị vốn tồn</p>
              <p className="text-lg font-black text-amber-600 dark:text-amber-400">
                {formatVND(totalInventoryValue)}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600">
              <FileSpreadsheet size={20} />
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
              activeTab === 'stock'
                ? 'bg-amber-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
            }`}
          >
            Danh sách tồn kho ({ingredients.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
              activeTab === 'logs'
                ? 'bg-amber-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
            }`}
          >
            Lịch sử xuất / nhập kho ({inventoryLogs.length})
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === 'stock' && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Tên nguyên liệu</th>
                    <th className="p-3.5">Tồn kho hiện tại</th>
                    <th className="p-3.5">Ngưỡng báo động</th>
                    <th className="p-3.5">Đơn giá vốn</th>
                    <th className="p-3.5">Giá trị tồn</th>
                    <th className="p-3.5">Nhà cung cấp</th>
                    <th className="p-3.5">Trạng thái</th>
                    <th className="p-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredIngredients.map((ing) => {
                    const isLow = ing.stock <= ing.minThreshold;
                    const val = ing.stock * ing.costPerUnit;

                    return (
                      <tr
                        key={ing.id}
                        className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                          isLow ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                        }`}
                      >
                        <td className="p-3.5 font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {ing.name}
                        </td>
                        <td className="p-3.5 font-extrabold text-base">
                          <span className={isLow ? 'text-rose-600' : 'text-zinc-800 dark:text-zinc-200'}>
                            {ing.stock.toLocaleString('vi-VN')} {ing.unit}
                          </span>
                        </td>
                        <td className="p-3.5 text-zinc-500">
                          {ing.minThreshold.toLocaleString('vi-VN')} {ing.unit}
                        </td>
                        <td className="p-3.5 font-medium">
                          {formatVND(ing.costPerUnit)} / {ing.unit}
                        </td>
                        <td className="p-3.5 font-semibold text-amber-700 dark:text-amber-400">
                          {formatVND(val)}
                        </td>
                        <td className="p-3.5 text-zinc-500">
                          {ing.supplier || 'Chưa cập nhật'}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isLow
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            }`}
                          >
                            {isLow ? 'Sắp hết' : 'Đầy đủ'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenImport(ing.id)}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-md font-semibold text-[11px] cursor-pointer"
                            >
                              Nhập thêm
                            </button>
                            <button
                              onClick={() => handleOpenAdjust(ing)}
                              className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md font-semibold text-[11px] cursor-pointer"
                            >
                              Kiểm kê
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Xóa nguyên liệu ${ing.name}?`)) {
                                  deleteIngredient(ing.id);
                                }
                              }}
                              className="p-1 text-zinc-400 hover:text-red-500 cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Lịch sử Logs */}
        {activeTab === 'logs' && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Thời gian</th>
                    <th className="p-3.5">Nguyên liệu</th>
                    <th className="p-3.5">Loại biến động</th>
                    <th className="p-3.5">Số lượng</th>
                    <th className="p-3.5">Tồn sau cùng</th>
                    <th className="p-3.5">Lý do / Mô tả</th>
                    <th className="p-3.5">Người thực hiện</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {inventoryLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-zinc-400">
                        Chưa có lịch sử xuất/nhập kho nào!
                      </td>
                    </tr>
                  ) : (
                    inventoryLogs.map((log) => {
                      const isImport = log.amount > 0;
                      return (
                        <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                          <td className="p-3.5 text-zinc-500 font-mono">
                            {formatDate(log.timestamp)}
                          </td>
                          <td className="p-3.5 font-bold text-zinc-900 dark:text-zinc-100">
                            {log.ingredientName}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.type === 'import'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                                  : log.type === 'export_order'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                                  : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
                              }`}
                            >
                              {log.type === 'import'
                                ? 'Nhập kho'
                                : log.type === 'export_order'
                                ? 'Trừ khi bán hàng'
                                : 'Điều chỉnh kiểm kê'}
                            </span>
                          </td>
                          <td className="p-3.5 font-black text-sm">
                            <span className={isImport ? 'text-emerald-600' : 'text-rose-600'}>
                              {isImport ? `+${log.amount}` : log.amount}
                            </span>
                          </td>
                          <td className="p-3.5 font-semibold text-zinc-700 dark:text-zinc-300">
                            {log.balanceAfter}
                          </td>
                          <td className="p-3.5 text-zinc-600 dark:text-zinc-400">
                            {log.reason}
                          </td>
                          <td className="p-3.5 text-zinc-500">{log.createdBy}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nhập Kho */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3 border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Phiếu Nhập Hàng Vào Kho
              </h3>
              <button
                onClick={() => setImportModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmImport} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Chọn nguyên liệu</label>
                <select
                  value={selectedIngForImport}
                  onChange={(e) => setSelectedIngForImport(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-bold"
                >
                  {ingredients.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Tồn: {i.stock} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Số lượng nhập</label>
                  <input
                    type="number"
                    required
                    value={importAmount}
                    onChange={(e) => setImportAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Đơn giá vốn (VNĐ)</label>
                  <input
                    type="number"
                    value={importCost}
                    onChange={(e) => setImportCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Lý do / Nhà cung cấp</label>
                <input
                  type="text"
                  value={importReason}
                  onChange={(e) => setImportReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Xác nhận nhập kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kiểm kê Điều chỉnh */}
      {adjustModalOpen && selectedIngForAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3 border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Kiểm Kê Tồn Kho Thực Tế
              </h3>
              <button
                onClick={() => setAdjustModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmAdjust} className="space-y-3">
              <p className="text-zinc-600 dark:text-zinc-400">
                Nguyên liệu: <strong className="text-amber-600">{selectedIngForAdjust.name}</strong>
                <br />
                Tồn trên hệ thống:{' '}
                <strong>
                  {selectedIngForAdjust.stock} {selectedIngForAdjust.unit}
                </strong>
              </p>

              <div>
                <label className="block font-semibold mb-1">
                  Số lượng thực tế đếm được ({selectedIngForAdjust.unit})
                </label>
                <input
                  type="number"
                  required
                  value={actualStock}
                  onChange={(e) => setActualStock(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-bold text-base"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Lý do điều chỉnh (hao hụt, vỡ, sai lệch...)</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Cập nhật tồn kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Thêm nguyên liệu mới */}
      {newIngModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3 border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Thêm Nguyên Liệu Mới Vào Kho
              </h3>
              <button
                onClick={() => setNewIngModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNewIngredient} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Tên nguyên liệu</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Bột Cacao Nguyên Chất..."
                  value={newIngName}
                  onChange={(e) => setNewIngName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Đơn vị tính</label>
                  <select
                    value={newIngUnit}
                    onChange={(e) => setNewIngUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950"
                  >
                    <option value="g">g (Gram)</option>
                    <option value="ml">ml (Mililit)</option>
                    <option value="cái">cái (Ly, nắp, túi...)</option>
                    <option value="hộp">hộp</option>
                    <option value="kg">kg</option>
                    <option value="lon">lon</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tồn kho ban đầu</label>
                  <input
                    type="number"
                    value={newIngStock}
                    onChange={(e) => setNewIngStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Ngưỡng báo động sắp hết</label>
                  <input
                    type="number"
                    value={newIngMin}
                    onChange={(e) => setNewIngMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Đơn giá vốn ước tính (VNĐ)</label>
                  <input
                    type="number"
                    value={newIngCost}
                    onChange={(e) => setNewIngCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nhà cung cấp</label>
                <input
                  type="text"
                  placeholder="VD: Cty CP Cà phê Mộc Châu..."
                  value={newIngSupplier}
                  onChange={(e) => setNewIngSupplier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setNewIngModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Tạo nguyên liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
