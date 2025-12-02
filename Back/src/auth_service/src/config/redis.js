import Redis from "ioredis";

// La instancia se inicializará a null y solo se creará cuando se llame a initRedis()
let redisInstance = null;

/**
 * Inicializa y devuelve la instancia de cliente Redis. 
 * Esta función debe llamarse en el punto de entrada (server.js) *después* de cargar dotenv.
 * @returns {Redis.Redis} La instancia de Redis.
 */
export default function initRedis() {
  if (redisInstance) {
    return redisInstance; // Devuelve la instancia existente si ya se inicializó
  }

  // Las variables de entorno ya están cargadas en este punto, gracias a la llamada desde server.js.
  const REDIS_HOST = process.env.REDIS_HOST;
  const REDIS_PORT = Number(process.env.REDIS_PORT);
  const REDIS_USER = process.env.REDIS_USER;
  const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
  const REDIS_DB = Number(process.env.REDIS_DB);

  // LÍNEA DE DEPURACIÓN CLAVE: Muestra el host que se está usando.
  console.log(`🟡 [REDIS INIT] Intentando conectar a: ${REDIS_HOST}:${REDIS_PORT}.`);
  if (REDIS_HOST === "127.0.0.1") {
    console.log("🟡 [REDIS INIT ADVERTENCIA] ¡ADVERTENCIA! Usando valores por defecto. Revisa la carga de .env en server.js.");
  }

  const newRedisInstance = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    username: REDIS_USER,
    password: REDIS_PASSWORD,
    db: REDIS_DB,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  });

  newRedisInstance.on("connect", () => {
    console.log("🟢 Redis conectado correctamente al host:", REDIS_HOST);
  });

  newRedisInstance.on("error", (err) => {
    console.error("🔴 Error en Redis (Verifica firewall/credenciales):", err);
  });

  redisInstance = newRedisInstance;
  return redisInstance;
}