'use client';

import React, { useState } from 'react';
import { CafeProvider } from '@/context/CafeContext';
import Navbar, { ActiveTab } from '@/components/Navbar';
import PosView from '@/components/pos/PosView';
import TableManagementView from '@/components/tables/TableManagementView';
import KitchenDisplayView from '@/components/kitchen/KitchenDisplayView';
import MenuManagementView from '@/components/menu/MenuManagementView';
import InventoryView from '@/components/inventory/InventoryView';
import ReportsView from '@/components/reports/ReportsView';
import StaffManagementView from '@/components/staff/StaffManagementView';

function CafeApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-100 dark:bg-zinc-950">
      {/* Thanh Header điều hướng */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Vùng nội dung ứng dụng tương ứng */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'pos' && <PosView />}
        {activeTab === 'tables' && (
          <TableManagementView onGoToPos={() => setActiveTab('pos')} />
        )}
        {activeTab === 'kitchen' && <KitchenDisplayView />}
        {activeTab === 'menu' && <MenuManagementView />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'staff' && <StaffManagementView />}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <CafeProvider>
      <CafeApp />
    </CafeProvider>
  );
}
