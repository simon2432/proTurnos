const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/environment");

// Función para encriptar contraseña
const hashPassword = async (password) => {
  try {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error al encriptar contraseña");
  }
};

// Función para comparar contraseñas
const comparePassword = async (password, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error("Error al comparar contraseñas");
  }
};

// Función para generar JWT token
const generateToken = (payload) => {
  try {
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
    return token;
  } catch (error) {
    throw new Error("Error al generar token");
  }
};

// Función para generar refresh token
const generateRefreshToken = (payload) => {
  try {
    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
    return refreshToken;
  } catch (error) {
    throw new Error("Error al generar refresh token");
  }
};

// Función para verificar JWT token
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Función para verificar refresh token
const verifyRefreshToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Middleware para autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token de acceso requerido",
    });
  }

  const { valid, decoded, error } = verifyToken(token);

  if (!valid) {
    return res.status(403).json({
      success: false,
      message: "Token inválido o expirado",
      error: error,
    });
  }

  req.user = decoded;
  next();
};

// Middleware para verificar tipo de usuario
const requireUserType = (allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    if (!allowedTypes.includes(req.user.tipo_usuario)) {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado. Tipo de usuario no autorizado",
      });
    }

    next();
  };
};

// Función para generar payload del token
const generateTokenPayload = (user) => {
  return {
    id: user.dni,
    email: user.email,
    tipo_usuario: user.tipo_usuario,
    nombre_apellido: user.nombre_apellido,
  };
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  authenticateToken,
  requireUserType,
  generateTokenPayload,
};
