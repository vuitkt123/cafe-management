'use client';

import React, { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { Table, TableArea, TableStatus, Order } from '@/types';
import { formatVND, formatShortTime } from '@/lib/formatters';
import {
  Users,
  Coffee,
  ArrowRightLeft,
  DollarSign,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import TableSelectorModal from '../pos/TableSelectorModal';
import CheckoutModal from '../pos/CheckoutModal';
import ReceiptModal from '../pos/ReceiptModal';

interface TableManagementViewProps {
  onGoToPos: () => void;
}

export default function TableManagementView({ onGoToPos }: TableManagementViewProps) {
  const { tables, setActiveTableId, orders, updateTableStatus } = useCafe();

  const [activeArea, setActiveArea] = useState<TableArea | 'all'>('all');
  const [selectedTableForAction, setSelectedTableForAction] = useState<string | null>(null);
  const [tableModalMode, setTableModalMode] = useState<'change' | 'merge' | null>(null);

  // Thanh toán nhanh từ bàn
  const [checkoutOrderId, setCheckoutOrderId] = useState<string | undefined>(undefined);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const areas: { id: TableArea | 'all'; name: string }[] = [
    { id: 'all', name: 'Tất cả khu vực' },
    { id: 'tang1', name: 'Tầng 1 (Máy lạnh)' },
    { id: 'tang2', name: 'Tầng 2 (Yên tĩnh)' },
    { id: 'sanvuon', name: 'Sân Vườn (Thoáng đãng)' },
    { id: 'takeaway', name: 'Khách Mang Về' },
  ];

  const totalTables = tables.length;
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const availableCount = tables.filter((t) => t.status === 'available').length;
  const reservedCount = tables.filter((t) => t.status === 'reserved').length;

  const filteredTables = tables.filter((t) => {
    if (activeArea !== 'all' && t.area !== activeArea) return false;
    return true;
  });

  const handleOpenTableInPos = (tableId: string) => {
    setActiveTableId(tableId);
    onGoToPos();
  };

  const handleQuickPay = (table: Table) => {
    if (table.currentOrderId) {
      setActiveTableId(table.id);
      setCheckoutOrderId(table.currentOrderId);
      setIsCheckoutOpen(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
      {/* Top Banner: Thống kê trạng thái bàn */}
      <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Sơ Đồ Bàn & Phòng
            </h1>
            <p className="text-xs text-zinc-500">
              Theo dõi tình trạng bàn, gọi món và thanh toán tại chỗ
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Trống: {availableCount} bàn</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Có khách: {occupiedCount} bàn</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <span>Đặt trước: {reservedCount}</span>
            </div>
          </div>
        </div>

        {/* Tab Khu vực */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
          {areas.map((a) => (
            <button
              key={a.id}
              onClick={() => setActiveArea(a.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeArea === a.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sơ đồ bàn Grid */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredTables.map((table) => {
            const currentOrder = table.currentOrderId
              ? orders.find((o) => o.id === table.currentOrderId)
              : null;

            const isOccupied = table.status === 'occupied';
            const isReserved = table.status === 'reserved';
            const isAvailable = table.status === 'available';

            return (
              <div
                key={table.id}
                className={`rounded-2xl border-2 p-4 transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${
                  isOccupied
                    ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20'
                    : isReserved
                    ? 'border-purple-400 bg-purple-50/40 dark:bg-purple-950/20'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                }`}
              >
                {/* Top info */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                      {table.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isOccupied
                          ? 'bg-amber-500 text-white border-amber-600'
                          : isReserved
                          ? 'bg-purple-500 text-white border-purple-600'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                      }`}
                    >
                      {isOccupied ? 'Có khách' : isReserved ? 'Đặt trước' : 'Đang trống'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Users size={13} /> {table.capacity} chỗ
                    </span>
                    {table.area === 'tang1' && <span>Tầng 1</span>}
                    {table.area === 'tang2' && <span>Tầng 2</span>}
                    {table.area === 'sanvuon' && <span>Sân vườn</span>}
                    {table.area === 'takeaway' && <span>Mang đi</span>}
                  </div>

                  {/* Chi tiết đơn nếu có khách */}
                  {isOccupied && currentOrder && (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-amber-200 dark:border-amber-900/40 mb-3 space-y-1.5 text-xs shadow-2xs">
                      <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 text-[11px]">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock size={12} /> {formatShortTime(currentOrder.createdAt)}
                        </span>
                        <span>{currentOrder.items.reduce((s, i) => s + i.quantity, 0)} món</span>
                      </div>
                      <div className="flex items-center justify-between font-bold text-amber-700 dark:text-amber-400 text-sm pt-1 border-t border-zinc-100 dark:border-zinc-700">
                        <span>Tổng tạm:</span>
                        <span>{formatVND(currentOrder.total)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Các nút hành động cho bàn */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleOpenTableInPos(table.id)}
                      className="py-2 px-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Coffee size={14} />
                      <span>{isOccupied ? 'Thêm món' : 'Gọi món'}</span>
                    </button>

                    {isOccupied && currentOrder ? (
                      <button
                        onClick={() => handleQuickPay(table)}
                        className="py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <DollarSign size={14} />
                        <span>Thanh toán</span>
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          updateTableStatus(
                            table.id,
                            isReserved ? 'available' : 'reserved'
                          )
                        }
                        className="py-2 px-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        {isReserved ? 'Hủy đặt' : 'Đặt bàn'}
                      </button>
                    )}
                  </div>

                  {isOccupied && (
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => {
                          setActiveTableId(table.id);
                          setTableModalMode('change');
                        }}
                        className="py-1 px-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ArrowRightLeft size={11} />
                        <span>Đổi bàn</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTableId(table.id);
                          setTableModalMode('merge');
                        }}
                        className="py-1 px-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Gộp bàn</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Chuyển / Gộp bàn */}
      {tableModalMode && (
        <TableSelectorModal
          isOpen={true}
          mode={tableModalMode}
          onClose={() => setTableModalMode(null)}
        />
      )}

      {/* Modal Thanh toán nhanh */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={(ord) => setReceiptOrder(ord)}
        existingOrderId={checkoutOrderId}
      />

      {/* Modal In Hóa đơn */}
      <ReceiptModal
        order={receiptOrder}
        isOpen={!!receiptOrder}
        onClose={() => setReceiptOrder(null)}
      />
    </div>
  );
}
