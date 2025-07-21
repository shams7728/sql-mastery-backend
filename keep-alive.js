const fetch = require('node-fetch');
require('dotenv').config();

const BACKEND_URL = process.env.RENDER_EXTERNAL_URL || 'https://sqlflowbacked.onrender.com';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes (under the 15-minute threshold)

console.log(`Starting keep-alive service for ${BACKEND_URL}`);

const pingServer = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/health-check`, {
      timeout: 5000 // 5 second timeout
    });
    
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    
    console.log(`[${new Date().toISOString()}] Keep-alive ping successful`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Ping failed:`, error.message);
  }
};

// Initial ping when starting
pingServer();

// Set up regular pings
setInterval(pingServer, PING_INTERVAL);

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('Stopping keep-alive service');
  process.exit();
});
