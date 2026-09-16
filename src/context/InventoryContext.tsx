import { createContext, useContext, useRef, useState, ReactNode } from "react";

export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  price: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
}

export interface StockItem {
  productId: string;
  quantity: number;
}

const initialProducts: Product[] = [
  { id: "P001", name: "Premium Gypsum Board", category: "Gypsum", stock: 450, unit: "sheets", price: 3500, status: "in-stock" },
  { id: "P002", name: "Standard Gypsum Powder", category: "Gypsum", stock: 320, unit: "bags", price: 2800, status: "in-stock" },
  { id: "P003", name: "Acrylic Paint Base", category: "Paint Chemicals", stock: 180, unit: "liters", price: 4200, status: "low-stock" },
  { id: "P004", name: "POP Ceiling Filler", category: "POP Fillers", stock: 280, unit: "bags", price: 3200, status: "in-stock" },
  { id: "P005", name: "White Cement Mix", category: "Adhesives", stock: 145, unit: "bags", price: 2500, status: "low-stock" },
  { id: "P006", name: "Primer Coat Solution", category: "Paint Chemicals", stock: 210, unit: "liters", price: 3800, status: "in-stock" },
  { id: "P007", name: "Decorative POP", category: "POP Fillers", stock: 95, unit: "bags", price: 4500, status: "low-stock" },
  { id: "P008", name: "Industrial Gypsum", category: "Gypsum", stock: 0, unit: "tons", price: 85000, status: "out-of-stock" },
];

const getProductStatus = (stock: number): Product["status"] => {
  if (stock === 0) return "out-of-stock";
  if (stock < 200) return "low-stock";
  return "in-stock";
};

interface InventoryContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id" | "status">) => void;
  updateProduct: (id: string, updates: Partial<Omit<Product, "id" | "status">>) => void;
  reduceStock: (items: StockItem[]) => boolean;
  restoreStock: (items: StockItem[]) => void;
  /** Atomically swaps the stock held by an order: returns the old items and takes the new ones. */
  applySaleStockChange: (oldItems: StockItem[], newItems: StockItem[]) => boolean;
  getAvailableStock: (productId: string, reservedByOrder?: number) => number;
  refreshInventory: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  // Mirror of the latest products so several stock operations in one event
  // handler never read a stale snapshot.
  const productsRef = useRef<Product[]>(initialProducts);

  const commit = (next: Product[]) => {
    productsRef.current = next;
    setProducts(next);
  };

  const toDeltas = (items: StockItem[], sign: 1 | -1) => {
    const deltas = new Map<string, number>();
    items.forEach((item) => {
      deltas.set(item.productId, (deltas.get(item.productId) ?? 0) + sign * item.quantity);
    });
    return deltas;
  };

  /** Applies net stock deltas. Fails (without mutating) if any product would go negative. */
  const applyDeltas = (deltas: Map<string, number>): boolean => {
    const current = productsRef.current;

    for (const [productId, delta] of deltas) {
      const product = current.find((p) => p.id === productId);
      if (!product) return false;
      if (product.stock + delta < 0) return false;
    }

    commit(
      current.map((product) => {
        const delta = deltas.get(product.id);
        if (!delta) return product;
        const newStock = product.stock + delta;
        return { ...product, stock: newStock, status: getProductStatus(newStock) };
      })
    );
    return true;
  };

  const addProduct = (product: Omit<Product, "id" | "status">) => {
    const nextNumber =
      productsRef.current.reduce((max, p) => Math.max(max, parseInt(p.id.replace(/\D/g, ""), 10) || 0), 0) + 1;
    const newProduct: Product = {
      ...product,
      id: `P${String(nextNumber).padStart(3, "0")}`,
      status: getProductStatus(product.stock),
    };
    commit([...productsRef.current, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Omit<Product, "id" | "status">>) => {
    commit(
      productsRef.current.map((product) => {
        if (product.id !== id) return product;
        const updated = { ...product, ...updates };
        updated.status = getProductStatus(updated.stock);
        return updated;
      })
    );
  };

  const reduceStock = (items: StockItem[]): boolean => applyDeltas(toDeltas(items, -1));

  const restoreStock = (items: StockItem[]) => {
    applyDeltas(toDeltas(items, 1));
  };

  const applySaleStockChange = (oldItems: StockItem[], newItems: StockItem[]): boolean => {
    const deltas = toDeltas(oldItems, 1);
    newItems.forEach((item) => {
      deltas.set(item.productId, (deltas.get(item.productId) ?? 0) - item.quantity);
    });
    return applyDeltas(deltas);
  };

  const getAvailableStock = (productId: string, reservedByOrder = 0) => {
    const product = productsRef.current.find((p) => p.id === productId);
    return (product?.stock ?? 0) + reservedByOrder;
  };

  const refreshInventory = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    commit([...productsRef.current]);
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        reduceStock,
        restoreStock,
        applySaleStockChange,
        getAvailableStock,
        refreshInventory,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
