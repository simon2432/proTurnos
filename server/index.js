const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

// Importar configuraciones
const config = require("./config/environment");
const db = require("./config/database");

// Importar rutas
const authRoutes = require("./routes/auth");

// Importar utilidades
const { sanitizeData } = require("./utils/validation");

const app = express();

// Configuración de CORS
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

// Middleware para parsear JSON
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Middleware para sanitizar datos
app.use((req, res, next) => {
  if (req.body) {
    req.body = sanitizeData(req.body);
  }
  if (req.query) {
    req.query = sanitizeData(req.query);
  }
  if (req.params) {
    req.params = sanitizeData(req.params);
  }
  next();
});

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, config.upload.path));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${req.params.dni}_${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Permitir solo imágenes
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos de imagen"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize, // 5MB por defecto
  },
});

// Middleware para manejar errores de multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "El archivo es demasiado grande. Máximo 5MB.",
      });
    }
  }
  if (error.message === "Solo se permiten archivos de imagen") {
    return res.status(400).json({
      success: false,
      message: "Solo se permiten archivos de imagen",
    });
  }
  next(error);
});

// Rutas de autenticación
app.use("/auth", authRoutes);

// Ruta para obtener la información del usuario (cliente o especialista)
app.get("/user/:dni", (req, res) => {
  const { dni } = req.params;
  const sqlCliente = "SELECT * FROM clientes WHERE dni = ?";
  const sqlEspecialista = "SELECT * FROM especialistas WHERE dni = ?";

  db.query(sqlCliente, [dni], (err, resultCliente) => {
    if (err) {
      console.error("Error al obtener usuario cliente:", err);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
    if (resultCliente.length > 0) {
      // Remover contraseña de la respuesta
      const user = { ...resultCliente[0] };
      delete user.contrasenia;
      return res.status(200).json({
        success: true,
        user: { ...user, tipo_usuario: "cliente" },
      });
    } else {
      db.query(sqlEspecialista, [dni], (err, resultEspecialista) => {
        if (err) {
          console.error("Error al obtener usuario especialista:", err);
          return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
          });
        }
        if (resultEspecialista.length > 0) {
          // Remover contraseña de la respuesta
          const user = { ...resultEspecialista[0] };
          delete user.contrasenia;
          return res.status(200).json({
            success: true,
            user: { ...user, tipo_usuario: "especialista" },
          });
        } else {
          return res.status(404).json({
            success: false,
            message: "Usuario no encontrado",
          });
        }
      });
    }
  });
});

// Ruta para actualizar la información del usuario (cliente o especialista)
app.put("/user/:dni", upload.single("imagen"), (req, res) => {
  const { dni } = req.params;
  const {
    nombre_apellido,
    email,
    contrasenia,
    telefono,
    especialidad,
    descripcion,
    direccion,
    tipo_usuario = "especialista",
    rango1_inicio,
    rango1_fin,
    rango2_inicio,
    rango2_fin,
    dias_atencion,
  } = req.body;

  const imagen = req.file ? `/fotosEs/${req.file.filename}` : null;

  let sql = "";
  let values = [];
  let fieldsToUpdate = [];

  if (tipo_usuario === "cliente") {
    sql = "UPDATE clientes SET ";

    if (nombre_apellido !== undefined) {
      fieldsToUpdate.push("nombre_apellido = ?");
      values.push(nombre_apellido);
    }
    if (email !== undefined) {
      fieldsToUpdate.push("email = ?");
      values.push(email);
    }
    if (contrasenia !== undefined) {
      // Encriptar nueva contraseña si se proporciona
      const { hashPassword } = require("./utils/auth");
      hashPassword(contrasenia)
        .then((hashedPassword) => {
          fieldsToUpdate.push("contrasenia = ?");
          values.push(hashedPassword);
          executeUpdate();
        })
        .catch((error) => {
          console.error("Error al encriptar contraseña:", error);
          return res.status(500).json({
            success: false,
            message: "Error al actualizar contraseña",
          });
        });
      return;
    }
    if (telefono !== undefined) {
      fieldsToUpdate.push("telefono = ?");
      values.push(telefono);
    }

    sql += fieldsToUpdate.join(", ");
    sql += " WHERE dni = ?";
    values.push(dni);
    executeUpdate();
  } else if (tipo_usuario === "especialista") {
    sql = "UPDATE especialistas SET ";

    if (nombre_apellido !== undefined) {
      fieldsToUpdate.push("nombre_apellido = ?");
      values.push(nombre_apellido);
    }
    if (email !== undefined) {
      fieldsToUpdate.push("email = ?");
      values.push(email);
    }
    if (contrasenia !== undefined) {
      // Encriptar nueva contraseña si se proporciona
      const { hashPassword } = require("./utils/auth");
      hashPassword(contrasenia)
        .then((hashedPassword) => {
          fieldsToUpdate.push("contrasenia = ?");
          values.push(hashedPassword);
          executeUpdate();
        })
        .catch((error) => {
          console.error("Error al encriptar contraseña:", error);
          return res.status(500).json({
            success: false,
            message: "Error al actualizar contraseña",
          });
        });
      return;
    }
    if (telefono !== undefined) {
      fieldsToUpdate.push("telefono = ?");
      values.push(telefono);
    }
    if (especialidad !== undefined) {
      fieldsToUpdate.push("especialidad = ?");
      values.push(especialidad);
    }
    if (descripcion !== undefined) {
      fieldsToUpdate.push("descripcion = ?");
      values.push(descripcion);
    }
    if (direccion !== undefined) {
      fieldsToUpdate.push("direccion = ?");
      values.push(direccion);
    }
    if (imagen !== null) {
      fieldsToUpdate.push("imagen = ?");
      values.push(imagen);
    }
    if (rango1_inicio !== undefined) {
      fieldsToUpdate.push("rango1_inicio = ?");
      values.push(rango1_inicio);
    }
    if (rango1_fin !== undefined) {
      fieldsToUpdate.push("rango1_fin = ?");
      values.push(rango1_fin);
    }
    if (rango2_inicio !== undefined) {
      fieldsToUpdate.push("rango2_inicio = ?");
      values.push(rango2_inicio);
    }
    if (rango2_fin !== undefined) {
      fieldsToUpdate.push("rango2_fin = ?");
      values.push(rango2_fin);
    }
    if (dias_atencion !== undefined) {
      fieldsToUpdate.push("dias_atencion = ?");
      values.push(dias_atencion);
    }

    sql += fieldsToUpdate.join(", ");
    sql += " WHERE dni = ?";
    values.push(dni);
    executeUpdate();
  } else {
    return res.status(400).json({
      success: false,
      message: "Tipo de usuario no válido",
    });
  }

  function executeUpdate() {
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error en la consulta SQL:", err);
        return res.status(500).json({
          success: false,
          message: "Error interno del servidor",
        });
      }
      res.status(200).json({
        success: true,
        message: "Información actualizada correctamente",
      });
    });
  }
});

