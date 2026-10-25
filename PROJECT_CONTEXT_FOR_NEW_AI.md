# MAKEMYTOUR — PORTABLE CONTEXT FOR AI ASSISTANTS

> **Paste this document into any new AI conversation to immediately provide complete, technically verified context about the MakeMyTour repository.**

---

## 1. Executive Summary & Architecture

- **Project:** MakeMyTour (Full-stack travel booking application inspired by MakeMyTrip).
- **Frontend:** Next.js 15.1.4 (Pages Router), React 19, TypeScript, Tailwind CSS, Redux Toolkit, Axios. Location: `./makemytour/` (runs on `http://localhost:3000`).
- **Backend:** Spring Boot 3.4.1 (Java 17), Spring Data JPA, Hibernate, Spring Security (BCrypt), Maven. Location: `./` (runs on `http://localhost:4040`).
- **Database:** MySQL 8 (`makemytour` database on `localhost:3306`).
- **Active API Client:** `makemytour/src/api/index.ts` connecting to `http://localhost:4040`.

---

## 2. Key Data Models (Backend JPA Entities)

### `Users` (`app_users` table)
- `id` (Long, PK)
- `email` (String, unique)
- `name` (String, full name)
- `password` (String, BCrypt hashed, write-only in JSON)
- `phone` (String, optional)

### `Flight` (`flights` table)
- `id` (Long, PK)
- `airline` (String, e.g. "IndiGo")
- `source` (String, departure city)
- `destination` (String, arrival city)
- `departureTime` / `arrivalTime` (LocalDateTime)
- `price` (BigDecimal)
- `availableSeats` (Integer)

### `Hotel` (`hotels` table)
- `id` (Long, PK)
- `name` (String)
- `city` (String)
- `address` (String)
- `availableRooms` (Integer)
- `starRating` (Integer)
- `pricePerNight` (BigDecimal)

### `Booking` (`bookings` table)
- `id` (Long, PK)
- `user` (Users, non-null FK `user_id`)
- `flight` (Flight, optional FK `flight_id`)
- `hotel` (Hotel, optional FK `hotel_id`)
- `status` (String, default "CONFIRMED")
- `totalPrice` (BigDecimal)
- `createdAt` (LocalDateTime, default now)

---

## 3. Verified Backend Endpoints (Port 4040)

- `GET /api/health` -> `{"status":"UP"}`
- `POST /api/users/register` -> Body: `{ name, email, password, phone }` -> Returns created `Users` entity.
- `GET /api/users` -> Returns list of all users without password hashes.
- `GET /api/flights` -> Returns list of all flights.
- `GET /api/hotels` -> Returns list of all hotels.
- `POST /api/bookings` -> Body: `{ userId, flightId?, hotelId? }` -> Returns created `Booking` entity.
- `GET /api/bookings/user/{userId}` -> Returns list of bookings for the given user.
- `PATCH /api/bookings/{id}/cancel` -> Sets booking status to `CANCELLED`.

---

## 4. Frontend State & Mappings

### Redux Store (`makemytour/src/store/index.js`)
- Slice: `user` (`state.user.user`).
- Persists to `localStorage` on `setUser(data)`.

### Field Mapping Rules
- Backend uses `airline`, `source`, `destination` -> Frontend `src/api/index.ts:getflight()` maps to `flightName`, `from`, `to`.
- Backend uses `name`, `city` -> Frontend `src/api/index.ts:gethotel()` maps to `hotelName`, `location`.
- Backend returns `name`, `phone` -> Frontend profile page (`src/pages/profile/index.tsx`) safely checks both `name` (split) and `firstName`/`lastName`, and both `phone` and `phoneNumber`.

---

## 5. Critical Lifecycle & Business Rules

1. **Booking Creation:**
   - Client calls `handleflightbooking` or `handlehotelbooking` -> `POST /api/bookings`.
   - Backend `BookingService` verifies user and flight/hotel existence, sets `totalPrice = flight.price`, sets `status = "CONFIRMED"`, and saves to MySQL.
2. **Payment Is NOT Implemented:**
   - Clicking "Proceed to Payment" immediately creates a `CONFIRMED` booking in MySQL.
   - There is no payment gateway integration.
   - The UI correctly displays `"Payment status unavailable"` instead of `"Paid"`.
3. **Login Is NOT Implemented:**
   - The backend only has `/api/users/register`.
   - Registering a user immediately stores them in Redux and logs them in for that session.

---

## 6. Known Bugs & Implementation Status

| Bug / Feature | Status | Location & Details |
|---|---|---|
| Flight selection route ID matching | **FIXED** | `makemytour/src/pages/book-flight/[id]/index.tsx` checks `router.isReady` and compares IDs as strings. |
| Booking creation crash on `user.bookings` | **FIXED (Flight)** | `makemytour/src/pages/book-flight/[id]/index.tsx` uses `[...(user.bookings ?? []), data]`. |
| Hotel booking crash on `user.bookings` | **UNRESOLVED** | `makemytour/src/pages/book-hotel/[id]/index.tsx:140` still has `bookings: [...user.bookings, data]` without `?? []`. |
| Profile booking display | **FIXED** | `makemytour/src/pages/profile/index.tsx` normalizes backend bookings, formats dates, and queries live DB. |
| Duplicate booking on double click | **UNRESOLVED** | Needs button disabling while booking request is pending. |
| Quantity ignored in backend total price | **UNRESOLVED** | `BookingService` sets price from single `flight.getPrice()`. |

---

## 7. Instructions for Future AI Assistants

- **Do Not Hallucinate:** Always inspect active files. For details, refer to `PROJECT_CONTEXT.md`.
- **Preserve Design:** Keep the MakeMyTrip-inspired Tailwind UI and red/white color scheme.
- **Never Hardcode Fake Success:** Do not claim a payment succeeded when payment processing is not implemented.
- **Security:** Never commit real credentials or expose secrets in documentation.
