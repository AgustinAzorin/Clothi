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

// Calcular rutas - desde server.js hasta la raíz del proyecto
const projectRoot = path.join(__dirname, '../../../'); // Back/src/auth_service → ../../../ → raíz
const publicPath = path.join(projectRoot, 'Public');

console.log('📁 Directorios:');
console.log('  - server.js:', __dirname);
console.log('  - Raíz del proyecto:', projectRoot);
console.log('  - Carpeta Public:', publicPath);

// Servir archivos estáticos DESDE Public, pero SIN /Public en la URL
app.use(express.static(publicPath)); // Esto hace que / → Public/

// Rutas específicas para archivos en subcarpetas
app.use('/css', express.static(path.join(publicPath, 'css')));      // /css → Public/css/
app.use('/js', express.static(path.join(publicPath, 'scripts')));   // /js → Public/scripts/

// Inicializa Redis
const redisClient = connectRedis(); 

// Rutas de API
app.use("/api", router);

// Redirección de la raíz
app.get("/", (req, res) => {
    res.sendFile(path.join(publicPath, 'pages', 'login.html'));
});

// Ruta específica para login
app.get("/login", (req, res) => {
    res.sendFile(path.join(publicPath, 'pages', 'login.html'));
});

// Ruta para signup
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
    console.log(`🚀 Servidor en puerto ${PORT}`);
    console.log(`📁 Public path: ${publicPath}`);
    console.log(`🌐 URLs:`);
    console.log(`   • http://localhost:${PORT}/`);
    console.log(`   • http://localhost:${PORT}/login`);
    console.log(`   • http://localhost:${PORT}/signup`);
    console.log(`   • http://localhost:${PORT}/api/*`);
    console.log(`   • http://localhost:${PORT}/css/style.css`);
    console.log(`   • http://localhost:${PORT}/js/app.js`);
    
    try {
        await sequelize.authenticate();
        console.log("🟢 DB conectada");
    } catch (err) {
        console.error("🔴 DB Error:", err.message);
    }

    if (redisClient) {
        try {
            await redisClient.ping();
            console.log("🔴 Redis conectado");
        } catch (err) {
            console.error("🔴 Redis Error:", err.message);
        }
    }
});