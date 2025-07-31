import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

// Admin credentials - updated as requested
const ADMIN_CREDENTIALS = [
  { username: 'admin11', password: 'mview1' },
  { username: 'admin77', password: 'mview0' }
];

// Get user data from simple JSON file
function getUserData(): any {
  const filePath = path.join(process.cwd(), 'server/data/userdata/users/logindata.json');
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading user data:', error);
  }
  return { users: [] };
}

// Save user data to simple JSON file
function saveUserData(data: any): void {
  const filePath = path.join(process.cwd(), 'server/data/userdata/users/logindata.json');
  const dirPath = path.dirname(filePath);
  
  try {
    // Ensure directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

// Get user's personal data from their folder
function getUserPersonalData(username: string): any {
  const userDir = path.join(process.cwd(), 'server/data/userdata', `${username}_data`);
  const lists: Record<string, any> = {};
  
  try {
    for (let i = 1; i <= 3; i++) {
      const listPath = path.join(userDir, `list${i}.json`);
      if (fs.existsSync(listPath)) {
        const listData = fs.readFileSync(listPath, 'utf8');
        lists[`list${i}`] = JSON.parse(listData);
      }
    }
  } catch (error) {
    console.error('Error reading user personal data:', error);
  }
  
  return lists;
}

// Create user account info with location
async function getLocationFromIP(ip: string): Promise<string> {
  try {
    // For demo purposes, return "Unknown" - in production you'd use a geolocation service
    return "Unknown";
  } catch {
    return "Unknown";
  }
}

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password, isSignUp, isAdmin, rememberMe } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (isAdmin) {
      // Admin login check with new credentials
      const validAdmin = ADMIN_CREDENTIALS.find(admin => 
        admin.username === username && admin.password === password
      );
      
      if (validAdmin) {
        const maxAge = rememberMe ? 2 * 24 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000; // 2 days if remember me, 12 hours otherwise
        res.json({ 
          success: true, 
          message: 'Admin login successful',
          isAdmin: true,
          maxAge 
        });
      } else {
        res.status(401).json({ error: 'Invalid admin credentials' });
      }
      return;
    }

    const userData = getUserData();

    if (isSignUp) {
      // Check if user already exists
      const existingUser = userData.users.find((u: any) => u.username === username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Get user IP and location info
      const userIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'Unknown';
      const location = await getLocationFromIP(userIP.toString());
      const createdAt = new Date().toISOString();

      // Create new user
      const newUser = {
        username,
        password, // In production, you'd hash this
        createdAt,
        userIP: userIP.toString(),
        location
      };

      userData.users.push(newUser);
      saveUserData(userData);

      // Create user data folder
      await createUserDataFolder(username, createdAt, userIP.toString(), location);

      res.json({ success: true, message: 'Account created successfully' });
    } else {
      // Login existing user - ensure exact username/password match
      const user = userData.users.find((u: any) => u.username === username && u.password === password);
      if (user) {
        const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000; // 30 days if remember me, 12 hours otherwise
        res.json({ 
          success: true, 
          message: 'Login successful',
          isAdmin: false,
          maxAge,
          userData: getUserPersonalData(username)
        });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Create user data folder with required files in users subfolder
async function createUserDataFolder(username: string, createdAt: string, userIP: string, location: string) {
  const userDataDir = path.join(process.cwd(), 'server/data/userdata/users', `${username}_data`);
  
  try {
    // Create the directory
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }
    
    // Create empty list file (only list1 for personal watch list)
    fs.writeFileSync(path.join(userDataDir, 'list1.json'), JSON.stringify([], null, 2));
    
    // Create [username]_list_info file for list 1 (watch list)
    const listInfo = {
      listName: `${username}'s watch list`,
      listType: "watchlist",
      createdAt: createdAt,
      lastModified: createdAt,
      description: `Personal watch list for ${username}`
    };
    fs.writeFileSync(path.join(userDataDir, `${username}_list_info.json`), JSON.stringify(listInfo, null, 2));
    
    // Create account info file with exact format requested
    const accountInfo = `Account Created: ${createdAt}
IP Address: ${userIP}
City: ${location}
Username: ${username}`;
    
    fs.writeFileSync(path.join(userDataDir, 'account_info.txt'), accountInfo);
  } catch (error) {
    console.error('Error creating user data folder:', error);
  }
}

// Admin endpoints for user management
router.get('/admin/users', async (req, res) => {
  try {
    const userData = getUserData();
    res.json(userData.users.map((user: any) => ({
      username: user.username,
      createdAt: user.createdAt,
      userIP: user.userIP,
      location: user.location
    })));
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Admin endpoint to view user data
router.get('/admin/user-data', async (req, res) => {
  try {
    const userData = getUserData();
    res.json(userData);
  } catch (error) {
    console.error('Error reading user data:', error);
    res.status(500).json({ error: 'Failed to read user data' });
  }
});

// Admin endpoint to create users
router.post('/admin/users', async (req, res) => {
  try {
    const { username, password } = req.body;
    const userData = getUserData();

    const existingUser = userData.users.find((u: any) => u.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const createdAt = new Date().toISOString();
    const userIP = 'Admin Created';
    const location = 'Admin';

    const newUser = {
      username,
      password,
      createdAt,
      userIP,
      location
    };

    userData.users.push(newUser);
    saveUserData(userData);

    await createUserDataFolder(username, createdAt, userIP, location);

    res.json({ success: true, message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Admin endpoint to delete users
router.delete('/admin/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const userData = getUserData();

    const userIndex = userData.users.findIndex((u: any) => u.username === username);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove user from data
    userData.users.splice(userIndex, 1);
    saveUserData(userData);

    // Move user data to old_userdata archive
    const userDataDir = path.join(process.cwd(), 'server/data/userdata/users', `${username}_data`);
    const oldUserdataDir = path.join(process.cwd(), 'server/data/userdata/old_userdata');
    const archivedUserDir = path.join(oldUserdataDir, `${username}_data_${Date.now()}`);
    
    // Ensure old_userdata directory exists
    if (!fs.existsSync(oldUserdataDir)) {
      fs.mkdirSync(oldUserdataDir, { recursive: true });
    }
    
    // Move user data to archive instead of deleting
    if (fs.existsSync(userDataDir)) {
      fs.renameSync(userDataDir, archivedUserDir);
    }

    res.json({ success: true, message: 'User deleted and data archived successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Admin endpoint to update API keys
router.post('/admin/api-keys', async (req, res) => {
  try {
    const { saveApiConfig } = require('./config-loader');
    const { finnhubApiKey, alphaVantageApiKey } = req.body;
    
    const config = {
      ...(finnhubApiKey && { finnhubApiKey }),
      ...(alphaVantageApiKey && { alphaVantageApiKey }),
      lastUpdated: new Date().toISOString()
    };
    
    saveApiConfig(config);
    
    res.json({ 
      success: true, 
      message: 'API keys updated and saved successfully' 
    });
  } catch (error) {
    console.error('Error saving API keys:', error);
    res.status(500).json({ error: 'Failed to save API keys' });
  }
});

export default router;