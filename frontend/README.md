# 💻 IMN Frontend

> Next.js 15 client for the IMN Inventory Management System — featuring a real-time dashboard, AI chat interface, product/sales/report management, and dark mode support.

---

## 🛠️ Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16+ | App Router, SSR, API proxy |
| [React](https://react.dev/) | 19 | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | 6 | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Utility-first styling |
| [Framer Motion](https://www.framer.com/motion/) | 12 | Animations & transitions |
| [Chart.js](https://www.chartjs.org/) / [react-chartjs-2](https://react-chartjs-2.js.org/) | 4/5 | Dashboard charts |
| [Recharts](https://recharts.org/) | 3 | Alternative chart components |
| [shadcn/ui](https://ui.shadcn.com/) + Radix UI | latest | Accessible UI primitives |
| [Lucide React](https://lucide.dev/) | 1 | Icon library |
| [next-themes](https://github.com/pacocoursey/next-themes) | 0.4 | Dark / light mode |
| [Axios](https://axios-http.com/) | 1 | HTTP client (alongside fetch) |
| [react-to-print](https://github.com/MatthewHerbst/react-to-print) | 3 | Report printing |

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (fonts, theme provider)
│   │   ├── page.tsx                  # Root redirect → /login
│   │   ├── providers.tsx             # Global providers wrapper
│   │   ├── globals.css               # Global styles & CSS variables
│   │   ├── login/                    # Login page
│   │   ├── register/                 # Registration page
│   │   └── dashboard/               # Protected app pages
│   │       ├── layout.tsx            # Dashboard shell (sidebar + header)
│   │       ├── page.tsx              # Main dashboard overview
│   │       ├── EmexaAssistant/       # AI chat interface
│   │       ├── products/             # Product management
│   │       ├── categories/           # Category management
│   │       ├── sales/                # Sales management
│   │       ├── reports/              # Report builder & history
│   │       ├── users/                # Admin user management
│   │       ├── activity-logs/        # Audit log viewer
│   │       ├── settings/             # User profile & settings
│   │       └── help/                 # Help center
│   │
│   ├── components/
│   │   ├── AiAssistant.tsx           # Emexa info / documentation card
│   │   ├── AuthComponents.tsx        # Login & register form components
│   │   ├── StatCard.tsx              # Dashboard stat card (shared)
│   │   ├── ServiceWorkerRegister.tsx # PWA service worker hook
│   │   ├── theme-provider.tsx        # next-themes wrapper
│   │   ├── dashboard/
│   │   │   ├── DashboardHeader.tsx   # Top nav bar with user menu
│   │   │   ├── SidebarApp.tsx        # Collapsible sidebar navigation
│   │   │   ├── DashboardCharts.tsx   # Chart components (trend, gauge, bar)
│   │   │   └── StatCard.tsx          # Dashboard-specific stat card
│   │   ├── logo/                     # Logo SVG component
│   │   └── ui/                       # shadcn/ui components (button, card, dialog…)
│   │
│   ├── lib/
│   │   ├── api.ts                    # All API calls + auth headers + image URL helpers
│   │   └── react-query-custom.ts     # Lightweight custom query hook
│   │
│   ├── hooks/                        # Custom React hooks
│   └── types/
│       └── sale.ts                   # TypeScript interfaces
│
├── public/                           # Static assets
├── next.config.ts                    # Next.js config (standalone output)
├── tailwind.config.ts                # Tailwind configuration
├── components.json                   # shadcn/ui component registry
└── package.json
```

---

## ⚙️ Setup & Running

### Prerequisites
- **Node.js** 18+ or **Bun** (recommended)
- Backend running on `http://localhost:8080`

### Install dependencies

```bash
# With Bun (recommended)
bun install

# Or with npm
npm install
```

### Run in development

```bash
bun dev
# or
npm run dev
```

App is available at **http://localhost:3000**

### Build for production

```bash
bun run build
bun start
```

---

## 🔌 API Communication

All backend calls live in [`src/lib/api.ts`](./src/lib/api.ts).

Every request automatically attaches the current user's ID via the `X-Current-User-Id` header — pulled from `sessionStorage`:

```ts
function authHeaders(extra?: Record<string, string>) {
  const headers = { ...extra };
  const userId = sessionStorage.getItem("userId");
  if (userId) headers["X-Current-User-Id"] = userId;
  return headers;
}
```

The Next.js dev server proxies `/api/*` → `http://localhost:8080/api/*` to avoid CORS issues.

### Key helper functions

| Function | Description |
|---|---|
| `resolveImageUrl(path)` | Resolves product image paths → full backend URL |
| `resolveProfileImageUrl(path)` | Resolves user avatar paths → full backend URL |
| `fetchConversations()` | Get the current user's chat history |
| `sendChatMessage(id, text)` | Send a message to Emexa |
| `deleteConversation(id)` | Delete a conversation permanently |
| `fetchProducts(search, page, size, filters)` | Paginated product list with filters |
| `fetchDashboardStats()` | Product KPIs for the dashboard |
| `fetchSalesDashboardAnalytics()` | Revenue/order metrics for the dashboard |

---

## 🎨 Key Pages

### Dashboard (`/dashboard`)
- Real-time KPI stat cards (products, revenue, inventory value, alerts)
- Inventory & Profit Trend line chart (monthly)
- Most Active Day bar chart (by weekday)
- Top Sellers ranked table with product images
- Repeat Customer Rate gauge
- Floating Action Button (FAB) for quick "Add Product" / "New Sale"
- Shimmer skeleton loading while data fetches

### Emexa AI Chat (`/dashboard/EmexaAssistant`)
- Full conversational chat UI with message bubbles
- Per-user isolated chat history loaded from the backend
- Sliding sidebar drawer showing all past conversations
- Trash icon per conversation — deletes from DB on confirm
- Suggestion chips on empty state
- Auto-scroll to latest message
- Animated typing indicator (bouncing dots)

### Products (`/dashboard/products`)
- Searchable, paginated product table
- Filter by category, brand, stock status, active state
- Add / edit product with image upload
- Bulk delete with checkboxes
- Toggle product active/inactive
- Low-stock visual badges

### Settings (`/dashboard/settings`)
- Update display name
- Upload a new profile photo
- Dark / light mode toggle

---

## 🌗 Theming

Dark and light mode is managed by `next-themes`. The theme toggle is available in the dashboard sidebar. CSS variables for colors are defined in `globals.css` and follow the shadcn/ui convention.

---

## 🐳 Docker

A `Dockerfile` is included for containerized deployment:

```bash
docker build -t imn-frontend .
docker run -p 3000:3000 imn-frontend
```

The Next.js build is configured with `output: "standalone"` for minimal Docker images.
