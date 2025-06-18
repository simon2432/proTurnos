const { body, param, query, validationResult } = require("express-validator");

// Validaciones comunes
const commonValidations = {
  email: body("email").isEmail().normalizeEmail().withMessage("Email inválido"),

  password: body("contrasenia")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
    ),

  dni: body("dni")
    .isNumeric()
    .isLength({ min: 7, max: 8 })
    .withMessage("DNI debe ser un número de 7 u 8 dígitos"),

  phone: body("telefono").notEmpty().withMessage("El teléfono es obligatorio"),

  name: body("nombre_apellido")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Nombre debe tener entre 2 y 100 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("Nombre solo puede contener letras y espacios"),

  specialty: body("especialidad")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Especialidad debe tener entre 2 y 100 caracteres"),

  description: body("descripcion")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Descripción no puede exceder 500 caracteres"),

  address: body("direccion")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Dirección no puede exceder 200 caracteres"),
};

// Validaciones específicas para rutas
const authValidations = {
  register: [
    commonValidations.name,
    commonValidations.dni,
    commonValidations.email,
    commonValidations.password,
    commonValidations.phone,
    // Validación condicional de especialidad
    body("especialidad").custom((value, { req }) => {
      if (req.body.tipo_usuario === "especialista") {
        if (!value || typeof value !== "string" || value.trim().length < 2) {
          throw new Error(
            "La especialidad es obligatoria y debe tener al menos 2 caracteres para especialistas"
          );
        }
        if (value.length > 100) {
          throw new Error("Especialidad debe tener entre 2 y 100 caracteres");
        }
      }
      return true;
    }),
    body("tipo_usuario")
      .isIn(["cliente", "especialista"])
      .withMessage("Tipo de usuario debe ser cliente o especialista"),
  ],

  login: [
    commonValidations.email,
    body("contrasenia").notEmpty().withMessage("Contraseña es requerida"),
  ],
};

const userValidations = {
  updateUser: [
    param("dni").isNumeric().withMessage("DNI inválido"),
    commonValidations.name.optional(),
    commonValidations.email.optional(),
    commonValidations.password.optional(),
    commonValidations.phone.optional(),
    commonValidations.specialty.optional(),
    commonValidations.description.optional(),
    commonValidations.address.optional(),
  ],

  getUser: [param("dni").isNumeric().withMessage("DNI inválido")],
};

const turnoValidations = {
  createTurno: [
    body("dni_cliente").isNumeric().withMessage("DNI cliente inválido"),
    body("dni_especialista")
      .isNumeric()
      .withMessage("DNI especialista inválido"),
    body("fecha")
      .isISO8601()
      .withMessage("Fecha inválida")
      .custom((value) => {
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
          throw new Error("No se pueden crear turnos en fechas pasadas");
        }
        return true;
      }),
    body("hora")
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Hora inválida (formato HH:MM)"),
  ],

  getTurnosByDate: [
    param("dni_especialista")
      .isNumeric()
      .withMessage("DNI especialista inválido"),
    param("fecha").isISO8601().withMessage("Fecha inválida"),
  ],

  deleteTurno: [
    param("id").isInt({ min: 1 }).withMessage("ID de turno inválido"),
  ],
};

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Mostrar el primer error específico si existe
    const firstError = errors.array()[0];
    return res.status(400).json({
      success: false,
      message: firstError ? firstError.msg : "Datos de entrada inválidos",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }
  next();
};

// Función para sanitizar datos
const sanitizeData = (data) => {
  if (typeof data === "string") {
    return data.trim().replace(/[<>]/g, "");
  }
  if (typeof data === "object" && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeData(value);
    }
    return sanitized;
  }
  return data;
};

module.exports = {
  commonValidations,
  authValidations,
  userValidations,
  turnoValidations,
  handleValidationErrors,
  sanitizeData,
};
