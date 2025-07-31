import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = "market" | "list1" | "list2" | "list3";

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const viewLabels: Record<ViewMode, string> = {
  market: "Market Overview",
  list1: "List 1",
  list2: "List 2", 
  list3: "List 3"
};

const viewCycle: ViewMode[] = ["market", "list1", "list2", "list3"];

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  const handleToggle = () => {
    const currentIndex = viewCycle.indexOf(currentView);
    const nextIndex = (currentIndex + 1) % viewCycle.length;
    onViewChange(viewCycle[nextIndex]);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="h-9 px-3 neon-hover hover:scale-105 transition-all duration-300 view-toggle-button"
      title={`Switch to ${viewLabels[viewCycle[(viewCycle.indexOf(currentView) + 1) % viewCycle.length]]}`}
    >
      <RotateCcw className="h-4 w-4 mr-2" />
      <span className="text-sm font-medium">{viewLabels[currentView]}</span>
    </Button>
  );
}