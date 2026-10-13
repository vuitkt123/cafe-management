'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Category,
  Product,
  Topping,
  Table,
  Ingredient,
  User,
  Order,
  CartItem,
  Role,
  PaymentMethod,
  InventoryLog,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_TOPPINGS,
  INITIAL_TABLES,
  INITIAL_INGREDIENTS,
  INITIAL_USERS,
  INITIAL_ORDERS,
} from '../lib/initialData';

interface CafeContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchUser: (userId: string) => void;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;

  categories: Category[];
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  products: Product[];
  addProduct: (prod: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, prod: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  toppings: Topping[];
  addTopping: (topping: Omit<Topping, 'id'>) => void;
  updateTopping: (id: string, topping: Partial<Topping>) => void;
  deleteTopping: (id: string) => void;

  tables: Table[];
  activeTableId: string;
  setActiveTableId: (id: string) => void;
  changeTable: (fromTableId: string, toTableId: string) => void;
  mergeTables: (sourceTableId: string, targetTableId: string) => void;
  updateTableStatus: (tableId: string, status: Table['status']) => void;

  // Giỏ hàng POS
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'totalPrice'>) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  discountPercent: number;
  setDiscountPercent: (percent: number) => void;
  discountAmount: number;
  setDiscountAmount: (amount: number) => void;
  cartSubtotal: number;
  cartTotal: number;

  // Đơn hàng
  orders: Order[];
  saveOrderForTable: () => string; // returns order id
  checkoutOrder: (
    paymentMethod: PaymentMethod,
    cashReceived?: number,
    existingOrderId?: string
  ) => Order;
  cancelOrder: (orderId: string) => void;
  updateOrderItemStatus: (orderId: string, itemId: string, status: 'pending' | 'preparing' | 'completed') => void;

  // Kho nguyên liệu
  ingredients: Ingredient[];
  inventoryLogs: InventoryLog[];
  addIngredient: (ing: Omit<Ingredient, 'id' | 'lastUpdated'>) => void;
  updateIngredient: (id: string, ing: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
  importInventory: (ingredientId: string, amount: number, costPerUnit: number, reason: string) => void;
  adjustInventory: (ingredientId: string, newAmount: number, reason: string) => void;
  lowStockCount: number;

  // Data management
  resetToDefaultData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
}

const CafeContext = createContext<CafeContextType | null>(null);

const STORAGE_KEY_PREFIX = 'coffeehub_pos_';

