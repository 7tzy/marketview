import { z } from "zod";

export const marketIndexSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  value: z.number(),
  change: z.number(),
  changePercent: z.number(),
  lastUpdated: z.string(),
});

export const marketDataSchema = z.object({
  sp500: marketIndexSchema,
  dowJones: marketIndexSchema,
  nasdaq: marketIndexSchema,
  lastRefresh: z.string(),
});

export const userPreferencesSchema = z.object({
  username: z.string(),
  showMarketOverview: z.boolean().default(true),
  showContent: z.boolean().default(true), // Controls watchlist and market overview entirely
});

export type MarketIndex = z.infer<typeof marketIndexSchema>;
export type MarketData = z.infer<typeof marketDataSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export interface IStorage {
  // No persistent storage needed for this application
}
