import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
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

// Monthly financial data
const monthlyData = [
  { month: "Jan", revenue: 4500000, expenses: 2800000, profit: 1700000 },
  { month: "Feb", revenue: 5200000, expenses: 3100000, profit: 2100000 },
  { month: "Mar", revenue: 4800000, expenses: 2900000, profit: 1900000 },
  { month: "Apr", revenue: 6100000, expenses: 3500000, profit: 2600000 },
  { month: "May", revenue: 5900000, expenses: 3300000, profit: 2600000 },
  { month: "Jun", revenue: 7200000, expenses: 4000000, profit: 3200000 },
  { month: "Jul", revenue: 6800000, expenses: 3800000, profit: 3000000 },
  { month: "Aug", revenue: 7500000, expenses: 4200000, profit: 3300000 },
  { month: "Sep", revenue: 8100000, expenses: 4500000, profit: 3600000 },
  { month: "Oct", revenue: 7900000, expenses: 4400000, profit: 3500000 },
  { month: "Nov", revenue: 8500000, expenses: 4700000, profit: 3800000 },
  { month: "Dec", revenue: 9200000, expenses: 5100000, profit: 4100000 },
];

// Yearly comparison data
const yearlyData = [
  { year: "2021", revenue: 45000000, expenses: 28000000, profit: 17000000 },
  { year: "2022", revenue: 58000000, expenses: 34000000, profit: 24000000 },
  { year: "2023", revenue: 72000000, expenses: 41000000, profit: 31000000 },
  { year: "2024", revenue: 81700000, expenses: 45300000, profit: 36400000 },
];

// Expense breakdown
const expenseBreakdown = [
  { name: "Raw Materials", value: 18500000, color: "hsl(var(--primary))" },
  { name: "Logistics", value: 8200000, color: "hsl(var(--accent))" },
  { name: "Salaries", value: 9500000, color: "hsl(var(--success))" },
  { name: "Utilities", value: 3200000, color: "hsl(var(--warning))" },
  { name: "Marketing", value: 2800000, color: "hsl(var(--destructive))" },
  { name: "Other", value: 3100000, color: "hsl(var(--muted-foreground))" },
];

// Accounts receivable/payable
const accountsReceivable = [
  { customer: "ABC Construction Ltd", amount: 2500000, dueDate: "2024-02-15", status: "overdue" },
  { customer: "BuildRight Nigeria", amount: 1800000, dueDate: "2024-02-28", status: "pending" },
  { customer: "Lagos Interiors", amount: 950000, dueDate: "2024-03-05", status: "pending" },
  { customer: "Delta Builders", amount: 3200000, dueDate: "2024-03-15", status: "pending" },
];

const accountsPayable = [
  { vendor: "Gypsum Suppliers Co.", amount: 1200000, dueDate: "2024-02-10", status: "overdue" },
  { vendor: "Chemical Industries Ltd", amount: 850000, dueDate: "2024-02-20", status: "pending" },
  { vendor: "Transport Services", amount: 450000, dueDate: "2024-02-25", status: "pending" },
];

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `₦${(value / 1000000).toFixed(1)}M`;
  }
  return `₦${(value / 1000).toFixed(0)}K`;
};

const Analytics = () => {
  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);

  const totalReceivable = accountsReceivable.reduce((sum, a) => sum + a.amount, 0);
  const totalPayable = accountsPayable.reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Analytics</h1>
        <p className="text-muted-foreground">Track revenue, expenses, and profit performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className="flex items-center text-xs text-success">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +18.2% vs last year
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses (YTD)</CardTitle>
            <Receipt className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <div className="flex items-center text-xs text-destructive">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              +10.5% vs last year
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Profit (YTD)</CardTitle>
            <PiggyBank className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalProfit)}</div>
            <div className="flex items-center text-xs text-success">
              <TrendingUp className="h-3 w-3 mr-1" />
              {profitMargin}% margin
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
            <Wallet className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalReceivable - totalPayable)}</div>
            <p className="text-xs text-muted-foreground">Net receivables</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue vs Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                      formatter={(value: number) => formatCurrency(value)}
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
              </CardContent>
            </Card>

            {/* Profit Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Profit Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                      formatter={(value: number) => formatCurrency(value)}
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="yearly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yearly Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="hsl(var(--success))" name="Revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="Expenses" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" fill="hsl(var(--primary))" name="Profit" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Expense Breakdown & Accounts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
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
                  formatter={(value: number) => formatCurrency(value)}
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
          </CardContent>
        </Card>

        {/* Accounts Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Accounts Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Receivables */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-success flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4" />
                  Receivables
                </h4>
                <span className="font-bold">{formatCurrency(totalReceivable)}</span>
              </div>
              <div className="space-y-2">
                {accountsReceivable.slice(0, 3).map((acc, i) => (
                  <div key={i} className="flex items-center justify-between text-sm border-b pb-2">
                    <span className="text-muted-foreground truncate max-w-[150px]">{acc.customer}</span>
                    <div className="flex items-center gap-2">
                      <span>{formatCurrency(acc.amount)}</span>
                      <Badge variant={acc.status === "overdue" ? "destructive" : "secondary"} className="text-xs">
                        {acc.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payables */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-destructive flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4" />
                  Payables
                </h4>
                <span className="font-bold">{formatCurrency(totalPayable)}</span>
              </div>
              <div className="space-y-2">
                {accountsPayable.map((acc, i) => (
                  <div key={i} className="flex items-center justify-between text-sm border-b pb-2">
                    <span className="text-muted-foreground truncate max-w-[150px]">{acc.vendor}</span>
                    <div className="flex items-center gap-2">
                      <span>{formatCurrency(acc.amount)}</span>
                      <Badge variant={acc.status === "overdue" ? "destructive" : "secondary"} className="text-xs">
                        {acc.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
