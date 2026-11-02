export type FlightStatusEnum =
  | "ON_TIME"
  | "BOARDING"
  | "DELAYED"
  | "IN_AIR"
  | "LANDED";

export interface FlightStatusUpdate {
  flightId: number;
  airline: string;
  source: string;
  destination: string;
  status: FlightStatusEnum;
  statusDisplay: string;
  terminal: string;
  gate: string;
  delayMinutes: number;
  delayReason?: string | null;
  originalDeparture: string;
  revisedDeparture: string;
  originalArrival: string;
  estimatedArrival: string;
  progressPercentage: number;
  lastUpdatedTimestamp: string;
}

export interface FlightNotification {
  id: string;
  flightId: number;
  airline: string;
  route: string;
  oldStatus?: FlightStatusEnum | string;
  newStatus: FlightStatusEnum | string;
  statusDisplay: string;
  delayMinutes?: number;
  delayReason?: string | null;
  estimatedArrival?: string;
  timestamp: string;
  read: boolean;
}

export interface FlightTrackerState {
  trackedFlightIds: number[];
  statuses: Record<number, FlightStatusUpdate>;
  notifications: FlightNotification[];
  notificationsEnabled: boolean;
  loading: boolean;
  lastPolledAt: string | null;
  isFlightHomeActive: boolean;
}

