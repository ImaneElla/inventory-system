# ⚙️ IMN Backend

> Spring Boot 3 REST API for the IMN Inventory Management System — handling products, sales, categories, reports, user auth, activity logging, and the Emexa AI chat engine powered by Ollama + LLaMA 3.

---

## 🛠️ Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [Java](https://www.java.com/) | 21 | Language |
| [Spring Boot](https://spring.io/projects/spring-boot) | 3.4.1 | REST API framework |
| [Spring Data JPA](https://spring.io/projects/spring-data-jpa) | — | ORM / database access |
| [Spring AI (Ollama)](https://docs.spring.io/spring-ai/reference/) | 1.0.0-M4 | Local LLM integration |
| [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html) | — | Health & metrics endpoints |
| [Spring Boot Validation](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#validation) | — | Request validation |
| [PostgreSQL](https://www.postgresql.org/) | 14+ | Relational database |
| [Lombok](https://projectlombok.org/) | 1.18.30 | Boilerplate reduction |
| [spring-dotenv](https://github.com/paulschwarz/spring-dotenv) | 4.0.0 | `.env` file support |
| [Ollama](https://ollama.com/) | latest | Local LLM runner (LLaMA 3) |
| Maven | 3.9+ | Build tool |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/imane/inventorysystem/
│   │   │   ├── InventorySystemApplication.java   # Entry point
│   │   │   │
│   │   │   ├── controller/                       # REST endpoints
│   │   │   │   ├── AuthController.java           # /api/auth — login, register, users
│   │   │   │   ├── ChatController.java           # /api/conversations — Emexa AI chat
│   │   │   │   ├── ProductController.java        # /api/v1/products
│   │   │   │   ├── CategoryController.java       # /api/v1/categories
│   │   │   │   ├── SaleController.java           # /api/v1/sales
│   │   │   │   ├── ReportController.java         # /api/reports
│   │   │   │   └── ActivityLogController.java    # /api/activity-logs
│   │   │   │
│   │   │   ├── service/
│   │   │   │   └── ChatService.java              # Ollama prompt assembly + inventory cache
│   │   │   │
│   │   │   ├── entity/                           # JPA entities (DB tables)
│   │   │   │   ├── User.java
│   │   │   │   ├── Role.java                     # Enum: ADMIN, MANAGER
│   │   │   │   ├── Product.java
│   │   │   │   ├── Category.java
│   │   │   │   ├── Sale.java
│   │   │   │   ├── SaleItem.java
│   │   │   │   ├── Conversation.java             # Chat thread (userId-scoped)
│   │   │   │   ├── ChatMessage.java              # Individual chat messages
│   │   │   │   ├── Report.java
│   │   │   │   ├── ActivityLog.java
│   │   │   │   ├── StockMovement.java
│   │   │   │   └── MovementType.java             # Enum: STOCK_IN, STOCK_OUT
│   │   │   │
│   │   │   ├── repository/                       # Spring Data JPA repositories
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── ProductRepository.java
│   │   │   │   ├── ConversationRepository.java
│   │   │   │   ├── ChatMessageRepository.java
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── dto/                              # Request / response objects
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── SendMessageRequest.java
│   │   │   │   ├── ConversationResponse.java
│   │   │   │   └── ChatMessageResponse.java
│   │   │   │
│   │   │   ├── config/                           # Spring config beans
│   │   │   │   └── UserActivityInterceptor.java  # Updates lastSeen on each request
│   │   │   │
│   │   │   └── exception/                        # Global exception handling
│   │   │
│   │   └── resources/
│   │       └── application.properties            # All app configuration
│   │
│   └── test/                                     # Unit / integration tests
│
├── uploads/
│   └── profiles/                                 # User profile photos (served statically)
├── pom.xml
├── mvnw / mvnw.cmd                               # Maven wrapper
└── Dockerfile
```

---

## ⚙️ Configuration

All configuration lives in `src/main/resources/application.properties`.

Environment variables are loaded from a `.env` file (via `spring-dotenv`):

```properties
# .env (in backend/ root)
DB_URL=jdbc:postgresql://localhost:5432/inventory-system
DB_USERNAME=your_user
DB_PASSWORD=your_password
```

Full `application.properties`:

```properties
# Database
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

# Server
server.port=8080

# Ollama AI
spring.ai.ollama.base-url=http://localhost:11434
spring.ai.ollama.chat.options.model=llama3
spring.ai.ollama.chat.options.temperature=0.3
spring.ai.ollama.chat.options.num-predict=512
spring.ai.ollama.chat.options.num-ctx=2048
spring.ai.ollama.chat.options.top-k=20
spring.ai.ollama.chat.options.top-p=0.8
spring.ai.ollama.chat.options.repeat-penalty=1.1
```

> `spring.jpa.hibernate.ddl-auto=update` automatically creates or updates tables on startup — no manual SQL migrations needed.

---

## 🚀 Running the Backend

### Prerequisites
- Java 21+
- PostgreSQL 14+ running locally
- Ollama installed and running (`ollama serve`)
- LLaMA 3 model pulled: `ollama pull llama3`

### Start with Maven wrapper

```bash
cd backend
./mvnw spring-boot:run        # Linux/Mac
.\mvnw.cmd spring-boot:run    # Windows
```

API available at **http://localhost:8080**

### Build a JAR

```bash
./mvnw clean package -DskipTests
java -jar target/inventory-system-0.0.1-SNAPSHOT.jar
```

---

## 🔌 REST API Reference

### Auth — `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register (multipart: userName, email, password, role, image?) |
| `POST` | `/api/auth/login` | Login → returns userId, userName, role, email, imageUrl |
| `GET` | `/api/auth/users` | List all users |
| `DELETE` | `/api/auth/users/{id}` | Delete a user (cannot delete yourself) |
| `PATCH` | `/api/auth/users/{id}/profile` | Update username and/or avatar photo |

### Products — `/api/v1/products`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/products` | List with search, pagination, and filters |
| `POST` | `/api/v1/products` | Create a product |
| `PUT` | `/api/v1/products/{id}` | Update a product |
| `DELETE` | `/api/v1/products/{id}` | Delete a product |
| `DELETE` | `/api/v1/products/batch` | Bulk delete by ID list |
| `PATCH` | `/api/v1/products/{id}/toggle-active` | Toggle active state |
| `GET` | `/api/v1/products/stats` | Dashboard KPIs (total, stock, value, profit, low-stock) |

### Categories — `/api/v1/categories`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/categories` | List all categories |
| `POST` | `/api/v1/categories` | Create a category |
| `PUT` | `/api/v1/categories/{id}` | Update a category |
| `DELETE` | `/api/v1/categories/{id}` | Delete a category |

### Sales — `/api/v1/sales`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/sales` | List with search, status filter, date range, pagination |
| `POST` | `/api/v1/sales/process` | Process a new sale (deducts stock automatically) |
| `DELETE` | `/api/v1/sales/{id}` | Delete a sale |
| `GET` | `/api/v1/sales/stats/dashboard` | Revenue, orders, top products, activity by day |

### Reports — `/api/reports`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reports` | List reports (optional search) |
| `POST` | `/api/reports` | Save a new report |
| `DELETE` | `/api/reports/{id}` | Delete a report |

### Emexa AI Chat — `/api/conversations`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/conversations` | Get conversations for the current user |
| `POST` | `/api/conversations` | Create a new conversation |
| `GET` | `/api/conversations/{id}` | Get all messages in a conversation |
| `POST` | `/api/conversations/{id}/messages` | Send a message → get Emexa's reply |
| `DELETE` | `/api/conversations/{id}` | Delete a conversation and all its messages |

> All endpoints accept the `X-Current-User-Id` header for user-scoped operations.

---

## 🤖 Emexa AI — How `ChatService` Works

`ChatService` is the core of the AI engine. On each message:

1. **Loads the conversation** from PostgreSQL.
2. **Auto-titles** the conversation from the first user message.
3. **Saves the user message** to the DB.
4. **Retrieves trimmed history** — last **6 messages** only (keeps the prompt small and fast).
5. **Gets inventory context** from a **60-second in-memory cache** (avoids a full `SELECT * FROM products` on every message).
6. **Assembles a prompt**: `SystemMessage` (role + inventory data) + history + current user message.
7. **Calls Ollama** via Spring AI `ChatModel.call()`.
8. **Saves Emexa's reply** and returns it.

### Inventory cache

```java
private volatile String cachedInventoryContext = null;
private final AtomicLong cacheTimestamp = new AtomicLong(0);
private static final long CACHE_TTL_MS = 60_000; // 60 seconds
```

The cache is invalidated automatically after 60 seconds so Emexa always has reasonably fresh stock data without hammering the database.

---

## 🗃️ Database Schema (Key Tables)

```
users            id, username, email, password, role, imageUrl, lastSeen
products         id, name, sku, brand, quantity, minStockLevel, price, costPrice, isActive, categoryId, imageUrl
categories       id, name, description
sales            id, totalAmount, status, createdAt
sale_items       id, saleId, productId, quantity, unitPrice
conversations    id (UUID), title, userId, createdAt
chat_messages    id (UUID), conversationId, sender, text, timestamp
reports          id, name, summary, type, dateRange, formats, status, generatedBy, totalRevenue, totalTransactions, lineItemsJson, createdAt
activity_logs    id, actorId, action, entityType, entityId, timestamp
stock_movements  id, productId, type (STOCK_IN/OUT), quantity, timestamp
```

> Tables are created/updated automatically by Hibernate on startup (`ddl-auto=update`).

---

## 📂 File Uploads

Profile images are stored on disk at:

```
backend/uploads/profiles/<uuid>_<original-filename>
```

They are served statically by Spring Boot and accessed via:

```
http://localhost:8080/uploads/profiles/<filename>
```

Product images follow the same pattern under `uploads/`.

---

## 🐳 Docker

```bash
docker build -t imn-backend .
docker run -p 8080:8080 \
  -e DB_URL=jdbc:postgresql://host.docker.internal:5432/inventory-system \
  -e DB_USERNAME=your_user \
  -e DB_PASSWORD=your_password \
  imn-backend
```

Or use the full stack with Docker Compose from the project root:

```bash
docker-compose up --build
```