export function CafeProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [toppings, setToppings] = useState<Topping[]>(INITIAL_TOPPINGS);
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);

  const [activeTableId, setActiveTableId] = useState<string>('takeaway');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Load từ LocalStorage lúc khởi tạo
  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem(STORAGE_KEY_PREFIX + 'users');
      if (savedUsers) setUsers(JSON.parse(savedUsers));

      const savedCategories = localStorage.getItem(STORAGE_KEY_PREFIX + 'categories');
      if (savedCategories) setCategories(JSON.parse(savedCategories));

      const savedProducts = localStorage.getItem(STORAGE_KEY_PREFIX + 'products');
      if (savedProducts) setProducts(JSON.parse(savedProducts));

      const savedToppings = localStorage.getItem(STORAGE_KEY_PREFIX + 'toppings');
      if (savedToppings) setToppings(JSON.parse(savedToppings));

      const savedTables = localStorage.getItem(STORAGE_KEY_PREFIX + 'tables');
      if (savedTables) setTables(JSON.parse(savedTables));

      const savedIngredients = localStorage.getItem(STORAGE_KEY_PREFIX + 'ingredients');
      if (savedIngredients) setIngredients(JSON.parse(savedIngredients));

      const savedOrders = localStorage.getItem(STORAGE_KEY_PREFIX + 'orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));

      const savedLogs = localStorage.getItem(STORAGE_KEY_PREFIX + 'inventoryLogs');
      if (savedLogs) setInventoryLogs(JSON.parse(savedLogs));
    } catch (e) {
      console.error('Error loading data from local storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Tự động lưu vào LocalStorage mỗi khi state thay đổi (chỉ sau khi đã loaded)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'users', JSON.stringify(users));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'categories', JSON.stringify(categories));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'products', JSON.stringify(products));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'toppings', JSON.stringify(toppings));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'tables', JSON.stringify(tables));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'ingredients', JSON.stringify(ingredients));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'orders', JSON.stringify(orders));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'inventoryLogs', JSON.stringify(inventoryLogs));
    } catch (e) {
      console.error('Error saving data to local storage', e);
    }
  }, [users, categories, products, toppings, tables, ingredients, orders, inventoryLogs, isLoaded]);

  // Đồng bộ giỏ hàng khi người dùng chọn bàn khác
  useEffect(() => {
    if (!activeTableId) return;
    const curTable = tables.find((t) => t.id === activeTableId);
    if (curTable?.currentOrderId) {
      const activeOrder = orders.find((o) => o.id === curTable.currentOrderId);
      if (activeOrder && activeOrder.paymentStatus === 'unpaid') {
        setCart(activeOrder.items);
        setDiscountPercent(activeOrder.discountPercent);
        setDiscountAmount(activeOrder.discountAmount);
        return;
      }
    }
    // Nếu bàn không có đơn lưu, dọn giỏ (trừ khi đang ở Takeaway và đã có đồ)
    if (activeTableId !== 'takeaway') {
      setCart([]);
      setDiscountPercent(0);
      setDiscountAmount(0);
    }
  }, [activeTableId, tables, orders]);

  // Quản lý người dùng
  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) setCurrentUser(found);
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = { ...userData, id: `u_${Date.now()}` };
    setUsers((prev) => [...prev, newUser]);
  };

  const updateUser = (id: string, updated: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updated }));
    }
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // Quản lý Danh mục
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = { ...cat, id: `cat_${Date.now()}` };
    setCategories((prev) => [...prev, newCat]);
  };

  const updateCategory = (id: string, cat: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...cat } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Quản lý Món
  const addProduct = (prod: Omit<Product, 'id'>) => {
    const newProd: Product = { ...prod, id: `prod_${Date.now()}` };
    setProducts((prev) => [...prev, newProd]);
  };

  const updateProduct = (id: string, prod: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...prod } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Quản lý Topping
  const addTopping = (top: Omit<Topping, 'id'>) => {
    const newTop: Topping = { ...top, id: `top_${Date.now()}` };
    setToppings((prev) => [...prev, newTop]);
  };

  const updateTopping = (id: string, top: Partial<Topping>) => {
    setToppings((prev) => prev.map((t) => (t.id === id ? { ...t, ...top } : t)));
  };

  const deleteTopping = (id: string) => {
    setToppings((prev) => prev.filter((t) => t.id !== id));
  };

  // Quản lý Bàn
  const updateTableStatus = (tableId: string, status: Table['status']) => {
    setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, status } : t)));
  };

  const changeTable = (fromTableId: string, toTableId: string) => {
    const fromTable = tables.find((t) => t.id === fromTableId);
    const toTable = tables.find((t) => t.id === toTableId);
    if (!fromTable || !toTable) return;

    const orderId = fromTable.currentOrderId;
    if (!orderId) return;

    // Cập nhật đơn hàng đổi tên bàn
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, tableId: toTableId, tableName: toTable.name } : o))
    );

    // Cập nhật 2 bàn
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === fromTableId) {
          return { ...t, status: 'available', currentOrderId: undefined };
        }
        if (t.id === toTableId) {
          return { ...t, status: 'occupied', currentOrderId: orderId };
        }
        return t;
      })
    );

    setActiveTableId(toTableId);
  };

  const mergeTables = (sourceTableId: string, targetTableId: string) => {
    const sourceTable = tables.find((t) => t.id === sourceTableId);
    const targetTable = tables.find((t) => t.id === targetTableId);
    if (!sourceTable || !targetTable || !sourceTable.currentOrderId || !targetTable.currentOrderId) return;

    const sourceOrder = orders.find((o) => o.id === sourceTable.currentOrderId);
    const targetOrder = orders.find((o) => o.id === targetTable.currentOrderId);
    if (!sourceOrder || !targetOrder) return;

    // Gộp items từ source vào target
    const mergedItems = [...targetOrder.items, ...sourceOrder.items];
    const newSubtotal = mergedItems.reduce((sum, it) => sum + it.totalPrice, 0);
    const newTotal = Math.max(0, newSubtotal - targetOrder.discountAmount);

    // Cập nhật target order và xóa source order
    setOrders((prev) =>
      prev
        .filter((o) => o.id !== sourceOrder.id)
        .map((o) =>
          o.id === targetOrder.id
            ? { ...o, items: mergedItems, subtotal: newSubtotal, total: newTotal }
            : o
        )
    );

    // Giải phóng source table
    setTables((prev) =>
      prev.map((t) =>
        t.id === sourceTableId
          ? { ...t, status: 'available', currentOrderId: undefined }
          : t
      )
    );

    setActiveTableId(targetTableId);
  };

  // Giỏ hàng
  const addToCart = (newItem: Omit<CartItem, 'id' | 'totalPrice'>) => {
    const unitPrice = newItem.unitPrice;
    const totalPrice = unitPrice * newItem.quantity;
    const itemWithId: CartItem = {
      ...newItem,
      id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      totalPrice,
      status: 'pending',
    };

    setCart((prev) => {
      // Kiểm tra món trùng cùng size, topping, đường đá, ghi chú
      const existingIdx = prev.findIndex(
        (it) =>
          it.productId === newItem.productId &&
          it.selectedSize === newItem.selectedSize &&
          it.iceLevel === newItem.iceLevel &&
          it.sugarLevel === newItem.sugarLevel &&
          it.note === newItem.note &&
          JSON.stringify(it.selectedToppings) === JSON.stringify(newItem.selectedToppings)
      );

      if (existingIdx >= 0) {
        const copy = [...prev];
        const updatedQty = copy[existingIdx].quantity + newItem.quantity;
        copy[existingIdx] = {
          ...copy[existingIdx],
          quantity: updatedQty,
          totalPrice: copy[existingIdx].unitPrice * updatedQty,
        };
        return copy;
      }
      return [...prev, itemWithId];
    });
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0
              ? { ...item, quantity: newQty, totalPrice: item.unitPrice * newQty }
              : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setDiscountAmount(0);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartTotal = Math.max(0, cartSubtotal - (discountAmount || (cartSubtotal * discountPercent) / 100));

  // Lưu đơn tạm thời cho bàn
  const saveOrderForTable = (): string => {
    if (cart.length === 0) return '';
    const activeTable = tables.find((t) => t.id === activeTableId);
    const tableName = activeTable ? activeTable.name : 'Khách Mang Về (Takeaway)';

    let orderId = activeTable?.currentOrderId;
    const now = new Date().toISOString();

    if (orderId) {
      // Đã có đơn, cập nhật
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                items: cart,
                subtotal: cartSubtotal,
                discountPercent,
                discountAmount,
                total: cartTotal,
                orderStatus: 'processing',
              }
            : o
        )
      );
    } else {
      // Tạo đơn mới
      const countToday = orders.filter((o) => o.createdAt.startsWith(now.slice(0, 10))).length + 1;
      const dateStr = now.slice(0, 10).replace(/-/g, '');
      const code = `CF-${dateStr}-${String(countToday).padStart(3, '0')}`;
      orderId = `ord_${Date.now()}`;

      const newOrder: Order = {
        id: orderId,
        code,
        tableId: activeTableId !== 'takeaway' ? activeTableId : undefined,
        tableName,
        items: cart,
        subtotal: cartSubtotal,
        discountPercent,
        discountAmount,
        taxAmount: 0,
        total: cartTotal,
        paymentStatus: 'unpaid',
        orderStatus: 'processing',
        cashierName: currentUser.name,
        createdAt: now,
      };

      setOrders((prev) => [newOrder, ...prev]);

      if (activeTableId !== 'takeaway') {
        setTables((prev) =>
          prev.map((t) =>
            t.id === activeTableId ? { ...t, status: 'occupied', currentOrderId: orderId } : t
          )
        );
      }
    }

    return orderId;
  };

  // Trừ kho nguyên liệu tự động theo định lượng (Recipe)
  const deductInventoryForOrder = (orderItems: CartItem[]) => {
    const updatedIngredients = [...ingredients];
    const newLogs: InventoryLog[] = [];
    const now = new Date().toISOString();

    orderItems.forEach((cartItem) => {
      const prod = products.find((p) => p.id === cartItem.productId);
      if (!prod || !prod.recipe) return;

      prod.recipe.forEach((recipeItem) => {
        const totalUsed = recipeItem.amount * cartItem.quantity;
        const ingIndex = updatedIngredients.findIndex((ing) => ing.id === recipeItem.ingredientId);
        if (ingIndex >= 0) {
          const ing = updatedIngredients[ingIndex];
          const newStock = Math.max(0, ing.stock - totalUsed);
          updatedIngredients[ingIndex] = {
            ...ing,
            stock: newStock,
            lastUpdated: now.slice(0, 10),
          };

          newLogs.push({
            id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            ingredientId: ing.id,
            ingredientName: ing.name,
            type: 'export_order',
            amount: -totalUsed,
            balanceAfter: newStock,
            reason: `Bán ${cartItem.quantity}x ${cartItem.productName}`,
            timestamp: now,
            createdBy: currentUser.name,
          });
        }
      });
    });

    setIngredients(updatedIngredients);
    setInventoryLogs((prev) => [...newLogs, ...prev]);
  };

  // Thanh toán
  const checkoutOrder = (
    paymentMethod: PaymentMethod,
    cashReceived?: number,
    existingOrderId?: string
  ): Order => {
    const now = new Date().toISOString();
    const activeTable = tables.find((t) => t.id === activeTableId);
    const tableName = activeTable ? activeTable.name : 'Khách Mang Về (Takeaway)';

    let orderToPay: Order;

    if (existingOrderId) {
      const existing = orders.find((o) => o.id === existingOrderId);
      if (!existing) throw new Error('Không tìm thấy đơn hàng!');
      orderToPay = {
        ...existing,
        paymentMethod,
        paymentStatus: 'paid',
        orderStatus: 'paid',
        paidAt: now,
        cashReceived,
        changeGiven: cashReceived ? Math.max(0, cashReceived - existing.total) : 0,
      };
      setOrders((prev) => prev.map((o) => (o.id === existingOrderId ? orderToPay : o)));
    } else {
      // Thanh toán trực tiếp từ giỏ hàng hiện tại
      const countToday = orders.filter((o) => o.createdAt.startsWith(now.slice(0, 10))).length + 1;
      const dateStr = now.slice(0, 10).replace(/-/g, '');
      const code = `CF-${dateStr}-${String(countToday).padStart(3, '0')}`;
      const orderId = `ord_${Date.now()}`;

      orderToPay = {
        id: orderId,
        code,
        tableId: activeTableId !== 'takeaway' ? activeTableId : undefined,
        tableName,
        items: cart,
        subtotal: cartSubtotal,
        discountPercent,
        discountAmount,
        taxAmount: 0,
        total: cartTotal,
        paymentMethod,
        paymentStatus: 'paid',
        orderStatus: 'paid',
        cashReceived,
        changeGiven: cashReceived ? Math.max(0, cashReceived - cartTotal) : 0,
        cashierName: currentUser.name,
        createdAt: now,
        paidAt: now,
      };

      setOrders((prev) => [orderToPay, ...prev]);
    }

    // Trừ kho nguyên liệu
    deductInventoryForOrder(orderToPay.items);

    // Giải phóng bàn nếu có
    if (orderToPay.tableId) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === orderToPay.tableId ? { ...t, status: 'available', currentOrderId: undefined } : t
        )
      );
    }

    // Làm rỗng giỏ hàng
    clearCart();

    return orderToPay;
  };

  const cancelOrder = (orderId: string) => {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: 'cancelled' } : o))
    );

    if (ord.tableId) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === ord.tableId ? { ...t, status: 'available', currentOrderId: undefined } : t
        )
      );
    }
  };

  const updateOrderItemStatus = (
    orderId: string,
    itemId: string,
    status: 'pending' | 'preparing' | 'completed'
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updatedItems = ord.items.map((it) => (it.id === itemId ? { ...it, status } : it));
          const allCompleted = updatedItems.every((it) => it.status === 'completed');
          const somePreparing = updatedItems.some((it) => it.status === 'preparing');

          let newOrderStatus = ord.orderStatus;
          if (allCompleted) newOrderStatus = 'served';
          else if (somePreparing) newOrderStatus = 'processing';

          return { ...ord, items: updatedItems, orderStatus: newOrderStatus };
        }
        return ord;
      })
    );
  };

  // Quản lý kho
  const addIngredient = (ing: Omit<Ingredient, 'id' | 'lastUpdated'>) => {
    const newIng: Ingredient = {
      ...ing,
      id: `ing_${Date.now()}`,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };
    setIngredients((prev) => [...prev, newIng]);
  };

  const updateIngredient = (id: string, ing: Partial<Ingredient>) => {
    setIngredients((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, ...ing, lastUpdated: new Date().toISOString().slice(0, 10) } : i
      )
    );
  };

  const deleteIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  const importInventory = (
    ingredientId: string,
    amount: number,
    costPerUnit: number,
    reason: string
  ) => {
    const now = new Date().toISOString();
    setIngredients((prev) =>
      prev.map((i) => {
        if (i.id === ingredientId) {
          const newStock = i.stock + amount;
          return {
            ...i,
            stock: newStock,
            costPerUnit: costPerUnit || i.costPerUnit,
            lastUpdated: now.slice(0, 10),
          };
        }
        return i;
      })
    );

    const ing = ingredients.find((i) => i.id === ingredientId);
    if (ing) {
      setInventoryLogs((prev) => [
        {
          id: `log_${Date.now()}`,
          ingredientId,
          ingredientName: ing.name,
          type: 'import',
          amount,
          balanceAfter: ing.stock + amount,
          reason: reason || 'Nhập kho bổ sung',
          timestamp: now,
          createdBy: currentUser.name,
        },
        ...prev,
      ]);
    }
  };

  const adjustInventory = (ingredientId: string, newAmount: number, reason: string) => {
    const now = new Date().toISOString();
    const ing = ingredients.find((i) => i.id === ingredientId);
    if (!ing) return;

    const diff = newAmount - ing.stock;
    setIngredients((prev) =>
      prev.map((i) => (i.id === ingredientId ? { ...i, stock: newAmount, lastUpdated: now.slice(0, 10) } : i))
    );

    setInventoryLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        ingredientId,
        ingredientName: ing.name,
        type: 'adjustment',
        amount: diff,
        balanceAfter: newAmount,
        reason: reason || 'Kiểm kê điều chỉnh kho',
        timestamp: now,
        createdBy: currentUser.name,
      },
      ...prev,
    ]);
  };

  const lowStockCount = ingredients.filter((i) => i.stock <= i.minThreshold).length;

  // Khôi phục & Xuất dữ liệu
  const resetToDefaultData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setCategories(INITIAL_CATEGORIES);
    setProducts(INITIAL_PRODUCTS);
    setToppings(INITIAL_TOPPINGS);
    setTables(INITIAL_TABLES);
    setIngredients(INITIAL_INGREDIENTS);
    setOrders(INITIAL_ORDERS);
    setInventoryLogs([]);
    setCart([]);
    localStorage.clear();
  };

  const exportDataJSON = () => {
    const data = {
      users,
      categories,
      products,
      toppings,
      tables,
      ingredients,
      orders,
      inventoryLogs,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.products && data.tables && data.orders) {
        if (data.users) setUsers(data.users);
        if (data.categories) setCategories(data.categories);
        if (data.products) setProducts(data.products);
        if (data.toppings) setToppings(data.toppings);
        if (data.tables) setTables(data.tables);
        if (data.ingredients) setIngredients(data.ingredients);
        if (data.orders) setOrders(data.orders);
        if (data.inventoryLogs) setInventoryLogs(data.inventoryLogs);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <CafeContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUser,
        users,
        addUser,
        updateUser,
        deleteUser,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toppings,
        addTopping,
        updateTopping,
        deleteTopping,
        tables,
        activeTableId,
        setActiveTableId,
        changeTable,
        mergeTables,
        updateTableStatus,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        discountPercent,
        setDiscountPercent,
        discountAmount,
        setDiscountAmount,
        cartSubtotal,
        cartTotal,
        orders,
        saveOrderForTable,
        checkoutOrder,
        cancelOrder,
        updateOrderItemStatus,
        ingredients,
        inventoryLogs,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        importInventory,
        adjustInventory,
        lowStockCount,
        resetToDefaultData,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </CafeContext.Provider>
  );
}

export function useCafe() {
  const context = useContext(CafeContext);
  if (!context) {
    throw new Error('useCafe must be used within a CafeProvider');
  }
  return context;
}
