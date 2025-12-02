import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import sequelize from "./config/supabase.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", router);

app.listen(process.env.PORT || 3000, async () => {
  try {
    await sequelize.authenticate();
    console.log("DB Connected");
  } catch (err) {
    console.error("DB Error:", err);
  }

  console.log("Auth service running");
});
