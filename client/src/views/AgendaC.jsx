import { useState, useEffect } from "react";
import "./AgendaC.css";
import { Menu } from "../components/Menu";
import { InfoE } from "../components/InfoE";
import Turno from "../components/Turno";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom"; // Para redirigir

function AgendaC() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [especialista, setEspecialista] = useState("");
  const [especialistas, setEspecialistas] = useState([]);
  const [mostrarInfo, setMostrarInfo] = useState(false);
  const [infoEspecialista, setInfoEspecialista] = useState(null);
  const [turnosDisponibles, setTurnosDisponibles] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [errorMessage, setErrorMessage] = useState(""); // Mensaje de error
  const [loading, setLoading] = useState(false);

  // Estado para la ventana modal
  const [modalVisible, setModalVisible] = useState(false);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);

  const diasSemana = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];

  useEffect(() => {
    fetch("http://localhost:3003/especialistas")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al cargar especialistas");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setEspecialistas(data.data || []);
        } else {
          console.error("Error al cargar especialistas:", data.message);
        }
      })
      .catch((error) =>
        console.error("Error al cargar los especialistas:", error)
      );
  }, []);

  const handleBuscarTurnos = () => {
    if (
      especialista &&
      selectedYear &&
      selectedMonth &&
      selectedDay &&
      infoEspecialista
    ) {
      const fecha = `${selectedYear}-${
        selectedMonth < 10 ? "0" : ""
      }${selectedMonth}-${selectedDay < 10 ? "0" : ""}${selectedDay}`;

      // Crear la fecha usando Date.UTC para evitar problemas de zona horaria
      const fechaSeleccionada = new Date(
        Date.UTC(selectedYear, selectedMonth - 1, selectedDay)
      );
      const diaSeleccionado = fechaSeleccionada.getUTCDay(); // 0 para domingo, 1 para lunes, etc.
      const diasAtencionEspecialista = infoEspecialista.dias_atencion
        .toLowerCase()
        .split(",");

      if (!diasAtencionEspecialista.includes(diasSemana[diaSeleccionado])) {
        setErrorMessage(
          `El especialista no atiende los días ${diasSemana[diaSeleccionado]}.`
        );
        setTurnosDisponibles([]);
        return;
      }

      setErrorMessage(""); // Limpiar el mensaje de error
      fetchTurnosOcupados(fecha);
    }
  };

  const fetchTurnosOcupados = (fecha) => {
    setLoading(true);
    const url = `http://localhost:3003/turnos-ocupados/${especialista}/${fecha}`;
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al cargar turnos ocupados");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          generateTurnosDisponibles(data.data || []);
        } else {
          console.error("Error al cargar turnos ocupados:", data.message);
          setTurnosDisponibles([]);
        }
      })
      .catch((error) => {
        console.error("Error al cargar los turnos ocupados:", error);
        setTurnosDisponibles([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const generateTurnosDisponibles = (turnosOcupadosData) => {
    if (!infoEspecialista) return;
    const turnos = [];
    const { rango1_inicio, rango1_fin, rango2_inicio, rango2_fin } =
      infoEspecialista;
    const generateTimeslots = (start, end) => {
      if (!start || !end) return;
      let startTime = new Date(`1970-01-01T${start}`);
      let endTime = new Date(`1970-01-01T${end}`);
      const turnosOcupadosSet = new Set(
        turnosOcupadosData.map((hora) => hora.slice(0, 5))
      );
      while (startTime < endTime) {
        const formattedTime = startTime.toTimeString().slice(0, 5);
        const ocupado = turnosOcupadosSet.has(formattedTime);
        turnos.push({ hora: formattedTime, ocupado });
        startTime.setMinutes(startTime.getMinutes() + 30);
      }
    };

    if (rango1_inicio && rango1_fin)
      generateTimeslots(rango1_inicio, rango1_fin);
    if (rango2_inicio && rango2_fin)
      generateTimeslots(rango2_inicio, rango2_fin);

    setTurnosDisponibles(turnos);
  };

  const handleReservarTurno = (turno) => {
    setTurnoSeleccionado(turno);
    setModalVisible(true);
  };

  const handleAceptarReserva = () => {
    const fecha = `${selectedYear}-${
      selectedMonth < 10 ? "0" : ""
    }${selectedMonth}-${selectedDay < 10 ? "0" : ""}${selectedDay}`;

    // Llamada al back-end para crear el turno
    fetch("http://localhost:3003/crear-turno", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dni_cliente: user.dni,
        dni_especialista: especialista,
        fecha,
        hora: turnoSeleccionado.hora,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("Turno creado con éxito:", data);
          setModalVisible(false);
          navigate("/turnosc"); // Redirigir a TurnosC
        } else {
          alert(data.message || "Error al crear el turno");
        }
      })
      .catch((error) => {
        console.error("Error al reservar el turno:", error);
        alert("Error de conexión al reservar el turno");
      });
  };

  const handleCancelarReserva = () => {
    setModalVisible(false);
  };

  const handleEspecialistaChange = (e) => {
    const especialistaDni = e.target.value;
    setEspecialista(especialistaDni);
    setInfoEspecialista(null);
    setMostrarInfo(false);
    setTurnosDisponibles([]);
  };

  const handleVerInfo = () => {
    if (especialista) {
      fetch(`http://localhost:3003/especialis/${especialista}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error al cargar información del especialista");
          }
          return response.json();
        })
        .then((data) => {
          if (data.success) {
            setInfoEspecialista(data.data || data);
            setMostrarInfo(true);
          } else {
            alert(
              data.message || "Error al cargar información del especialista"
            );
          }
        })
        .catch((error) => {
          console.error(
            "Error al cargar la información del especialista:",
            error
          );
          alert("Error de conexión al cargar información del especialista");
        });
    }
  };

  const handleVerTurnos = () => {
    if (especialista) {
      fetch(`http://localhost:3003/especialis/${especialista}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error al cargar información del especialista");
          }
          return response.json();
        })
        .then((data) => {
          if (data.success) {
            setInfoEspecialista(data.data || data);
            setMostrarInfo(false);
            handleBuscarTurnos();
          } else {
            alert(
              data.message || "Error al cargar información del especialista"
            );
          }
        })
        .catch((error) => {
          console.error(
            "Error al cargar la información del especialista:",
            error
          );
          alert("Error de conexión al cargar información del especialista");
        });
    }
  };

  const handleVolver = () => {
    setMostrarInfo(false);
    setInfoEspecialista(null);
  };

  const handleYearChange = (e) => setSelectedYear(e.target.value);
  const handleMonthChange = (e) => setSelectedMonth(e.target.value);
  const handleDayChange = (e) => setSelectedDay(e.target.value);

  const yearOptions = [];
  for (
    let i = new Date().getFullYear();
    i <= new Date().getFullYear() + 5;
    i++
  ) {
    yearOptions.push(
      <option key={i} value={i}>
        {i}
      </option>
    );
  }

  const monthOptions = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
  ];

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const dayOptions = [];
  for (let i = 1; i <= daysInMonth; i++) {
    dayOptions.push(
      <option key={i} value={i}>
        {i}
      </option>
    );
  }

  return (
    <div>
      <Menu />
      <div className={`cuerpo-agendac ${mostrarInfo ? "blur-background" : ""}`}>
        <div className="tur">Turnos disponibles</div>
        {!mostrarInfo ? (
          <div className="agenda-containerr">
            <div className="selectors">
              <select
                className="especialista-select"
                value={especialista}
                onChange={handleEspecialistaChange}
              >
                <option value="">Seleccionar especialista</option>
                {especialistas.map((esp, index) => (
                  <option key={index} value={esp.dni}>
                    {esp.especialidad} / {esp.nombre_apellido}
                  </option>
                ))}
              </select>
              <button className="info-btn" onClick={handleVerInfo}>
                Ver información
              </button>
            </div>
            <div className="date-selectors">
              <select
                className="year-select"
                value={selectedYear}
                onChange={handleYearChange}
              >
                {yearOptions}
              </select>

              <select
                className="month-select"
                value={selectedMonth}
                onChange={handleMonthChange}
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>

              <select
                className="day-select"
                value={selectedDay}
                onChange={handleDayChange}
              >
                {dayOptions}
              </select>

              <button className="buscar-btn" onClick={handleVerTurnos}>
                Buscar turnos
              </button>
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {loading && <p className="loading">Cargando turnos...</p>}
            <div className="turnos-disponibles">
              {turnosDisponibles.length === 0 && !errorMessage && !loading ? (
                <p>-</p>
              ) : (
                turnosDisponibles.map((turno, index) => (
                  <Turno
                    key={index}
                    hora={turno.hora}
                    ocupado={turno.ocupado}
                    onClick={() =>
                      turno.ocupado ? null : handleReservarTurno(turno)
                    }
                  />
                ))
              )}
            </div>
          </div>
        ) : (
          <InfoE info={infoEspecialista} onVolver={handleVolver} />
        )}

        {modalVisible && (
          <div className="modal">
            <div className="modal-content">
              <p>
                ¿Reservar turno el {selectedDay}/{selectedMonth}/{selectedYear}{" "}
                a las {turnoSeleccionado?.hora}?
              </p>
              <button className="btn-confirm" onClick={handleAceptarReserva}>
                Aceptar
              </button>
              <button className="btn-cancel" onClick={handleCancelarReserva}>
                Volver
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AgendaC;
