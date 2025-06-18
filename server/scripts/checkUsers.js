const db = require("../config/database");

// Script para verificar usuarios existentes
const checkUsers = () => {
  console.log("🔍 Verificando usuarios existentes...");

  // Verificar clientes
  const clientesQuery =
    "SELECT dni, email, nombre_apellido, contrasenia FROM clientes";

  db.query(clientesQuery, (err, clientes) => {
    if (err) {
      console.error("❌ Error al obtener clientes:", err);
      return;
    }

    console.log(`\n📋 CLIENTES (${clientes.length} encontrados):`);
    if (clientes.length === 0) {
      console.log("   No hay clientes registrados");
    } else {
      clientes.forEach((cliente, index) => {
        const isEncrypted = cliente.contrasenia.startsWith("$2a$");
        console.log(
          `   ${index + 1}. ${cliente.nombre_apellido} (${
            cliente.email
          }) - DNI: ${cliente.dni} - Contraseña: ${
            isEncrypted ? "Encriptada" : "Sin encriptar"
          }`
        );
      });
    }
  });

  // Verificar especialistas
  const especialistasQuery =
    "SELECT dni, email, nombre_apellido, especialidad, contrasenia FROM especialistas";

  db.query(especialistasQuery, (err, especialistas) => {
    if (err) {
      console.error("❌ Error al obtener especialistas:", err);
      return;
    }

    console.log(`\n👨‍⚕️ ESPECIALISTAS (${especialistas.length} encontrados):`);
    if (especialistas.length === 0) {
      console.log("   No hay especialistas registrados");
    } else {
      especialistas.forEach((especialista, index) => {
        const isEncrypted = especialista.contrasenia.startsWith("$2a$");
        console.log(
          `   ${index + 1}. ${especialista.nombre_apellido} (${
            especialista.email
          }) - DNI: ${especialista.dni} - Especialidad: ${
            especialista.especialidad
          } - Contraseña: ${isEncrypted ? "Encriptada" : "Sin encriptar"}`
        );
      });
    }

    // Cerrar conexión después de mostrar resultados
    setTimeout(() => {
      db.end();
      console.log("\n🔌 Conexión a la base de datos cerrada");
      process.exit(0);
    }, 2000);
  });
};

// Ejecutar verificación si el script se ejecuta directamente
if (require.main === module) {
  checkUsers();
}

module.exports = checkUsers;
