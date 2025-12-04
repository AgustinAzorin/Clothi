-- Extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Configuración de collation para case-insensitive
CREATE COLLATION IF NOT EXISTS case_insensitive (
    provider = icu,
    locale = 'und-u-ks-level2',
    deterministic = false
);

-- Usuario para la aplicación (opcional)
CREATE USER clothi_app WITH PASSWORD 'clothi_app_password';
GRANT ALL PRIVILEGES ON DATABASE clothi_dev TO clothi_app;