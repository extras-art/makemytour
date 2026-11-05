import axios from "axios";
import {
  PriceBreakdown,
  PriceHistoryEntry,
  PriceLockResponse,
  BatchBreakdownRequest,
} from "../types/pricing.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4040";

export const fetchPriceBreakdown = async (
  entityType: string,
  entityId: number
): Promise<PriceBreakdown> => {
  const response = await axios.get<PriceBreakdown>(
    `${API_BASE_URL}/api/pricing/${entityType.toLowerCase()}/${entityId}/breakdown`
  );
  return response.data;
};

export const fetchPriceHistory = async (
  entityType: string,
  entityId: number
): Promise<PriceHistoryEntry[]> => {
  const response = await axios.get<PriceHistoryEntry[]>(
    `${API_BASE_URL}/api/pricing/${entityType.toLowerCase()}/${entityId}/history`
  );
  return response.data;
};

export const fetchBatchBreakdown = async (
  req: BatchBreakdownRequest
): Promise<PriceBreakdown[]> => {
  const response = await axios.post<PriceBreakdown[]>(
    `${API_BASE_URL}/api/pricing/batch-breakdown`,
    req
  );
  return response.data;
};

export const createPriceLock = async (
  userId: number,
  entityType: string,
  entityId: number
): Promise<PriceLockResponse> => {
  const response = await axios.post<PriceLockResponse>(
    `${API_BASE_URL}/api/pricing/lock`,
    {
      userId,
      entityType: entityType.toUpperCase(),
      entityId,
    }
  );
  return response.data;
};

export const fetchActivePriceLock = async (
  userId: number,
  entityType: string,
  entityId: number
): Promise<PriceLockResponse | null> => {
  try {
    const response = await axios.get<PriceLockResponse>(
      `${API_BASE_URL}/api/pricing/lock/active`,
      {
        params: {
          userId,
          entityType: entityType.toUpperCase(),
          entityId,
        },
      }
    );
    if (response.status === 204 || !response.data) {
      return null;
    }
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 204) {
      return null;
    }
    return null;
  }
};

export const simulateDemandSurge = async (
  entityType: string,
  entityId: number
): Promise<PriceBreakdown> => {
  const response = await axios.post<PriceBreakdown>(
    `${API_BASE_URL}/api/pricing/${entityType.toLowerCase()}/${entityId}/simulate-surge`
  );
  return response.data;
};

