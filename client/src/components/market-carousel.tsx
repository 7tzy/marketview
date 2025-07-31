import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketOverview } from "@/components/market-overview";
import { StockListView } from "@/components/stock-list-view";
import type { ViewMode } from "@/components/carousel-navigation";
import type { MarketData } from "@shared/schema";

interface StockData {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

interface MarketCarouselProps {
  currentView: ViewMode;
  marketData?: MarketData;
  isLoading: boolean;
  error: any;
  isRefetching: boolean;
  onRefresh: () => void;
  stockList1?: StockData[];
  stockList2?: StockData[];
  stockList3?: StockData[];
  isLoading1: boolean;
  isLoading2: boolean;
  isLoading3: boolean;
  error1: any;
  error2: any;
  error3: any;
  username?: string;
}

export function MarketCarousel({
  currentView,
  marketData,
  isLoading,
  error,
  isRefetching,
  onRefresh,
  stockList1,
  stockList2,
  stockList3,
  isLoading1,
  isLoading2,
  isLoading3,
  error1,
  error2,
  error3,
  username,
}: MarketCarouselProps) {
  const renderView = () => {
    switch (currentView) {
      case "market":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Market Overview</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isRefetching}
                className="text-financial-blue hover:text-blue-700 neon-hover-pc"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            <div className="market-overview">
              <MarketOverview 
                marketData={marketData} 
                isLoading={isLoading} 
                error={error} 
              />
            </div>
          </div>
        );
      case "list1":
        return (
          <div className="px-4">
            <StockListView 
              listNumber={1}
              stocks={stockList1} 
              isLoading={isLoading1} 
              error={error1}
              username={username}
            />
          </div>
        );
      case "list2":
        return (
          <div className="px-4">
            <StockListView 
              listNumber={2}
              stocks={stockList2} 
              isLoading={isLoading2} 
              error={error2}
              username={username}
            />
          </div>
        );
      case "list3":
        return (
          <div className="px-4">
            <StockListView 
              listNumber={3}
              stocks={stockList3} 
              isLoading={isLoading3} 
              error={error3}
              username={username}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div 
        className="transition-all duration-500 ease-in-out"
        key={currentView}
      >
        {renderView()}
      </div>
    </div>
  );
}