import { Sequelize } from 'sequelize';
import 'dotenv/config'; // ← perfecto

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS, // ← asegurate que coincide con tu .env
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "postgres",
    logging: false
  }
);

export default sequelize;
