// src/config/redis.js
import Redis from "ioredis";
import 'dotenv/config'; // ← ESTO YA CARGA EL .env, NO USES dotenv.config()

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  username: process.env.REDIS_USER || undefined,
  password: process.env.REDIS_PASSWORD || undefined,
  db: Number(process.env.REDIS_DB) || 0,
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

redis.on("connect", () => {
  console.log("🟢 Redis conectado correctamente");
});

redis.on("error", (err) => {
  console.error("🔴 Error en Redis:", err);
});

export default redis;
