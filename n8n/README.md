# MobileHub Delhi - n8n WhatsApp AI Workflow

This workflow enables an AI-powered WhatsApp agent that automatically responds to customer inquiries about phone availability and pricing.

## Workflow Overview

```
WhatsApp Message Received → Filter Text → Extract Details → Is Greeting?
                                                              ↓
                                          ┌─────────────────────────────────┐
                                          ↓                                 ↓
                                   Welcome Message              Search Inventory API
                                          ↓                                 ↓
                                          └──────→ Prepare Response ←───── AI Agent
                                                          ↓
                                                   Send WhatsApp Reply
                                                          ↓
                                                   Log to MobileHub
```

## Node Details

### 1. WhatsApp Message Received (Trigger)
- **Type**: `n8n-nodes-base.whatsAppTrigger`
- **Function**: Triggers automatically when a WhatsApp message is received
- **Requires**: WhatsApp Business API credentials

### 2. Filter Text Messages
- Only processes text messages (ignores images, voice notes, etc.)

### 3. Extract Message Details
- Parses customer name, phone number, message text
- Detects brand (Apple, Samsung, OnePlus, Xiaomi, Vivo, Oppo, Realme, etc.)
- Detects budget from message (e.g., "under 30k", "₹25000", "20-25k range")
- Determines intent (greeting, search, availability, price, purchase)

### 4. Is Greeting?
- Routes greetings → Welcome message
- Routes phone queries → Inventory search + AI

### 5. Search Inventory API
- Calls MobileHub API: `POST /api/phones/search`
- Sends: query, brand, maxBudget
- Returns matching phones + alternative suggestions

### 6. AI Agent - Generate Response
- Uses OpenAI GPT to generate natural, conversational response
- Context-aware: uses customer name, query, and live inventory data
- Responds in English-Hindi mix for authentic Delhi shopkeeper feel
- Includes pricing, condition, battery health in responses

### 7. Send WhatsApp Reply
- Sends the AI-generated response back via WhatsApp Business API

## Setup Instructions

### Prerequisites
1. n8n instance (self-hosted or n8n Cloud)
2. WhatsApp Business API access (Meta Business account)
3. OpenAI API key
4. MobileHub app deployed and accessible

### Step 1: WhatsApp Business API Setup

1. Go to [Meta Business Suite](https://business.facebook.com/)
2. Create/access your WhatsApp Business account
3. Navigate to WhatsApp → API Setup
4. Note down your:
   - **Phone Number ID**
   - **WhatsApp Business Account ID**
   - **Permanent Access Token** (generate from System Users)

### Step 2: Configure n8n Credentials

Create these credentials in n8n:

**WhatsApp Business Cloud API:**
1. Go to Credentials → Add Credential → WhatsApp Business Cloud
2. Enter:
   - Access Token: Your permanent Meta access token
   - Business Account ID: Your WhatsApp Business Account ID

**OpenAI API:**
1. Go to Credentials → Add Credential → OpenAI
2. Enter your OpenAI API key

### Step 3: Set Environment Variables

In n8n Settings → Variables, add:

| Variable | Value | Description |
|----------|-------|-------------|
| `MOBILEHUB_API_URL` | `https://your-domain.com` | Your deployed MobileHub URL |
| `WHATSAPP_PHONE_NUMBER_ID` | `1234567890` | Your WhatsApp Phone Number ID |

### Step 4: Import Workflow

1. Open n8n dashboard
2. Click **Add Workflow** → **Import from File**
3. Select `whatsapp-ai-workflow.json`
4. Click on each node with ⚠️ warning and connect your credentials
5. Click **Save** then **Activate**

### Step 5: Configure Webhook in Meta

1. In n8n, the WhatsApp Trigger node auto-generates a webhook URL
2. Go to Meta Business → WhatsApp → Configuration
3. Add webhook:
   - **Callback URL**: n8n will provide this
   - **Verify Token**: Match with n8n settings
4. Subscribe to: `messages`

## Testing the Workflow

1. Send **"Hi"** or **"Hello"** to your WhatsApp Business number
   - Should receive welcome message with menu options

2. Send **"iPhone 13 available hai?"**
   - AI will search inventory and respond with matching phones

3. Send **"Samsung under 30k dikhao"**
   - AI will filter by brand + budget

4. Send **"Do you have OnePlus phones?"**
   - AI will show all available OnePlus models

## Example Conversations

**Customer**: "Hi"
**Bot**: "Namaste Ji! 🙏 Welcome to MobileHub Delhi..."

**Customer**: "iPhone 13 128GB chahiye under 55k"
**Bot**: "Ji bilkul! Hamare paas iPhone 13 128GB available hai:
- *iPhone 13 Midnight* - ₹52,999 (Grade A+, Battery 92%)
- *iPhone 13 Blue* - ₹49,999 (Grade A, Battery 88%)
✅ IMEI verified, 60-day warranty
Kaunsa dekhna chahenge? 📱"

## Customization

### Modify Welcome Message
Edit the **Welcome Message** node's JavaScript code to change greeting text

### Change AI Personality
Edit the **AI Agent** node's system message and prompt template

### Add More Brands
Update `brandMap` in the **Extract Message Details** node

### Adjust Response Length
Modify the character limit in **Prepare WhatsApp Response** node

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Workflow not triggering | Verify webhook is configured in Meta and workflow is active |
| API errors | Check MOBILEHUB_API_URL is correct and accessible |
| AI not responding | Verify OpenAI credentials and account has balance |
| Empty responses | Ensure database has phone inventory |
| Messages not sending | Check WhatsApp credentials and phone number ID |

## Support

For issues with:
- **n8n**: [n8n Community](https://community.n8n.io/)
- **WhatsApp API**: [Meta Developer Docs](https://developers.facebook.com/docs/whatsapp)
- **MobileHub**: Check the main README.md
