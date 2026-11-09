# Adi Shakti Trader — Super Admin Panel

React + Vite + Recharts. Separate website for the store owner / admin. Responsive for laptop, tablet and phone.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173. You will see the admin login. Any ID and a password of 4+ characters work in the prototype.

## Pages

| Route | What it does |
|---|---|
| `/login` | Admin sign in |
| `/` | Dashboard: sales, orders, pending payments, low stock, sales trend, order status, recent orders, top products |
| `/tally` | **Order tally** (total / pending / completed / cancelled, orders per day, status, channel) · **Product tally** (sold vs available by category, top sellers, full stock register) · **Billing tally** (bills, sales, received, pending, weekly sales, payment modes, pending payments). Date range filter and Export to Excel (CSV) |
| `/orders` | All orders with filters, search, inline status change, order details drawer (items, progress, mark paid, cancel) |
| `/products` | All 46 products: edit stock with + / −, add / edit / delete product with photo |
| `/billing` | Invoices with Pending / Overdue / Paid filters, invoice view, Print / Save as PDF, mark as paid |
| `/videos` | Upload cake demo videos (2-minute limit checked), link products, preview, delete |
| `/partners` | Approve / reject partner store requests, active partners |
| `/settings` | Store profile (address, phones, GSTIN), notifications, password |

## Data

- `src/data/products.js`: all 46 products (stock from the store list, **prices are sample**)
- `src/data/orders.js`: **sample orders** generated with a fixed seed (same every load)
- `src/data/tally.js`: every tally number is calculated from the orders and products, so all pages match. Replace the data with API calls later
- `src/data/store.js`: store details from the visiting card (please confirm GSTIN)

Changes (status, stock, payments, videos) stay in memory until refresh. Connect the backend to save them.
