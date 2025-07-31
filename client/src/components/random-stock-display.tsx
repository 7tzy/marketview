import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

// Common stock tickers
const stockTickers = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "BRK.B", "UNH", "JNJ",
  "V", "WMT", "JPM", "MA", "PG", "CVX", "HD", "BAC", "ABBV", "PFE",
  "KO", "AVGO", "PEP", "TMO", "COST", "MRK", "DIS", "ACN", "VZ", "ADBE",
  "NFLX", "CRM", "NKE", "DHR", "TXN", "NEE", "CMCSA", "RTX", "ABT", "QCOM",
  "WFC", "AMD", "BMY", "T", "UPS", "SPGI", "PM", "HON", "LIN", "SCHW"
];

interface StockData {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export function RandomStockDisplay() {
  const [randomStock, setRandomStock] = useState<string>("");

  // Pick a random stock on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * stockTickers.length);
    setRandomStock(stockTickers[randomIndex]);
  }, []);

  // Fetch stock data for the random stock
  const { data: stockData, isLoading, error } = useQuery<StockData>({
    queryKey: ["/api/random-stock", randomStock],
    enabled: !!randomStock,
    refetchInterval: 30 * 60 * 1000, // 30 minutes
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  if (!randomStock) return null;

  if (isLoading) {
    return (
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Featured Stock</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  if (error || !stockData) {
    // Check if this is an offline error
    const isOfflineError = error?.message?.includes("offline") || (error as any)?.error === "Offline mode";
    const errorMessage = isOfflineError 
      ? "You are offline, please go online to use stock data"
      : "Unable to load stock data";
    
    return (
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Featured Stock</h3>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>{errorMessage}</p>
          <p className="text-sm mt-1">Stock: {randomStock}</p>
        </div>
      </Card>
    );
  }

  const isPositive = stockData.change >= 0;

  return (
    <Card className="glass-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Featured Stock</h3>
      
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {stockData.symbol}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-500">
              {stockData.name || stockData.symbol}
            </span>
          </div>
        </div>

        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ${stockData.value.toFixed(2)}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1 ${
            isPositive ? 'text-success-green' : 'text-alert-red'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="font-medium">
              {isPositive ? '+' : ''}${stockData.change.toFixed(2)}
            </span>
          </div>
          
          <div className={`text-sm font-medium ${
            isPositive ? 'text-success-green' : 'text-alert-red'
          }`}>
            {isPositive ? '+' : ''}{stockData.changePercent.toFixed(2)}%
          </div>
        </div>
      </div>
    </Card>
  );
}