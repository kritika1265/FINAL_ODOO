# RentPro - Rental Management System

A complete frontend for a Rental Management System that supports Customers, Vendors, and Admins with full rental lifecycle flows.

## Project Structure

```
ODDO/
├── index.html              # Homepage
├── products.html           # Product listing with filters
├── product-detail.html     # Product detail with rental config
├── cart.html               # Quotation / Cart
├── checkout.html           # Checkout (address & billing)
├── checkout-payment.html   # Payment page
├── order-confirmation.html # Order success page
├── login.html              # Login
├── signup.html             # Signup (Name, Email, Company, GSTIN, Password)
├── forgot-password.html    # Password reset
├── invoice-print.html      # Printable invoice template
├── css/
│   ├── main.css            # Main stylesheet
│   ├── variables.css       # Design tokens
│   ├── base.css            # Reset & typography
│   ├── components.css      # Buttons, cards, forms
│   ├── layout.css          # Header, footer, grid
│   └── responsive.css      # Mobile breakpoints
├── customer/               # Customer Portal
│   ├── dashboard.html
│   ├── orders.html
│   ├── order-detail.html
│   └── invoices.html
├── vendor/                 # Vendor Portal
│   ├── dashboard.html
│   ├── products.html
│   ├── orders.html
│   ├── invoices.html
│   └── pickups.html
└── admin/                  # Admin Portal
    ├── dashboard.html
    ├── vendors.html
    ├── products.html
    ├── orders.html
    ├── reports.html
    └── settings.html
```

## How to Run

1. Open `index.html` in a browser, or
2. Use a local server (e.g. `npx serve .` or `python -m http.server 8000`)
3. Navigate to `http://localhost:8000` (or your server URL)

## User Roles & Access

| Role    | Portal           | Key Pages                                      |
|---------|------------------|------------------------------------------------|
| Customer| Website + Portal | Browse, Cart, Checkout, Orders, Invoices       |
| Vendor  | Vendor Portal    | Products, Orders, Invoices, Pickups & Returns  |
| Admin   | Admin Panel      | Vendors, Products, Orders, Reports, Settings   |

**Quick links from Login page:**
- Customer Portal → `customer/dashboard.html`
- Vendor Portal → `vendor/dashboard.html`
- Admin Portal → `admin/dashboard.html`

## Rental Flow (Customer)

1. **Browse** → Products page with filters
2. **Select** → Product detail → Configure rental period (hour/day/week) → Add to Cart
3. **Quotation** → Cart shows items with dates & totals
4. **Checkout** → Address, billing (GSTIN), company info
5. **Payment** → Full or partial payment
6. **Confirmation** → Order confirmed, pickup doc generated

## Features Implemented

- **Auth:** Login, Signup (with GSTIN, Company), Forgot password
- **Products:** Listing, filters, detail with hourly/daily/weekly pricing
- **Cart/Quotation:** Editable until confirmation
- **Checkout:** Address, GSTIN, billing info
- **Payment:** Payment method selection (placeholder)
- **Customer Portal:** Dashboard, orders, invoices, order status
- **Vendor Portal:** Products, orders, invoices, pickups & returns
- **Admin:** Dashboard, vendors, products, orders, reports, settings
- **Invoice:** Print-ready invoice template
- **Responsive:** Mobile-friendly CSS breakpoints

## Tech Stack

- HTML5
- CSS3 (custom properties, grid, flexbox)
- Vanilla JavaScript (minimal, for form interactions)

## Next Steps (Backend)

To make this fully functional, you'll need:

- Backend API (Node.js, Python, etc.)
- Database (PostgreSQL, MongoDB)
- Authentication (JWT/sessions)
- Payment gateway integration
- Email notifications
- File storage for product images
