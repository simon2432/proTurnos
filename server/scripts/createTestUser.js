const db = require("../config/database");
const { hashPassword } = require("../utils/auth");

// Script para crear un usuario de prueba
const createTestUser = async () => {
  console.log("👤 Creando usuario de prueba...");

  try {
    // Datos del usuario de prueba
    const testUser = {
      dni: "12345678",
      nombre_apellido: "Usuario Prueba",
      email: "test@test.com",
      contrasenia: "Test123",
      telefono: "1234567890",
      especialidad: "Medicina General",
      tipo_usuario: "especialista",
    };

    // Verificar si el usuario ya existe
    const checkQuery = `
            SELECT dni FROM clientes WHERE dni = ? OR email = ?
            UNION
            SELECT dni FROM especialistas WHERE dni = ? OR email = ?
        `;

    db.query(
      checkQuery,
      [testUser.dni, testUser.email, testUser.dni, testUser.email],
      async (err, results) => {
        if (err) {
          console.error("❌ Error al verificar usuario existente:", err);
          return;
        }

        if (results.length > 0) {
          console.log("⚠️  El usuario de prueba ya existe");
          console.log("📧 Email: test@test.com");
          console.log("🔑 Contraseña: Test123");
          db.end();
          return;
        }

        // Encriptar contraseña
        const hashedPassword = await hashPassword(testUser.contrasenia);

        // Insertar usuario
        const sql =
          "INSERT INTO especialistas (nombre_apellido, dni, email, contrasenia, telefono, especialidad) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [
          testUser.nombre_apellido,
          testUser.dni,
          testUser.email,
          hashedPassword,
          testUser.telefono,
          testUser.especialidad,
        ];

        db.query(sql, values, (err, result) => {
          if (err) {
            console.error("❌ Error al crear usuario de prueba:", err);
            return;
          }

          console.log("✅ Usuario de prueba creado exitosamente");
          console.log("📧 Email: test@test.com");
          console.log("🔑 Contraseña: Test123");
          console.log("👨‍⚕️ Tipo: Especialista");
          console.log("🏥 Especialidad: Medicina General");

          db.end();
          process.exit(0);
        });
      }
    );
  } catch (error) {
    console.error("❌ Error al crear usuario de prueba:", error);
    db.end();
    process.exit(1);
  }
};

// Ejecutar creación si el script se ejecuta directamente
if (require.main === module) {
  createTestUser();
}

module.exports = createTestUser;
