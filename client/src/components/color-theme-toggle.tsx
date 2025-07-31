import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function ColorThemeToggle() {
  const [isColorsEnabled, setIsColorsEnabled] = useState(false);
  const [isLuxury, setIsLuxury] = useState(false);

  useEffect(() => {
    const colorsEnabled = localStorage.getItem("colors-enabled") === "true";
    const luxuryEnabled = localStorage.getItem("luxury-theme") === "true";
    
    setIsColorsEnabled(colorsEnabled);
    setIsLuxury(luxuryEnabled);
    
    // Apply the appropriate classes
    if (colorsEnabled) {
      document.documentElement.classList.add("colors-enabled");
      if (luxuryEnabled) {
        document.documentElement.classList.add("luxury-theme");
      } else {
        document.documentElement.classList.remove("luxury-theme");
      }
    } else {
      document.documentElement.classList.remove("colors-enabled", "luxury-theme");
    }
  }, []);

  const toggleColorTheme = () => {
    if (!isColorsEnabled) {
      // First click: enable colors with green theme
      setIsColorsEnabled(true);
      setIsLuxury(false);
      localStorage.setItem("colors-enabled", "true");
      localStorage.setItem("luxury-theme", "false");
      document.documentElement.classList.add("colors-enabled");
      document.documentElement.classList.remove("luxury-theme");
    } else if (!isLuxury) {
      // Second click: switch to luxury (champagne) theme
      setIsLuxury(true);
      localStorage.setItem("luxury-theme", "true");
      document.documentElement.classList.add("luxury-theme");
    } else {
      // Third click: disable colors completely
      setIsColorsEnabled(false);
      setIsLuxury(false);
      localStorage.setItem("colors-enabled", "false");
      localStorage.setItem("luxury-theme", "false");
      document.documentElement.classList.remove("colors-enabled", "luxury-theme");
    }
  };

  const getButtonState = () => {
    if (!isColorsEnabled) {
      return { text: "Enable Hover Colors", color: "text-gray-400" };
    } else if (!isLuxury) {
      return { text: "Switch to Luxury Theme", color: "text-green-400" };
    } else {
      return { text: "Disable Hover Colors", color: "text-yellow-400" };
    }
  };

  const buttonState = getButtonState();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleColorTheme}
      className="w-9 h-9 p-0"
      title={buttonState.text}
    >
      <Palette className={`h-4 w-4 transition-colors ${buttonState.color}`} />
      <span className="sr-only">Toggle color theme</span>
    </Button>
  );
}