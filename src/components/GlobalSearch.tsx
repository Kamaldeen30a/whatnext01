import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Package, ShoppingCart, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useInventory } from "@/context/InventoryContext";
import { useSales } from "@/context/SalesContext";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "product" | "order" | "customer";
  id: string;
  title: string;
  subtitle: string;
  path: string;
}

const typeConfig = {
  product: { icon: Package, label: "Product", color: "text-blue-500" },
  order: { icon: ShoppingCart, label: "Order", color: "text-green-500" },
  customer: { icon: User, label: "Customer", color: "text-orange-500" },
};

const GlobalSearch = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { products } = useInventory();
  const { sales } = useSales();

  // Build search results
  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const matches: SearchResult[] = [];

    // Search products
    products.forEach((p) => {
      if (
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      ) {
        matches.push({
          type: "product",
          id: p.id,
          title: p.name,
          subtitle: `${p.category} · ${p.stock} ${p.unit} · ₦${p.price.toLocaleString()}`,
          path: "/inventory",
        });
      }
    });

    // Search orders
    sales.forEach((s) => {
      if (
        s.orderNumber.toLowerCase().includes(q) ||
        s.customer.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      ) {
        matches.push({
          type: "order",
          id: s.id,
          title: s.orderNumber,
          subtitle: `${s.customer} · ₦${s.total.toLocaleString()} · ${s.status}`,
          path: "/sales",
        });
      }
    });

    // Search unique customers
    const seen = new Set<string>();
    sales.forEach((s) => {
      const name = s.customer;
      if (!seen.has(name) && name.toLowerCase().includes(q)) {
        seen.add(name);
        const customerSales = sales.filter((x) => x.customer === name);
        const totalSpent = customerSales.reduce((sum, x) => sum + x.total, 0);
        matches.push({
          type: "customer",
          id: name,
          title: name,
          subtitle: `${customerSales.length} order${customerSales.length > 1 ? "s" : ""} · ₦${totalSpent.toLocaleString()} total`,
          path: "/sales",
        });
      }
    });

    return matches.slice(0, 8);
  }, [query, products, sales]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard shortcut: Ctrl/Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    setQuery("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search orders, products, customers…"
          className="pl-9 pr-16 h-9 bg-muted/50 border-muted focus:bg-background text-sm"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-3 sm:right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No results for "{query}"
            </div>
          ) : (
            <ul className="py-1 max-h-72 overflow-y-auto">
              {results.map((result, i) => {
                const config = typeConfig[result.type];
                const Icon = config.icon;
                return (
                  <li key={`${result.type}-${result.id}`}>
                    <button
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                        i === selectedIndex ? "bg-accent" : "hover:bg-accent/50"
                      )}
                    >
                      <div className={cn("flex-shrink-0 p-1.5 rounded-md bg-muted", config.color)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                      </div>
                      <span className="flex-shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        {config.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
