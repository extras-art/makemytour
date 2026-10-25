-- scripts/db-verify.sql
-- Health and integrity verification script for MakeMyTour database

SELECT 'Verifying tables in makemytour...' AS status;

-- 1. Check Table Counts
SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL
SELECT 'flights', COUNT(*) FROM flights
UNION ALL
SELECT 'hotels', COUNT(*) FROM hotels
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'admin_audit_logs', COUNT(*) FROM admin_audit_logs;

-- 2. Verify Referential Integrity (No Orphaned Bookings)
SELECT COUNT(*) AS orphaned_flight_bookings
FROM bookings
WHERE flight_id IS NOT NULL AND flight_id NOT IN (SELECT id FROM flights);

SELECT COUNT(*) AS orphaned_hotel_bookings
FROM bookings
WHERE hotel_id IS NOT NULL AND hotel_id NOT IN (SELECT id FROM hotels);

SELECT COUNT(*) AS orphaned_user_bookings
FROM bookings
WHERE user_id NOT IN (SELECT id FROM users);

-- 3. Verify Active Inventory
SELECT 'Active Flights' AS category, COUNT(*) AS count FROM flights WHERE active = TRUE
UNION ALL
SELECT 'Inactive Flights', COUNT(*) FROM flights WHERE active = FALSE
UNION ALL
SELECT 'Active Hotels', COUNT(*) FROM hotels WHERE active = TRUE
UNION ALL
SELECT 'Inactive Hotels', COUNT(*) FROM hotels WHERE active = FALSE;
