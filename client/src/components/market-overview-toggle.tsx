import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface UserPreferences {
  showMarketOverview: boolean;
  showContent: boolean;
}

interface MarketOverviewToggleProps {
  onToggle?: (enabled: boolean) => void;
}

export function MarketOverviewToggle({ onToggle }: MarketOverviewToggleProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch user preferences
  const { data: preferences, isLoading } = useQuery<UserPreferences>({
    queryKey: ['/api/user-preferences'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation to update preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: { showMarketOverview: boolean; showContent: boolean }) => {
      const response = await fetch('/api/user-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPreferences),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-preferences'] });
      toast({
        title: "Preference Updated",
        description: "Market overview visibility setting saved.",
      });
    },
    onError: (error: any) => {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preference. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggle = () => {
    if (!preferences) return;
    
    const newShowMarketOverview = !preferences.showMarketOverview;
    updatePreferencesMutation.mutate({
      showMarketOverview: newShowMarketOverview,
      showContent: preferences.showContent
    });
    
    onToggle?.(newShowMarketOverview);
  };

  if (isLoading) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Eye className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      disabled={updatePreferencesMutation.isPending}
      title={preferences?.showMarketOverview ? "Hide Market Overview Tab" : "Show Market Overview Tab"}
    >
      {preferences?.showMarketOverview ? (
        <Eye className="h-4 w-4" />
      ) : (
        <EyeOff className="h-4 w-4" />
      )}
    </Button>
  );
}