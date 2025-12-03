import 'dotenv/config'; // 1. Carga las variables de entorno primero
import express from "express";
import cors from "cors";
import router from "./src/routes/index.js";
import sequelize from "./src/config/supabase.js";
import path from 'path';
import { fileURLToPath } from 'url';

// Importaciones para manejar __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -- CAMBIO CRUCIAL --
// Ahora importamos la función por defecto, y podemos darle cualquier nombre (ej. 'connectRedis')
import connectRedis from "./src/config/redis.js"; 

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, '../../Public/pages')));

// 2. Inicializa Redis *después* de que dotenv se haya ejecutado.
// Usamos el nombre que le dimos a la importación: connectRedis
const redisClient = connectRedis(); 

// Rutas
app.use("/api", router);

// Redirección de la raíz a index.html
app.get("/", (req, res) => {
    res.redirect("/login.html");
});
app.use("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found" });
}); 
// Usamos el puerto del entorno (del .env) o 3000 como fallback.
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`🚀 Server starting on port ${PORT}...`);
    
    try {
        await sequelize.authenticate();
        console.log("🟢 DB Connected successfully.");
    } catch (err) {
        console.error("🔴 DB Error:", err.message);
    }

    console.log(`✨ Auth service running on port ${PORT}`);
    
    // Ahora, si usas redisClient en alguna parte, estará inicializado correctamente.
    
    // Verificación de conexión a Redis (opcional)
    if (redisClient) {
        try {
            await redisClient.ping();
            console.log("🔴 Redis Connected successfully.");
        } catch (err) {
            console.error("🔴 Redis Error:", err.message);
        }
    }
});