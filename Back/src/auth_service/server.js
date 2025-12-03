import 'dotenv/config';
import express from "express";
import cors from "cors";
import router from "./src/routes/index.js";
import sequelize from "./src/config/supabase.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import connectRedis from "./src/config/redis.js"; 

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Calcular rutas base
const projectRoot = path.join(__dirname, '../../'); // Va hasta el directorio raíz
const publicPath = path.join(projectRoot, 'Public');

console.log('📁 Directorios:');
console.log('  - server.js en:', __dirname);
console.log('  - Raíz del proyecto:', projectRoot);
console.log('  - Carpeta Public:', publicPath);

// Servir archivos estáticos desde diferentes carpetas
app.use(express.static(publicPath)); // Sirve todo en Public/

// Rutas específicas para organizar mejor
app.use('/pages', express.static(path.join(publicPath, 'pages')));    // HTML
app.use('/css', express.static(path.join(publicPath, 'css')));        // CSS
app.use('/js', express.static(path.join(publicPath, 'scripts')));     // JS (scripts)

// Inicializa Redis
const redisClient = connectRedis(); 

// Rutas de API
app.use("/api", router);

// Redirección de la raíz a login.html
app.get("/", (req, res) => {
    res.sendFile(path.join(publicPath, 'pages', 'login.html'));
});

// Ruta específica para login
app.get("/login", (req, res) => {
    res.sendFile(path.join(publicPath, 'pages', 'login.html'));
});

// Ruta para signup (si tienes signup.html)
app.get("/signup", (req, res) => {
    res.sendFile(path.join(publicPath, 'pages', 'signup.html'));
});

// API 404
app.use("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found" });
});

// Para cualquier otra ruta HTML, redirigir a login
app.get("*.html", (req, res) => {
    res.sendFile(path.join(publicPath, 'pages', 'login.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`🚀 Servidor iniciado en puerto ${PORT}...`);
    console.log(`📁 Archivos estáticos desde: ${publicPath}`);
    console.log(`🌐 URLs disponibles:`);
    console.log(`   • Frontend: http://localhost:${PORT}`);
    console.log(`   • Login: http://localhost:${PORT}/login`);
    console.log(`   • API: http://localhost:${PORT}/api`);
    
    try {
        await sequelize.authenticate();
        console.log("🟢 Base de datos conectada exitosamente.");
    } catch (err) {
        console.error("🔴 Error en DB:", err.message);
    }

    if (redisClient) {
        try {
            await redisClient.ping();
            console.log("🔴 Redis conectado exitosamente.");
        } catch (err) {
            console.error("🔴 Error en Redis:", err.message);
        }
    }
});