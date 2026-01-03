import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Package, BarChart3, Truck } from "lucide-react";
import logo from "@/assets/whatnext-logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 px-4">
        <div className="max-w-4xl mx-auto py-12 sm:py-20 text-center">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <img src={logo} alt="WhatNext Investment Logo" className="h-20 sm:h-32 w-auto" />
          </div>
          
          <p className="text-lg sm:text-xl text-muted-foreground mb-3 sm:mb-4">
            Business Management Dashboard
          </p>
          
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Complete solution for managing import, export, production, sales & distribution 
            of building materials including gypsum, paint chemicals, and POP fillers.
          </p>

          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              className="gap-2 text-base sm:text-lg px-6 sm:px-8"
              onClick={() => navigate("/login")}
            >
              Access Dashboard
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-10 sm:mt-16">
            <div className="p-4 sm:p-6 rounded-lg bg-card border border-border">
              <Package className="h-8 sm:h-10 w-8 sm:w-10 text-primary mb-3 sm:mb-4 mx-auto" />
              <h3 className="font-semibold text-base sm:text-lg mb-2">Inventory Management</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Track stock, manage products, and monitor inventory levels in real-time
              </p>
            </div>
            
            <div className="p-4 sm:p-6 rounded-lg bg-card border border-border">
              <BarChart3 className="h-8 sm:h-10 w-8 sm:w-10 text-accent mb-3 sm:mb-4 mx-auto" />
              <h3 className="font-semibold text-base sm:text-lg mb-2">Sales Analytics</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Comprehensive sales tracking with detailed reports and insights
              </p>
            </div>
            
            <div className="p-4 sm:p-6 rounded-lg bg-card border border-border sm:col-span-2 md:col-span-1">
              <Truck className="h-8 sm:h-10 w-8 sm:w-10 text-success mb-3 sm:mb-4 mx-auto" />
              <h3 className="font-semibold text-base sm:text-lg mb-2">Logistics Tracking</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
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
