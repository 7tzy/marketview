import { type MarketData } from "@shared/schema";

export interface IStorage {
  // No persistent storage needed for market data
}

export class MemStorage implements IStorage {
  constructor() {
    // No storage needed for this application
  }
}

export const storage = new MemStorage();
