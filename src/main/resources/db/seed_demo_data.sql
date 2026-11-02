-- Seed demo suitable relatable data for MakeMyTour (Hotels and Flights only)

-- Ensure existing flight #1 and hotel #1 are set active
UPDATE flights SET active = b'1' WHERE id = 1;
UPDATE hotels SET active = b'1' WHERE id = 1;

-- Clean existing demo data if any beyond row 1 (safe with foreign key constraint)
-- Only delete rows not referenced by bookings
DELETE FROM flights WHERE id > 1 AND id NOT IN (SELECT flight_id FROM bookings WHERE flight_id IS NOT NULL);
DELETE FROM hotels WHERE id > 1 AND id NOT IN (SELECT hotel_id FROM bookings WHERE hotel_id IS NOT NULL);

-- ============================================================================
-- FLIGHTS INVENTORY
-- ============================================================================
INSERT INTO flights (airline, source, destination, departure_time, arrival_time, price, available_seats, active) VALUES
-- Delhi <-> Mumbai
('IndiGo 6E-204', 'Delhi', 'Mumbai', '2026-11-02 06:00:00', '2026-11-02 08:15:00', 4999.00, 45, b'1'),
('Air India AI-805', 'Delhi', 'Mumbai', '2026-11-02 09:30:00', '2026-11-02 11:45:00', 5650.00, 18, b'1'),
('Vistara UK-992', 'Delhi', 'Mumbai', '2026-11-02 17:15:00', '2026-11-02 19:35:00', 6400.00, 12, b'1'),
('Akasa Air QP-1108', 'Delhi', 'Mumbai', '2026-11-03 14:00:00', '2026-11-03 16:15:00', 4200.00, 5, b'1'),
('IndiGo 6E-5321', 'Mumbai', 'Delhi', '2026-11-02 07:45:00', '2026-11-02 10:00:00', 4850.00, 38, b'1'),
('Air India AI-102', 'Mumbai', 'Delhi', '2026-11-02 19:00:00', '2026-11-02 21:15:00', 5800.00, 24, b'1'),
('Vistara UK-835', 'Mumbai', 'Delhi', '2026-11-04 11:20:00', '2026-11-04 13:35:00', 6150.00, 8, b'1'),

-- Delhi <-> Bangalore
('IndiGo 6E-6184', 'Delhi', 'Bangalore', '2026-11-02 08:00:00', '2026-11-02 10:50:00', 6200.00, 50, b'1'),
('Vistara UK-817', 'Delhi', 'Bangalore', '2026-11-03 15:30:00', '2026-11-03 18:25:00', 7450.00, 15, b'1'),
('Air India AI-506', 'Delhi', 'Bangalore', '2026-11-05 20:00:00', '2026-11-05 22:55:00', 5890.00, 30, b'1'),
('Akasa Air QP-1302', 'Bangalore', 'Delhi', '2026-11-02 09:15:00', '2026-11-02 12:05:00', 5400.00, 22, b'1'),
('IndiGo 6E-2131', 'Bangalore', 'Delhi', '2026-11-03 18:45:00', '2026-11-03 21:35:00', 6100.00, 4, b'1'),

-- Mumbai <-> Goa
('SpiceJet SG-8169', 'Mumbai', 'Goa', '2026-11-02 11:00:00', '2026-11-02 12:15:00', 3299.00, 60, b'1'),
('IndiGo 6E-344', 'Mumbai', 'Goa', '2026-11-03 16:30:00', '2026-11-03 17:40:00', 3750.00, 14, b'1'),
('Akasa Air QP-1388', 'Mumbai', 'Goa', '2026-11-06 08:30:00', '2026-11-06 09:45:00', 2999.00, 3, b'1'),
('IndiGo 6E-345', 'Goa', 'Mumbai', '2026-11-04 18:30:00', '2026-11-04 19:45:00', 3500.00, 30, b'1'),

-- Delhi <-> Goa
('IndiGo 6E-632', 'Delhi', 'Goa', '2026-11-03 10:15:00', '2026-11-03 13:00:00', 5800.00, 40, b'1'),
('Vistara UK-847', 'Delhi', 'Goa', '2026-11-05 13:45:00', '2026-11-05 16:25:00', 7100.00, 19, b'1'),
('Air India AI-873', 'Goa', 'Delhi', '2026-11-06 17:00:00', '2026-11-06 19:40:00', 6450.00, 25, b'1'),

-- Bangalore <-> Mumbai
('Air India AI-678', 'Bangalore', 'Mumbai', '2026-11-02 12:30:00', '2026-11-02 14:15:00', 3850.00, 35, b'1'),
('IndiGo 6E-512', 'Bangalore', 'Mumbai', '2026-11-04 07:00:00', '2026-11-04 08:45:00', 4100.00, 55, b'1'),

-- Kolkata <-> Delhi
('Air India AI-763', 'Kolkata', 'Delhi', '2026-11-03 09:45:00', '2026-11-03 12:15:00', 5200.00, 28, b'1'),
('IndiGo 6E-208', 'Kolkata', 'Delhi', '2026-11-04 16:15:00', '2026-11-04 18:40:00', 4750.00, 42, b'1'),

