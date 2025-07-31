import * as fs from 'fs';
import * as path from 'path';

interface ApiConfig {
  finnhubApiKey?: string;
  alphaVantageApiKey?: string;
  lastUpdated?: string;
}

const CONFIG_PATH = path.join(process.cwd(), 'server/data/api-config.json');

export function loadApiConfig(): ApiConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf8');
      const config = JSON.parse(data);
      
      // Load saved API keys into environment variables
      if (config.finnhubApiKey) {
        process.env.FINNHUB_API_KEY = config.finnhubApiKey;
      }
      if (config.alphaVantageApiKey) {
        process.env.ALPHA_VANTAGE_API_KEY = config.alphaVantageApiKey;
      }
      
      return config;
    }
  } catch (error) {
    console.error('Error loading API config:', error);
  }
  
  return {};
}

export function saveApiConfig(config: ApiConfig): void {
  try {
    const configDir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    
    // Update environment variables immediately
    if (config.finnhubApiKey) {
      process.env.FINNHUB_API_KEY = config.finnhubApiKey;
    }
    if (config.alphaVantageApiKey) {
      process.env.ALPHA_VANTAGE_API_KEY = config.alphaVantageApiKey;
    }
  } catch (error) {
    console.error('Error saving API config:', error);
    throw error;
  }
}