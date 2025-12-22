import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Filter,
  Download,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface Sale {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  items: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "paid" | "pending" | "failed";
  date: string;
}

const initialSales: Sale[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    customer: "Alice Johnson",
    email: "alice@example.com",
    items: 3,
    total: 1250.00,
    status: "delivered",
    paymentStatus: "paid",
    date: "2024-12-20",
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    customer: "Bob Smith",
    email: "bob@example.com",
    items: 1,
    total: 499.99,
    status: "shipped",
    paymentStatus: "paid",
    date: "2024-12-19",
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    customer: "Carol Davis",
    email: "carol@example.com",
    items: 5,
    total: 2150.50,
    status: "processing",
    paymentStatus: "paid",
    date: "2024-12-18",
  },
  {
    id: "4",
    orderNumber: "ORD-2024-004",
    customer: "David Wilson",
    email: "david@example.com",
    items: 2,
    total: 875.00,
    status: "pending",
    paymentStatus: "pending",
    date: "2024-12-17",
  },
  {
    id: "5",
    orderNumber: "ORD-2024-005",
    customer: "Emma Brown",
    email: "emma@example.com",
    items: 4,
    total: 1680.00,
    status: "cancelled",
    paymentStatus: "failed",
    date: "2024-12-16",
  },
];

const statusColors: Record<Sale["status"], string> = {
  pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  processing: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  shipped: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  delivered: "bg-green-500/10 text-green-600 dark:text-green-400",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const paymentColors: Record<Sale["paymentStatus"], string> = {
  paid: "bg-green-500/10 text-green-600 dark:text-green-400",
  pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  failed: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const Sales = () => {
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer: "",
    email: "",
    items: "",
    total: "",
  });

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalRevenue: sales
      .filter((s) => s.paymentStatus === "paid")
      .reduce((sum, s) => sum + s.total, 0),
    totalOrders: sales.length,
    avgOrderValue:
      sales.length > 0
        ? sales.reduce((sum, s) => sum + s.total, 0) / sales.length
        : 0,
    uniqueCustomers: new Set(sales.map((s) => s.email)).size,
  };

  const handleAddSale = () => {
    if (!formData.customer.trim() || !formData.email.trim() || !formData.items || !formData.total) {
      toast.error("Please fill in all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const newSale: Sale = {
      id: Date.now().toString(),
      orderNumber: `ORD-2024-${String(sales.length + 1).padStart(3, "0")}`,
      customer: formData.customer.trim(),
      email: formData.email.trim(),
      items: parseInt(formData.items),
      total: parseFloat(formData.total),
      status: "pending",
      paymentStatus: "pending",
      date: new Date().toISOString().split("T")[0],
    };

    setSales([newSale, ...sales]);
    setFormData({ customer: "", email: "", items: "", total: "" });
    setIsDialogOpen(false);
    toast.success("Sale order created successfully");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales Management</h1>
            <p className="text-muted-foreground">Track and manage your sales orders</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Sale
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Sale</DialogTitle>
                <DialogDescription>
                  Add a new sales order to the system
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer Name</Label>
                  <Input
                    id="customer"
                    placeholder="Enter customer name"
                    value={formData.customer}
                    onChange={(e) =>
                      setFormData({ ...formData, customer: e.target.value })
                    }
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="customer@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    maxLength={255}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="items">Number of Items</Label>
                    <Input
                      id="items"
                      type="number"
                      min="1"
                      placeholder="0"
                      value={formData.items}
                      onChange={(e) =>
                        setFormData({ ...formData, items: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total">Total Amount ($)</Label>
                    <Input
                      id="total"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.total}
                      onChange={(e) =>
                        setFormData({ ...formData, total: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSale}>Create Sale</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">From paid orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.avgOrderValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Per order average</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueCustomers}</div>
              <p className="text-xs text-muted-foreground">Unique customers</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>Orders</CardTitle>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    className="pl-9 w-full sm:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    maxLength={100}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Payment</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.orderNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{sale.customer}</p>
                            <p className="text-sm text-muted-foreground">{sale.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{sale.items}</TableCell>
                        <TableCell className="font-medium">
                          ${sale.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary" className={statusColors[sale.status]}>
                            {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="secondary" className={paymentColors[sale.paymentStatus]}>
                            {sale.paymentStatus.charAt(0).toUpperCase() + sale.paymentStatus.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {new Date(sale.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toast.info(`Viewing order ${sale.orderNumber}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Sales;
