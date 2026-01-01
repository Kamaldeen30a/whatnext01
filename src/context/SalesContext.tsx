import { createContext, useContext, useState, ReactNode } from "react";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  orderNumber: string;
  customer: string;
  address: string;
  phoneNumber: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "paid" | "pending" | "failed";
  date: string;
}

// Initial sales data with varied dates for analytics
const initialSales: Sale[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    customer: "Alice Johnson",
    address: "123 Main Street, Lagos",
    phoneNumber: "+234 801 234 5678",
    items: [
      { productId: "P001", productName: "Premium Gypsum Board", quantity: 10, unitPrice: 3500, total: 35000 },
      { productId: "P003", productName: "Acrylic Paint Base", quantity: 5, unitPrice: 4200, total: 21000 },
    ],
    total: 56000,
    status: "delivered",
    paymentStatus: "paid",
    date: "2025-12-20",
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    customer: "Bob Smith",
    address: "45 Victoria Island, Lagos",
    phoneNumber: "+234 802 345 6789",
    items: [
      { productId: "P002", productName: "Standard Gypsum Powder", quantity: 20, unitPrice: 2800, total: 56000 },
    ],
    total: 56000,
    status: "shipped",
    paymentStatus: "paid",
    date: "2025-12-19",
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    customer: "Carol Davis",
    address: "78 Lekki Phase 1, Lagos",
    phoneNumber: "+234 803 456 7890",
    items: [
      { productId: "P004", productName: "POP Ceiling Filler", quantity: 15, unitPrice: 3200, total: 48000 },
      { productId: "P005", productName: "White Cement Mix", quantity: 10, unitPrice: 2500, total: 25000 },
      { productId: "P006", productName: "Primer Coat Solution", quantity: 8, unitPrice: 3800, total: 30400 },
    ],
    total: 103400,
    status: "processing",
    paymentStatus: "paid",
    date: "2025-12-18",
  },
  {
    id: "4",
    orderNumber: "ORD-2024-004",
    customer: "David Wilson",
    address: "12 Ikeja GRA, Lagos",
    phoneNumber: "+234 804 567 8901",
    items: [
      { productId: "P007", productName: "Decorative POP", quantity: 5, unitPrice: 4500, total: 22500 },
    ],
    total: 22500,
    status: "pending",
    paymentStatus: "pending",
    date: "2025-12-17",
  },
  {
    id: "5",
    orderNumber: "ORD-2024-005",
    customer: "Emma Brown",
    address: "33 Yaba, Lagos",
    phoneNumber: "+234 805 678 9012",
    items: [
      { productId: "P001", productName: "Premium Gypsum Board", quantity: 25, unitPrice: 3500, total: 87500 },
      { productId: "P002", productName: "Standard Gypsum Powder", quantity: 30, unitPrice: 2800, total: 84000 },
    ],
    total: 171500,
    status: "cancelled",
    paymentStatus: "failed",
    date: "2025-12-16",
  },
  // Additional historical data
  {
    id: "6",
    orderNumber: "ORD-2024-006",
    customer: "Frank Miller",
    address: "22 Surulere, Lagos",
    phoneNumber: "+234 806 789 0123",
    items: [
      { productId: "P001", productName: "Premium Gypsum Board", quantity: 50, unitPrice: 3500, total: 175000 },
    ],
    total: 175000,
    status: "delivered",
    paymentStatus: "paid",
    date: "2025-11-15",
  },
  {
    id: "7",
    orderNumber: "ORD-2024-007",
    customer: "Grace Ola",
    address: "55 Apapa, Lagos",
    phoneNumber: "+234 807 890 1234",
    items: [
      { productId: "P003", productName: "Acrylic Paint Base", quantity: 30, unitPrice: 4200, total: 126000 },
      { productId: "P006", productName: "Primer Coat Solution", quantity: 20, unitPrice: 3800, total: 76000 },
    ],
    total: 202000,
    status: "delivered",
    paymentStatus: "paid",
    date: "2025-11-10",
  },
  {
    id: "8",
    orderNumber: "ORD-2024-008",
    customer: "Henry Adams",
    address: "88 Maryland, Lagos",
    phoneNumber: "+234 808 901 2345",
    items: [
      { productId: "P004", productName: "POP Ceiling Filler", quantity: 40, unitPrice: 3200, total: 128000 },
    ],
    total: 128000,
    status: "delivered",
    paymentStatus: "paid",
    date: "2025-10-25",
  },
  {
    id: "9",
    orderNumber: "ORD-2024-009",
    customer: "Irene Cole",
    address: "10 Festac, Lagos",
    phoneNumber: "+234 809 012 3456",
    items: [
      { productId: "P002", productName: "Standard Gypsum Powder", quantity: 100, unitPrice: 2800, total: 280000 },
    ],
    total: 280000,
    status: "delivered",
    paymentStatus: "paid",
    date: "2025-10-10",
  },
  {
    id: "10",
    orderNumber: "ORD-2024-010",
    customer: "James Okoro",
    address: "77 Ikoyi, Lagos",
    phoneNumber: "+234 810 123 4567",
    items: [
      { productId: "P001", productName: "Premium Gypsum Board", quantity: 80, unitPrice: 3500, total: 280000 },
      { productId: "P007", productName: "Decorative POP", quantity: 25, unitPrice: 4500, total: 112500 },
    ],
    total: 392500,
    status: "delivered",
    paymentStatus: "paid",
    date: "2025-09-20",
  },
];

interface SalesContextType {
  sales: Sale[];
  addSale: (sale: Omit<Sale, "id" | "orderNumber">) => Sale;
  updateSale: (id: string, updates: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  getSalesByDateRange: (startDate: Date, endDate: Date) => Sale[];
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export function SalesProvider({ children }: { children: ReactNode }) {
  const [sales, setSales] = useState<Sale[]>(initialSales);

  const addSale = (saleData: Omit<Sale, "id" | "orderNumber">): Sale => {
    const newSale: Sale = {
      ...saleData,
      id: Date.now().toString(),
      orderNumber: `ORD-2024-${String(sales.length + 1).padStart(3, "0")}`,
    };
    setSales((prev) => [newSale, ...prev]);
    return newSale;
  };

  const updateSale = (id: string, updates: Partial<Sale>) => {
    setSales((prev) =>
      prev.map((sale) => (sale.id === id ? { ...sale, ...updates } : sale))
    );
  };

  const deleteSale = (id: string) => {
    setSales((prev) => prev.filter((sale) => sale.id !== id));
  };

  const getSalesByDateRange = (startDate: Date, endDate: Date): Sale[] => {
    return sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    });
  };

  return (
    <SalesContext.Provider value={{ sales, addSale, updateSale, deleteSale, getSalesByDateRange }}>
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error("useSales must be used within a SalesProvider");
  }
  return context;
}
