import 'dotenv/config'; // 1. Carga las variables de entorno primero
import express from "express";
import cors from "cors";
import router from "./src/routes/index.js";
import sequelize from "./src/config/supabase.js";
// -- CAMBIO CRUCIAL --
// Ahora importamos la función por defecto, y podemos darle cualquier nombre (ej. 'connectRedis')
import connectRedis from "./src/config/redis.js"; 


const app = express();
app.use(cors());
app.use(express.json());

// 2. Inicializa Redis *después* de que dotenv se haya ejecutado.
// Usamos el nombre que le dimos a la importación: connectRedis
const redisClient = connectRedis(); 

app.use("/api", router);

// Usamos el puerto del entorno (del .env) o 3000 como fallback.
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    try {
        await sequelize.authenticate();
        console.log("🟢 DB Connected successfully.");
    } catch (err) {
        console.error("🔴 DB Error:", err.message);
    }

    console.log(`✨ Auth service running on port ${PORT}`);
    
    // Ahora, si usas redisClient en alguna parte, estará inicializado correctamente.
});