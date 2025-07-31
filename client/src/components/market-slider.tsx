import { useState, useRef, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketOverview } from "@/components/market-overview";
import { StockListView } from "@/components/stock-list-view";
import type { MarketData } from "@shared/schema";

interface StockData {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

interface MarketSliderProps {
  marketData?: MarketData;
  isLoading: boolean;
  error: any;
  isRefetching: boolean;
  onRefresh: () => void;
  stockList1?: StockData[];
  isLoading1: boolean;
  error1: any;
  isLoggedIn?: boolean;
  username?: string;
  showMarketOverview?: boolean;
}

export function MarketSlider({
  marketData,
  isLoading,
  error,
  isRefetching,
  onRefresh,
  stockList1,
  isLoading1,
  error1,
  isLoggedIn = true,
  username,
  showMarketOverview = true,
}: MarketSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Build slides array conditionally based on showMarketOverview prop
  const allSlides = [
    ...(showMarketOverview ? [{
      title: "Market Overview",
      component: (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Market Overview</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefetching}
              className="text-financial-blue hover:text-opacity-80 neon-hover-pc"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <div className="market-overview">
            <MarketOverview marketData={marketData} isLoading={isLoading} error={error} />
          </div>
        </div>
      )
    }] : []),
    {
      title: "My Stock List",
      component: (
        <div className="px-4">
          <StockListView listNumber={1} stocks={stockList1} isLoading={isLoading1} error={error1} isLoggedIn={isLoggedIn} username={username} />
        </div>
      )
    }
  ];

  const slides = allSlides;

  // Reset current slide if it's out of bounds when slides change
  useEffect(() => {
    if (currentSlide >= slides.length && slides.length > 0) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setTranslateX(0);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTranslateX(0);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTranslateX(0);
  };

  // Touch/Mouse handlers
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    
    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const threshold = 100; // minimum swipe distance
    
    if (Math.abs(translateX) > threshold) {
      if (translateX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    } else {
      setTranslateX(0);
    }
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
    e.preventDefault(); // Prevent scrolling
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleEnd();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Don't render anything if there are no slides
  if (slides.length === 0) {
    return null;
  }

  // If there's only one slide (market overview hidden), render it statically
  if (slides.length === 1) {
    return (
      <div className="relative select-none">
        <div className="w-full">
          {slides[0].component}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden select-none">
      {/* Slide Indicators - Only show if more than one slide */}
      {slides.length > 1 && (
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'bg-financial-blue scale-125' 
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                title={slides[index].title}
              />
            ))}
          </div>
        </div>
      )}

      {/* Slider Container */}
      <div
        ref={sliderRef}
        className="cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ userSelect: 'none' }}
      >
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{ 
            transform: `translateX(calc(-100% + ${translateX}px))`,
            transitionDuration: isDragging ? '0ms' : '300ms'
          }}
        >
          {/* Render slides with infinite loop effect */}
          {/* Previous slide for seamless loop */}
          <div 
            key={`prev-${(currentSlide - 1 + slides.length) % slides.length}`}
            className="w-full flex-shrink-0"
            style={{ userSelect: 'none', transform: 'translateX(-100%)' }}
          >
            {slides[(currentSlide - 1 + slides.length) % slides.length].component}
          </div>
          
          {/* Current slide */}
          <div 
            key={`current-${currentSlide}`}
            className="w-full flex-shrink-0"
            style={{ userSelect: 'none' }}
          >
            {slides[currentSlide].component}
          </div>
          
          {/* Next slide for seamless loop */}
          <div 
            key={`next-${(currentSlide + 1) % slides.length}`}
            className="w-full flex-shrink-0"
            style={{ userSelect: 'none' }}
          >
            {slides[(currentSlide + 1) % slides.length].component}
          </div>
        </div>
      </div>

      {/* Navigation hint - Only show if more than one slide */}
      {slides.length > 1 && (
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Use arrow keys or swipe to navigate • {currentSlide + 1} of {slides.length}
          </p>
        </div>
      )}
    </div>
  );
}