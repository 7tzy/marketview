import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { X, Save, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";


// Comprehensive stock tickers for suggestions including index constituents
const commonTickers = [
  "AAPL", "MSFT", "GOOGL", "GOOG", "AMZN", "TSLA", "META", "NVDA", "NFLX", "ADBE",
    "CRM", "AMD", "INTC", "ORCL", "IBM", "CSCO", "QCOM", "AVGO", "TXN", "MU",
    "JPM", "BAC", "WFC", "GS", "MS", "C", "BLK", "AXP", "SPGI", "CME", "ICE", "COF",
    "JNJ", "UNH", "PFE", "ABBV", "MRK", "TMO", "ABT", "BMY", "LLY", "MDT", "GILD", "AMGN",
    "WMT", "HD", "PG", "KO", "PEP", "DIS", "NKE", "COST", "SBUX", "MCD", "TGT", "LOW",
    "XOM", "CVX", "COP", "SLB", "EOG", "KMI", "OXY", "PSX", "VLO", "MPC", "HAL", "BKR",
    "BRK.B", "V", "MA", "NEE", "HON", "PM", "RTX", "UNP", "CAT", "DE", "MMM", "GE",
    "SPY", "QQQ", "DIA", "IWM", "VTI", "VOO", "VEA", "VWO", "AGG", "BND", "GLD", "SLV", "TSM"
];

interface TickerWithTimestamp {
  ticker: string;
  timestamp: number;
}

export function StockManager() {
  const [inputValue, setInputValue] = useState("");
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load tickers from localStorage with expiration check
  useEffect(() => {
    const saved = localStorage.getItem("currentTickers");
    if (saved) {
      try {
        const tickersWithTimestamp: TickerWithTimestamp[] = JSON.parse(saved);
        const now = Date.now();
        const validTickers = tickersWithTimestamp
          .filter(item => (now - item.timestamp) < 10000) // 10 seconds
          .map(item => item.ticker);
        
        setSelectedTickers(validTickers);
        
        // Update localStorage with only valid tickers
        const updatedTickers = tickersWithTimestamp.filter(item => (now - item.timestamp) < 10000);
        localStorage.setItem("currentTickers", JSON.stringify(updatedTickers));
      } catch (e) {
        console.error("Failed to parse saved tickers:", e);
        localStorage.removeItem("currentTickers");
      }
    }
  }, []);

  // Save tickers to localStorage with timestamps
  useEffect(() => {
    const now = Date.now();
    const tickersWithTimestamp: TickerWithTimestamp[] = selectedTickers.map(ticker => ({
      ticker,
      timestamp: now
    }));
    localStorage.setItem("currentTickers", JSON.stringify(tickersWithTimestamp));
  }, [selectedTickers]);

  // Auto-cleanup expired tickers every second
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem("currentTickers");
      if (saved) {
        try {
          const tickersWithTimestamp: TickerWithTimestamp[] = JSON.parse(saved);
          const now = Date.now();
          const validTickers = tickersWithTimestamp
            .filter(item => (now - item.timestamp) < 10000)
            .map(item => item.ticker);
          
          if (validTickers.length !== selectedTickers.length) {
            setSelectedTickers(validTickers);
            const updatedTickers = tickersWithTimestamp.filter(item => (now - item.timestamp) < 10000);
            localStorage.setItem("currentTickers", JSON.stringify(updatedTickers));
          }
        } catch (e) {
          console.error("Error during ticker cleanup:", e);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedTickers]);

  // Update suggestions when input changes
  useEffect(() => {
    if (inputValue.length > 0) {
      const filtered = commonTickers
        .filter(ticker => 
          ticker.toLowerCase().includes(inputValue.toLowerCase()) &&
          !selectedTickers.includes(ticker)
        )
        .slice(0, 10);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, selectedTickers]);

  const addTicker = (ticker: string) => {
    if (!selectedTickers.includes(ticker)) {
      setSelectedTickers([...selectedTickers, ticker.toUpperCase()]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeTicker = (ticker: string) => {
    setSelectedTickers(selectedTickers.filter(t => t !== ticker));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addTicker(inputValue.trim());
    }
  };

  const saveToListMutation = useMutation<any, any, { tickers: string[] }>({
    mutationFn: async ({ tickers }) => {
      const response = await fetch(`/api/user-stock-list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tickers }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save list");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Saved!",
        description: "Tickers saved to your personal list",
      });
      
      // Invalidate list queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user-stock-list"] });
      
      // Clear selected tickers after save
      setSelectedTickers([]);
      localStorage.removeItem("currentTickers");
    },
    onError: (error: any) => {
      const isOfflineError = error?.message?.includes("offline");
      const errorMessage = isOfflineError 
        ? "You are offline, please go online to use Your Lists"
        : (error instanceof Error ? error.message : "Failed to save list");
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSaveToList = () => {
    if (selectedTickers.length === 0) {
      toast({
        title: "No tickers",
        description: "Please add some stock tickers first",
        variant: "destructive",
      });
      return;
    }
    
    saveToListMutation.mutate({ tickers: selectedTickers });
  };

  const clearListMutation = useMutation<any, any, {}>({
    mutationFn: async () => {
      const response = await fetch(`/api/user-stock-list`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to clear list");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "List cleared!",
        description: "Successfully cleared your personal list",
      });
      
      // Invalidate list queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user-stock-list"] });
    },
    onError: (error: any) => {
      const isOfflineError = error?.message?.includes("offline");
      const errorMessage = isOfflineError 
        ? "You are offline, please go online to use Your Lists"
        : (error instanceof Error ? error.message : "Failed to clear list");
      
      toast({
        title: "Error", 
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleClearList = () => {
    clearListMutation.mutate({});
  };

  return (
    <Card className="glass-card p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Current Stocks</h2>
      
      {/* Stock ticker input */}
      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="Enter stock ticker (e.g., AAPL)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          className="glass-card"
          maxLength={10}
          disabled={false}
        />
        
        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-10 frosted-dropdown p-2 max-h-48 overflow-y-auto themed-scrollbar">
            {suggestions.map((ticker) => (
              <button
                key={ticker}
                onClick={() => addTicker(ticker)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                {ticker}
              </button>
            ))}
          </Card>
        )}
      </div>

      {/* Selected tickers */}
      {selectedTickers.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {selectedTickers.map((ticker) => (
              <span
                key={ticker}
                className="inline-flex items-center gap-1 px-3 py-1 bg-financial-blue text-white rounded-full text-sm"
              >
                {ticker}
                <button
                  onClick={() => removeTicker(ticker)}
                  className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <p className="text-xs text-professional-gray mt-2">
            {selectedTickers.length} tickers selected (expires in 10s)
          </p>
        </div>
      )}

      {/* Save and Clear buttons - single list */}
      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={handleSaveToList}
          disabled={selectedTickers.length === 0 || saveToListMutation.isPending}
          className="flex items-center gap-2 neon-hover-pc transition-all duration-300"
          variant="outline"
        >
          <Save className="w-4 h-4" />
          Add to My List
        </Button>
        <Button
          onClick={handleClearList}
          disabled={clearListMutation.isPending}
          className="flex items-center gap-2 neon-hover-pc transition-all duration-300"
          variant="outline"
        >
          <Trash2 className="w-4 h-4" />
          Clear My List
        </Button>
      </div>
    </Card>
  );
}