const db = require("../config/database");
const { hashPassword } = require("../utils/auth");

// Script para migrar contraseñas existentes a formato encriptado
const migratePasswords = async () => {
  console.log("🔄 Iniciando migración de contraseñas...");

  try {
    // Migrar contraseñas de clientes
    console.log("📋 Migrando contraseñas de clientes...");
    const clientesQuery =
      'SELECT dni, contrasenia FROM clientes WHERE contrasenia NOT LIKE "$2a$%"';

    db.query(clientesQuery, async (err, clientes) => {
      if (err) {
        console.error("❌ Error al obtener clientes:", err);
        return;
      }

      console.log(
        `📊 Encontrados ${clientes.length} clientes con contraseñas sin encriptar`
      );

      for (const cliente of clientes) {
        try {
          const hashedPassword = await hashPassword(cliente.contrasenia);
          const updateQuery =
            "UPDATE clientes SET contrasenia = ? WHERE dni = ?";

          db.query(updateQuery, [hashedPassword, cliente.dni], (updateErr) => {
            if (updateErr) {
              console.error(
                `❌ Error al actualizar cliente ${cliente.dni}:`,
                updateErr
              );
            } else {
              console.log(`✅ Cliente ${cliente.dni} actualizado`);
            }
          });
        } catch (error) {
          console.error(
            `❌ Error al encriptar contraseña del cliente ${cliente.dni}:`,
            error
          );
        }
      }
    });

    // Migrar contraseñas de especialistas
    console.log("📋 Migrando contraseñas de especialistas...");
    const especialistasQuery =
      'SELECT dni, contrasenia FROM especialistas WHERE contrasenia NOT LIKE "$2a$%"';

    db.query(especialistasQuery, async (err, especialistas) => {
      if (err) {
        console.error("❌ Error al obtener especialistas:", err);
        return;
      }

      console.log(
        `📊 Encontrados ${especialistas.length} especialistas con contraseñas sin encriptar`
      );

      for (const especialista of especialistas) {
        try {
          const hashedPassword = await hashPassword(especialista.contrasenia);
          const updateQuery =
            "UPDATE especialistas SET contrasenia = ? WHERE dni = ?";

          db.query(
            updateQuery,
            [hashedPassword, especialista.dni],
            (updateErr) => {
              if (updateErr) {
                console.error(
                  `❌ Error al actualizar especialista ${especialista.dni}:`,
                  updateErr
                );
              } else {
                console.log(`✅ Especialista ${especialista.dni} actualizado`);
              }
            }
          );
        } catch (error) {
          console.error(
            `❌ Error al encriptar contraseña del especialista ${especialista.dni}:`,
            error
          );
        }
      }
    });

    console.log("✅ Migración de contraseñas completada");

    // Cerrar conexión después de un tiempo
    setTimeout(() => {
      db.end();
      console.log("🔌 Conexión a la base de datos cerrada");
      process.exit(0);
    }, 5000);
  } catch (error) {
    console.error("❌ Error en la migración:", error);
    db.end();
    process.exit(1);
  }
};

// Ejecutar migración si el script se ejecuta directamente
if (require.main === module) {
  migratePasswords();
}

module.exports = migratePasswords;
