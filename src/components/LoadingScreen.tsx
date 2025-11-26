import logo from "@/assets/whatnext-logo.png";

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="flex flex-col items-center gap-8">
        <img 
          src={logo} 
          alt="WhatNext Investment Logo" 
          className="h-32 w-auto animate-fade-in"
        />
        
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-muted"></div>
          <div className="absolute top-0 h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
        
        <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
