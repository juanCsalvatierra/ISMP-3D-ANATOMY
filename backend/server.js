const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "admin",
  host: "localhost",
  database: "anatomy",
  password: "admin",
  port: 5432,
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("LOGIN:", email, password);

  try {
    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      AND password = $2
      `,
      [email, password]
    );

    const user = result.rows[0];

    if (user) {
      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    }

    return res.status(401).json({
      success: false,
      message: "Credenciales incorrectas",
    });
  } catch (error) {
    console.error("ERROR LOGIN:", error);

    return res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
});

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});
