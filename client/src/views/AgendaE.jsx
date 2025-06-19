import { useState, useEffect } from "react";
import "./AgendaE.css";
import { Menu } from "../components/Menu";
import { useUser } from "../context/UserContext";

function AgendaE() {
  const { user } = useUser();
  const [horario1, setHorario1] = useState({ inicio: "N", fin: "N" });
  const [horario2, setHorario2] = useState({ inicio: "N", fin: "N" });
  const [diasAtencion, setDiasAtencion] = useState({
    lunes: false,
    martes: false,
    miercoles: false,
    jueves: false,
    viernes: false,
    sabado: false,
    domingo: false,
  });
  const [rangoActual, setRangoActual] = useState({
    rango1: "N - N",
    rango2: "N - N",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para formatear el tiempo a HH:MM
  const formatTime = (time) => {
    console.log("AgendaE - formatTime recibió:", time, "Tipo:", typeof time);

    if (
      !time ||
      time === "N" ||
      time === null ||
      time === undefined ||
      time === ""
    ) {
      console.log("AgendaE - formatTime retorna N (valor vacío)");
      return "N";
    }

    // Si es un string, intentar formatearlo
    if (typeof time === "string") {
      // Si ya está en formato HH:MM, devolverlo
      if (time.match(/^\d{2}:\d{2}$/)) {
        console.log("AgendaE - formatTime retorna (HH:MM):", time);
        return time;
      }
      // Si tiene segundos (HH:MM:SS), cortar a HH:MM
      if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
        const formatted = time.slice(0, 5);
        console.log(
          "AgendaE - formatTime retorna (HH:MM:SS -> HH:MM):",
          formatted
        );
        return formatted;
      }
      // Si es solo un número, convertirlo a HH:MM
      if (time.match(/^\d+$/)) {
        const hours = Math.floor(time / 100);
        const minutes = time % 100;
        const formatted = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;
        console.log(
          "AgendaE - formatTime retorna (número -> HH:MM):",
          formatted
        );
        return formatted;
      }
    }

    // Si es un objeto Date o Time, convertirlo
    if (time instanceof Date) {
      const formatted = time.toTimeString().slice(0, 5);
      console.log("AgendaE - formatTime retorna (Date -> HH:MM):", formatted);
      return formatted;
    }

    console.log("AgendaE - formatTime retorna N (formato no reconocido)");
    return "N";
  };

  // Función para cargar los datos del usuario
  const cargarDatosUsuario = () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    fetch(`http://localhost:3003/user/${user.dni}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al cargar datos del usuario");
        }
        return response.json();
      })
      .then((data) => {
        console.log("AgendaE - Datos recibidos:", data);
        console.log("AgendaE - Tipo de datos:", typeof data);
        console.log("AgendaE - Es array:", Array.isArray(data));

        // Los datos ahora vienen directamente, no envueltos en data.success
        const userData = data;

        console.log(
          "AgendaE - Rango1_inicio:",
          userData.rango1_inicio,
          "Tipo:",
          typeof userData.rango1_inicio
        );
        console.log(
          "AgendaE - Rango1_fin:",
          userData.rango1_fin,
          "Tipo:",
          typeof userData.rango1_fin
        );
        console.log(
          "AgendaE - Rango2_inicio:",
          userData.rango2_inicio,
          "Tipo:",
          typeof userData.rango2_inicio
        );
        console.log(
          "AgendaE - Rango2_fin:",
          userData.rango2_fin,
          "Tipo:",
          typeof userData.rango2_fin
        );
        console.log(
          "AgendaE - Dias_atencion:",
          userData.dias_atencion,
          "Tipo:",
          typeof userData.dias_atencion
        );

        // Función auxiliar para verificar si un valor de tiempo es válido
        const isValidTime = (time) => {
          console.log(
            "AgendaE - isValidTime recibió:",
            time,
            "Tipo:",
            typeof time
          );

          // Verificar si es null, undefined, vacío o "N"
          if (
            !time ||
            time === null ||
            time === undefined ||
            time === "" ||
            time === "N"
          ) {
            console.log("AgendaE - isValidTime retorna false (valor vacío)");
            return false;
          }

          // Verificar si es un string con formato de tiempo válido
          if (typeof time === "string") {
            // Formato HH:MM
            if (time.match(/^\d{2}:\d{2}$/)) {
              console.log("AgendaE - isValidTime retorna true (HH:MM)");
              return true;
            }
            // Formato HH:MM:SS
            if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
              console.log("AgendaE - isValidTime retorna true (HH:MM:SS)");
              return true;
            }
            // Formato numérico (ej: 900 para 9:00)
            if (time.match(/^\d+$/)) {
              console.log("AgendaE - isValidTime retorna true (número)");
              return true;
            }
          }

          // Verificar si es un objeto Date
          if (time instanceof Date) {
            console.log("AgendaE - isValidTime retorna true (Date)");
            return true;
          }

          console.log(
            "AgendaE - isValidTime retorna false (formato no reconocido)"
          );
          return false;
        };

        setHorario1({
          inicio: isValidTime(userData.rango1_inicio)
            ? formatTime(userData.rango1_inicio)
            : "N",
          fin: isValidTime(userData.rango1_fin)
            ? formatTime(userData.rango1_fin)
            : "N",
        });
        setHorario2({
          inicio: isValidTime(userData.rango2_inicio)
            ? formatTime(userData.rango2_inicio)
            : "N",
          fin: isValidTime(userData.rango2_fin)
            ? formatTime(userData.rango2_fin)
            : "N",
        });

        console.log("AgendaE - Horario1 establecido:", {
          inicio: isValidTime(userData.rango1_inicio)
            ? formatTime(userData.rango1_inicio)
            : "N",
          fin: isValidTime(userData.rango1_fin)
            ? formatTime(userData.rango1_fin)
            : "N",
        });
        console.log("AgendaE - Horario2 establecido:", {
          inicio: isValidTime(userData.rango2_inicio)
            ? formatTime(userData.rango2_inicio)
            : "N",
          fin: isValidTime(userData.rango2_fin)
            ? formatTime(userData.rango2_fin)
            : "N",
        });

        setRangoActual({
          rango1: `${formatTime(userData.rango1_inicio)} - ${formatTime(
            userData.rango1_fin
          )}`,
          rango2: `${formatTime(userData.rango2_inicio)} - ${formatTime(
            userData.rango2_fin
          )}`,
        });

        console.log("AgendaE - Rango actual establecido:", {
          rango1: `${formatTime(userData.rango1_inicio)} - ${formatTime(
            userData.rango1_fin
          )}`,
          rango2: `${formatTime(userData.rango2_inicio)} - ${formatTime(
            userData.rango2_fin
          )}`,
        });

        const diasAtencionArray = userData.dias_atencion
          ? userData.dias_atencion.split(",")
          : [];
        console.log("AgendaE - Dias de atención array:", diasAtencionArray);

        setDiasAtencion((prevState) => {
          const newState = { ...prevState };
          diasAtencionArray.forEach((dia) => {
            if (dia && dia.trim() !== "") {
              newState[dia.trim()] = true;
            }
          });
          console.log("AgendaE - Nuevo estado de días:", newState);
          return newState;
        });
      })
      .catch((error) => {
        console.error("Error al cargar los datos del especialista:", error);
        setError("Error de conexión al cargar datos del usuario");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarDatosUsuario(); // Cargar los datos cuando se monta el componente
  }, [user]);

  if (!user) {
    return (
      <div>Error: El usuario no está disponible. Por favor, inicie sesión.</div>
    );
  }

  const horarios = [
    "N",
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
  ];

  const diasSemana = [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
    "domingo",
  ];

  const handleDiaChange = (dia) => {
    setDiasAtencion({
      ...diasAtencion,
      [dia]: !diasAtencion[dia],
    });
  };

  const handleSaveChanges = () => {
    const diasAtencionString = diasSemana
      .filter((dia) => diasAtencion[dia])
      .join(",");

    const requestBody = {
      rango1_inicio: horario1.inicio !== "N" ? horario1.inicio : null,
      rango1_fin: horario1.fin !== "N" ? horario1.fin : null,
      rango2_inicio: horario2.inicio !== "N" ? horario2.inicio : null,
      rango2_fin: horario2.fin !== "N" ? horario2.fin : null,
      dias_atencion: diasAtencionString || null,
      tipo_usuario: user.tipo_usuario,
    };

    console.log("AgendaE - Enviando datos:", requestBody);

    fetch(`http://localhost:3003/user/${user.dni}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.message || "Error al actualizar datos");
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("AgendaE - Respuesta del servidor:", data);
        if (
          data.success ||
          data.message === "Información actualizada correctamente"
        ) {
          alert("Cambios guardados correctamente");
          cargarDatosUsuario(); // Recargar los datos del usuario
        } else {
          alert(data.message || "Ocurrió un error al guardar los cambios");
        }
      })
      .catch((error) => {
        console.error("Error al guardar los cambios:", error);
        alert(error.message || "Error de conexión al guardar los cambios");
      });
  };

  return (
    <div>
      <Menu />
      <div className="agenda-container">
        <h2>Establecer turnos</h2>
        <p className="te">Elegi el rango horario de tus turnos</p>

        {loading && <div className="loading">Cargando datos...</div>}
        {error && <div className="error">{error}</div>}

        <div className="horario">
          <select
            value={horario1.inicio}
            onChange={(e) =>
              setHorario1({ ...horario1, inicio: e.target.value })
            }
          >
            {horarios.map((hora) => (
              <option key={hora} value={hora}>
                {hora}
              </option>
            ))}
          </select>
          <div className="aa">/</div>
          <select
            value={horario1.fin}
            onChange={(e) => setHorario1({ ...horario1, fin: e.target.value })}
          >
            {horarios.map((hora) => (
              <option key={hora} value={hora}>
                {hora}
              </option>
            ))}
          </select>
        </div>
        <div className="horario">
          <select
            value={horario2.inicio}
            onChange={(e) =>
              setHorario2({ ...horario2, inicio: e.target.value })
            }
          >
            {horarios.map((hora) => (
              <option key={hora} value={hora}>
                {hora}
              </option>
            ))}
          </select>
          <div className="aa">/</div>
          <select
            value={horario2.fin}
            onChange={(e) => setHorario2({ ...horario2, fin: e.target.value })}
          >
            {horarios.map((hora) => (
              <option key={hora} value={hora}>
                {hora}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="te">Rango horario actual:</p>
          <p>Primer rango: {rangoActual.rango1}</p>
          <p>Segundo rango: {rangoActual.rango2}</p>
        </div>
        <p className="te">Días de atención</p>
        <div className="dias-semana">
          {diasSemana.map((dia) => (
            <div key={dia} className="dia-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={diasAtencion[dia]}
                  onChange={() => handleDiaChange(dia)}
                />
                {dia.charAt(0).toUpperCase() + dia.slice(1)}
              </label>
            </div>
          ))}
        </div>
        <button className="guardar-btn" onClick={handleSaveChanges}>
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

export default AgendaE;
