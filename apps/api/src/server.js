const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize } = require('./config/database');
const { supabase } = require('./config/supabase');
const { errorHandler } = require('./middleware/errorHandler');

const marketRoutes = require('./modules/marketplace/routes/recommendationRoutes');
const authRoutes = require('./modules/auth/routes/authRoutes');


const app = express();
const PORT = process.env.PORT || 3001;

// ======================
// MIDDLEWARES GLOBALES
// ======================
app.use(helmet()); // Seguridad HTTP headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// ======================
//RUTAS MODULOS
// ======================
app.use('/api/auth', authRoutes);
app.use("api/marketpalce", marketRoutes);

// ======================
// RUTAS BÁSICAS (Health checks)
// ======================
app.get('/', (req, res) => {
  res.json({
    message: 'Clothi API v1.0',
    documentation: '/api/docs',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', async (req, res) => {
  try {
    // Verificar conexión a DB
    await sequelize.authenticate();
    
    // Verificar conexión a Supabase
    const { error } = await supabase.from('user_profiles').select('count');
    
    res.json({
      status: 'healthy',
      database: 'connected',
      supabase: error ? 'disconnected' : 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ======================
// IMPORTAR RUTAS DE MÓDULOS
// ======================
// (Los importaremos después de crearlos)
// app.use('/api/auth', require('./modules/auth/routes'));
// app.use('/api/products', require('./modules/products/routes'));
// app.use('/api/outfits', require('./modules/outfits/routes'));

// ======================
// RUTA DE DOCS (placeholder)
// ======================
app.get('/api/docs', (req, res) => {
  res.json({
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        profile: 'GET /api/auth/profile'
      },
      products: {
        list: 'GET /api/products',
        create: 'POST /api/products',
        detail: 'GET /api/products/:id'
      },
      outfits: {
        list: 'GET /api/outfits',
        create: 'POST /api/outfits',
        detail: 'GET /api/outfits/:id'
      }
    }
  });
});

// ======================
// MANEJO DE ERRORES
// ======================
app.use(errorHandler);

// ======================
// RUTA 404
// ======================
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// ======================
// INICIAR SERVIDOR
// ======================
const startServer = async () => {
  try {
    // Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized');
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
      console.log(`🔐 Supabase: ${process.env.SUPABASE_URL ? 'Configured' : 'Not configured'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; // Para testing