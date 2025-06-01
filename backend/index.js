import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/usuarios.js";
import { logMiddleware } from "./middlewares/logMiddleware.js";
import { pool } from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(logMiddleware);

// Rutas
app.use("/", router);

// Probar conexión a la base de datos al iniciar
const verificarConexionBD = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ Conectado a PostgreSQL correctamente");
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error.message);
    process.exit(1); 
  }
};

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  await verificarConexionBD();
});
