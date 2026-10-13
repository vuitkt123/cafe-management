'use client';

import React, { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { Order, CartItem } from '@/types';
import { formatShortTime } from '@/lib/formatters';
import {
  Clock,
  CheckCircle,
  Coffee,
  CheckCheck,
  AlertCircle,
  Flame,
} from 'lucide-react';

export default function KitchenDisplayView() {
  const { orders, updateOrderItemStatus } = useCafe();
  const [filter, setFilter] = useState<'active' | 'all'>('active');

  // Lọc các đơn chưa hoàn thành hoặc chưa hủy
  const displayedOrders = orders.filter((o) => {
    if (o.orderStatus === 'cancelled') return false;
    if (filter === 'active') {
      return o.orderStatus !== 'paid' && o.orderStatus !== 'served';
    }
    return true;
  });

  const handleToggleItemStatus = (orderId: string, item: CartItem) => {
    let nextStatus: 'pending' | 'preparing' | 'completed' = 'preparing';
    if (item.status === 'preparing') nextStatus = 'completed';
    else if (item.status === 'completed') nextStatus = 'pending';

    updateOrderItemStatus(orderId, item.id, nextStatus);
  };

  const handleCompleteAllItems = (order: Order) => {
    order.items.forEach((item) => {
      updateOrderItemStatus(order.id, item.id, 'completed');
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-900 text-zinc-100 overflow-hidden">
      {/* Top Bar KDS */}
      <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-600/20 text-amber-500 rounded-xl border border-amber-600/30">
            <Flame size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span>Màn Hình Pha Chế (KDS - Barista)</span>
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-mono border border-amber-500/30">
                LIVE
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Cập nhật order theo thời gian thực từ quầy thu ngân và các bàn
            </p>
          </div>
        </div>

        {/* Bộ lọc đơn */}
        <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'active'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Đang chờ làm ({orders.filter((o) => o.orderStatus !== 'paid' && o.orderStatus !== 'served' && o.orderStatus !== 'cancelled').length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Tất cả đơn trong ngày
          </button>
        </div>
      </div>

      {/* Grid danh sách phiếu gọi món KDS */}
      <div className="flex-1 overflow-y-auto p-5">
        {displayedOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-16">
            <CheckCheck size={56} className="mb-3 opacity-40 text-emerald-500" />
            <p className="text-lg font-bold text-zinc-300">Không có món nào đang chờ pha chế!</p>
            <p className="text-xs text-zinc-500 mt-1">Các món đã được hoàn tất hoặc chưa có order mới</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedOrders.map((order) => {
              const allDone = order.items.every((it) => it.status === 'completed');

              return (
                <div
                  key={order.id}
                  className={`rounded-2xl border-2 overflow-hidden flex flex-col justify-between shadow-lg transition-all ${
                    allDone
                      ? 'border-emerald-600/40 bg-zinc-950/60 opacity-80'
                      : 'border-zinc-800 bg-zinc-950 hover:border-amber-500/50'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-3.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-amber-400">
                          {order.tableName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                          {order.code}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Clock size={12} /> {formatShortTime(order.createdAt)} • {order.cashierName}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCompleteAllItems(order)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-600/30 text-[11px] font-bold transition-all cursor-pointer"
                      title="Hoàn tất cả đơn"
                    >
                      Xong hết
                    </button>
                  </div>

                  {/* Item List */}
                  <div className="p-3.5 space-y-2.5 flex-1">
                    {order.items.map((item) => {
                      const isCompleted = item.status === 'completed';
                      const isPreparing = item.status === 'preparing';

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleItemStatus(order.id, item)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                            isCompleted
                              ? 'bg-emerald-950/20 border-emerald-800/40 opacity-70 line-through-text'
                              : isPreparing
                              ? 'bg-blue-950/30 border-blue-600/50 shadow-inner'
                              : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black ${
                                  isCompleted
                                    ? 'bg-emerald-600 text-white'
                                    : isPreparing
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-amber-600 text-white'
                                }`}
                              >
                                {item.quantity}x
                              </span>
                              <span
                                className={`font-bold text-sm ${
                                  isCompleted
                                    ? 'text-zinc-400 line-through'
                                    : 'text-zinc-100'
                                }`}
                              >
                                {item.productName}{' '}
                                <span className="text-xs text-amber-400 font-semibold">
                                  ({item.selectedSize})
                                </span>
                              </span>
                            </div>

                            {/* Options: Đường, đá, topping */}
                            <div className="text-[11px] text-zinc-400 pl-8 space-y-0.5">
                              {item.selectedToppings.length > 0 && (
                                <p className="text-amber-300">
                                  + {item.selectedToppings.map((t) => t.name).join(', ')}
                                </p>
                              )}
                              <p>
                                Đá: <strong className="text-zinc-200">{item.iceLevel}</strong> • Đường:{' '}
                                <strong className="text-zinc-200">{item.sugarLevel}</strong>
                              </p>
                              {item.note && (
                                <p className="text-rose-400 font-semibold bg-rose-950/40 px-1.5 py-0.5 rounded inline-block">
                                  ⚠️ {item.note}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex-shrink-0 pt-0.5">
                            {isCompleted ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Đã pha
                              </span>
                            ) : isPreparing ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                Đang làm
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                                Chờ
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Card Footer */}
                  <div className="p-3 bg-zinc-900/60 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                    <span>Tổng: {order.items.reduce((s, it) => s + it.quantity, 0)} ly</span>
                    <span className="text-[11px] italic">Bấm vào món để đổi trạng thái</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
