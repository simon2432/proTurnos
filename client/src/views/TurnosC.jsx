import { useState, useEffect } from "react";
import "./TurnosC.css";
import { Menu } from "../components/Menu";
import { TurnoC } from "../components/TurnoC";
import { InfoE } from "../components/InfoE";
import { useUser } from "../context/UserContext";

function TurnosC() {
  const { user } = useUser();
  const [turnos, setTurnos] = useState([]);
  const [mostrarInfo, setMostrarInfo] = useState(false);
  const [infoEspecialista, setInfoEspecialista] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      cargarTurnos();
    }
  }, [user]);

  const cargarTurnos = () => {
    setLoading(true);
    setError(null);

    fetch(`http://localhost:3003/turnos/${user.dni}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al cargar los turnos");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setTurnos(data.data || []);
        } else {
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

  const handleVerInfo = (dniEspecialista) => {
    const cleanedDni = dniEspecialista.trim();
    fetch(`http://localhost:3003/especialis/${cleanedDni}`)
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
          alert(data.message || "Error al cargar información del especialista");
        }
      })
      .catch((error) => {
        console.error(
          "Error al cargar la información del especialista:",
          error
        );
        alert("Error de conexión al cargar información del especialista");
      });
  };

  const handleCancelarTurno = (idTurno) => {
    fetch(`http://localhost:3003/turnos/${idTurno}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setTurnos((prevTurnos) =>
            prevTurnos.filter((turno) => turno.id !== idTurno)
          );
          alert("Turno cancelado correctamente");
        } else {
          alert(data.message || "Error al cancelar el turno");
        }
      })
      .catch((error) => {
        console.error("Error al cancelar el turno:", error);
        alert("Error de conexión al cancelar el turno");
      });
  };

  const handleVolver = () => {
    setMostrarInfo(false);
    setInfoEspecialista(null);
  };

  return (
    <div>
      <Menu />
      <div className={`cuerpo-turnosc ${mostrarInfo ? "blur-background" : ""}`}>
        <div className="tur">Turnos</div>
        {!mostrarInfo ? (
          <div className="turnosc">
            {loading && <div className="loading">Cargando turnos...</div>}
            {error && <div className="error">{error}</div>}

            {!loading && !error && turnos.length > 0 ? (
              turnos.map((turno) => (
                <TurnoC
                  key={turno.id}
                  fecha={turno.fecha}
                  hora={turno.hora}
                  nombreEspecialista={turno.nombre_especialista}
                  especialidad={turno.especialidad}
                  direccion={turno.direccion}
                  onVerInfo={() => handleVerInfo(turno.dni_especialista)}
                  onCancelar={() => handleCancelarTurno(turno.id)}
                />
              ))
            ) : !loading && !error ? (
              <p className="notur">No tienes turnos programados.</p>
            ) : null}
          </div>
        ) : (
          <InfoE info={infoEspecialista} onVolver={handleVolver} />
        )}
      </div>
    </div>
  );
}

export default TurnosC;
