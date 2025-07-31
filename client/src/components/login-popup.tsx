import { useState, useEffect } from "react";
import { X, Eye, EyeOff, Settings, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginPopup({ isOpen, onClose }: LoginPopupProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const userCookie = document.cookie.split(';').find(c => c.trim().startsWith('Keeplogin_u='));
    const adminCookie = document.cookie.split(';').find(c => c.trim().startsWith('Keeplogin_a='));
    
    if (userCookie || adminCookie) {
      const cookieValue = userCookie ? userCookie.split('=')[1] : adminCookie?.split('=')[1];
      if (cookieValue) {
        setIsLoggedIn(true);
        setCurrentUser(cookieValue);
      }
    }
  }, [isOpen]);

  // Auto-close countdown for logged in users
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoggedIn && isOpen) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            onClose();
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLoggedIn, isOpen, onClose]);

  const handleSubmit = async () => {
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          isSignUp,
          isAdmin,
          rememberMe
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message,
          className: "bg-success-green text-white",
        });

        if (!isSignUp) {
          // Set login cookie with proper duration
          const cookieName = data.isAdmin ? 'Keeplogin_a' : 'Keeplogin_u';
          const maxAge = data.maxAge || 86400; // Default 24 hours
          document.cookie = `${cookieName}=${username}; path=/; max-age=${maxAge / 1000}`;
          
          setIsLoggedIn(true);
          setCurrentUser(username);
          
          // Redirect to admin panel if admin login
          if (data.isAdmin) {
            setTimeout(() => {
              window.location.href = '/admin';
            }, 1000);
          } else {
            // Auto-refresh user data after login for regular users
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }

          /* IDLE REFRESH LOGIN
          // Alternative implementation for auto-refresh after login
          // This code will refresh the page immediately after successful login
          // to update all user-specific information on the front page
          if (!data.isAdmin) {
            // Force refresh to show logged-in user's data
            window.location.reload();
          }
          */
        }

        setUsername("");
        setPassword("");
        setCountdown(5);
        
        if (isSignUp) {
          setIsSignUp(false);
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Authentication failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to connect to server",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    document.cookie = 'Keeplogin_u=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'Keeplogin_a=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setIsLoggedIn(false);
    setCurrentUser("");
    onClose();
    window.location.reload();
  };

  const handleAdminPage = () => {
    window.location.href = '/admin';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Enhanced Backdrop */}
      <div 
        className="absolute inset-0 enhanced-backdrop-blur"
        onClick={onClose}
      />
      
      {/* Popup - Perfectly centered */}
      <Card className="relative w-full max-w-md glass-card transform-none z-[10000]"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}>
        <CardHeader className="text-center">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAdmin(!isAdmin)}
                className={`neon-hover-pc p-2 ${isAdmin ? 'bg-financial-blue/20' : ''}`}
                title="Admin Login"
              >
                <Settings className={`h-4 w-4 ${isAdmin ? 'text-financial-blue' : 'text-gray-400'}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRememberMe(!rememberMe)}
                className={`neon-hover-pc p-2 ${rememberMe ? 'bg-financial-blue/20' : ''}`}
                title="Remember Me"
              >
                <Check className={`h-4 w-4 ${rememberMe ? 'text-financial-blue' : 'text-gray-400'}`} />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="neon-hover-pc p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold">
            {isLoggedIn ? `Hello, ${currentUser}` : (isSignUp ? "Sign Up" : (isAdmin ? "Admin Login" : "Login"))}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {isLoggedIn ? (
            <div className="space-y-4">
              <div className="text-center text-green-600 dark:text-green-400">
                ✓ Successfully logged in
              </div>
              
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                Logout ({countdown}s)
              </Button>
              
              {document.cookie.includes('Keeplogin_a=') && (
                <Button 
                  onClick={handleAdminPage}
                  className="w-full bg-financial-blue hover:bg-financial-blue/80"
                >
                  ADMIN PAGE
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="glass-card"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="glass-card pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-financial-blue hover:bg-financial-blue/80 neon-hover-pc"
              >
                {isLoading ? "Please wait..." : (isSignUp ? "Create Account" : "Login")}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-financial-blue hover:underline"
                >
                  {isSignUp ? "Already registered? Log in" : "Not registered? Create an account"}
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}