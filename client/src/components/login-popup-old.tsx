import { useState, useEffect } from "react";
import { X, User, Eye, EyeOff, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
        setIsAdmin(!!adminCookie);
      }
    }
  }, [isOpen]);

  // Countdown timer when logged in
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoggedIn && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isLoggedIn && countdown === 0) {
      onClose();
    }
    return () => clearTimeout(timer);
  }, [isLoggedIn, countdown, onClose]);

  const handleLogin = async () => {
    setIsLoading(true);

    // Admin account validation
    if (isAdmin) {
      const validAdmins = {
        'admin11': 'mview1',
        'admin77': 'mview0'
      };

      if (validAdmins[username as keyof typeof validAdmins] === password) {
        // Clear any existing user cookie
        document.cookie = 'Keeplogin_u=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        if (rememberMe) {
          // Set admin cookie for 48 hours
          const expires = new Date(Date.now() + 48 * 60 * 60 * 1000).toUTCString();
          document.cookie = `Keeplogin_a=${username}; expires=${expires}; path=/`;
        }

        setIsLoggedIn(true);
        setCurrentUser(username);
        setCountdown(5);

        toast({
          title: "Login successful",
          description: "Welcome, Administrator!",
          className: "bg-success-green text-white",
        });
      } else {
        toast({
          title: "Login failed",
          description: "Invalid admin credentials",
          variant: "destructive",
        });
      }
    } else {
      // Regular user login - would check encrypted file in real implementation
      // For now, just demonstrate the flow
      if (username && password) {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, isSignUp })
          });

          if (response.ok) {
            if (rememberMe) {
              const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
              document.cookie = `Keeplogin_u=${username}; expires=${expires}; path=/`;
            }

            setIsLoggedIn(true);
            setCurrentUser(username);
            setCountdown(5);

            toast({
              title: "Login successful",
              description: `Welcome, ${username}!`,
              className: "bg-success-green text-white",
            });
          } else {
            toast({
              title: "Login failed",
              description: "Invalid credentials",
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: "Login failed",
            description: "Unable to connect to server",
            variant: "destructive",
          });
        }
      }
    }

    setIsLoading(false);
  };

  const handleDashboard = () => {
    // Would open dashboard popup in real implementation
    toast({
      title: "Dashboard",
      description: "Dashboard functionality would open here",
    });
  };

  const handleAdminPage = () => {
    // Navigate to admin page
    window.location.href = '/admin';
  };

  const handleLogout = () => {
    document.cookie = 'Keeplogin_u=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'Keeplogin_a=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setIsLoggedIn(false);
    setCurrentUser("");
    setIsAdmin(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Enhanced Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">
            {isLoggedIn ? `Hello, ${currentUser}` : "Login"}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          {isLoggedIn ? (
            <div className="space-y-4">
              <Button 
                onClick={handleDashboard}
                className="w-full"
              >
                Dashboard
              </Button>
              
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                Close ({countdown}s)
              </Button>
              
              {isAdmin && (
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
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="signup" 
                    checked={isSignUp}
                    onCheckedChange={(checked) => setIsSignUp(checked as boolean)}
                  />
                  <Label htmlFor="signup">Sign Up</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="admin" 
                    checked={isAdmin}
                    onCheckedChange={(checked) => setIsAdmin(checked as boolean)}
                  />
                  <Label htmlFor="admin">Admin</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember">Remember Me</Label>
                </div>
              </div>
              
              <Button 
                onClick={handleLogin}
                disabled={isLoading || !username || !password}
                className="w-full login-button"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}