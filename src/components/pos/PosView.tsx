'use client';

import React, { useState, useMemo } from 'react';
import { useCafe } from '@/context/CafeContext';
import { Product, Order } from '@/types';
import { formatVND } from '@/lib/formatters';
import { Search, Plus, Sparkles } from 'lucide-react';
import ProductCustomizerModal from './ProductCustomizerModal';
import CartPanel from './CartPanel';
import CheckoutModal from './CheckoutModal';
import ReceiptModal from './ReceiptModal';

export default function PosView() {
  const { categories, products, toppings, addToCart } = useCafe();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);

  // Modals
  const [checkoutOrderId, setCheckoutOrderId] = useState<string | undefined>(undefined);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  // Lọc sản phẩm
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchCat = selectedCategoryId === 'all' || prod.categoryId === selectedCategoryId;
      const matchSearch =
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch && prod.isAvailable;
    });
  }, [products, selectedCategoryId, searchQuery]);

  const handleOpenCheckout = (existingOrderId?: string) => {
    setCheckoutOrderId(existingOrderId);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = (completedOrder: Order) => {
    setReceiptOrder(completedOrder);
  };

  return (
    <div className="flex h-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
      {/* Cột Trái & Giữa: Menu & Tìm kiếm món */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top bar: Tìm kiếm & Danh mục */}
        <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 space-y-3 shadow-2xs">
          {/* Thanh tìm kiếm */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm món theo tên thức uống, bánh ngọt... (VD: bạc xỉu, trà đào)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Danh sách danh mục Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategoryId === 'all'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
              }`}
            >
              Tất cả món
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategoryId === cat.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách sản phẩm Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">
              <Sparkles size={40} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Không tìm thấy món ăn nào phù hợp!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => setCustomizingProduct(prod)}
                  className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xs hover:shadow-md hover:border-amber-400 dark:hover:border-amber-600 transition-all flex flex-col cursor-pointer"
                >
                  {/* Ảnh món */}
                  <div className="relative h-32 w-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {prod.sizes.map((s) => s.name).join('/')}
                    </div>
                  </div>

                  {/* Chi tiết món */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-amber-600 transition-colors">
                        {prod.name}
                      </h3>
                      <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                        {prod.description}
                      </p>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400">
                        {formatVND(prod.basePrice)}
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition-colors">
                        <Plus size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cột Phải: Giỏ hàng POS */}
      <div className="w-80 md:w-96 h-full flex-shrink-0">
        <CartPanel onOpenCheckout={handleOpenCheckout} />
      </div>

      {/* Modal Tùy chỉnh món (Size, topping, đường đá) */}
      {customizingProduct && (
        <ProductCustomizerModal
          isOpen={true}
          product={customizingProduct}
          toppings={toppings}
          onClose={() => setCustomizingProduct(null)}
          onAddToCart={(item) => {
            addToCart(item);
          }}
        />
      )}

      {/* Modal Thanh toán */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
        existingOrderId={checkoutOrderId}
      />

      {/* Modal Hóa đơn chuẩn in POS */}
      <ReceiptModal
        order={receiptOrder}
        isOpen={!!receiptOrder}
        onClose={() => setReceiptOrder(null)}
      />
    </div>
  );
}
