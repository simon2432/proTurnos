const db = require("../config/database");
const {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  generateTokenPayload,
} = require("../utils/auth");
const { sanitizeData } = require("../utils/validation");

// Controlador para registro de usuarios
const register = async (req, res) => {
  try {
    console.log("📝 Datos de registro recibidos:", req.body);

    const {
      nombre_apellido,
      dni,
      email,
      contrasenia,
      telefono,
      especialidad,
      tipo_usuario,
    } = sanitizeData(req.body);

    console.log("🧹 Datos sanitizados:", {
      nombre_apellido,
      dni,
      email,
      telefono,
      especialidad,
      tipo_usuario,
    });

    // Validaciones básicas
    if (!nombre_apellido || !dni || !email || !contrasenia || !tipo_usuario) {
      console.log("❌ Datos faltantes en el registro");
      return res.status(400).json({
        success: false,
        message: "Todos los campos obligatorios deben estar completos",
      });
    }

    if (tipo_usuario !== "cliente" && tipo_usuario !== "especialista") {
      console.log("❌ Tipo de usuario inválido:", tipo_usuario);
      return res.status(400).json({
        success: false,
        message: "Tipo de usuario debe ser cliente o especialista",
      });
    }

    if (tipo_usuario === "especialista" && !especialidad) {
      console.log("❌ Especialidad faltante para especialista");
      return res.status(400).json({
        success: false,
        message: "La especialidad es obligatoria para especialistas",
      });
    }

    console.log("🔍 Verificando si el usuario ya existe...");

    // Verificar si el usuario ya existe
    const checkUserSql = `
            SELECT dni FROM clientes WHERE dni = ? OR email = ?
            UNION
            SELECT dni FROM especialistas WHERE dni = ? OR email = ?
        `;

    db.query(checkUserSql, [dni, email, dni, email], async (err, results) => {
      if (err) {
        console.error("❌ Error al verificar usuario existente:", err);
        return res.status(500).json({
          success: false,
          message: "Error interno del servidor",
        });
      }

      console.log("📊 Usuarios existentes encontrados:", results.length);

      if (results.length > 0) {
        console.log("❌ Usuario ya existe");
        return res.status(400).json({
          success: false,
          message: "El DNI o email ya están registrados",
        });
      }

      console.log("🔐 Encriptando contraseña...");

      // Encriptar contraseña
      const hashedPassword = await hashPassword(contrasenia);
      console.log("✅ Contraseña encriptada");

      let sql = "";
      let values = [];

      if (tipo_usuario === "cliente") {
        sql =
          "INSERT INTO clientes (nombre_apellido, dni, email, contrasenia, telefono) VALUES (?, ?, ?, ?, ?)";
        values = [nombre_apellido, dni, email, hashedPassword, telefono];
        console.log("👤 Registrando cliente...");
      } else if (tipo_usuario === "especialista") {
        sql =
          "INSERT INTO especialistas (nombre_apellido, dni, email, contrasenia, telefono, especialidad) VALUES (?, ?, ?, ?, ?, ?)";
        values = [
          nombre_apellido,
          dni,
          email,
          hashedPassword,
          telefono,
          especialidad,
        ];
        console.log("👨‍⚕️ Registrando especialista...");
      }

      console.log("📝 SQL Query:", sql);
      console.log("📊 Valores:", values);

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error("❌ Error al registrar usuario:", err);
          return res.status(500).json({
            success: false,
            message: "Error al registrar usuario: " + err.message,
          });
        }

        console.log("✅ Usuario registrado exitosamente");
        res.status(201).json({
          success: true,
          message: `Usuario ${tipo_usuario} registrado exitosamente`,
        });
      });
    });
  } catch (error) {
    console.error("❌ Error en registro:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor: " + error.message,
    });
  }
};

// Función para verificar contraseña (compatible con contraseñas sin encriptar)
const verifyPassword = async (inputPassword, storedPassword) => {
  try {
    // Primero intentar con bcrypt (contraseña encriptada)
    const isBcryptValid = await comparePassword(inputPassword, storedPassword);
    if (isBcryptValid) {
      return true;
    }

    // Si no funciona con bcrypt, verificar si es contraseña sin encriptar
    if (inputPassword === storedPassword) {
      return true;
    }

    return false;
  } catch (error) {
    // Si hay error con bcrypt, verificar contraseña sin encriptar
    return inputPassword === storedPassword;
  }
};

