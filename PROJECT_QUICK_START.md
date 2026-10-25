# MakeMyTour — Quick Start Guide

## 1. Project Purpose
MakeMyTour is a full-stack MakeMyTrip clone built with a **Next.js (React 19)** frontend and a **Spring Boot 3.4 (Java 17)** backend with **MySQL** persistence. It supports flight/hotel searching, dynamic fare calculation, booking creation, and user profile management.

---

## 2. Technology Stack
- **Frontend:** Next.js 15.1.4 (Pages Router), React 19, TypeScript 5, Tailwind CSS 3.4, Redux Toolkit, Axios, Radix UI, Lucide Icons.
- **Backend:** Java 17, Spring Boot 3.4.1, Spring Data JPA / Hibernate, Spring Security (BCrypt), Maven.
- **Database:** MySQL 8 (`makemytour` database).

---

## 3. Directory Layout
- **Root (`/`):** Backend Spring Boot application (`pom.xml`, `mvnw`, `src/`).
- **Frontend (`/makemytour`):** Next.js application (`package.json`, `src/`).

---

## 4. Run Commands

### Start MySQL
Ensure local MySQL service is running on default port `3306` with the `makemytour` database created:
```sql
CREATE DATABASE IF NOT EXISTS makemytour;
```

### Start Backend (Port 4040)
From the repository root:
```bash
./mvnw spring-boot:run
```
*Health Check:* `curl http://localhost:4040/api/health` -> `{"status":"UP"}`

### Start Frontend (Port 3000)
From the `makemytour` folder:
```bash
cd makemytour
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Configuration & Environment Variables

### Frontend (`makemytour/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4040
```

### Backend (`src/main/resources/application.properties`)
```properties
server.port=4040
spring.datasource.url=jdbc:mysql://localhost:3306/makemytour
spring.datasource.username=root
spring.datasource.password=<YOUR_MYSQL_PASSWORD>
spring.jpa.hibernate.ddl-auto=update
```

---

## 6. Key API Endpoints (Backend: `http://localhost:4040`)
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint |
| `POST` | `/api/users/register` | Register new user account with hashed password |
| `GET` | `/api/flights` | Retrieve all available flights |
| `GET` | `/api/hotels` | Retrieve all available hotels |
| `POST` | `/api/bookings` | Create new flight or hotel booking (`{ userId, flightId, hotelId }`) |
| `GET` | `/api/bookings/user/{userId}` | Retrieve bookings for a specific user |
| `PATCH` | `/api/bookings/{id}/cancel` | Cancel an existing booking |

---

## 7. Current Known Bugs
1. **Hotel Booking Crash on New Users (`book-hotel/[id]/index.tsx:140`):** `user.bookings` is accessed without nullish coalescing (`[...user.bookings, data]`). Needs `[...(user.bookings ?? []), data]`.
2. **Double Booking on Repeated Clicks:** The "Book Now" / "Proceed to Payment" buttons do not disable while waiting for the network request, creating duplicate records.
3. **Backend Ticket Quantity Ignored:** `BookingService` sets `totalPrice` to a single ticket price (`flight.getPrice()`), ignoring quantity.
4. **Missing Login Endpoint:** The backend has registration (`/api/users/register`), but no `/api/users/login` endpoint.
5. **No Seat/Room Inventory Decrement:** Bookings do not decrement `availableSeats` or `availableRooms`.

---

## 8. Recommended Next Development Task
Fix the crash in **`makemytour/src/pages/book-hotel/[id]/index.tsx`** by adding nullish coalescing to `user.bookings` (identical to the fix made on `book-flight`), and disable the booking submission button while loading to prevent duplicate bookings.
