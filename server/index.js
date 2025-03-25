import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentsRouter from './routes/payments.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Enhanced logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const { method, url, body } = req;

  // Create a divider for better log readability
  console.log('\n' + '='.repeat(80));
  console.log(`[${timestamp}] ${method} ${url}`);
  
  // Log request body if present
  if (Object.keys(body).length > 0) {
    console.log('\nRequest Body:');
    console.log(JSON.stringify(body, null, 2));
  }

  // Capture and log response data
  const originalSend = res.send;
  res.send = function(data) {
    console.log('\nResponse:');
    console.log(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    console.log('='.repeat(80) + '\n');
    return originalSend.apply(res, arguments);
  };

  // Capture frontend console logs
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleInfo = console.info;

  console.log = function(...args) {
    originalConsoleLog('\n[Frontend]', ...args);
  };

  console.error = function(...args) {
    originalConsoleError('\n[Frontend Error]', ...args);
  };

  console.warn = function(...args) {
    originalConsoleWarn('\n[Frontend Warning]', ...args);
  };

  console.info = function(...args) {
    originalConsoleInfo('\n[Frontend Info]', ...args);
  };

  next();
});

// Routes
app.use('/api/payments', paymentsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check request received');
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('\n[Server Error]:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\nServer running on port ${PORT}`);
  console.log('='.repeat(80));
});