// Controlador para login de usuarios
const login = async (req, res) => {
  try {
    const { email, contrasenia } = sanitizeData(req.body);

    console.log("🔐 Intento de login para email:", email);

    // Buscar usuario en ambas tablas
    const sqlCliente = "SELECT * FROM clientes WHERE email = ?";
    const sqlEspecialista = "SELECT * FROM especialistas WHERE email = ?";

    db.query(sqlCliente, [email], async (err, clienteResults) => {
      if (err) {
        console.error("Error en consulta cliente:", err);
        return res.status(500).json({
          success: false,
          message: "Error interno del servidor",
        });
      }

      let user = null;
      let userType = "";

      if (clienteResults.length > 0) {
        user = clienteResults[0];
        userType = "cliente";
        console.log("👤 Usuario encontrado como cliente");
      } else {
        db.query(sqlEspecialista, [email], async (err, especialistaResults) => {
          if (err) {
            console.error("Error en consulta especialista:", err);
            return res.status(500).json({
              success: false,
              message: "Error interno del servidor",
            });
          }

          if (especialistaResults.length > 0) {
            user = especialistaResults[0];
            userType = "especialista";
            console.log("👨‍⚕️ Usuario encontrado como especialista");
          } else {
            console.log("❌ Usuario no encontrado");
            return res.status(401).json({
              success: false,
              message: "Email o contraseña incorrectos",
            });
          }

          // Verificar contraseña
          const isPasswordValid = await verifyPassword(
            contrasenia,
            user.contrasenia
          );

          if (!isPasswordValid) {
            console.log("❌ Contraseña incorrecta para especialista");
            return res.status(401).json({
              success: false,
              message: "Email o contraseña incorrectos",
            });
          }

          console.log("✅ Login exitoso para especialista");

          // Generar tokens
          const userWithType = { ...user, tipo_usuario: userType };
          const tokenPayload = generateTokenPayload(userWithType);
          const token = generateToken(tokenPayload);
          const refreshToken = generateRefreshToken(tokenPayload);

          // Remover contraseña de la respuesta
          delete user.contrasenia;

          res.status(200).json({
            success: true,
            message: "Login exitoso",
            user: { ...user, tipo_usuario: userType },
            token,
            refreshToken,
          });
        });
        return;
      }

      // Verificar contraseña para cliente
      const isPasswordValid = await verifyPassword(
        contrasenia,
        user.contrasenia
      );

      if (!isPasswordValid) {
        console.log("❌ Contraseña incorrecta para cliente");
        return res.status(401).json({
          success: false,
          message: "Email o contraseña incorrectos",
        });
      }

      console.log("✅ Login exitoso para cliente");

      // Generar tokens
      const userWithType = { ...user, tipo_usuario: userType };
      const tokenPayload = generateTokenPayload(userWithType);
      const token = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Remover contraseña de la respuesta
      delete user.contrasenia;

      res.status(200).json({
        success: true,
        message: "Login exitoso",
        user: { ...user, tipo_usuario: userType },
        token,
        refreshToken,
      });
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

// Controlador para refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token requerido",
      });
    }

    const { verifyRefreshToken } = require("../utils/auth");
    const { valid, decoded, error } = verifyRefreshToken(refreshToken);

    if (!valid) {
      return res.status(403).json({
        success: false,
        message: "Refresh token inválido o expirado",
      });
    }

    // Generar nuevos tokens
    const tokenPayload = generateTokenPayload(decoded);
    const newToken = generateToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    res.status(200).json({
      success: true,
      message: "Tokens renovados exitosamente",
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Error en refresh token:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

// Controlador para logout
const logout = (req, res) => {
  try {
    // En una implementación más robusta, aquí podrías invalidar el token
    // Por ahora, solo devolvemos una respuesta exitosa
    res.status(200).json({
      success: true,
      message: "Logout exitoso",
    });
  } catch (error) {
    console.error("Error en logout:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
};
