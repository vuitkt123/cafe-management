import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CoffeeHub POS - Hệ Thống Quản Lý Quán Cà Phê Toàn Diện',
  description: 'Hệ thống quản lý bán hàng POS, sơ đồ bàn, kho nguyên liệu định lượng và báo cáo doanh thu',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="h-full flex flex-col bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
