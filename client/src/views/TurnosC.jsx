import React, { useState, useEffect } from 'react';
import "./TurnosC.css";
import { Menu } from "../components/Menu";
import { TurnoC } from "../components/TurnoC";
import { InfoE } from '../components/InfoE';  
import { useUser } from '../context/UserContext';

function TurnosC() {
    const { user } = useUser();  // Obtenemos el usuario registrado
    const [turnos, setTurnos] = useState([]);
    const [mostrarInfo, setMostrarInfo] = useState(false);
    const [infoEspecialista, setInfoEspecialista] = useState(null);

    useEffect(() => {
        if (user) {
            // Obtener los turnos del cliente desde el backend
            fetch(`http://localhost:3003/turnos/${user.dni}`)
                .then(response => response.json())
                .then(data => {
                    setTurnos(data);
                })
                .catch(error => console.error('Error al cargar los turnos:', error));
        }
    }, [user]);

    const handleVerInfo = (dniEspecialista) => {
        const cleanedDni = dniEspecialista.trim();  // Elimina espacios en blanco
        fetch(`http://localhost:3003/especialis/${cleanedDni}`)
            .then(response => response.json())
            .then(data => {
                setInfoEspecialista(data);
                setMostrarInfo(true);
            })
            .catch(error => console.error('Error al cargar la información del especialista:', error));
    };

    const handleCancelarTurno = (idTurno) => {
        fetch(`http://localhost:3003/turnos/${idTurno}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                setTurnos(prevTurnos => prevTurnos.filter(turno => turno.id !== idTurno));
                alert('turno cancelado correctamente');
            } else {
                console.error('Error al cancelar el turno:', data.message);
            }
        })
        .catch(error => console.error('Error al cancelar el turno:', error));
    };

    const handleVolver = () => {
        setMostrarInfo(false);
        setInfoEspecialista(null);  // Resetea la información del especialista
    };

    return (
        <div>
            <Menu />
            <div className={`cuerpo-turnosc ${mostrarInfo ? 'blur-background' : ''}`}>
                <div className='tur'>Turnos</div>
                {!mostrarInfo ? (
                    <div className='turnosc'>
                        {turnos.length > 0 ? (
                            turnos.map(turno => (
                                <TurnoC
                                    key={turno.id}
                                    fecha={turno.fecha}
                                    hora={turno.hora}
                                    nombreEspecialista={turno.nombre_especialista}
                                    especialidad={turno.especialidad}
                                    direccion={turno.direccion}
                                    onVerInfo={() => handleVerInfo(turno.dni_especialista)}
                                    onCancelar={() => handleCancelarTurno(turno.id)}  // Pasa la función de cancelación
                                />
                            ))
                        ) : (
                            <p className='notur' >No tienes turnos programados.</p>
                        )}
                    </div>
                ) : (
                    <InfoE info={infoEspecialista} onVolver={handleVolver} />
                )}
            </div>
        </div>
    );
}

export default TurnosC;