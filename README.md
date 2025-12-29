# MobileHub Delhi

A professional CRM dashboard and e-commerce website for a second-hand mobile phone business in Delhi, India, with WhatsApp AI agent integration via n8n.

## 🚀 Features

### CRM Dashboard (`/admin`)
- **Inventory Management** - Add, edit, and track mobile phones with detailed specs
- **Condition Grading** - A+ to D grading system with quality checks
- **Pricing in INR** - Cost price, selling price, MRP with discount calculation
- **IMEI Tracking** - CEIR verification status
- **Warranty Management** - 30/60/90 day seller warranty options
- **Analytics Dashboard** - Sales trends, popular brands, revenue tracking

### Public Website
- **Phone Catalog** - Browse all available phones with filters
- **Detailed Product Pages** - Full specs, condition reports, battery health
- **Brand Filtering** - Apple, Samsung, OnePlus, Xiaomi, Vivo, Oppo, Realme
- **Price Range Filter** - Budget-based search
- **WhatsApp Integration** - Click-to-chat with pre-filled messages
- **Mobile Responsive** - Optimized for all devices

### WhatsApp AI Agent (n8n)
- **Automated Responses** - AI-powered replies to customer queries
- **Inventory Search** - Real-time phone availability checks
- **Hindi-English Mix** - Natural Delhi shopkeeper communication style
- **Intent Detection** - Understands greetings, searches, price inquiries
- **Suggestion Engine** - Recommends alternatives if exact match unavailable

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Automation**: n8n workflows
- **AI**: OpenAI GPT (via n8n)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- WhatsApp Business API (for AI agent)
- n8n instance (self-hosted or cloud)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Set Up Database**
   - Create a Supabase project
   - Run `supabase/schema.sql` in SQL Editor
   - Copy project URL and keys to `.env.local`

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   - Website: http://localhost:3000
   - CRM: http://localhost:3000/admin

## 📱 API Endpoints

- `GET /api/phones/search` - Search inventory
- `GET /api/phones/[id]` - Get phone details
- `POST /api/webhook/whatsapp` - n8n webhook

## 🇮🇳 Indian Market Features

- GST Compliance (18%)
- IMEI Verification
- INR Pricing (₹)
- Hindi-English Support
- Delhi Location

---

Built with ❤️ for Delhi's mobile market
