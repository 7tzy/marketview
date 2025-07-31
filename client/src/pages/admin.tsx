import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, UserPlus, Database, Key, LogOut, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  username: string;
  createdAt: string;
  userIP: string;
  location: string;
}

interface EncryptedData {
  encryptedData: string;
  decryptedData: any;
  encryptionKey: string;
}

export default function AdminPanel() {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [finnhubApiKey, setFinnhubApiKey] = useState('');
  const [alphaVantageApiKey, setAlphaVantageApiKey] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is admin on mount
  useEffect(() => {
    const checkAdminStatus = () => {
      const adminCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('Keeplogin_a='));
      
      if (adminCookie) {
        setIsAdmin(true);
      } else {
        // Not admin, redirect to home
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
      setIsChecking(false);
    };

    checkAdminStatus();
  }, []);

  const handleLogout = () => {
    document.cookie = 'Keeplogin_u=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'Keeplogin_a=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/';
  };

  const handleHome = () => {
    window.location.href = '/';
  };

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/auth/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/auth/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  // Fetch user data
  const { data: userData, refetch: refetchUserData } = useQuery({
    queryKey: ['/api/auth/admin/user-data'],
    queryFn: async () => {
      const response = await fetch('/api/auth/admin/user-data');
      if (!response.ok) throw new Error('Failed to fetch user data');
      return response.json();
    }
  });

  // Create user mutation
  const createUser = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await fetch('/api/auth/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/admin/user-data'] });
      setNewUsername('');
      setNewPassword('');
      toast({
        title: "Success",
        description: "User created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: async (username: string) => {
      const response = await fetch(`/api/auth/admin/users/${username}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/admin/user-data'] });
      toast({
        title: "Success",
        description: "User deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // API Key update mutation
  const updateApiKeys = useMutation({
    mutationFn: async ({ finnhubKey, alphaVantageKey }: { finnhubKey: string; alphaVantageKey: string }) => {
      const response = await fetch('/api/auth/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finnhubApiKey: finnhubKey, alphaVantageApiKey: alphaVantageKey })
      });
      if (!response.ok) throw new Error('Failed to update API keys');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "API keys updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    createUser.mutate({ username: newUsername, password: newPassword });
  };

  const handleUpdateApiKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finnhubApiKey && !alphaVantageApiKey) {
      toast({
        title: "Error",
        description: "Please provide at least one API key",
        variant: "destructive"
      });
      return;
    }
    updateApiKeys.mutate({ finnhubKey: finnhubApiKey, alphaVantageKey: alphaVantageApiKey });
  };

  // Show loading or redirect message if not admin
  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-slate-900 dark:text-white">Checking authorization...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-slate-900 dark:text-white mb-2">Redirecting you to home page...</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Admin access required</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-financial-champagne/20 text-financial-champagne border-financial-champagne">
              System Administrator
            </Badge>
            <Button 
              onClick={handleHome}
              variant="outline"
              size="sm"
              className="border-financial-champagne text-financial-champagne hover:bg-financial-champagne/10"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create User Form */}
            <form onSubmit={handleCreateUser} className="flex gap-2">
              <Input
                placeholder="Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="max-w-xs"
              />
              <Input
                type="text"
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="max-w-xs"
              />
              <Button 
                type="submit" 
                disabled={createUser.isPending}
                className="bg-financial-champagne hover:bg-financial-champagne/90"
              >
                {createUser.isPending ? "Creating..." : "Create User"}
              </Button>
            </form>

            {/* Users List */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Registered Users ({users.length})</h3>
              {usersLoading ? (
                <div className="text-slate-500">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="text-slate-500">No users found</div>
              ) : (
                <div className="grid gap-2">
                  {users.map((user: User) => (
                    <div key={user.username} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-slate-500">
                          Created: {new Date(user.createdAt).toLocaleString()} | 
                          IP: {user.userIP} | 
                          Location: {user.location}
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteUser.mutate(user.username)}
                        disabled={deleteUser.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* API Keys Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              API Keys Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Configure API keys for real-time market data. Both keys are optional, but at least one is required for market data functionality.
            </div>
            <form onSubmit={handleUpdateApiKeys} className="space-y-4">
              <div>
                <label htmlFor="finnhub-key" className="block text-sm font-medium mb-2">
                  Finnhub API Key
                </label>
                <Input
                  id="finnhub-key"
                  type="password"
                  placeholder="Enter Finnhub API key..."
                  value={finnhubApiKey}
                  onChange={(e) => setFinnhubApiKey(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Get your free API key from <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer" className="text-financial-champagne hover:underline">finnhub.io</a>
                </p>
              </div>
              
              <div>
                <label htmlFor="alpha-vantage-key" className="block text-sm font-medium mb-2">
                  Alpha Vantage API Key
                </label>
                <Input
                  id="alpha-vantage-key"
                  type="password"
                  placeholder="Enter Alpha Vantage API key..."
                  value={alphaVantageApiKey}
                  onChange={(e) => setAlphaVantageApiKey(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Get your free API key from <a href="https://www.alphavantage.co" target="_blank" rel="noopener noreferrer" className="text-financial-champagne hover:underline">alphavantage.co</a>
                </p>
              </div>
              
              <Button 
                type="submit" 
                disabled={updateApiKeys.isPending}
                className="bg-financial-champagne hover:bg-financial-champagne/90"
              >
                {updateApiKeys.isPending ? "Updating..." : "Update API Keys"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* User Data Viewer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              User Data Viewer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={() => refetchUserData()}
                variant="outline"
                className="border-financial-champagne text-financial-champagne hover:bg-financial-champagne/10"
              >
                Refresh Data
              </Button>
            </div>
            
            {userData && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">User Database</h4>
                  <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-sm overflow-auto max-h-64">
                    {JSON.stringify(userData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}