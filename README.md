# 📅 Cal Clone – Scheduling Application

A full-stack scheduling and booking web app inspired by **Cal.com**.
Users can create event types, set availability, and allow others to book meetings seamlessly.

---

## 🚀 Live Demo

👉 https://cal-clone-rho.vercel.app

---

## 🔗 Live Repository

👉 https://github.com/Ansh1ka15/cal-clone

---

## ✨ Features

* 🗂️ Create, edit, delete event types
* ⏰ Set weekly availability
* 🔗 Unique booking link (slug-based)
* 📆 Public booking page
* 📝 Attendee enters name & email
* ✅ Booking confirmation screen
* 📊 View upcoming bookings
* 🔄 Cancel & reschedule bookings
* 🎨 Color-coded event types
* 🌗 Light & Dark theme support

---

## 📸 Screenshots

### 📌 Event Types Dashboard

#### 🌞 Light Mode

![Event Types Light](./screenshots/event-types-light.png)

#### 🌙 Dark Mode

![Event Types Dark](./screenshots/event-types-dark.png)

---

### ➕ Create Event Type

#### 🌞 Light Mode

![New Event](./screenshots/create-event-light.png)

#### 🌙 Dark Mode

![New Event Dark](./screenshots/create-event-dark.png)

---

### 📊 Bookings

#### 🌞 Light Mode

![Bookings](./screenshots/bookings-light.png)

#### 🌙 Dark Mode

![Bookings Dark](./screenshots/bookings-dark.png)

---

### ⏰ Availability

#### 🌞 Light Mode

![Availability](./screenshots/availability-light.png)

#### 🌙 Dark Mode

![Availability Dark](./screenshots/availability-dark.png)

#### 🕒 Slots View

![Slots](./screenshots/availability-slots.png)


---

### ✅ Booking Confirmation

![Booking Confirm](./screenshots/booking-confirm.png)

---

### 🔌 API Testing

![API](./screenshots/api-test.png)

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js
* Sequelize ORM

### Database

* PostgreSQL

---

## ⚙️ Setup Instructions

### Clone repo

```bash
git clone https://github.com/Ansh1ka15/cal-clone.git
cd cal-clone
```

---

### Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calclone
DB_USER=postgres
DB_PASSWORD=yourpassword
```

Run backend:

```bash
npm run dev
```

---

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

---

## 🌐 API Endpoints

### Event Types

* GET `/api/event-types`
* POST `/api/event-types`
* PUT `/api/event-types/:id`
* DELETE `/api/event-types/:id`

### Availability

* GET `/api/availability`
* PUT `/api/availability`

### Bookings

* GET `/api/bookings`
* POST `/api/bookings`
* PATCH `/api/bookings/:id/cancel`
* PATCH `/api/bookings/:id/reschedule`

---

## 👩‍💻 Author

**Anshika Singh**
