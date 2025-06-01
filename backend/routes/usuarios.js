import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { checkCredentials } from "../middlewares/checkCredentials.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

// POST /usuarios → registrar nuevo usuario
router.post("/usuarios", checkCredentials, async (req, res) => {
  try {
    const { email, password, rol, lenguaje } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO usuarios (email, password, rol, lenguage) VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [email, hashedPassword, rol, lenguaje];

    const { rows } = await pool.query(query, values);

    res.status(201).json({ mensaje: "Usuario registrado con éxito", usuario: rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar usuario", detalle: error.message });
  }
});

// POST /login → autenticar y devolver token
router.post("/login", checkCredentials, async (req, res) => {
  try {
    const { email, password } = req.body;

    const { rows } = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error en login", detalle: error.message });
  }
});

// GET /usuarios → devolver datos del usuario autenticado
router.get("/usuarios", verifyToken, async (req, res) => {
  try {
    const email = req.email; // viene del token verificado en el middleware

    const { rows } = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuario", detalle: error.message });
  }
});

export default router;
