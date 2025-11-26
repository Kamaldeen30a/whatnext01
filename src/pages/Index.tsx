import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Building2, ArrowRight, Package, BarChart3, Truck } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Building2 className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold">WhatNext Investment</h1>
          </div>
          
          <p className="text-xl text-muted-foreground mb-4">
            Business Management Dashboard
          </p>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Complete solution for managing import, export, production, sales & distribution 
            of building materials including gypsum, paint chemicals, and POP fillers.
          </p>

          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              className="gap-2 text-lg px-8"
              onClick={() => navigate("/login")}
            >
              Access Dashboard
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-lg bg-card border border-border">
              <Package className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Inventory Management</h3>
              <p className="text-sm text-muted-foreground">
                Track stock, manage products, and monitor inventory levels in real-time
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border border-border">
              <BarChart3 className="h-10 w-10 text-accent mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Sales Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive sales tracking with detailed reports and insights
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border border-border">
              <Truck className="h-10 w-10 text-success mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Logistics Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor deliveries, shipments, and distribution in one place
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          © 2025 WhatNext Investment Nigeria Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
