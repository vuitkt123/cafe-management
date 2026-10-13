'use client';

import React, { useState, useMemo } from 'react';
import { useCafe } from '@/context/CafeContext';
import { Order } from '@/types';
import { formatVND, formatDate } from '@/lib/formatters';
import {
  TrendingUp,
  CreditCard,
  Banknote,
  QrCode,
  Download,
  Calendar,
  Award,
  Receipt,
  Printer,
  Search,
} from 'lucide-react';
import ReceiptModal from '../pos/ReceiptModal';

export default function ReportsView() {
  const { orders } = useCafe();

  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [searchCode, setSearchCode] = useState<string>('');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  // Lọc danh sách đơn đã thanh toán
  const paidOrders = useMemo(() => {
    return orders.filter((o) => o.paymentStatus === 'paid');
  }, [orders]);

  // Lọc theo khoảng thời gian
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return paidOrders.filter((o) => {
      if (!o.paidAt && !o.createdAt) return false;
      const orderDate = new Date(o.paidAt || o.createdAt);

      if (dateFilter === 'today') {
        return (
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      if (dateFilter === 'week') {
        const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7;
      }
      if (dateFilter === 'month') {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }, [paidOrders, dateFilter]);

  // Tổng doanh thu
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = filteredOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // Thống kê theo phương thức thanh toán
  const paymentStats = useMemo(() => {
    let cash = 0;
    let vietqr = 0;
    let card = 0;

    filteredOrders.forEach((o) => {
      if (o.paymentMethod === 'vietqr') vietqr += o.total;
      else if (o.paymentMethod === 'card') card += o.total;
      else cash += o.total;
    });

    return { cash, vietqr, card };
  }, [filteredOrders]);

  // Thống kê Top món bán chạy nhất
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; quantity: number; revenue: number }>();

    filteredOrders.forEach((o) => {
      o.items.forEach((item) => {
        const cur = map.get(item.productName) || {
          name: item.productName,
          quantity: 0,
          revenue: 0,
        };
        cur.quantity += item.quantity;
        cur.revenue += item.totalPrice;
        map.set(item.productName, cur);
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [filteredOrders]);

  // Dữ liệu biểu đồ cột doanh thu 7 ngày gần nhất (hoặc theo hóa đơn)
  const chartBars = useMemo(() => {
    const days: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = `${d.getDate()}/${d.getMonth() + 1}`;
      const rev = paidOrders
        .filter((o) => {
          const ordD = new Date(o.paidAt || o.createdAt);
          return (
            ordD.getDate() === d.getDate() &&
            ordD.getMonth() === d.getMonth() &&
            ordD.getFullYear() === d.getFullYear()
          );
        })
        .reduce((sum, o) => sum + o.total, 0);
      days.push({ label: dayStr, value: rev });
    }
    return days;
  }, [paidOrders]);

  const maxChartValue = Math.max(...chartBars.map((b) => b.value), 100000);

  // Xuất file CSV
  const handleExportCSV = () => {
    const headers = 'Mã đơn,Bàn,Thời gian,Số món,Tổng tiền (VND),PT Thanh toán,Thu ngân\n';
    const rows = filteredOrders
      .map(
        (o) =>
          `"${o.code}","${o.tableName}","${formatDate(o.paidAt || o.createdAt)}",${o.items.reduce(
            (s, i) => s + i.quantity,
            0
          )},${o.total},"${o.paymentMethod || 'cash'}","${o.cashierName}"`
      )
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bao_cao_doanh_thu_coffeehub_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
      {/* Top Banner */}
      <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Báo Cáo Doanh Thu & Thống Kê
            </h1>
            <p className="text-xs text-zinc-500">
              Phân tích hiệu quả kinh doanh, phương thức thanh toán và món bán chạy nhất
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Buttons */}
            <div className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl flex text-xs">
              <button
                onClick={() => setDateFilter('today')}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                  dateFilter === 'today'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-300'
                }`}
              >
                Hôm nay
              </button>
              <button
                onClick={() => setDateFilter('week')}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                  dateFilter === 'week'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-300'
                }`}
              >
                7 ngày qua
              </button>
              <button
                onClick={() => setDateFilter('month')}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                  dateFilter === 'month'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-300'
                }`}
              >
                Tháng này
              </button>
              <button
                onClick={() => setDateFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                  dateFilter === 'all'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-300'
                }`}
              >
                Tất cả
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download size={15} />
              <span>Xuất CSV</span>
            </button>
          </div>
        </div>

        {/* 4 Thẻ KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-950/40 dark:to-zinc-900 rounded-2xl border border-amber-200 dark:border-amber-900/50">
            <span className="text-xs text-zinc-500 block mb-1">Tổng doanh thu thực tế</span>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-400">
              {formatVND(totalRevenue)}
            </div>
          </div>

          <div className="p-3.5 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <span className="text-xs text-zinc-500 block mb-1">Số hóa đơn thành công</span>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {totalOrdersCount} <span className="text-sm font-normal text-zinc-400">đơn</span>
            </div>
          </div>

          <div className="p-3.5 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <span className="text-xs text-zinc-500 block mb-1">Giá trị trung bình/đơn</span>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {formatVND(avgOrderValue)}
            </div>
          </div>

          <div className="p-3.5 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <span className="text-xs text-zinc-500 block mb-1">Tỷ lệ Chuyển khoản QR</span>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {totalRevenue > 0
                ? `${Math.round((paymentStats.vietqr / totalRevenue) * 100)}%`
                : '0%'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Biểu đồ Doanh thu (SVG Cột đẹp mắt) */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-amber-600" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Xu Hướng Doanh Thu 7 Ngày Gần Nhất
                </h3>
              </div>
              <span className="text-xs text-zinc-400 font-mono">Đơn vị: VNĐ</span>
            </div>

            {/* Khung vẽ cột */}
            <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2 border-b border-zinc-200 dark:border-zinc-800">
              {chartBars.map((bar, i) => {
                const heightPct = Math.max(8, Math.round((bar.value / maxChartValue) * 100));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      {bar.value > 0 ? `${Math.round(bar.value / 1000)}k` : '0'}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full max-w-[40px] bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg transition-all hover:brightness-110"
                    />
                    <span className="text-[11px] font-medium text-zinc-500">{bar.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phân bổ Thanh toán & Top món */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-amber-600" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Cơ Cấu Phương Thức Thanh Toán
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <QrCode size={14} className="text-blue-500" /> Chuyển khoản VietQR:
                  </span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {formatVND(paymentStats.vietqr)}
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${totalRevenue > 0 ? (paymentStats.vietqr / totalRevenue) * 100 : 0}%`,
                    }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Banknote size={14} className="text-emerald-500" /> Tiền mặt:
                  </span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {formatVND(paymentStats.cash)}
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${totalRevenue > 0 ? (paymentStats.cash / totalRevenue) * 100 : 0}%`,
                    }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CreditCard size={14} className="text-purple-500" /> Quẹt thẻ POS:
                  </span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {formatVND(paymentStats.card)}
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${totalRevenue > 0 ? (paymentStats.card / totalRevenue) * 100 : 0}%`,
                    }}
                    className="h-full bg-purple-500 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Top món bán chạy */}
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 mb-2 font-bold text-xs text-zinc-700 dark:text-zinc-300">
                <Award size={15} className="text-amber-500" />
                <span>Top Món Bán Chạy Nhất</span>
              </div>
              <div className="space-y-1.5">
                {topProducts.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="line-clamp-1 max-w-[160px] text-zinc-600 dark:text-zinc-400">
                      #{idx + 1} {p.name}
                    </span>
                    <span className="font-bold text-amber-600">{p.quantity} ly</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lịch sử hóa đơn chi tiết */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Receipt size={18} className="text-amber-600" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Lịch Sử Hóa Đơn Bán Hàng
              </h3>
            </div>

            <div className="relative">
              <Search size={15} className="absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Tìm mã đơn (CF-2026...)..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Mã hóa đơn</th>
                  <th className="p-3.5">Bàn / Khu vực</th>
                  <th className="p-3.5">Thời gian thanh toán</th>
                  <th className="p-3.5">Số lượng món</th>
                  <th className="p-3.5">Tổng thanh toán</th>
                  <th className="p-3.5">Phương thức</th>
                  <th className="p-3.5">Thu ngân</th>
                  <th className="p-3.5 text-right">In lại bill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredOrders
                  .filter((o) => o.code.toLowerCase().includes(searchCode.toLowerCase()))
                  .map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="p-3.5 font-bold font-mono text-zinc-900 dark:text-zinc-100">
                        {order.code}
                      </td>
                      <td className="p-3.5 font-medium">{order.tableName}</td>
                      <td className="p-3.5 text-zinc-500 font-mono">
                        {formatDate(order.paidAt || order.createdAt)}
                      </td>
                      <td className="p-3.5 font-semibold">
                        {order.items.reduce((s, it) => s + it.quantity, 0)} món
                      </td>
                      <td className="p-3.5 font-black text-amber-600 text-sm">
                        {formatVND(order.total)}
                      </td>
                      <td className="p-3.5 uppercase font-semibold text-[11px]">
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            order.paymentMethod === 'vietqr'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                              : order.paymentMethod === 'card'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          }`}
                        >
                          {order.paymentMethod === 'vietqr'
                            ? 'VietQR'
                            : order.paymentMethod === 'card'
                            ? 'Thẻ'
                            : 'Tiền mặt'}
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-500">{order.cashierName}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedReceiptOrder(order)}
                          className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px] flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Printer size={13} />
                          <span>In bill</span>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal In Lại Hóa Đơn */}
      <ReceiptModal
        order={selectedReceiptOrder}
        isOpen={!!selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
      />
    </div>
  );
}
