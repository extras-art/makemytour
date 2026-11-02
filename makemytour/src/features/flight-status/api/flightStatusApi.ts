import api from "@/api";
import { FlightStatusUpdate } from "../types/flightStatus.types";

/**
 * Fetch simulated live status for a single flight.
 */
export const fetchFlightStatus = async (flightId: number): Promise<FlightStatusUpdate> => {
  const response = await api.get<FlightStatusUpdate>(`/api/flight-status/${flightId}`);
  return response.data;
};

/**
 * Fetch live statuses for a batch of flight IDs in a single request.
 */
export const fetchBatchFlightStatus = async (flightIds: number[]): Promise<FlightStatusUpdate[]> => {
  if (!flightIds || flightIds.length === 0) {
    return [];
  }
  const response = await api.post<FlightStatusUpdate[]>("/api/flight-status/batch", { flightIds });
  return response.data;
};

/**
 * Force a simulated live state change for demonstration and push notification testing.
 */
export const simulateFlightStatusChange = async (flightId: number): Promise<FlightStatusUpdate> => {
  const response = await api.post<FlightStatusUpdate>(`/api/flight-status/${flightId}/simulate-change`);
  return response.data;
};

/**
 * Fetch live statuses for all available active flights.
 */
export const fetchAllFlightStatuses = async (): Promise<FlightStatusUpdate[]> => {
  const response = await api.get<FlightStatusUpdate[]>("/api/flight-status/all");
  return response.data;
};