// Ruta para obtener todos los especialistas ordenados por especialidad
app.get("/especialistas", (req, res) => {
  const sql = "SELECT * FROM especialistas ORDER BY especialidad ASC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error en la consulta SQL:", err);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
    res.status(200).json({
      success: true,
      data: results,
    });
  });
});

// Ruta para obtener los turnos de un cliente específico
app.get("/turnos/:dni_cliente", (req, res) => {
  const { dni_cliente } = req.params;
  const sql = `
        SELECT turnos.*, especialistas.nombre_apellido AS nombre_especialista, especialistas.especialidad, especialistas.direccion 
        FROM turnos 
        JOIN especialistas ON turnos.dni_especialista = especialistas.dni 
        WHERE turnos.dni_cliente = ? 
        ORDER BY fecha ASC, hora ASC`;

  db.query(sql, [dni_cliente], (err, results) => {
    if (err) {
      console.error("Error en la consulta SQL:", err);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
    res.status(200).json({
      success: true,
      data: results,
    });
  });
});

// Ruta para eliminar un turno por ID
app.delete("/turnos/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM turnos WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error en la consulta SQL:", err);
      return res.status(500).json({
        success: false,
        message: "Error al cancelar el turno",
      });
    }
    if (result.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        message: "Turno cancelado correctamente",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Turno no encontrado",
      });
    }
  });
});

// Ruta para obtener la información completa del especialista por DNI
app.get("/especialis/:dni", (req, res) => {
  const { dni } = req.params;
  const sql = "SELECT * FROM especialistas WHERE dni = ?";

  db.query(sql, [dni], (err, result) => {
    if (err) {
      console.error("Error en la consulta SQL:", err);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
    if (result.length > 0) {
      // Remover contraseña de la respuesta
      const user = { ...result[0] };
      delete user.contrasenia;
      return res.status(200).json({
        success: true,
        data: user,
      });
    } else {
      console.log("Especialista no encontrado para el DNI:", dni);
      return res.status(404).json({
        success: false,
        message: "Especialista no encontrado",
      });
    }
  });
});

// Ruta para obtener los turnos ocupados de un especialista en una fecha específica
app.get("/turnos-ocupados/:dni_especialista/:fecha", (req, res) => {
  const { dni_especialista, fecha } = req.params;
  const sql =
    "SELECT TIME_FORMAT(hora, '%H:%i') AS hora FROM turnos WHERE dni_especialista = ? AND fecha = ?";

  db.query(sql, [dni_especialista, fecha], (err, results) => {
    if (err) {
      console.error("Error en la consulta SQL:", err);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
    res.status(200).json({
      success: true,
      data: results.map((turno) => turno.hora),
    });
  });
});

// Ruta para crear un nuevo turno
app.post("/crear-turno", (req, res) => {
  const { dni_cliente, dni_especialista, fecha, hora } = req.body;

  const sql = `INSERT INTO turnos (dni_cliente, dni_especialista, fecha, hora) VALUES (?, ?, ?, ?)`;

  db.query(sql, [dni_cliente, dni_especialista, fecha, hora], (err, result) => {
    if (err) {
      console.error("Error al crear el turno:", err);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
    res.status(201).json({
      success: true,
      message: "Turno reservado exitosamente",
    });
  });
});

// Obtener los turnos del especialista entre dos fechas
app.get("/turnos-especialista/:dni_especialista", (req, res) => {
  const { dni_especialista } = req.params;
  const { fecha_inicio, fecha_fin } = req.query;

  const sql = `
        SELECT t.id, t.fecha, t.hora, c.nombre_apellido AS nombre, c.email, c.telefono 
        FROM turnos t 
        JOIN clientes c ON t.dni_cliente = c.dni 
        WHERE t.dni_especialista = ? 
        AND t.fecha BETWEEN ? AND ? 
        ORDER BY t.fecha, t.hora
    `;

  db.query(sql, [dni_especialista, fecha_inicio, fecha_fin], (err, results) => {
    if (err) {
      console.error("Error al obtener los turnos:", err);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
    res.status(200).json({
      success: true,
      data: results,
    });
  });
});

// Middleware para manejar errores globales
app.use((error, req, res, next) => {
  console.error("Error no manejado:", error);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  });
});

// Middleware para rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  });
});

// Iniciar servidor
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log(`📊 Entorno: ${config.server.nodeEnv}`);
  console.log(`🌐 CORS Origin: ${config.cors.origin}`);
});
