'use client';

import React, { useState } from 'react';
import { Product, Topping } from '@/types';
import { formatVND } from '@/lib/formatters';
import { X, Plus, Minus, Check } from 'lucide-react';

interface ProductCustomizerModalProps {
  product: Product;
  toppings: Topping[];
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (customizedItem: {
    productId: string;
    productName: string;
    basePrice: number;
    unitPrice: number;
    quantity: number;
    selectedSize: 'S' | 'M' | 'L';
    selectedToppings: Topping[];
    iceLevel: string;
    sugarLevel: string;
    note: string;
  }) => void;
}

export default function ProductCustomizerModal({
  product,
  toppings,
  isOpen,
  onClose,
  onAddToCart,
}: ProductCustomizerModalProps) {
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L'>('M');
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [iceLevel, setIceLevel] = useState<string>('100%');
  const [sugarLevel, setSugarLevel] = useState<string>('100%');
  const [note, setNote] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  if (!isOpen) return null;

  // Tính đơn giá theo size và toppings
  const sizeOption = product.sizes.find((s) => s.name === selectedSize);
  const sizeExtra = sizeOption ? sizeOption.extraPrice : 0;
  const toppingsTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const unitPrice = product.basePrice + sizeExtra + toppingsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleTopping = (topping: Topping) => {
    if (selectedToppings.some((t) => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const handleConfirm = () => {
    onAddToCart({
      productId: product.id,
      productName: product.name,
      basePrice: product.basePrice,
      unitPrice,
      quantity,
      selectedSize,
      selectedToppings,
      iceLevel,
      sugarLevel,
      note,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="relative h-44 bg-amber-100 dark:bg-zinc-800">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
            <h3 className="text-xl font-bold">{product.name}</h3>
            <p className="text-sm text-zinc-200 line-clamp-1">{product.description}</p>
          </div>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-5 text-zinc-900 dark:text-zinc-100 flex-1">
          {/* Chọn Size */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">
              Chọn Size ly
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {product.sizes.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setSelectedSize(s.name)}
                  className={`p-3 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                    selectedSize === s.name
                      ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <div className="text-base">Size {s.name}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    +{formatVND(s.extraPrice)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chọn Lượng Đá & Đường */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">
                Lượng Đá
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['0%', '50%', '100%'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setIceLevel(lvl)}
                    className={`px-3 py-1.5 text-xs rounded-lg border font-medium cursor-pointer transition-colors ${
                      iceLevel === lvl
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                        : 'border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    {lvl} đá
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">
                Lượng Đường
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['0%', '50%', '100%'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSugarLevel(lvl)}
                    className={`px-3 py-1.5 text-xs rounded-lg border font-medium cursor-pointer transition-colors ${
                      sugarLevel === lvl
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold'
                        : 'border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    {lvl} ngọt
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chọn Topping */}
          {toppings.length > 0 && (
            <div>
              <label className="block text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">
                Thêm Topping
              </label>
              <div className="space-y-2">
                {toppings.map((top) => {
                  const isChecked = selectedToppings.some((t) => t.id === top.id);
                  return (
                    <div
                      key={top.id}
                      onClick={() => toggleTopping(top)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            isChecked
                              ? 'bg-amber-600 border-amber-600 text-white'
                              : 'border-zinc-300 dark:border-zinc-700'
                          }`}
                        >
                          {isChecked && <Check size={14} strokeWidth={3} />}
                        </div>
                        <span className="text-sm font-medium">{top.name}</span>
                      </div>
                      <span className="text-sm text-amber-600 dark:text-amber-400 font-semibold">
                        +{formatVND(top.price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">
              Ghi chú cho pha chế
            </label>
            <input
              type="text"
              placeholder="VD: Không lấy nắp nhựa, pha đậm vị..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 cursor-pointer"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center font-bold text-base">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 cursor-pointer"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-base shadow-md shadow-amber-600/20 transition-all flex items-center justify-between cursor-pointer"
          >
            <span>Thêm vào đơn</span>
            <span>{formatVND(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
