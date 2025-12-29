# MobileHub Delhi - Development Instructions

## Project Overview
A professional CRM dashboard and e-commerce website for a second-hand mobile phone business in Delhi, India.

## Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

## Project Structure
```
src/
├── app/
│   ├── (public)/          # Public website routes
│   ├── admin/             # CRM dashboard routes
│   └── api/               # API routes for n8n integration
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── admin/             # CRM-specific components
│   └── public/            # Website components
├── lib/
│   ├── supabase/          # Supabase client configuration
│   └── utils.ts           # Utility functions
└── types/                 # TypeScript type definitions
```

## Key Features
1. **CRM Dashboard** (`/admin`)
   - Phone inventory management (CRUD)
   - Seller/Customer tracking
   - Order management with GST
   - Analytics dashboard

2. **Public Website** (`/`)
   - Phone catalog with filters
   - Phone detail pages
   - WhatsApp click-to-chat

3. **API Routes** (`/api`)
   - `/api/phones/search` - Search inventory (for n8n)
   - `/api/phones/[id]` - Get phone details
   - `/api/webhook/whatsapp` - WhatsApp webhook

## Indian Market Specifics
- All prices in INR (₹)
- GST compliance (18%)
- IMEI verification tracking
- Condition grades: A+, A, B+, B, C, D
- Warranty periods: 30/60/90 days

## Database Tables
- `phones` - Mobile inventory
- `sellers` - People who sold phones
- `customers` - Buyers
- `orders` - Sales transactions
- `whatsapp_conversations` - Chat history

## Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_WHATSAPP_NUMBER=919XXXXXXXXX
```

## Running the Project
```bash
npm run dev    # Start development server
npm run build  # Build for production
```
