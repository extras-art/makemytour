export interface PriceBreakdown {
  entityId: number;
  entityType: string;
  basePrice: number;
  finalPrice: number;
  lowestPrice30d: number;
  highestPrice30d: number;
  demandMultiplierPct: number;
  seasonalMultiplierPct: number;
  scarcityMultiplierPct: number;
  timeHorizonMultiplierPct: number;
  activeRuleBadges: string[];
  explanationSummary: string;
}

export interface PriceHistoryEntry {
  id: number;
  entityType: string;
  entityId: number;
  recordedPrice: number;
  basePrice: number;
  primaryReason: string;
  recordedAt: string;
}

export interface PriceLockResponse {
  lockId: string;
  entityId: number;
  entityType: string;
  lockedPrice: number;
  expiresAt: string;
  remainingSeconds: number;
}

export interface BatchBreakdownRequest {
  entityType: string;
  entityIds: number[];
}

