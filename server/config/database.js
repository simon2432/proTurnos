const mysql = require("mysql");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "care_planer",
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
};

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err);
    return;
  }
  console.log("✅ Conectado a la base de datos MySQL");
});

// Manejar reconexión automática
db.on("error", (err) => {
  console.error("Error en la conexión de la base de datos:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.log("Reconectando a la base de datos...");
    db.connect();
  } else {
    throw err;
  }
});

module.exports = db;
