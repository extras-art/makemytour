-- V2__production_upgrades.sql
-- Performance indexes and constraints for MakeMyTour production

-- Index for searching flights by origin, destination, and active status
CREATE INDEX idx_flights_route_active ON flights (source, destination, active);

-- Index for searching hotels by city and active status
CREATE INDEX idx_hotels_city_active ON hotels (city, active);

-- Index for querying user bookings in reverse chronological order
CREATE INDEX idx_bookings_user_created ON bookings (user_id, created_at DESC);

-- Unique index for idempotency lookup per user
CREATE INDEX idx_bookings_idempotency ON bookings (user_id, idempotency_key);

-- Index for admin audit logs query by created_at
CREATE INDEX idx_admin_audit_logs_created ON admin_audit_logs (created_at DESC);

