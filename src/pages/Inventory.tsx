import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, AlertCircle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  price: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
}

const sampleProducts: Product[] = [
  { id: "P001", name: "Premium Gypsum Board", category: "Gypsum", stock: 450, unit: "sheets", price: 3500, status: "in-stock" },
  { id: "P002", name: "Standard Gypsum Powder", category: "Gypsum", stock: 320, unit: "bags", price: 2800, status: "in-stock" },
  { id: "P003", name: "Acrylic Paint Base", category: "Paint Chemicals", stock: 180, unit: "liters", price: 4200, status: "low-stock" },
  { id: "P004", name: "POP Ceiling Filler", category: "POP Fillers", stock: 280, unit: "bags", price: 3200, status: "in-stock" },
  { id: "P005", name: "White Cement Mix", category: "Adhesives", stock: 145, unit: "bags", price: 2500, status: "low-stock" },
  { id: "P006", name: "Primer Coat Solution", category: "Paint Chemicals", stock: 210, unit: "liters", price: 3800, status: "in-stock" },
  { id: "P007", name: "Decorative POP", category: "POP Fillers", stock: 95, unit: "bags", price: 4500, status: "low-stock" },
  { id: "P008", name: "Industrial Gypsum", category: "Gypsum", stock: 0, unit: "tons", price: 85000, status: "out-of-stock" },
];

const Inventory = () => {
  const [products] = useState<Product[]>(sampleProducts);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: Product["status"]) => {
    const styles = {
      "in-stock": "bg-success/10 text-success hover:bg-success/20",
      "low-stock": "bg-warning/10 text-warning hover:bg-warning/20",
      "out-of-stock": "bg-destructive/10 text-destructive hover:bg-destructive/20",
    };
    return styles[status];
  };

  const getStatusLabel = (status: Product["status"]) => {
    return status.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your building materials stock</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Unique SKUs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {products.filter((p) => p.status === "low-stock").length}
            </div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {products.filter((p) => p.status === "out-of-stock").length}
            </div>
            <p className="text-xs text-muted-foreground">Urgent action required</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Products Inventory</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Price (₦)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.id}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {product.status === "low-stock" && (
                            <AlertCircle className="h-4 w-4 text-warning" />
                          )}
                          {product.stock}
                        </div>
                      </TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell className="text-right">
                        {product.price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(product.status)}>
                          {getStatusLabel(product.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No products found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
