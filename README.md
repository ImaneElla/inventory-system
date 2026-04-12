# 📦 Inventory Management System

> A full-stack inventory management web application built with **Next.js** and **Spring Boot**, designed to help businesses track products, manage stock movements, record sales, and gain AI-powered insights.

---

## 🧠 Overview

This system allows businesses to:

- Track products and available quantities
- Record stock entries and exits
- Avoid stockouts or overstocking
- Analyze sales and profits
- Get AI-powered restocking suggestions

---

## 🎯 Objectives

- Automate inventory management
- Reduce human errors
- Support data-driven decision making

---

## 🚀 Tech Stack

### 🎨 Frontend
| Technology | Purpose |
|---|---|
| Next.js | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| Framer Motion | Animations |
| Chart.js | Data visualization |

### ⚙️ Backend
| Technology | Purpose |
|---|---|
| Java + Spring Boot | REST API server |
| Spring Security + JWT | Authentication & authorization |
| Spring Data JPA (Hibernate) | ORM / data access |
| PostgreSQL | Relational database |
| Postman | API testing |

---

## 🧩 Features

### 📊 1. Dashboard
- Total products overview
- Total sales count
- Net profit summary
- Low stock alerts
- Sales & profit charts (Chart.js)
- AI insights panel
- Global search
- Best-selling products analysis

### 📦 2. Product Management
- Add / Edit / Delete products
- Fields: name, quantity, price
- Search & filter products

### 📤 3. Stock Movements
- **Stock IN** — record incoming inventory
- **Stock OUT** — record outgoing inventory
- Full movement history log

### 🛒 4. Sales
- Record sales transactions
- Automatic stock deduction
- Profit calculation per sale
- Select products from list
- Input quantity → see total in real time
- Confirm and save sale

### 🤖 5. AI Insights
- Smart suggestions:
  - Products that need restocking
  - Low-performing products
- Demand forecasting

### 📊 6. Reports
- Sales reports
- Profit reports
- Product reports
- Export to **PDF** and **Excel**

---

## 🔐 Access Control

Two roles with different permissions:

| Feature | Admin | Manager |
|---|---|---|
| User Management | ✅ | ❌ |
| Products | ✅ | ✅ |
| Sales | ✅ | ✅ |
| Reports | ✅ | ❌ |
| AI Insights | ✅ | ❌ |

### 👤 Manager Role
Handles day-to-day operations:
- ✅ View Dashboard
- ✅ Manage Products (CRUD)
- ✅ Record Sales
- ✅ Auto stock updates
- ❌ Cannot access Reports or User Management

---

## 🗄️ Database Schema

### `users` Table

| Field | Type | Description |
|---|---|---|
| id | INT (PK) | Primary key |
| username | VARCHAR | Username |
| email | VARCHAR | example.gmail.com |
| password | VARCHAR | Hashed password |
| role | ENUM | `ADMIN` / `MANAGER` |

---

## 🏗️ Project Architecture

```
📁 inventory-system/
│
├── 🟢 backend/          → Spring Boot
│
├── 🟣 frontend/         → Next.js
│
└── README.md
```

### 🔵 Backend Structure

```
inventory-backend/
│
├── src/main/java/com/inventory/
│   ├── controller/        # REST API endpoints
│   ├── service/           # Business logic
│   ├── repository/        # DB access (JPA)
│   ├── model/             # Entity classes (tables)
│   ├── dto/               # Data Transfer Objects
│   ├── config/            # Security, CORS, configs
│   ├── exception/         # Error handling
│   └── InventoryApplication.java
│
├── src/main/resources/
│   └── application.properties
│
└── pom.xml
```

### 🟣 Frontend Structure

```
inventory-frontend/
│
├── app/                   # Next.js app router
│
├── components/
│   ├── dashboard/
│   ├── products/
│   ├── sales/
│   └── ui/                # shadcn/ui components
│
├── services/
│   └── api.ts             # Backend API calls
│
├── hooks/
├── lib/
│   └── utils.ts
├── types/
├── styles/
└── public/
```

---

## 🔗 Communication Flow

```
USER
 │
 ▼
Next.js (Frontend)
 │
 ▼  API Request (REST + JWT)
 │
 ▼
Spring Boot (Backend)
 │
 ▼
PostgreSQL (Database)
 │
 ▼
Spring Boot
 │
 ▼
Next.js
 │
 ▼
USER
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- Java 17+
- PostgreSQL 14+
- Maven

### 1. Clone the repository

```bash
git clone https://github.com/your-username/inventory-system.git
cd inventory-system
```

### 2. Backend Setup

```bash
cd backend
# Configure your DB credentials in src/main/resources/application.properties
mvn spring-boot:run
# OR
.\mvnw spring-boot:run
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Access the app

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |

---

## 📄 License

This project is licensed under the MIT License.
