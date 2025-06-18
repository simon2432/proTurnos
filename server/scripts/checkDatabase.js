const db = require("../config/database");

// Script para verificar la estructura de la base de datos
const checkDatabase = () => {
  console.log("🔍 Verificando estructura de la base de datos...");

  // Verificar si las tablas existen
  const checkTablesQuery = `
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'care_planer' 
        AND TABLE_NAME IN ('clientes', 'especialistas', 'turnos')
    `;

  db.query(checkTablesQuery, (err, tables) => {
    if (err) {
      console.error("❌ Error al verificar tablas:", err);
      return;
    }

    console.log(`\n📋 TABLAS ENCONTRADAS (${tables.length}):`);
    tables.forEach((table) => {
      console.log(`   ✅ ${table.TABLE_NAME}`);
    });

    if (tables.length < 3) {
      console.log("\n⚠️  Faltan algunas tablas. Verifica que tengas:");
      console.log("   - clientes");
      console.log("   - especialistas");
      console.log("   - turnos");
    }

    // Verificar estructura de tabla clientes
    const clientesStructureQuery = `
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = 'care_planer' 
            AND TABLE_NAME = 'clientes'
            ORDER BY ORDINAL_POSITION
        `;

    db.query(clientesStructureQuery, (err, clientesColumns) => {
      if (err) {
        console.error("❌ Error al verificar estructura de clientes:", err);
        return;
      }

      console.log("\n👤 ESTRUCTURA TABLA CLIENTES:");
      if (clientesColumns.length === 0) {
        console.log("   ❌ Tabla clientes no existe");
      } else {
        clientesColumns.forEach((column) => {
          console.log(
            `   📊 ${column.COLUMN_NAME} (${column.DATA_TYPE}) - Nullable: ${column.IS_NULLABLE}`
          );
        });
      }

      // Verificar estructura de tabla especialistas
      const especialistasStructureQuery = `
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = 'care_planer' 
                AND TABLE_NAME = 'especialistas'
                ORDER BY ORDINAL_POSITION
            `;

      db.query(especialistasStructureQuery, (err, especialistasColumns) => {
        if (err) {
          console.error(
            "❌ Error al verificar estructura de especialistas:",
            err
          );
          return;
        }

        console.log("\n👨‍⚕️ ESTRUCTURA TABLA ESPECIALISTAS:");
        if (especialistasColumns.length === 0) {
          console.log("   ❌ Tabla especialistas no existe");
        } else {
          especialistasColumns.forEach((column) => {
            console.log(
              `   📊 ${column.COLUMN_NAME} (${column.DATA_TYPE}) - Nullable: ${column.IS_NULLABLE}`
            );
          });
        }

        // Verificar estructura de tabla turnos
        const turnosStructureQuery = `
                    SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
                    FROM information_schema.COLUMNS 
                    WHERE TABLE_SCHEMA = 'care_planer' 
                    AND TABLE_NAME = 'turnos'
                    ORDER BY ORDINAL_POSITION
                `;

        db.query(turnosStructureQuery, (err, turnosColumns) => {
          if (err) {
            console.error("❌ Error al verificar estructura de turnos:", err);
            return;
          }

          console.log("\n📅 ESTRUCTURA TABLA TURNOS:");
          if (turnosColumns.length === 0) {
            console.log("   ❌ Tabla turnos no existe");
          } else {
            turnosColumns.forEach((column) => {
              console.log(
                `   📊 ${column.COLUMN_NAME} (${column.DATA_TYPE}) - Nullable: ${column.IS_NULLABLE}`
              );
            });
          }

          // Cerrar conexión
          setTimeout(() => {
            db.end();
            console.log("\n🔌 Conexión a la base de datos cerrada");
            process.exit(0);
          }, 2000);
        });
      });
    });
  });
};

// Ejecutar verificación si el script se ejecuta directamente
if (require.main === module) {
  checkDatabase();
}

module.exports = checkDatabase;
