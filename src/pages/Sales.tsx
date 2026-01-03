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
  Trash2,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { useInventory } from "@/context/InventoryContext";
import { useSales, Sale, OrderItem } from "@/context/SalesContext";

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
  const { products, reduceStock, restoreStock } = useInventory();
  const { sales, addSale, updateSale } = useSales();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  
  const [formData, setFormData] = useState({
    customer: "",
    address: "",
    phoneNumber: "",
  });

  const [editFormData, setEditFormData] = useState({
    customer: "",
    address: "",
    phoneNumber: "",
    status: "pending" as Sale["status"],
    paymentStatus: "pending" as Sale["paymentStatus"],
  });
  const [editOrderItems, setEditOrderItems] = useState<OrderItem[]>([]);
  const [editSelectedProduct, setEditSelectedProduct] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnitPrice, setEditUnitPrice] = useState("");
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.phoneNumber.includes(searchQuery);
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
    uniqueCustomers: new Set(sales.map((s) => s.phoneNumber)).size,
  };

  const handleAddItem = () => {
    if (!selectedProduct || !quantity || parseInt(quantity) <= 0) {
      toast.error("Please select a product and enter a valid quantity");
      return;
    }

    const priceValue = parseFloat(unitPrice);
    if (!unitPrice || isNaN(priceValue) || priceValue <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    // Check available stock
    const existingQty = orderItems.find(item => item.productId === selectedProduct)?.quantity || 0;
    const requestedQty = parseInt(quantity);
    if (existingQty + requestedQty > product.stock) {
      toast.error(`Insufficient stock. Only ${product.stock - existingQty} ${product.unit} available`);
      return;
    }

    const existingItemIndex = orderItems.findIndex(item => item.productId === selectedProduct);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += requestedQty;
      updatedItems[existingItemIndex].unitPrice = priceValue;
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].quantity * priceValue;
      setOrderItems(updatedItems);
    } else {
      const newItem: OrderItem = {
        productId: product.id,
        productName: product.name,
        quantity: requestedQty,
        unitPrice: priceValue,
        total: requestedQty * priceValue,
      };
      setOrderItems([...orderItems, newItem]);
    }

    setSelectedProduct("");
    setQuantity("");
    setUnitPrice("");
  };

  const handleRemoveItem = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId));
  };

  const calculateOrderTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleAddSale = () => {
    if (!formData.customer.trim() || !formData.address.trim() || !formData.phoneNumber.trim()) {
      toast.error("Please fill in all customer details");
      return;
    }

    if (orderItems.length === 0) {
      toast.error("Please add at least one product to the order");
      return;
    }

    // Reduce stock for all items
    const stockReduced = reduceStock(
      orderItems.map(item => ({ productId: item.productId, quantity: item.quantity }))
    );

    if (!stockReduced) {
      toast.error("Insufficient stock for one or more items. Please check availability.");
      return;
    }

    addSale({
      customer: formData.customer.trim(),
      address: formData.address.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      items: orderItems,
      total: calculateOrderTotal(),
      status: "pending",
      paymentStatus: "pending",
      date: new Date().toISOString().split("T")[0],
    });

    setFormData({ customer: "", address: "", phoneNumber: "" });
    setOrderItems([]);
    setIsDialogOpen(false);
    toast.success("Sale order created successfully. Stock has been updated.");
  };

  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale);
    setViewDialogOpen(true);
  };

  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale);
    setEditFormData({
      customer: sale.customer,
      address: sale.address,
      phoneNumber: sale.phoneNumber,
      status: sale.status,
      paymentStatus: sale.paymentStatus,
    });
    setEditOrderItems([...sale.items]);
    setEditDialogOpen(true);
  };

  const handleAddEditItem = () => {
    if (!editSelectedProduct || !editQuantity || parseInt(editQuantity) <= 0) {
      toast.error("Please select a product and enter a valid quantity");
      return;
    }

    const priceValue = parseFloat(editUnitPrice);
    if (!editUnitPrice || isNaN(priceValue) || priceValue <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const product = products.find(p => p.id === editSelectedProduct);
    if (!product) return;

    // Check available stock (add back what was originally in order for this product)
    const originalItem = selectedSale?.items.find(item => item.productId === editSelectedProduct);
    const originalQty = originalItem?.quantity || 0;
    const currentEditQty = editOrderItems.find(item => item.productId === editSelectedProduct)?.quantity || 0;
    const requestedQty = parseInt(editQuantity);
    const availableStock = product.stock + originalQty;
    
    if (currentEditQty + requestedQty > availableStock) {
      toast.error(`Insufficient stock. Only ${availableStock - currentEditQty} ${product.unit} available`);
      return;
    }

    const existingItemIndex = editOrderItems.findIndex(item => item.productId === editSelectedProduct);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...editOrderItems];
      updatedItems[existingItemIndex].quantity += requestedQty;
      updatedItems[existingItemIndex].unitPrice = priceValue;
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].quantity * priceValue;
      setEditOrderItems(updatedItems);
    } else {
      const newItem: OrderItem = {
        productId: product.id,
        productName: product.name,
        quantity: requestedQty,
        unitPrice: priceValue,
        total: requestedQty * priceValue,
      };
      setEditOrderItems([...editOrderItems, newItem]);
    }

    setEditSelectedProduct("");
    setEditQuantity("");
    setEditUnitPrice("");
  };

  const handleRemoveEditItem = (productId: string) => {
    setEditOrderItems(editOrderItems.filter(item => item.productId !== productId));
  };

  const calculateEditOrderTotal = () => {
    return editOrderItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSaveEdit = () => {
    if (!selectedSale) return;

    if (!editFormData.customer.trim() || !editFormData.address.trim() || !editFormData.phoneNumber.trim()) {
      toast.error("Please fill in all customer details");
      return;
    }

    if (editOrderItems.length === 0) {
      toast.error("Please add at least one product to the order");
      return;
    }

    // First restore the original stock
    restoreStock(
      selectedSale.items.map(item => ({ productId: item.productId, quantity: item.quantity }))
    );

    // Then reduce stock for the new items
    const stockReduced = reduceStock(
      editOrderItems.map(item => ({ productId: item.productId, quantity: item.quantity }))
    );

    if (!stockReduced) {
      // If failed, restore the original order's stock reduction
      reduceStock(
        selectedSale.items.map(item => ({ productId: item.productId, quantity: item.quantity }))
      );
      toast.error("Insufficient stock for one or more items. Please check availability.");
      return;
    }

    updateSale(selectedSale.id, {
      customer: editFormData.customer.trim(),
      address: editFormData.address.trim(),
      phoneNumber: editFormData.phoneNumber.trim(),
      status: editFormData.status,
      paymentStatus: editFormData.paymentStatus,
      items: editOrderItems,
      total: calculateEditOrderTotal(),
    });

    setEditDialogOpen(false);
    setSelectedSale(null);
    toast.success("Order updated successfully. Stock has been adjusted.");
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Sales Management</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Track and manage your sales orders</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full" onPointerDownOutside={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>Create New Sale</DialogTitle>
                <DialogDescription>
                  Add customer details and select products for this order
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 sm:gap-6 py-4">
                {/* Customer Details */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Customer Details</h4>
                  <div className="grid gap-4">
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
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="Enter delivery address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        maxLength={200}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        placeholder="+234 800 000 0000"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, phoneNumber: e.target.value })
                        }
                        maxLength={20}
                      />
                    </div>
                  </div>
                </div>

                {/* Product Selection */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Add Products</h4>
                  <div className="grid gap-2">
                    <Select value={selectedProduct} onValueChange={(value) => {
                      setSelectedProduct(value);
                      // Clear price when changing product
                      setUnitPrice("");
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.stock} {product.unit} available)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        className="flex-1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Price (₦)"
                        className="flex-1"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(e.target.value)}
                      />
                      <Button type="button" onClick={handleAddItem} size="icon" className="shrink-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {selectedProduct && !unitPrice && (
                      <p className="text-sm text-muted-foreground">
                        Enter the unit price for this product
                      </p>
                    )}
                  </div>

                  {/* Order Items List */}
                  {orderItems.length > 0 && (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="w-10"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderItems.map((item) => (
                            <TableRow key={item.productId}>
                              <TableCell className="font-medium">{item.productName}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">₦{item.unitPrice.toLocaleString()}</TableCell>
                              <TableCell className="text-right">₦{item.total.toLocaleString()}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => handleRemoveItem(item.productId)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} className="font-bold text-right">Order Total:</TableCell>
                            <TableCell className="font-bold text-right">₦{calculateOrderTotal().toLocaleString()}</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  )}
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
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold">
                ₦{stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">From paid orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Avg. Order</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold">
                ₦{stats.avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-muted-foreground">Per order</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stats.uniqueCustomers}</div>
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
                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                    <TableHead className="hidden lg:table-cell">Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Payment</TableHead>
                    <TableHead className="hidden xl:table-cell">Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
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
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">{sale.address}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{sale.phoneNumber}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="space-y-1">
                            {sale.items.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="text-sm">
                                {item.productName} x{item.quantity}
                              </div>
                            ))}
                            {sale.items.length > 2 && (
                              <div className="text-sm text-muted-foreground">
                                +{sale.items.length - 2} more items
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₦{sale.total.toLocaleString()}
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
                        <TableCell className="hidden xl:table-cell text-muted-foreground">
                          {new Date(sale.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewSale(sale)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditSale(sale)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* View Order Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedSale?.orderNumber}</DialogTitle>
              <DialogDescription>
                View complete order information
              </DialogDescription>
            </DialogHeader>
            {selectedSale && (
              <div className="space-y-6 py-4">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer Name</p>
                    <p className="font-medium">{selectedSale.customer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{selectedSale.phoneNumber}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Delivery Address</p>
                    <p className="font-medium">{selectedSale.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Order Date</p>
                    <p className="font-medium">{new Date(selectedSale.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className={statusColors[selectedSale.status]}>
                        {selectedSale.status.charAt(0).toUpperCase() + selectedSale.status.slice(1)}
                      </Badge>
                      <Badge variant="secondary" className={paymentColors[selectedSale.paymentStatus]}>
                        {selectedSale.paymentStatus.charAt(0).toUpperCase() + selectedSale.paymentStatus.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">Items Purchased</h4>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedSale.items.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{item.productName}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">₦{item.unitPrice.toLocaleString()}</TableCell>
                            <TableCell className="text-right">₦{item.total.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="font-bold text-right">Order Total:</TableCell>
                          <TableCell className="font-bold text-right">₦{selectedSale.total.toLocaleString()}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Order Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen} modal>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Edit Order - {selectedSale?.orderNumber}</DialogTitle>
              <DialogDescription>
                Update order details, status, or items
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {/* Customer Details */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Customer Details</h4>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-customer">Customer Name</Label>
                    <Input
                      id="edit-customer"
                      placeholder="Enter customer name"
                      value={editFormData.customer}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, customer: e.target.value })
                      }
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-address">Address</Label>
                    <Input
                      id="edit-address"
                      placeholder="Enter delivery address"
                      value={editFormData.address}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, address: e.target.value })
                      }
                      maxLength={200}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phoneNumber">Phone Number</Label>
                    <Input
                      id="edit-phoneNumber"
                      placeholder="+234 800 000 0000"
                      value={editFormData.phoneNumber}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, phoneNumber: e.target.value })
                      }
                      maxLength={20}
                    />
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Order Status</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={editFormData.status} 
                      onValueChange={(value: Sale["status"]) => 
                        setEditFormData({ ...editFormData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Status</Label>
                    <Select 
                      value={editFormData.paymentStatus} 
                      onValueChange={(value: Sale["paymentStatus"]) => 
                        setEditFormData({ ...editFormData, paymentStatus: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Product Selection */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Order Items</h4>
                <div className="flex flex-wrap gap-2">
                  <Select value={editSelectedProduct} onValueChange={setEditSelectedProduct}>
                    <SelectTrigger className="flex-1 min-w-[200px]">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.stock} {product.unit} available)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    className="w-20"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Unit Price (₦)"
                    className="w-32"
                    value={editUnitPrice}
                    onChange={(e) => setEditUnitPrice(e.target.value)}
                  />
                  <Button type="button" onClick={handleAddEditItem} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Order Items List */}
                {editOrderItems.length > 0 && (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {editOrderItems.map((item) => (
                          <TableRow key={item.productId}>
                            <TableCell className="font-medium">{item.productName}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">₦{item.unitPrice.toLocaleString()}</TableCell>
                            <TableCell className="text-right">₦{item.total.toLocaleString()}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleRemoveEditItem(item.productId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="font-bold text-right">Order Total:</TableCell>
                          <TableCell className="font-bold text-right">₦{calculateEditOrderTotal().toLocaleString()}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Sales;