'use client';

import React from 'react';
import { Order } from '@/types';
import { formatVND, formatDate } from '@/lib/formatters';
import { Printer, X, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiptModal({ order, isOpen, onClose }: ReceiptModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white text-zinc-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header Actions */}
        <div className="p-4 bg-zinc-100 flex items-center justify-between border-b border-zinc-200 print:hidden">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <CheckCircle2 size={18} />
            <span>Thanh toán thành công</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              <Printer size={15} />
              <span>In Hóa Đơn</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-500 hover:text-zinc-800 rounded-lg cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Khung Hóa Đơn (Chuẩn POS 80mm) */}
        <div id="printable-receipt" className="p-6 overflow-y-auto flex-1 font-mono text-xs leading-relaxed space-y-3 bg-white">
          {/* Thông tin Quán */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-zinc-400">
            <h2 className="text-base font-black tracking-wider uppercase">THE COFFEE HUB</h2>
            <p className="text-[11px] text-zinc-600">Specialty Coffee & Tea</p>
            <p className="text-[11px] text-zinc-600">Đ/c: 88 Đường Hoa Sữa, P.7, Q. Phú Nhuận, TP.HCM</p>
            <p className="text-[11px] text-zinc-600">Hotline: 0908 123 456</p>
            <p className="text-[10px] text-zinc-500">Wifi: CoffeeHub_Free | Pass: 88888888</p>
          </div>

          {/* Tiêu đề & Thông tin đơn */}
          <div className="text-center py-1">
            <h3 className="text-sm font-bold uppercase tracking-widest">HÓA ĐƠN THANH TOÁN</h3>
            <p className="text-[11px] font-bold text-zinc-800 mt-0.5">{order.code}</p>
          </div>

          <div className="space-y-0.5 text-[11px] text-zinc-700 pb-2 border-b border-dashed border-zinc-400">
            <div className="flex justify-between">
              <span>Bàn/Khu vực:</span>
              <span className="font-bold text-zinc-900">{order.tableName}</span>
            </div>
            <div className="flex justify-between">
              <span>Thu ngân:</span>
              <span>{order.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span>Thời gian:</span>
              <span>{formatDate(order.paidAt || order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>PT Thanh toán:</span>
              <span className="font-semibold uppercase">
                {order.paymentMethod === 'vietqr'
                  ? 'Chuyển khoản VietQR'
                  : order.paymentMethod === 'card'
                  ? 'Thẻ POS'
                  : 'Tiền mặt'}
              </span>
            </div>
          </div>

          {/* Danh sách món */}
          <div className="py-2 border-b border-dashed border-zinc-400 space-y-2">
            <div className="grid grid-cols-12 font-bold text-zinc-800 pb-1 border-b border-zinc-200">
              <span className="col-span-6">Tên món</span>
              <span className="col-span-2 text-center">SL</span>
              <span className="col-span-4 text-right">T.Tiền</span>
            </div>

            {order.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="grid grid-cols-12 font-semibold text-zinc-900">
                  <span className="col-span-6 line-clamp-1">
                    {item.productName} ({item.selectedSize})
                  </span>
                  <span className="col-span-2 text-center">{item.quantity}</span>
                  <span className="col-span-4 text-right">{formatVND(item.totalPrice)}</span>
                </div>

                {/* Chi tiết topping / đường đá */}
                <div className="text-[10px] text-zinc-500 pl-2">
                  {item.selectedToppings.length > 0 && (
                    <div>+ {item.selectedToppings.map((t) => t.name).join(', ')}</div>
                  )}
                  <div>
                    {item.iceLevel} đá, {item.sugarLevel} đường
                    {item.note ? ` - ${item.note}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tổng kết tiền */}
          <div className="space-y-1.5 pt-1 pb-3 border-b border-dashed border-zinc-400 text-zinc-800">
            <div className="flex justify-between">
              <span>Tổng tiền hàng:</span>
              <span>{formatVND(order.subtotal)}</span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Giảm giá:</span>
                <span>-{formatVND(order.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-extrabold text-zinc-950 pt-1 border-t border-zinc-300">
              <span>TỔNG CỘNG:</span>
              <span className="text-base text-amber-800">{formatVND(order.total)}</span>
            </div>

            {order.paymentMethod === 'cash' && order.cashReceived && (
              <>
                <div className="flex justify-between text-[11px] pt-1">
                  <span>Tiền khách đưa:</span>
                  <span>{formatVND(order.cashReceived)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span>Tiền thối lại:</span>
                  <span>{formatVND(order.changeGiven || 0)}</span>
                </div>
              </>
            )}
          </div>

          {/* Lời cảm ơn & Chân trang */}
          <div className="text-center pt-2 space-y-1">
            <p className="font-semibold text-zinc-800">Cảm ơn quý khách & Hẹn gặp lại!</p>
            <p className="text-[10px] text-zinc-500">Pass wifi tự động lưu khi quét mã QR bên dưới</p>
            <div className="pt-2 flex justify-center">
              {/* QR Code demo */}
              <div className="w-20 h-20 bg-zinc-100 border border-zinc-300 rounded p-1 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://coffeehub.vn/bill/${order.code}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <p className="text-[9px] text-zinc-400 pt-1">Hệ thống POS Quán Cà Phê CoffeeHub</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer text-center"
          >
            Đóng & Tiếp tục bán hàng
          </button>
        </div>
      </div>
    </div>
  );
}
