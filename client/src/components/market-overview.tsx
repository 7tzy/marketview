import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import type { MarketData } from "@shared/schema";

interface MarketOverviewProps {
  marketData?: MarketData;
  isLoading: boolean;
  error: any;
}

export function MarketOverview({ marketData, isLoading, error }: MarketOverviewProps) {
  if (error) {
    // Check if this is an offline error
    const isOfflineError = error?.message?.includes("offline") || (error as any)?.error === "Offline mode";
    const errorMessage = isOfflineError 
      ? "You are offline, please go online to use Market Overview"
      : "Unable to load market data";
    
    return (
      <Card className="glass-card p-6">
        <div className="flex items-center gap-2 text-alert-red">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">{errorMessage}</span>
        </div>
        {!isOfflineError && (
          <p className="text-sm text-professional-gray mt-2">
            Please check your internet connection and try refreshing the page.
          </p>
        )}
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="glass-card p-6">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-5 w-5" />
            </div>
            <Skeleton className="h-8 w-32 mb-2" />
            <div className="flex items-center">
              <Skeleton className="h-4 w-16 mr-2" />
              <Skeleton className="h-4 w-12" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!marketData) {
    return (
      <Card className="glass-card p-6">
        <div className="text-center text-professional-gray">
          No market data available
        </div>
      </Card>
    );
  }

  const indices = [
    {
      ...marketData.sp500,
      name: "S&P 500"
    },
    {
      ...marketData.dowJones,
      name: "Dow Jones"
    },
    {
      ...marketData.nasdaq,
      name: "NASDAQ"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {indices.map((index) => {
        const isPositive = index.change >= 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;
        const colorClass = isPositive ? 'text-success-green' : 'text-alert-red';

        return (
          <Card key={index.symbol} className="glass-card p-6 rounded-lg neon-hover-pc transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{index.name}</h3>
              <TrendIcon className={`w-5 h-5 ${colorClass}`} />
            </div>
            <div className="mb-2">
              <span className="text-3xl font-bold">
                {index.value.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center">
              <span className={`font-medium mr-2 ${colorClass}`}>
                {isPositive ? '+' : ''}{index.change.toFixed(2)}
              </span>
              <span className={`text-sm ${colorClass}`}>
                ({isPositive ? '+' : ''}{index.changePercent.toFixed(2)}%)
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
