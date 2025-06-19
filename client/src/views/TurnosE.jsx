import { useState, useEffect } from "react";
import "./TurnosE.css";
import { Menu } from "../components/Menu";
import { TurnoE } from "../components/TurnoE";
import { useUser } from "../context/UserContext";

function TurnosE() {
  const { user } = useUser();
  const [turnos, setTurnos] = useState([]);
  const [selectedTurno, setSelectedTurno] = useState(null);
  const [startOfWeek, setStartOfWeek] = useState(getStartOfWeek(new Date())); // Asegurar que la semana empiece en lunes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para formatear la fecha en formato dd/mm/yyyy
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formatted = `${year}-${month}-${day}`;
    console.log("TurnosE - formatDate:", date.toDateString(), "->", formatted);
    return formatted;
  };

  // Función para obtener el inicio de la semana (lunes)
  function getStartOfWeek(date) {
    const day = date.getDay(); // Obtener el día de la semana (0=domingo, 1=lunes...)
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajustar al lunes
    return new Date(date.setDate(diff)); // Ajustar fecha
  }

  // Cargar turnos del especialista logueado
  const cargarTurnos = () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const fechaInicio = formatDate(startOfWeek);
    const fechaFin = formatDate(
      new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000)
    ); // Sumar 6 días

    console.log("TurnosE - Cargando turnos para especialista:", user.dni);
    console.log("TurnosE - Fecha inicio:", fechaInicio);
    console.log("TurnosE - Fecha fin:", fechaFin);

    fetch(
      `http://localhost:3003/turnos-especialista/${user.dni}?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al cargar los turnos");
        }
        return response.json();
      })
      .then((data) => {
        console.log("TurnosE - Respuesta del servidor:", data);
        if (data.success) {
          console.log("TurnosE - Turnos recibidos:", data.data);
          setTurnos(data.data || []);
        } else {
          console.log("TurnosE - Error en la respuesta:", data.message);
          setError(data.message || "Error al cargar los turnos");
          setTurnos([]);
        }
      })
      .catch((error) => {
        console.error("Error al cargar los turnos:", error);
        setError("Error de conexión al cargar los turnos");
        setTurnos([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (user) {
      cargarTurnos();
    }
  }, [user, startOfWeek]);

  // Función para manejar el cambio de semana
  const cambiarSemana = (direccion) => {
    const nuevaFechaInicio = new Date(startOfWeek);
    nuevaFechaInicio.setDate(startOfWeek.getDate() + direccion * 7); // Cambiar semana
    setStartOfWeek(getStartOfWeek(nuevaFechaInicio)); // Recalcular para asegurar que empieza en lunes
  };

  // Función para mostrar el detalle del turno seleccionado
  const seleccionarTurno = (turno) => {
    setSelectedTurno(turno);
  };

  // Función para volver a la vista de los turnos
  const volverATurnos = () => {
    console.log("TurnosE - Volviendo a la vista de turnos");
    setSelectedTurno(null);
  };

  // Mostrar los días de la semana
  const diasSemana = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  const dias = diasSemana.map((dia, index) => {
    const fechaDia = new Date(startOfWeek);
    fechaDia.setDate(startOfWeek.getDate() + index);
    return {
      nombre: dia,
      fecha: fechaDia,
    };
  });

  console.log(
    "TurnosE - Días de la semana:",
    dias.map((d) => ({ nombre: d.nombre, fecha: d.fecha.toDateString() }))
  );
  console.log("TurnosE - Turnos cargados:", turnos);

  return (
    <div className="cuerpo-turnose">
      <Menu />
      {selectedTurno && <div className="overlay"></div>}
      <div>
        {!selectedTurno ? (
          <>
            <div className="turo">Turnos</div>
            <div className="navegacion-semanal">
              <button onClick={() => cambiarSemana(-1)}>{"<"}</button>
              <span>{`${formatDate(startOfWeek)} - ${formatDate(
                new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000)
              )}`}</span>
              <button onClick={() => cambiarSemana(1)}>{">"}</button>
            </div>

            {loading && <div className="loading">Cargando turnos...</div>}
            {error && <div className="error">{error}</div>}

            <div className="cal">
              <table>
                <thead>
                  <tr>
                    {dias.map((dia) => (
                      <th key={dia.nombre}>{`${
                        dia.nombre
                      } ${dia.fecha.getDate()}/${
                        dia.fecha.getMonth() + 1
                      }`}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {dias.map((dia) => (
                      <td key={dia.nombre}>
                        {Array.isArray(turnos) &&
                          turnos
                            .filter((turno) => {
                              const turnoFecha = new Date(turno.fecha);
                              const diaFecha = dia.fecha;

                              // Comparar fecha completa (día, mes y año)
                              const sonMismaFecha =
                                turnoFecha.getDate() === diaFecha.getDate() &&
                                turnoFecha.getMonth() === diaFecha.getMonth() &&
                                turnoFecha.getFullYear() ===
                                  diaFecha.getFullYear();

                              return sonMismaFecha;
                            })
                            .map((turno) => (
                              <div
                                key={turno.id}
                                className="turno-hora"
                                onClick={() => seleccionarTurno(turno)}
                              >
                                {turno.hora.slice(0, 5)}
                              </div>
                            ))}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <TurnoE
            turno={selectedTurno}
            onVolver={volverATurnos}
            cargarTurnos={cargarTurnos}
          />
        )}
      </div>
    </div>
  );
}

export default TurnosE;
