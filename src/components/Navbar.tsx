'use client';

import React, { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import {
  Coffee,
  Layers,
  Flame,
  UtensilsCrossed,
  Package,
  BarChart3,
  Users,
  AlertTriangle,
  ChevronDown,
  UserCheck,
} from 'lucide-react';

export type ActiveTab = 'pos' | 'tables' | 'kitchen' | 'menu' | 'inventory' | 'reports' | 'staff';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { currentUser, switchUser, users, lowStockCount } = useCafe();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'pos' as ActiveTab, label: 'Bán Hàng (POS)', icon: Coffee, roles: ['admin', 'cashier'] },
    { id: 'tables' as ActiveTab, label: 'Sơ Đồ Bàn', icon: Layers, roles: ['admin', 'cashier', 'barista'] },
    { id: 'kitchen' as ActiveTab, label: 'Màn Hình Pha Chế (KDS)', icon: Flame, roles: ['admin', 'cashier', 'barista'] },
    { id: 'menu' as ActiveTab, label: 'Thực Đơn & Định Lượng', icon: UtensilsCrossed, roles: ['admin'] },
    {
      id: 'inventory' as ActiveTab,
      label: 'Kho Nguyên Liệu',
      icon: Package,
      roles: ['admin'],
      badge: lowStockCount > 0 ? lowStockCount : undefined,
    },
    { id: 'reports' as ActiveTab, label: 'Báo Cáo Doanh Thu', icon: BarChart3, roles: ['admin'] },
    { id: 'staff' as ActiveTab, label: 'Nhân Viên & Cài Đặt', icon: Users, roles: ['admin'] },
  ];

  return (
    <header className="bg-zinc-950 text-white border-b border-zinc-800 flex-shrink-0 z-30 select-none">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-600/30">
            <Coffee size={22} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-wider text-amber-500">COFFEE</span>
              <span className="font-extrabold text-lg text-white">HUB</span>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium tracking-tight">
              Quản Lý Quán Cà Phê Chuyên Nghiệp
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isAllowed = item.roles.includes(currentUser.role);

            return (
              <button
                key={item.id}
                onClick={() => isAllowed && setActiveTab(item.id)}
                disabled={!isAllowed}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  !isAllowed
                    ? 'opacity-35 cursor-not-allowed text-zinc-500'
                    : isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                    : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                }`}
                title={!isAllowed ? 'Chỉ tài khoản Quản lý (Admin) mới có quyền truy cập' : ''}
              >
                <Icon size={16} />
                <span>{item.label}</span>

                {/* Badge cảnh báo kho */}
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-zinc-100 line-clamp-1">{currentUser.name}</p>
              <p className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider">
                {currentUser.role === 'admin'
                  ? 'Chủ Quán'
                  : currentUser.role === 'cashier'
                  ? 'Thu Ngân'
                  : 'Pha Chế'}
              </p>
            </div>
            <ChevronDown size={14} className="text-zinc-400" />
          </button>

          {/* Dropdown Menu */}
          {userDropdownOpen && (
            <div className="absolute right-0 top-12 mt-1 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 text-xs">
              <div className="px-3 py-2 text-zinc-400 text-[11px] font-semibold border-b border-zinc-800">
                Chuyển vai trò nhân viên thử nghiệm:
              </div>
              <div className="space-y-1 mt-1">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setUserDropdownOpen(false);
                      // Tự động chuyển tab phù hợp nếu role hiện tại không có quyền
                      if (u.role === 'barista' && (activeTab === 'pos' || activeTab === 'menu' || activeTab === 'inventory' || activeTab === 'reports')) {
                        setActiveTab('kitchen');
                      } else if (u.role === 'cashier' && (activeTab === 'menu' || activeTab === 'inventory' || activeTab === 'reports')) {
                        setActiveTab('pos');
                      }
                    }}
                    className={`w-full p-2 rounded-xl flex items-center justify-between text-left cursor-pointer transition-colors ${
                      currentUser.id === u.id
                        ? 'bg-amber-600/20 text-amber-400 font-bold'
                        : 'hover:bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div>
                      <p className="font-bold">{u.name}</p>
                      <p className="text-[10px] text-zinc-400 capitalize">
                        {u.role === 'admin'
                          ? 'Chủ quán (Admin)'
                          : u.role === 'cashier'
                          ? 'Thu ngân (POS)'
                          : 'Pha chế (Barista)'}
                      </p>
                    </div>
                    {currentUser.id === u.id && <UserCheck size={16} className="text-amber-500" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex items-center gap-1 px-3 py-2 border-t border-zinc-800 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAllowed = item.roles.includes(currentUser.role);

          return (
            <button
              key={item.id}
              onClick={() => isAllowed && setActiveTab(item.id)}
              disabled={!isAllowed}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${
                !isAllowed
                  ? 'opacity-30'
                  : isActive
                  ? 'bg-amber-600 text-white'
                  : 'text-zinc-400'
              }`}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