-- Chennai <-> Mumbai
('IndiGo 6E-442', 'Chennai', 'Mumbai', '2026-11-02 14:15:00', '2026-11-02 16:15:00', 4300.00, 30, b'1'),
('Vistara UK-822', 'Chennai', 'Mumbai', '2026-11-04 20:10:00', '2026-11-04 22:10:00', 5100.00, 16, b'1'),

-- Hyderabad <-> Bangalore
('IndiGo 6E-548', 'Hyderabad', 'Bangalore', '2026-11-02 10:20:00', '2026-11-02 11:30:00', 2800.00, 48, b'1'),
('Akasa Air QP-1412', 'Hyderabad', 'Bangalore', '2026-11-03 17:00:00', '2026-11-03 18:10:00', 2450.00, 25, b'1'),

-- Regional & Tourist Destinations
('SpiceJet SG-2971', 'Delhi', 'Jaipur', '2026-11-02 06:45:00', '2026-11-02 07:40:00', 2199.00, 20, b'1'),
('IndiGo 6E-2553', 'Delhi', 'Srinagar', '2026-11-03 11:10:00', '2026-11-03 12:45:00', 6890.00, 18, b'1'),
('Air India AI-825', 'Delhi', 'Srinagar', '2026-11-05 13:15:00', '2026-11-05 14:50:00', 7400.00, 9, b'1'),
('IndiGo 6E-415', 'Kochi', 'Mumbai', '2026-11-04 09:00:00', '2026-11-04 11:05:00', 4200.00, 32, b'1'),
('Vistara UK-920', 'Ahmedabad', 'Delhi', '2026-11-03 15:00:00', '2026-11-03 16:30:00', 3600.00, 26, b'1'),
('Air India AI-850', 'Pune', 'Delhi', '2026-11-04 07:30:00', '2026-11-04 09:40:00', 4900.00, 22, b'1'),
('IndiGo 6E-2214', 'Varanasi', 'Delhi', '2026-11-04 18:00:00', '2026-11-04 19:30:00', 3800.00, 19, b'1'),

-- International Routes
('Emirates EK-501', 'Mumbai', 'Dubai', '2026-11-03 04:30:00', '2026-11-03 06:15:00', 14800.00, 72, b'1'),
('Air India AI-995', 'Mumbai', 'Dubai', '2026-11-05 18:30:00', '2026-11-05 20:20:00', 12400.00, 35, b'1'),
('Thai Airways TG-316', 'Delhi', 'Bangkok', '2026-11-04 23:30:00', '2026-11-05 05:25:00', 16500.00, 40, b'1'),
('Singapore Airlines SQ-403', 'Delhi', 'Singapore', '2026-11-05 21:55:00', '2026-11-06 06:10:00', 21900.00, 50, b'1');

-- ============================================================================
-- HOTELS INVENTORY
-- ============================================================================
INSERT INTO hotels (name, city, address, price_per_night, available_rooms, star_rating, active) VALUES
-- Mumbai
('The Taj Mahal Palace', 'Mumbai', 'Apollo Bunder, Colaba, Mumbai', 18500.00, 12, 5, b'1'),
('Trident Nariman Point', 'Mumbai', 'Nariman Point, Marine Drive, Mumbai', 11200.00, 18, 5, b'1'),
('JW Marriott Mumbai Juhu', 'Mumbai', 'Juhu Tara Road, Juhu, Mumbai', 14000.00, 8, 5, b'1'),
('Ginger Mumbai Andheri', 'Mumbai', 'Teli Gali, Andheri East, Mumbai', 3499.00, 25, 3, b'1'),
('Novotel Mumbai Juhu Beach', 'Mumbai', 'Balraj Sahani Marg, Juhu Beach, Mumbai', 9200.00, 15, 4, b'1'),

-- Delhi / NCR
('The Leela Palace New Delhi', 'Delhi', 'Diplomatic Enclave, Chanakyapuri, New Delhi', 19000.00, 10, 5, b'1'),
('ITC Maurya, A Luxury Collection Hotel', 'Delhi', 'Sardar Patel Marg, Diplomatic Enclave, New Delhi', 15500.00, 14, 5, b'1'),
('JW Marriott Hotel New Delhi Aerocity', 'Delhi', 'Asset Area 4, Hospitality District, Aerocity, New Delhi', 12800.00, 22, 5, b'1'),
('Radisson Blu Plaza Delhi Airport', 'Delhi', 'National Highway 8, Mahipalpur, New Delhi', 7500.00, 19, 4, b'1'),
('Bloomrooms @ Janpath', 'Delhi', '1 Janpath Lane, Connaught Place, New Delhi', 3800.00, 15, 3, b'1'),

