const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const policyRoutes = require('./routes/policyRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const passwordRoutes = require('./routes/passwordRoutes');

dotenv.config();
connectDB();

const app = express();

// CORS: allow local dev and production (comma-separated in CLIENT_ORIGIN)
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);              // allow server-to-server/health checks
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS not allowed'));
  },
  credentials: true
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads (if any local uploads; Cloudinary preferred in prod)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/password', passwordRoutes);

// Health routes for Render monitoring
app.get('/health', (_req, res) => res.send('ok'));
app.get('/', (_req, res) => {
  res.json({
    message: 'API Running',
    routes: [
      '/api/auth',
      '/api/categories',
      '/api/expenses',
      '/api/users',
      '/api/tickets',
      '/api/policies',
      '/api/approvals',
      '/api/password'
    ]
  });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Error:', err.message);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
