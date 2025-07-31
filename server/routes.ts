import type { Express } from "express";
import { createServer, type Server } from "http";
import { marketDataSchema } from "@shared/schema";
import authRoutes from "./routes-auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Offline market data endpoint - returns offline message
  app.get("/api/market-data", async (req, res) => {
    res.status(503).json({ 
      error: "Offline mode",
      message: "You are offline, please go online to use Market Overview"
    });
  });

  // Offline stock list routes - return offline message
  app.get('/api/stock-lists/:listNumber', async (req, res) => {
    res.status(503).json({ 
      error: "Offline mode", 
      message: "You are offline, please go online to use Your Lists" 
    });
  });

  app.post('/api/stock-lists/:listNumber', async (req, res) => {
    res.status(503).json({ 
      error: "Offline mode", 
      message: "You are offline, please go online to use Your Lists" 
    });
  });

  // Offline random stock endpoint - return offline message  
  app.get('/api/random-stock/:symbol', async (req, res) => {
    res.status(503).json({ 
      error: "Offline mode", 
      message: "You are offline, please go online to use stock data" 
    });
  });

  // Offline user stock list endpoint - return offline message
  app.get('/api/user-stock-list', async (req, res) => {
    const userCookie = req.cookies?.Keeplogin_u;
    if (!userCookie) {
      return res.status(401).json({ error: 'Not logged in' });
    }
    
    res.status(503).json({ 
      error: "Offline mode", 
      message: "You are offline, please go online to use Your Lists" 
    });
  });

  app.post('/api/user-stock-list', async (req, res) => {
    const userCookie = req.cookies?.Keeplogin_u;
    if (!userCookie) {
      return res.status(401).json({ error: 'Not logged in' });
    }
    
    res.status(503).json({ 
      error: "Offline mode", 
      message: "You are offline, please go online to use Your Lists" 
    });
  });

  app.delete('/api/user-stock-list', async (req, res) => {
    const userCookie = req.cookies?.Keeplogin_u;
    if (!userCookie) {
      return res.status(401).json({ error: 'Not logged in' });
    }
    
    res.status(503).json({ 
      error: "Offline mode", 
      message: "You are offline, please go online to use Your Lists" 
    });
  });

  // Remove individual ticker from user's list - offline mode
  app.delete('/api/user-stock-list/:ticker', async (req, res) => {
    const userCookie = req.cookies?.Keeplogin_u;
    if (!userCookie) {
      return res.status(401).json({ error: 'Not logged in' });
    }
    
    res.status(503).json({ 
      error: "Offline mode", 
      message: "You are offline, please go online to use Your Lists" 
    });
  });

  // User preferences endpoints
  app.get('/api/user-preferences', async (req, res) => {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      // Get user from cookie
      const userCookie = req.cookies?.Keeplogin_u;
      if (!userCookie) {
        // Return default preferences for non-logged in users
        return res.json({
          showMarketOverview: true,
          showContent: true
        });
      }
      
      const username = userCookie;
      const userDataPath = path.join(process.cwd(), 'server/data/userdata/users', `${username}_data`);
      const preferencesPath = path.join(userDataPath, 'preferences.json');
      
      try {
        const rawData = fs.readFileSync(preferencesPath, 'utf8');
        const preferences = JSON.parse(rawData);
        res.json(preferences);
      } catch (fileError) {
        // File doesn't exist, return default preferences
        const defaultPreferences = {
          showMarketOverview: true,
          showContent: true
        };
        res.json(defaultPreferences);
      }
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ error: "Failed to fetch user preferences" });
    }
  });

  app.post('/api/user-preferences', async (req, res) => {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      // Get user from cookie
      const userCookie = req.cookies?.Keeplogin_u;
      if (!userCookie) {
        return res.status(401).json({ error: 'Not logged in' });
      }
      
      const { showMarketOverview, showContent } = req.body;
      
      if (typeof showMarketOverview !== 'boolean' || typeof showContent !== 'boolean') {
        return res.status(400).json({ error: 'Invalid preference values' });
      }
      
      const username = userCookie;
      const userDataPath = path.join(process.cwd(), 'server/data/userdata/users', `${username}_data`);
      const preferencesPath = path.join(userDataPath, 'preferences.json');
      
      // Ensure user directory exists
      if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true });
      }
      
      const preferences = {
        username,
        showMarketOverview,
        showContent,
        lastUpdated: new Date().toISOString()
      };
      
      fs.writeFileSync(preferencesPath, JSON.stringify(preferences, null, 2));
      
      res.json({ success: true, message: 'Preferences saved successfully' });
    } catch (error) {
      console.error("Error saving user preferences:", error);
      res.status(500).json({ error: "Failed to save user preferences" });
    }
  });

  // Auth routes
  app.use('/api/auth', authRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
