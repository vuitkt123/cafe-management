'use client';

import React, { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { Product, ProductSize, RecipeItem, Topping } from '@/types';
import { formatVND } from '@/lib/formatters';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Check,
  X,
  Layers,
  FlaskConical,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function MenuManagementView() {
  const {
    products,
    categories,
    toppings,
    ingredients,
    addProduct,
    updateProduct,
    deleteProduct,
    addTopping,
    deleteTopping,
    addCategory,
  } = useCafe();

  const [activeTab, setActiveTab] = useState<'products' | 'toppings' | 'categories'>('products');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');

  // Modal Add / Edit Product
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState<number>(30000);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [sizes, setSizes] = useState<ProductSize[]>([
    { name: 'S', extraPrice: 0 },
    { name: 'M', extraPrice: 5000 },
    { name: 'L', extraPrice: 10000 },
  ]);
  const [recipe, setRecipe] = useState<RecipeItem[]>([]);

  // Modal Topping
  const [newToppingName, setNewToppingName] = useState('');
  const [newToppingPrice, setNewToppingPrice] = useState(8000);

  // Modal Category
  const [newCatName, setNewCatName] = useState('');

  const openAddProductModal = () => {
    setEditingProductId(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setBasePrice(30000);
    setImage('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80');
    setDescription('');
    setIsAvailable(true);
    setSizes([
      { name: 'S', extraPrice: 0 },
      { name: 'M', extraPrice: 5000 },
      { name: 'L', extraPrice: 10000 },
    ]);
    setRecipe([]);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProductId(prod.id);
    setName(prod.name);
    setCategoryId(prod.categoryId);
    setBasePrice(prod.basePrice);
    setImage(prod.image);
    setDescription(prod.description);
    setIsAvailable(prod.isAvailable);
    setSizes(prod.sizes);
    setRecipe(prod.recipe || []);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Vui lòng nhập tên món!');

    if (editingProductId) {
      updateProduct(editingProductId, {
        name,
        categoryId,
        basePrice,
        image,
        description,
        isAvailable,
        sizes,
        recipe,
      });
    } else {
      addProduct({
        name,
        categoryId,
        basePrice,
        image,
        description,
        isAvailable,
        sizes,
        availableToppings: toppings.map((t) => t.id),
        recipe,
      });
    }
    setIsProductModalOpen(false);
  };

  const handleAddRecipeIngredient = (ingredientId: string) => {
    if (recipe.some((r) => r.ingredientId === ingredientId)) return;
    setRecipe([...recipe, { ingredientId, amount: 10 }]);
  };

  const handleUpdateRecipeAmount = (ingredientId: string, amount: number) => {
    setRecipe(recipe.map((r) => (r.ingredientId === ingredientId ? { ...r, amount } : r)));
  };

  const handleRemoveRecipeIngredient = (ingredientId: string) => {
    setRecipe(recipe.filter((r) => r.ingredientId !== ingredientId));
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCatFilter === 'all' || p.categoryId === selectedCatFilter;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
      {/* Top Header */}
      <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Quản Lý Thực Đơn & Công Thức
          </h1>
          <p className="text-xs text-zinc-500">
            Quản lý món, phân loại danh mục, topping và định lượng nguyên liệu trừ kho
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2">
          <div className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl flex">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-300'
              }`}
            >
              Món ăn & Đồ uống ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('toppings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'toppings'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-300'
              }`}
            >
              Topping ({toppings.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-300'
              }`}
            >
              Danh mục ({categories.length})
            </button>
          </div>

          {activeTab === 'products' && (
            <button
              onClick={openAddProductModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              <Plus size={16} />
              <span>Thêm món mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Filter & Search */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
              <div className="relative flex-1 min-w-[240px]">
                <Search size={16} className="absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm món trong thực đơn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedCatFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                    selectedCatFilter === 'all'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  Tất cả
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCatFilter(c.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                      selectedCatFilter === c.id
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Món & Hình ảnh</th>
                      <th className="p-3.5">Danh mục</th>
                      <th className="p-3.5">Giá niêm yết</th>
                      <th className="p-3.5">Size hỗ trợ</th>
                      <th className="p-3.5">Định lượng (Recipe)</th>
                      <th className="p-3.5">Trạng thái</th>
                      <th className="p-3.5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredProducts.map((p) => {
                      const cat = categories.find((c) => c.id === p.categoryId);
                      const hasRecipe = p.recipe && p.recipe.length > 0;

                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                              />
                              <div>
                                <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                  {p.name}
                                </p>
                                <p className="text-[11px] text-zinc-400 line-clamp-1 max-w-xs">
                                  {p.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                              {cat?.name || 'Chưa phân loại'}
                            </span>
                          </td>

                          <td className="p-3.5 font-bold text-amber-600 text-sm">
                            {formatVND(p.basePrice)}
                          </td>

                          <td className="p-3.5">
                            <div className="flex gap-1">
                              {p.sizes.map((s) => (
                                <span
                                  key={s.name}
                                  className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-semibold text-[11px]"
                                >
                                  {s.name} (+{formatVND(s.extraPrice)})
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="p-3.5">
                            {hasRecipe ? (
                              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                <FlaskConical size={14} />
                                <span>{p.recipe!.length} nguyên liệu</span>
                              </span>
                            ) : (
                              <span className="text-zinc-400 italic">Chưa có công thức</span>
                            )}
                          </td>

                          <td className="p-3.5">
                            <button
                              onClick={() =>
                                updateProduct(p.id, { isAvailable: !p.isAvailable })
                              }
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                                p.isAvailable
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                              }`}
                            >
                              {p.isAvailable ? <Eye size={12} /> : <EyeOff size={12} />}
                              <span>{p.isAvailable ? 'Còn bán' : 'Hết hàng'}</span>
                            </button>
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditProductModal(p)}
                                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-lg cursor-pointer"
                                title="Sửa món & công thức"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Xóa món "${p.name}"?`)) {
                                    deleteProduct(p.id);
                                  }
                                }}
                                className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer"
                                title="Xóa món"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab Topping */}
        {activeTab === 'toppings' && (
          <div className="max-w-2xl space-y-4">
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs flex items-center gap-3">
              <input
                type="text"
                placeholder="Tên topping mới (VD: Trân châu đường đen)..."
                value={newToppingName}
                onChange={(e) => setNewToppingName(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
              />
              <input
                type="number"
                placeholder="Giá tiền (VNĐ)..."
                value={newToppingPrice}
                onChange={(e) => setNewToppingPrice(Number(e.target.value))}
                className="w-32 px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-bold"
              />
              <button
                onClick={() => {
                  if (!newToppingName.trim()) return;
                  addTopping({ name: newToppingName, price: newToppingPrice });
                  setNewToppingName('');
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Thêm Topping
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800">
              {toppings.map((t) => (
                <div key={t.id} className="p-3.5 flex items-center justify-between">
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {t.name}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-amber-600 text-sm">
                      {formatVND(t.price)}
                    </span>
                    <button
                      onClick={() => deleteTopping(t.id)}
                      className="p-1 text-zinc-400 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Danh mục */}
        {activeTab === 'categories' && (
          <div className="max-w-2xl space-y-4">
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs flex items-center gap-3">
              <input
                type="text"
                placeholder="Tên danh mục mới (VD: Cà phê đá xay, Nước ép tươi)..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
              />
              <button
                onClick={() => {
                  if (!newCatName.trim()) return;
                  addCategory({ name: newCatName, icon: 'Coffee' });
                  setNewCatName('');
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Thêm Danh mục
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800">
              {categories.map((c) => (
                <div key={c.id} className="p-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{c.name}</h4>
                    <p className="text-xs text-zinc-500">
                      {products.filter((p) => p.categoryId === c.id).length} món trong danh mục
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Thêm / Sửa Món & Định lượng */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                {editingProductId ? 'Chỉnh Sửa Món' : 'Thêm Món Mới Vào Thực Đơn'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Tên món thức uống / bánh</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Danh mục</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Giá bán cơ bản (VNĐ)</label>
                  <input
                    type="number"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-bold text-amber-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Link Ảnh món (URL)</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Mô tả món</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950"
                />
              </div>

              {/* Định lượng công thức nguyên liệu (Recipe - BOM) */}
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    <FlaskConical size={16} className="text-amber-600" />
                    <span>Định Lượng Nguyên Liệu Trừ Kho Tự Động</span>
                  </div>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddRecipeIngredient(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className="px-2.5 py-1 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer"
                  >
                    <option value="" disabled>
                      + Thêm nguyên liệu kho...
                    </option>
                    {ingredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {recipe.length === 0 ? (
                  <p className="text-zinc-400 italic text-[11px]">
                    Chưa gắn công thức. Khi bán món này sẽ không tự trừ kho.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {recipe.map((r) => {
                      const ing = ingredients.find((i) => i.id === r.ingredientId);
                      return (
                        <div
                          key={r.ingredientId}
                          className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800"
                        >
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">
                            {ing?.name || r.ingredientId}
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={r.amount}
                              onChange={(e) =>
                                handleUpdateRecipeAmount(r.ingredientId, Number(e.target.value))
                              }
                              className="w-20 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 text-right font-bold"
                            />
                            <span className="text-zinc-500 w-8">{ing?.unit}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveRecipeIngredient(r.ingredientId)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
                >
                  Lưu Món
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
