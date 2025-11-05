// Keep-Alive Script for Render Free Tier
// This pings your backend every 14 minutes to prevent it from spinning down

const https = require('https');

// Replace with your actual Render backend URL
const BACKEND_URL = 'https://cravexpress-api.onrender.com/api/health';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes in milliseconds

function pingBackend() {
  const startTime = Date.now();
  
  https.get(BACKEND_URL, (res) => {
    const duration = Date.now() - startTime;
    console.log(`✅ Ping successful! Status: ${res.statusCode}, Response time: ${duration}ms`);
    console.log(`⏰ Next ping in 14 minutes at ${new Date(Date.now() + PING_INTERVAL).toLocaleTimeString()}`);
  }).on('error', (err) => {
    console.error('❌ Ping failed:', err.message);
    console.log('🔄 Will retry in 14 minutes...');
  });
}

// Ping immediately on start
console.log('🚀 Keep-Alive service started');
console.log(`📡 Pinging: ${BACKEND_URL}`);
pingBackend();

// Then ping every 14 minutes
setInterval(pingBackend, PING_INTERVAL);