-- Goa
('Taj Exotica Resort & Spa', 'Goa', 'Calwaddo, Benaulim, South Goa', 22000.00, 6, 5, b'1'),
('W Goa', 'Goa', 'Vagator Beach, Vagator, North Goa', 18900.00, 9, 5, b'1'),
('Grand Hyatt Goa', 'Goa', 'P.O. Goa University, Bambolim, North Goa', 13500.00, 16, 5, b'1'),
('Novotel Goa Resort & Spa', 'Goa', 'Pinto Waddo, Candolim, North Goa', 6800.00, 20, 4, b'1'),
('Fairfield by Marriott Goa Anjuna', 'Goa', 'Sim Vaddo, Anjuna, North Goa', 4200.00, 18, 3, b'1'),

-- Bangalore
('The Oberoi, Bengaluru', 'Bangalore', '37-39 MG Road, Bengaluru', 16500.00, 11, 5, b'1'),
('ITC Gardenia, A Luxury Collection Hotel', 'Bangalore', '1 Residency Road, Bengaluru', 13900.00, 15, 5, b'1'),
('The Chancery Pavilion', 'Bangalore', '135 Residency Road, Ashok Nagar, Bengaluru', 5200.00, 24, 4, b'1'),
('Treebo Trend Silver Key', 'Bangalore', 'Koramangala 5th Block, Bengaluru', 2600.00, 12, 3, b'1'),

-- Jaipur & Rajasthan
('Rambagh Palace', 'Jaipur', 'Bhawani Singh Road, Jaipur', 29500.00, 5, 5, b'1'),
('ITC Rajputana, A Luxury Collection Hotel', 'Jaipur', 'Palace Road, Gopalbari, Jaipur', 9800.00, 16, 5, b'1'),
('Lemon Tree Premier, Jaipur', 'Jaipur', 'Nirwan Marg, Bani Park, Jaipur', 4500.00, 20, 4, b'1'),
('Taj Lake Palace', 'Udaipur', 'Lake Pichola, Udaipur', 34000.00, 4, 5, b'1'),
('The Oberoi Udaivilas', 'Udaipur', 'Haridas Ji Ki Magri, Udaipur', 38000.00, 5, 5, b'1'),
('Radisson Blu Udaipur Palace Resort', 'Udaipur', 'Mallatalai, Ambamata, Udaipur', 8900.00, 14, 4, b'1'),

-- Hyderabad
('Taj Falaknuma Palace', 'Hyderabad', 'Engine Bowli, Falaknuma, Hyderabad', 28000.00, 6, 5, b'1'),
('ITC Kohenur, A Luxury Collection Hotel', 'Hyderabad', 'HITEC City, Madhapur, Hyderabad', 12500.00, 20, 5, b'1'),
('Park Hyatt Hyderabad', 'Hyderabad', 'Road No. 2, Banjara Hills, Hyderabad', 10200.00, 15, 5, b'1'),

-- Kolkata
('The Oberoi Grand', 'Kolkata', '15 Jawaharlal Nehru Road, New Market, Kolkata', 11500.00, 12, 5, b'1'),
('ITC Sonar, A Luxury Collection Hotel', 'Kolkata', '1 JBS Haldane Avenue, Kolkata', 8500.00, 18, 5, b'1'),

-- Chennai
('ITC Grand Chola', 'Chennai', '63 Mount Road, Guindy, Chennai', 12000.00, 25, 5, b'1'),
('Taj Club House', 'Chennai', 'No. 2 Club House Road, Anna Salai, Chennai', 7200.00, 14, 4, b'1'),

-- Hill Stations & North
('The Lalit Grand Palace Srinagar', 'Srinagar', 'Gupkar Road, Srinagar, Jammu and Kashmir', 16000.00, 8, 5, b'1'),
('The Khyber Himalayan Resort & Spa', 'Gulmarg', 'Gulmarg, Jammu and Kashmir', 24000.00, 5, 5, b'1'),
('Wildflower Hall, An Oberoi Resort', 'Shimla', 'Charabra, Shimla, Himachal Pradesh', 26000.00, 7, 5, b'1'),

-- Agra & Heritage
('The Oberoi Amarvilas', 'Agra', 'Taj East Gate Road, Agra', 32000.00, 7, 5, b'1'),
('ITC Mughal, A Luxury Collection Hotel', 'Agra', 'Fatehabad Road, Tajganj, Agra', 8200.00, 20, 5, b'1'),

-- South India & Coastal
('Grand Hyatt Kochi Bolgatty', 'Kochi', 'Mulavukad, Kochi, Kerala', 11000.00, 15, 5, b'1'),
('Brunton Boatyard - CGH Earth', 'Kochi', 'Calvathy Road, Fort Kochi, Kochi', 14500.00, 8, 5, b'1'),
('Taj Madikeri Resort & Spa', 'Coorg', '1st Monnangeri, Galibeedu, Coorg, Karnataka', 21000.00, 10, 5, b'1'),

-- International
('Atlantis, The Palm', 'Dubai', 'Crescent Road, The Palm Jumeirah, Dubai', 36000.00, 10, 5, b'1');

