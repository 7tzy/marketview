import { useState } from "react";
import { User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginPopup } from "@/components/login-popup";

export function ProfileButton() {
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // Check if user is logged in by looking for login cookies
  const isLoggedIn = document.cookie.includes('Keeplogin_');

  const handleLogin = () => {
    setShowLoginPopup(true);
  };

  const handleLogout = () => {
    // Clear all login cookies
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name.startsWith('Keeplogin_')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    });
    window.location.reload();
  };

  const navigateToAdmin = () => {
    window.location.href = '/admin';
  };

  if (isLoggedIn) {
    const isAdmin = document.cookie.includes('Keeplogin_a=');
    
    return (
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateToAdmin}
            className="w-9 h-9 p-0 neon-hover-pc"
            title="Admin Panel"
          >
            <User className="h-4 w-4 text-blue-500" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-xs px-2 py-1 h-7"
          title="Logout"
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogin}
        className="w-9 h-9 p-0 neon-hover-pc"
        title="Login"
      >
        <LogIn className="h-4 w-4" />
      </Button>
      
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
      />
    </>
  );
}