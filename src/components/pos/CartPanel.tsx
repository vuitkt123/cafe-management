'use client';

import React, { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { formatVND } from '@/lib/formatters';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRightLeft,
  ShoppingBag,
  Percent,
  CheckCircle,
  Clock,
  Layers,
} from 'lucide-react';
import TableSelectorModal from './TableSelectorModal';

interface CartPanelProps {
  onOpenCheckout: (existingOrderId?: string) => void;
}

export default function CartPanel({ onOpenCheckout }: CartPanelProps) {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    activeTableId,
    tables,
    cartSubtotal,
    cartTotal,
    discountPercent,
    setDiscountPercent,
    discountAmount,
    setDiscountAmount,
    saveOrderForTable,
    orders,
  } = useCafe();

  const [tableModalMode, setTableModalMode] = useState<'select' | 'change' | 'merge' | null>(null);
  const [showDiscountInput, setShowDiscountInput] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const currentTable = tables.find((t) => t.id === activeTableId);
  const existingOrder = currentTable?.currentOrderId
    ? orders.find((o) => o.id === currentTable.currentOrderId)
    : undefined;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleSaveOrder = () => {
    if (cart.length === 0) {
      alert('Giỏ hàng đang trống!');
      return;
    }
    const orderId = saveOrderForTable();
    showToast('Đã lưu đơn và gửi cho quầy pha chế thành công!');
  };

  const handleCheckout = () => {
    if (cart.length === 0 && !existingOrder) {
      alert('Giỏ hàng đang trống!');
      return;
    }
    onOpenCheckout(existingOrder?.id);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-lg">
      {/* Toast popup */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Giỏ hàng: Thông tin bàn */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-amber-50/50 dark:bg-zinc-950/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              POS
            </div>
            <div>
              <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                {currentTable ? currentTable.name : 'Khách Mang Về'}
              </h2>
              <span className="text-[11px] text-zinc-500">
                {currentTable?.status === 'occupied' ? 'Đang có khách ngồi' : 'Bàn đang sẵn sàng'}
              </span>
            </div>
          </div>

          {/* Nút thao tác bàn */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTableModalMode('select')}
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 text-xs font-medium cursor-pointer"
              title="Đổi bàn khác"
            >
              <Layers size={17} />
            </button>
            {activeTableId !== 'takeaway' && currentTable?.status === 'occupied' && (
              <>
                <button
                  onClick={() => setTableModalMode('change')}
                  className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 text-xs font-medium cursor-pointer"
                  title="Chuyển đơn sang bàn khác"
                >
                  <ArrowRightLeft size={17} />
                </button>
              </>
            )}
          </div>
        </div>

        {existingOrder && (
          <div className="bg-amber-100/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-lg text-[11px] flex items-center justify-between font-medium">
            <span className="flex items-center gap-1">
              <Clock size={13} /> Đơn đang mở: {existingOrder.code}
            </span>
            <span className="font-bold">{existingOrder.orderStatus.toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Danh sách món trong giỏ */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 py-12">
            <ShoppingBag size={48} className="mb-2 stroke-1 opacity-50" />
            <p className="text-sm font-medium">Chưa có món nào được chọn</p>
            <p className="text-xs text-zinc-500 mt-1">
              Bấm chọn món từ thực đơn bên trái để gọi món
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 shadow-2xs space-y-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {item.productName}{' '}
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-amber-600 dark:text-amber-400">
                      Size {item.selectedSize}
                    </span>
                  </h4>
                  <p className="text-xs font-semibold text-zinc-500 mt-0.5">
                    {formatVND(item.unitPrice)}
                  </p>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1 text-zinc-400 hover:text-red-500 rounded-md cursor-pointer transition-colors"
                  title="Xóa món"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Chi tiết Topping & Tùy chọn */}
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-0.5 bg-zinc-50 dark:bg-zinc-900/50 p-1.5 rounded-lg">
                {item.selectedToppings.length > 0 && (
                  <p className="line-clamp-1">
                    Topping: {item.selectedToppings.map((t) => t.name).join(', ')}
                  </p>
                )}
                <p>
                  {item.iceLevel} đá • {item.sugarLevel} ngọt
                  {item.note ? ` • Note: ${item.note}` : ''}
                </p>
              </div>

              {/* Tăng giảm số lượng & Thành tiền */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1">
                  <button
                    onClick={() => updateCartQuantity(item.id, -1)}
                    className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 cursor-pointer text-xs"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-6 text-center font-bold text-xs text-zinc-800 dark:text-zinc-200">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQuantity(item.id, 1)}
                    className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 cursor-pointer text-xs"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                  {formatVND(item.totalPrice)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chiết khấu / Giảm giá & Tính tiền */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-3">
        {/* Toggle Discount */}
        <div className="flex items-center justify-between text-xs">
          <button
            onClick={() => setShowDiscountInput(!showDiscountInput)}
            className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
          >
            <Percent size={14} />
            <span>{showDiscountInput ? 'Ẩn giảm giá' : 'Thêm giảm giá / Voucher'}</span>
          </button>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-500 hover:underline cursor-pointer text-[11px]"
            >
              Làm trống giỏ
            </button>
          )}
        </div>

        {showDiscountInput && (
          <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 w-24">Giảm theo %:</span>
              <div className="flex gap-1 flex-1">
                {[5, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => {
                      setDiscountPercent(pct);
                      setDiscountAmount(0);
                    }}
                    className={`flex-1 py-1 rounded-md border text-center font-bold cursor-pointer ${
                      discountPercent === pct
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-500 w-24">Số tiền giảm:</span>
              <input
                type="number"
                placeholder="VNĐ..."
                value={discountAmount || ''}
                onChange={(e) => {
                  setDiscountAmount(Number(e.target.value) || 0);
                  setDiscountPercent(0);
                }}
                className="flex-1 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 text-xs bg-zinc-50 dark:bg-zinc-950"
              />
            </div>
          </div>
        )}

        {/* Tóm tắt tiền */}
        <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex justify-between">
            <span>Tiền hàng ({cart.reduce((s, it) => s + it.quantity, 0)} món):</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {formatVND(cartSubtotal)}
            </span>
          </div>

          {(discountPercent > 0 || discountAmount > 0) && (
            <div className="flex justify-between text-red-600 font-semibold">
              <span>
                Giảm giá {discountPercent > 0 ? `(${discountPercent}%)` : ''}:
              </span>
              <span>
                -
                {formatVND(
                  discountAmount || (cartSubtotal * discountPercent) / 100
                )}
              </span>
            </div>
          )}

          <div className="flex justify-between text-base font-black text-zinc-950 dark:text-white pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <span>TỔNG CỘNG:</span>
            <span className="text-amber-600 dark:text-amber-400 text-lg">
              {formatVND(cartTotal)}
            </span>
          </div>
        </div>

        {/* 2 Nút hành động */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleSaveOrder}
            disabled={cart.length === 0}
            className="py-3 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Lưu Bàn / Bếp
          </button>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 && !existingOrder}
            className="py-3 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold text-xs shadow-md shadow-amber-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center justify-center gap-1.5"
          >
            <span>Thanh Toán</span>
          </button>
        </div>
      </div>

      {/* Modal thao tác bàn */}
      {tableModalMode && (
        <TableSelectorModal
          isOpen={true}
          mode={tableModalMode}
          onClose={() => setTableModalMode(null)}
        />
      )}
    </div>
  );
}
