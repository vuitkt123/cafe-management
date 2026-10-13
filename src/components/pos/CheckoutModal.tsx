'use client';

import React, { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { Order, PaymentMethod } from '@/types';
import { formatVND } from '@/lib/formatters';
import { X, Banknote, QrCode, CreditCard, Check, Calculator } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (order: Order) => void;
  existingOrderId?: string;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  onSuccess,
  existingOrderId,
}: CheckoutModalProps) {
  const { cartTotal, checkoutOrder, orders, activeTableId, tables } = useCafe();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashReceivedInput, setCashReceivedInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  // Lấy tổng tiền (nếu là đơn bàn đã lưu thì lấy total của đơn đó, không thì lấy cartTotal)
  let totalAmount = cartTotal;
  let orderCode = `CF-${Date.now().toString().slice(-6)}`;
  if (existingOrderId) {
    const existing = orders.find((o) => o.id === existingOrderId);
    if (existing) {
      totalAmount = existing.total;
      orderCode = existing.code;
    }
  }

  const cashReceived = Number(cashReceivedInput) || 0;
  const changeDue = Math.max(0, cashReceived - totalAmount);

  // Phím gợi ý mệnh giá tiền mặt
  const quickCashOptions = [
    { label: 'Đủ tiền', amount: totalAmount },
    { label: '50.000 ₫', amount: 50000 },
    { label: '100.000 ₫', amount: 100000 },
    { label: '200.000 ₫', amount: 200000 },
    { label: '500.000 ₫', amount: 500000 },
  ].filter((opt) => opt.amount >= totalAmount || opt.label === 'Đủ tiền');

  // VietQR URL theo chuẩn Vietcombank (Demo số tài khoản cửa hàng)
  const vietQrUrl = `https://img.vietqr.io/image/970436-1029384756-compact2.png?amount=${totalAmount}&addInfo=THANH TOAN ${orderCode}&accountName=THE COFFEE HUB`;

  const handleConfirmPayment = () => {
    if (paymentMethod === 'cash' && cashReceived < totalAmount) {
      alert('Số tiền khách đưa chưa đủ!');
      return;
    }

    setIsProcessing(true);
    try {
      const completedOrder = checkoutOrder(
        paymentMethod,
        paymentMethod === 'cash' ? cashReceived : totalAmount,
        existingOrderId
      );
      onSuccess(completedOrder);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Thanh toán thất bại!');
    } finally {
      setIsProcessing(false);
    }
  };

  const activeTable = tables.find((t) => t.id === activeTableId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
              Thanh Toán Đơn Hàng
            </h3>
            <p className="text-xs text-zinc-500">
              {activeTable ? activeTable.name : 'Khách Mang Về'} • Tổng thanh toán:{' '}
              <span className="font-bold text-amber-600 text-sm">{formatVND(totalAmount)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Phương thức thanh toán Tabs */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => {
                setPaymentMethod('cash');
                setCashReceivedInput(totalAmount.toString());
              }}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                paymentMethod === 'cash'
                  ? 'border-amber-600 bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-400 shadow-xs ring-2 ring-amber-500/20 font-bold'
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              <Banknote size={22} />
              <span className="text-xs">Tiền mặt</span>
            </button>

            <button
              onClick={() => setPaymentMethod('vietqr')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                paymentMethod === 'vietqr'
                  ? 'border-blue-600 bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs ring-2 ring-blue-500/20 font-bold'
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              <QrCode size={22} />
              <span className="text-xs">Quét VietQR</span>
            </button>

            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                paymentMethod === 'card'
                  ? 'border-purple-600 bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-xs ring-2 ring-purple-500/20 font-bold'
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              <CreditCard size={22} />
              <span className="text-xs">Thẻ POS / Visa</span>
            </button>
          </div>
        </div>

        {/* Nội dung chi tiết phương thức */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {paymentMethod === 'cash' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
                  Tiền khách đưa (VNĐ)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Nhập số tiền..."
                    value={cashReceivedInput}
                    onChange={(e) => setCashReceivedInput(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 text-xl font-bold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100"
                  />
                  <span className="absolute right-4 top-3.5 text-zinc-400 font-semibold text-sm">
                    ₫
                  </span>
                </div>
              </div>

              {/* Phím bấm nhanh */}
              <div>
                <span className="text-xs text-zinc-500 mb-2 block">Gợi ý mệnh giá:</span>
                <div className="flex flex-wrap gap-2">
                  {quickCashOptions.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCashReceivedInput(opt.amount.toString())}
                      className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-100 dark:hover:bg-amber-950/50 hover:text-amber-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tiền thừa thối lại */}
              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-medium text-sm">
                  <Calculator size={18} />
                  <span>Tiền thối lại khách:</span>
                </div>
                <span className="text-2xl font-black text-amber-700 dark:text-amber-400">
                  {formatVND(changeDue)}
                </span>
              </div>
            </div>
          )}

          {paymentMethod === 'vietqr' && (
            <div className="text-center space-y-3">
              <div className="max-w-xs mx-auto p-3 bg-white border border-zinc-200 rounded-2xl shadow-xs">
                <img
                  src={vietQrUrl}
                  alt="VietQR Chuyển khoản"
                  className="w-full h-auto rounded-xl object-contain"
                />
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Quét mã qua mọi ứng dụng Ngân hàng hoặc MoMo, ZaloPay
                </p>
                <p>Nội dung CK: <strong className="text-amber-600">THANH TOAN {orderCode}</strong></p>
                <p>Số tiền: <strong className="text-emerald-600">{formatVND(totalAmount)}</strong></p>
              </div>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
                <CreditCard size={32} />
              </div>
              <div>
                <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Chờ quẹt / chạm thẻ trên máy POS
                </h4>
                <p className="text-xs text-zinc-500 mt-1">
                  Số tiền cần thanh toán: <strong className="text-zinc-900 dark:text-zinc-100">{formatVND(totalAmount)}</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            disabled={isProcessing}
            onClick={handleConfirmPayment}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-sm font-bold shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-2"
          >
            <Check size={18} />
            <span>Xác nhận đã thanh toán</span>
          </button>
        </div>
      </div>
    </div>
  );
}
