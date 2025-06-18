require("dotenv").config();

const config = {
  // Database
  database: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "care_planer",
    port: process.env.DB_PORT || 3306,
  },

  // Server
  server: {
    port: process.env.PORT || 3003,
    nodeEnv: process.env.NODE_ENV || "development",
  },

  // JWT
  jwt: {
    secret:
      process.env.JWT_SECRET || "fallback-secret-key-change-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      "fallback-refresh-secret-key-change-in-production",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },

  // File Upload
  upload: {
    path: process.env.UPLOAD_PATH || "../client/public/fotosEs",
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
  },
};

// Validar configuraciones críticas
const validateConfig = () => {
  const required = ["JWT_SECRET", "JWT_REFRESH_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn("⚠️  Variables de entorno faltantes:", missing.join(", "));
    console.warn("⚠️  Usando valores por defecto. Cambia esto en producción.");
  }

  if (
    config.server.nodeEnv === "production" &&
    config.jwt.secret.includes("fallback")
  ) {
    throw new Error("❌ JWT_SECRET debe ser configurado en producción");
  }
};

validateConfig();

module.exports = config;
