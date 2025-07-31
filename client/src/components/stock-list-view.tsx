import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

interface StockData {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

interface StockListViewProps {
  listNumber: number;
  stocks?: StockData[];
  isLoading: boolean;
  error: any;
  isLoggedIn?: boolean;
  username?: string;
}

export function StockListView({ listNumber, stocks, isLoading, error, isLoggedIn = true, username }: StockListViewProps) {
  const getListTitle = () => {
    if (listNumber === 1 && username) {
      return `${username}'s watch list`;
    }
    return `List ${listNumber}`;
  };
  if (error) {
    // Check if this is an offline error
    const isOfflineError = error?.message?.includes("offline") || (error as any)?.error === "Offline mode";
    const errorMessage = isOfflineError 
      ? "You are offline, please go online to use Your Lists"
      : `Unable to load stock list ${listNumber}`;
    
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
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getListTitle()}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-4" />
              </div>
              <Skeleton className="h-6 w-24 mb-2" />
              <div className="flex items-center">
                <Skeleton className="h-4 w-12 mr-2" />
                <Skeleton className="h-4 w-10" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getListTitle()}</h2>
        <Card className="glass-card p-6">
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>Please login to create a list</p>
            <p className="text-sm mt-1">Log in to view and manage your custom stock lists</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!stocks || stocks.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getListTitle()}</h2>
        <Card className="glass-card p-6">
          <div className="text-center text-professional-gray">
            No current data
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getListTitle()}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stocks.map((stock) => {
          const isPositive = stock.change >= 0;
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;
          const colorClass = isPositive ? 'text-success-green' : 'text-alert-red';

          return (
            <Card key={stock.symbol} className="glass-card p-4 hover:shadow-lg transition-all duration-300 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{stock.symbol}</h3>
                  <p className="text-sm text-professional-gray">{stock.name}</p>
                </div>
                <TrendIcon className={`w-4 h-4 ${colorClass}`} />
              </div>
              <div className="mb-2">
                <span className="text-2xl font-bold">
                  ${stock.value.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center">
                <span className={`font-medium mr-2 ${colorClass} text-sm`}>
                  {isPositive ? '+' : ''}{stock.change.toFixed(2)}
                </span>
                <span className={`text-sm ${colorClass}`}>
                  ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}