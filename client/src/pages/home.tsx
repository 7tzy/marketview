import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChartLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { ColorThemeToggle } from "@/components/color-theme-toggle";
import { MarketOverviewToggle } from "@/components/market-overview-toggle";
import { ContentVisibilityToggle } from "@/components/content-visibility-toggle";
import { MarketSlider } from "@/components/market-slider";
import { ResourceSection } from "@/components/resource-section";
import { StockManager } from "@/components/stock-manager";
import { RandomStockDisplay } from "@/components/random-stock-display";
import { ProfileButton } from "@/components/profile-button";
import type { MarketData } from "@shared/schema";

interface StockData {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

interface UserPreferences {
  showMarketOverview: boolean;
  showContent: boolean;
}

export default function Home() {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string>();

  // Check login status and get username
  useEffect(() => {
    const userCookie = document.cookie.split(';').find(c => c.trim().startsWith('Keeplogin_u='));
    const adminCookie = document.cookie.split(';').find(c => c.trim().startsWith('Keeplogin_a='));
    setIsLoggedIn(!!(userCookie || adminCookie));
    
    if (userCookie) {
      const cookieValue = userCookie.split('=')[1];
      setUsername(cookieValue);
    }
  }, []);

  const { 
    data: marketData, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useQuery<MarketData>({
    queryKey: ["/api/market-data"],
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
    staleTime: 15 * 60 * 1000, // Consider data stale after 15 minutes
  });

  // User's personal stock list query - only fetch if logged in
  const { data: stockList1, isLoading: isLoading1, error: error1 } = useQuery<StockData[]>({
    queryKey: ["/api/user-stock-list"],
    enabled: isLoggedIn,
    refetchInterval: 30 * 60 * 1000,
    staleTime: 15 * 60 * 1000,
  });

  // User preferences query
  const { data: userPreferences } = useQuery<UserPreferences>({
    queryKey: ['/api/user-preferences'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing Data",
      description: "Updating market information...",
    });
  };

  return (
    <div className="min-h-screen financial-gradient">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ChartLine className="w-8 h-8 text-financial-blue" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Market Hub
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <MarketOverviewToggle />
            <ContentVisibilityToggle />
            <ColorThemeToggle />
            <ThemeToggle />
            <ProfileButton />
          </div>
        </header>

        {/* Market Slider - Top Section - Conditionally rendered */}
        {userPreferences?.showContent !== false && (
          <div className="mb-8">
            <MarketSlider
              marketData={marketData}
              isLoading={isLoading}
              error={error}
              isRefetching={isRefetching}
              onRefresh={handleRefresh}
              stockList1={isLoggedIn ? stockList1 : undefined}
              isLoading1={isLoading1}
              error1={error1}
              isLoggedIn={isLoggedIn}
              username={username}
              showMarketOverview={userPreferences?.showMarketOverview !== false}
            />
          </div>
        )}

        {/* Financial Resources Section */}
        <div className="mb-8">
          <ResourceSection />
        </div>

        {/* Stock Management Section - Split Layout - Conditionally rendered */}
        {userPreferences?.showContent !== false && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Stocks Section - Left Half */}
            <div className="glass-card rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                {isLoggedIn ? "Stock Manager" : "Please login to change your lists"}
              </h2>
              {isLoggedIn ? (
                <StockManager />
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <p>Please login to create and manage your stock lists</p>
                </div>
              )}
            </div>

            {/* Random Stock Display - Right Half - Desktop Only */}
            <div className="hidden lg:block">
              <RandomStockDisplay />
            </div>
          </div>
        )}

        {/* Mobile Random Stock Section - Only one instance - Conditionally rendered */}
        {userPreferences?.showContent !== false && (
          <div className="block lg:hidden">
            <RandomStockDisplay />
          </div>
        )}
      </div>
    </div>
  );
}