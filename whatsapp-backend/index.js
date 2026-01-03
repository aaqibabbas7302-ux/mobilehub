const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

let qrCodeData = null;
let isReady = false;
let isAuthenticated = false;

console.log("Initializing WhatsApp Client...");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
    }
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrCodeData = qr;
    isAuthenticated = false;
    isReady = false;
});

client.on('ready', () => {
    console.log('Client is ready!');
    isReady = true;
    isAuthenticated = true;
    qrCodeData = null;
});

client.on('authenticated', () => {
    console.log('Client is authenticated!');
    isAuthenticated = true;
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
    isAuthenticated = false;
    isReady = false;
});

client.on('disconnected', (reason) => {
    console.log('Client was disconnected', reason);
    isAuthenticated = false;
    isReady = false;
    client.initialize();
});

client.initialize();

// API Endpoints

app.get('/status', (req, res) => {
    res.json({
        isReady,
        isAuthenticated,
        hasQr: !!qrCodeData
    });
});

app.get('/qr', (req, res) => {
    if (qrCodeData) {
        res.json({ qr: qrCodeData });
    } else {
        res.status(404).json({ error: 'QR code not available yet or already authenticated' });
    }
});

app.post('/send', async (req, res) => {
    if (!isReady) {
        return res.status(503).json({ error: 'WhatsApp client is not ready' });
    }

    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ error: 'Phone and message are required' });
    }

    try {
        // Format phone number (append @c.us if not present)
        // Assuming Indian numbers for now, strip + or 0, ensure 91 prefix
        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.length === 10) {
            formattedPhone = '91' + formattedPhone;
        }
        
        const chatId = `${formattedPhone}@c.us`;
        
        const response = await client.sendMessage(chatId, message);
        res.json({ success: true, response });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message', details: error.message });
    }
});

app.post('/logout', async (req, res) => {
    try {
        await client.logout();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to logout' });
    }
});

app.listen(port, () => {
    console.log(`WhatsApp backend running at http://localhost:${port}`);
});
