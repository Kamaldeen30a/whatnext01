import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TrendingUp,
  DollarSign,
  Receipt,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
  CalendarIcon,
  Download,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, subDays, subMonths, startOfMonth, endOfMonth, parseISO, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { useSales } from "@/context/SalesContext";
import { exportToCSV, exportToPDF, formatCurrencyShort } from "@/lib/exportUtils";
import { toast } from "sonner";

// Expense ratio (estimated as percentage of revenue)
const EXPENSE_RATIO = 0.55;

// Expense breakdown percentages
const expenseCategories = [
  { name: "Raw Materials", percentage: 0.41, color: "hsl(var(--primary))" },
  { name: "Logistics", percentage: 0.18, color: "hsl(var(--accent))" },
  { name: "Salaries", percentage: 0.21, color: "hsl(var(--success))" },
  { name: "Utilities", percentage: 0.07, color: "hsl(var(--warning))" },
  { name: "Marketing", percentage: 0.06, color: "hsl(var(--destructive))" },
  { name: "Other", percentage: 0.07, color: "hsl(var(--muted-foreground))" },
];

const Analytics = () => {
  const { sales } = useSales();
  
  // Date range state
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });

  // Filter sales by date range
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const saleDate = parseISO(sale.date);
      return isWithinInterval(saleDate, { start: dateRange.from, end: dateRange.to });
    });
  }, [sales, dateRange]);

  // Calculate metrics from real sales data
  const metrics = useMemo(() => {
    const paidSales = filteredSales.filter((s) => s.paymentStatus === "paid" && s.status !== "cancelled");
    const totalRevenue = paidSales.reduce((sum, s) => sum + s.total, 0);
    const totalExpenses = totalRevenue * EXPENSE_RATIO;
    const totalProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0";

    // Receivables (pending payments)
    const receivables = filteredSales
      .filter((s) => s.paymentStatus === "pending" && s.status !== "cancelled")
      .reduce((sum, s) => sum + s.total, 0);

    return {
      totalRevenue,
      totalExpenses,
      totalProfit,
      profitMargin,
      receivables,
      totalOrders: filteredSales.length,
      paidOrders: paidSales.length,
    };
  }, [filteredSales]);

  // Generate monthly data from sales
  const monthlyData = useMemo(() => {
    const monthMap = new Map<string, { revenue: number; count: number }>();

    filteredSales
      .filter((s) => s.paymentStatus === "paid" && s.status !== "cancelled")
      .forEach((sale) => {
        const month = format(parseISO(sale.date), "MMM yyyy");
        const existing = monthMap.get(month) || { revenue: 0, count: 0 };
        monthMap.set(month, {
          revenue: existing.revenue + sale.total,
          count: existing.count + 1,
        });
      });

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month: month.split(" ")[0], // Just the month name
        fullMonth: month,
        revenue: data.revenue,
        expenses: data.revenue * EXPENSE_RATIO,
        profit: data.revenue * (1 - EXPENSE_RATIO),
      }))
      .sort((a, b) => new Date(a.fullMonth).getTime() - new Date(b.fullMonth).getTime());
  }, [filteredSales]);

  // Expense breakdown based on total expenses
  const expenseBreakdown = useMemo(() => {
    return expenseCategories.map((cat) => ({
      ...cat,
      value: metrics.totalExpenses * cat.percentage,
    }));
  }, [metrics.totalExpenses]);

  // Top customers
  const topCustomers = useMemo(() => {
    const customerMap = new Map<string, { total: number; orders: number }>();
    
    filteredSales
      .filter((s) => s.paymentStatus === "paid")
      .forEach((sale) => {
        const existing = customerMap.get(sale.customer) || { total: 0, orders: 0 };
        customerMap.set(sale.customer, {
          total: existing.total + sale.total,
          orders: existing.orders + 1,
        });
      });

    return Array.from(customerMap.entries())
      .map(([customer, data]) => ({ customer, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filteredSales]);

  // Pending payments (receivables)
  const pendingPayments = useMemo(() => {
    return filteredSales
      .filter((s) => s.paymentStatus === "pending" && s.status !== "cancelled")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 4);
  }, [filteredSales]);

  // Quick date range presets
  const setQuickRange = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    });
  };

  const setMonthRange = (monthsBack: number) => {
    const targetDate = subMonths(new Date(), monthsBack);
    setDateRange({
      from: startOfMonth(targetDate),
      to: monthsBack === 0 ? new Date() : endOfMonth(targetDate),
    });
  };

  // Export handlers
  const handleExportCSV = () => {
    const data = {
      headers: ["Month", "Revenue (₦)", "Expenses (₦)", "Profit (₦)"],
      rows: monthlyData.map((m) => [m.fullMonth, m.revenue, Math.round(m.expenses), Math.round(m.profit)]),
      title: "Financial Analytics Report",
    };
    exportToCSV(data, "analytics_report");
    toast.success("CSV exported successfully");
  };

  const handleExportPDF = () => {
    const data = {
      headers: ["Month", "Revenue (₦)", "Expenses (₦)", "Profit (₦)"],
      rows: monthlyData.map((m) => [
        m.fullMonth,
        formatCurrencyShort(m.revenue),
        formatCurrencyShort(Math.round(m.expenses)),
        formatCurrencyShort(Math.round(m.profit)),
      ]),
      title: `Financial Analytics Report (${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")})`,
    };
    exportToPDF(data, "analytics_report");
    toast.success("PDF export initiated");
  };

  const handleExportSalesCSV = () => {
    const data = {
      headers: ["Order #", "Customer", "Date", "Total (₦)", "Status", "Payment"],
      rows: filteredSales.map((s) => [
        s.orderNumber,
        s.customer,
        s.date,
        s.total,
        s.status,
        s.paymentStatus,
      ]),
      title: "Sales Report",
    };
    exportToCSV(data, "sales_report");
    toast.success("Sales CSV exported successfully");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Date Filter */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Financial Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Track revenue, expenses, and profit performance</p>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Quick Filters */}
          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
            <Button variant="outline" size="sm" onClick={() => setQuickRange(7)} className="shrink-0">7D</Button>
            <Button variant="outline" size="sm" onClick={() => setQuickRange(30)} className="shrink-0">30D</Button>
            <Button variant="outline" size="sm" onClick={() => setQuickRange(90)} className="shrink-0">90D</Button>
            <Button variant="outline" size="sm" onClick={() => setMonthRange(0)} className="shrink-0 whitespace-nowrap">This Month</Button>
          </div>

          <div className="flex gap-2">
            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-none justify-start text-left">
                  <CalendarIcon className="h-4 w-4 shrink-0" />
                  <span className="truncate text-xs sm:text-sm">
                    {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" side="bottom">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                    } else if (range?.from) {
                      setDateRange({ from: range.from, to: range.from });
                    }
                  }}
                  numberOfMonths={1}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Analytics as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  Analytics as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportSalesCSV}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Sales Data as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-2xl font-bold">{formatCurrencyShort(metrics.totalRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>{metrics.paidOrders} paid orders</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-2xl font-bold">{formatCurrencyShort(metrics.totalExpenses)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>~{(EXPENSE_RATIO * 100).toFixed(0)}% of revenue</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Net Profit</CardTitle>
            <PiggyBank className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-2xl font-bold">{formatCurrencyShort(metrics.totalProfit)}</div>
            <div className="flex items-center text-xs text-success">
              <TrendingUp className="h-3 w-3 mr-1" />
              {metrics.profitMargin}% margin
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Receivables</CardTitle>
            <Wallet className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-2xl font-bold">{formatCurrencyShort(metrics.receivables)}</div>
            <p className="text-xs text-muted-foreground">Pending payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue vs Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatCurrencyShort(v)} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                        formatter={(value: number) => formatCurrencyShort(value)}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stackId="1"
                        stroke="hsl(var(--success))"
                        fill="hsl(var(--success) / 0.3)"
                        name="Revenue"
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stackId="2"
                        stroke="hsl(var(--destructive))"
                        fill="hsl(var(--destructive) / 0.3)"
                        name="Expenses"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data for selected date range
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profit Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Profit Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatCurrencyShort(v)} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                        formatter={(value: number) => formatCurrencyShort(value)}
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                        name="Profit"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data for selected date range
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.totalExpenses > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={expenseBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {expenseBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                          formatter={(value: number) => formatCurrencyShort(value)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {expenseBreakdown.map((item) => (
                        <div key={item.name} className="flex items-center gap-2 text-sm">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No expense data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Revenue by Month Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatCurrencyShort(v)} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                        formatter={(value: number) => formatCurrencyShort(value)}
                      />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data for selected date range
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-success" />
              Top Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCustomers.length > 0 ? (
              <div className="space-y-3">
                {topCustomers.map((customer, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <span className="font-medium">{customer.customer}</span>
                      <p className="text-xs text-muted-foreground">{customer.orders} orders</p>
                    </div>
                    <span className="font-semibold">{formatCurrencyShort(customer.total)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No customer data</p>
            )}
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingPayments.length > 0 ? (
              <div className="space-y-3">
                {pendingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <span className="font-medium truncate max-w-[150px] block">{payment.customer}</span>
                      <p className="text-xs text-muted-foreground">{payment.orderNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{formatCurrencyShort(payment.total)}</span>
                      <Badge variant="secondary" className="text-xs">
                        pending
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No pending payments</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
