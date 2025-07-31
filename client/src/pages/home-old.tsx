import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChartLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { ColorThemeToggle } from "@/components/color-theme-toggle";
import { CarouselNavigation, type ViewMode } from "@/components/carousel-navigation";
import { MarketCarousel } from "@/components/market-carousel";
import { ResourceSection } from "@/components/resource-section";
import { StockManager } from "@/components/stock-manager";
import { ProfileButton } from "@/components/profile-button";
import type { MarketData } from "@shared/schema";

interface StockData {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export default function Home() {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<ViewMode>("market");

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
      
      const viewCycle: ViewMode[] = ["market", "list1", "list2", "list3"];
      const currentIndex = viewCycle.indexOf(currentView);
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = currentIndex === 0 ? viewCycle.length - 1 : currentIndex - 1;
        setCurrentView(viewCycle[prevIndex]);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % viewCycle.length;
        setCurrentView(viewCycle[nextIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView]);

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

  // Stock list queries
  const { data: stockList1, isLoading: isLoading1, error: error1 } = useQuery<StockData[]>({
    queryKey: ["/api/stock-lists", 1],
    enabled: currentView === "list1",
    refetchInterval: 30 * 60 * 1000,
    staleTime: 15 * 60 * 1000,
  });

  const { data: stockList2, isLoading: isLoading2, error: error2 } = useQuery<StockData[]>({
    queryKey: ["/api/stock-lists", 2],
    enabled: currentView === "list2",
    refetchInterval: 30 * 60 * 1000,
    staleTime: 15 * 60 * 1000,
  });

  const { data: stockList3, isLoading: isLoading3, error: error3 } = useQuery<StockData[]>({
    queryKey: ["/api/stock-lists", 3],
    enabled: currentView === "list3",
    refetchInterval: 30 * 60 * 1000,
    staleTime: 15 * 60 * 1000,
  });

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Market data refreshed",
        description: "Latest market information has been loaded",
      });
    } catch {
      toast({
        title: "Refresh failed",
        description: "Unable to fetch latest market data",
        variant: "destructive",
      });
    }
  };

  const getLastUpdated = () => {
    if (!marketData) return "Loading...";
    const lastRefresh = new Date(marketData.lastRefresh);
    return `Last updated: ${lastRefresh.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/Los_Angeles',
      timeZoneName: 'short'
    })}`;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ChartLine className="text-financial-blue text-2xl mr-3" />
              <h1 className="text-xl font-bold">Market View</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-sm text-professional-gray">
                  {getLastUpdated()}
                </span>
                <div className="h-2 w-2 bg-success-green rounded-full animate-pulse"></div>
              </div>
              <CarouselNavigation currentView={currentView} onViewChange={setCurrentView} />
              <ProfileButton />
              <ColorThemeToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Market Carousel Section */}
        <section className="mb-12">
          <MarketCarousel
            currentView={currentView}
            marketData={marketData}
            isLoading={isLoading}
            error={error}
            isRefetching={isRefetching}
            onRefresh={handleRefresh}
            stockList1={stockList1}
            stockList2={stockList2}
            stockList3={stockList3}
            isLoading1={isLoading1}
            isLoading2={isLoading2}
            isLoading3={isLoading3}
            error1={error1}
            error2={error2}
            error3={error3}
          />
        </section>

        {/* Stock Manager Section */}
        <section className="mb-12">
          <StockManager />
        </section>

        {/* Resources Section */}
        <ResourceSection />
      </main>

      {/* Footer */}
      <footer className="glass-card mt-16 mx-4 mb-4 rounded-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <ChartLine className="text-financial-blue text-xl mr-2" />
              <span className="text-sm">Market View - Your Financial Resource Center</span>
            </div>
            <div className="text-sm text-professional-gray">
              Market data delayed by 15 minutes.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
