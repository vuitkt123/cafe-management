'use client';

import React, { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { Table, TableArea } from '@/types';
import { X, ArrowRightLeft, Users, Coffee } from 'lucide-react';

interface TableSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'select' | 'change' | 'merge';
}

export default function TableSelectorModal({
  isOpen,
  onClose,
  mode,
}: TableSelectorModalProps) {
  const { tables, activeTableId, setActiveTableId, changeTable, mergeTables } = useCafe();
  const [selectedArea, setSelectedArea] = useState<TableArea | 'all'>('all');
  const [targetTableId, setTargetTableId] = useState<string>('');

  if (!isOpen) return null;

  const currentTable = tables.find((t) => t.id === activeTableId);

  const areas: { id: TableArea | 'all'; name: string }[] = [
    { id: 'all', name: 'Tất cả' },
    { id: 'tang1', name: 'Tầng 1' },
    { id: 'tang2', name: 'Tầng 2' },
    { id: 'sanvuon', name: 'Sân Vườn' },
    { id: 'takeaway', name: 'Mang Về' },
  ];

  const filteredTables = tables.filter((t) => {
    if (selectedArea !== 'all' && t.area !== selectedArea) return false;
    if (mode === 'change') {
      // Đổi bàn: chỉ hiện các bàn còn trống (hoặc khác bàn hiện tại)
      return t.id !== activeTableId && t.status === 'available';
    }
    if (mode === 'merge') {
      // Gộp bàn: chỉ hiện các bàn đang có khách khác bàn hiện tại
      return t.id !== activeTableId && t.status === 'occupied';
    }
    return true;
  });

  const handleAction = () => {
    if (!targetTableId) return;

    if (mode === 'select') {
      setActiveTableId(targetTableId);
    } else if (mode === 'change') {
      changeTable(activeTableId, targetTableId);
    } else if (mode === 'merge') {
      mergeTables(activeTableId, targetTableId);
    }
    onClose();
  };

  const getTitle = () => {
    if (mode === 'change') return `Chuyển đơn từ [${currentTable?.name}] sang bàn khác`;
    if (mode === 'merge') return `Gộp đơn từ [${currentTable?.name}] vào bàn khác`;
    return 'Chọn bàn phục vụ';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-lg">
              <ArrowRightLeft size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{getTitle()}</h3>
              <p className="text-xs text-zinc-500">
                {mode === 'change' && 'Chọn bàn trống đích để chuyển toàn bộ món sang'}
                {mode === 'merge' && 'Chọn bàn đang có khách đích để cộng gộp 2 hóa đơn lại với nhau'}
                {mode === 'select' && 'Chọn bàn để bắt đầu gọi món hoặc xem đơn hiện tại'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Area Tabs */}
        <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto bg-zinc-50 dark:bg-zinc-950">
          {areas.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedArea(a.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-colors ${
                selectedArea === a.id
                  ? 'bg-amber-600 text-white font-semibold shadow-2xs'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100'
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>

        {/* Tables Grid */}
        <div className="p-5 overflow-y-auto flex-1">
          {filteredTables.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <Coffee size={40} className="mx-auto mb-2 opacity-50" />
              <p>Không có bàn nào phù hợp với điều kiện!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredTables.map((t) => {
                const isSelected = targetTableId === t.id;
                const isCurrent = activeTableId === t.id;

                let statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400';
                let statusText = 'Trống';

                if (t.status === 'occupied') {
                  statusBadge = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400';
                  statusText = 'Có khách';
                } else if (t.status === 'reserved') {
                  statusBadge = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400';
                  statusText = 'Đặt trước';
                }

                return (
                  <div
                    key={t.id}
                    onClick={() => setTargetTableId(t.id)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[95px] ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/50 shadow-md ring-2 ring-amber-500/20'
                        : isCurrent
                        ? 'border-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 opacity-70'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-amber-400 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {t.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${statusBadge}`}
                      >
                        {statusText}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {t.capacity} chỗ
                      </span>
                      {isCurrent && <span className="text-[10px] font-bold text-amber-600">(Hiện tại)</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Đóng
          </button>
          <button
            disabled={!targetTableId}
            onClick={handleAction}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold shadow-xs cursor-pointer"
          >
            {mode === 'change' ? 'Xác nhận chuyển bàn' : mode === 'merge' ? 'Xác nhận gộp bàn' : 'Chọn bàn'}
          </button>
        </div>
      </div>
    </div>
  );
}
