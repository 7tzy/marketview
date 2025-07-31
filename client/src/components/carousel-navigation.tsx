import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = "market" | "list1" | "list2" | "list3";

interface CarouselNavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function CarouselNavigation({ currentView, onViewChange }: CarouselNavigationProps) {
  const views: { mode: ViewMode; label: string }[] = [
    { mode: "market", label: "Market Overview" },
    { mode: "list1", label: "List 1" },
    { mode: "list2", label: "List 2" },
    { mode: "list3", label: "List 3" },
  ];

  const currentIndex = views.findIndex(v => v.mode === currentView);
  
  const handlePrevious = () => {
    const prevIndex = currentIndex === 0 ? views.length - 1 : currentIndex - 1;
    onViewChange(views[prevIndex].mode);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % views.length;
    onViewChange(views[nextIndex].mode);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePrevious}
        className="neon-hover-pc w-8 h-8 p-0"
        title="Previous view (Left Arrow)"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-1 min-w-0">
        {views.map((view, index) => (
          <button
            key={view.mode}
            onClick={() => onViewChange(view.mode)}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              currentView === view.mode 
                ? 'bg-financial-blue scale-125' 
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
            title={view.label}
          />
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleNext}
        className="neon-hover-pc w-8 h-8 p-0"
        title="Next view (Right Arrow)"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}