import { createContext, useContext, useState, ReactNode } from "react";

export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  price: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
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
  reduceStock: (items: { productId: string; quantity: number }[]) => boolean;
  restoreStock: (items: { productId: string; quantity: number }[]) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addProduct = (product: Omit<Product, "id" | "status">) => {
    const newProduct: Product = {
      ...product,
      id: `P${String(products.length + 1).padStart(3, "0")}`,
      status: getProductStatus(product.stock),
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Omit<Product, "id" | "status">>) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id !== id) return product;
        const updated = { ...product, ...updates };
        updated.status = getProductStatus(updated.stock);
        return updated;
      })
    );
  };

  const reduceStock = (items: { productId: string; quantity: number }[]): boolean => {
    // First check if all items have sufficient stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        return false;
      }
    }

    // If all checks pass, reduce the stock
    setProducts((prev) =>
      prev.map((product) => {
        const item = items.find((i) => i.productId === product.id);
        if (!item) return product;
        const newStock = product.stock - item.quantity;
        return {
          ...product,
          stock: newStock,
          status: getProductStatus(newStock),
        };
      })
    );
    return true;
  };

  const restoreStock = (items: { productId: string; quantity: number }[]) => {
    setProducts((prev) =>
      prev.map((product) => {
        const item = items.find((i) => i.productId === product.id);
        if (!item) return product;
        const newStock = product.stock + item.quantity;
        return {
          ...product,
          stock: newStock,
          status: getProductStatus(newStock),
        };
      })
    );
  };

  return (
    <InventoryContext.Provider value={{ products, addProduct, updateProduct, reduceStock, restoreStock }}>
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
