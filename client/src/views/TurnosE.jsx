import React, { useState, useEffect } from 'react';
import "./TurnosE.css";
import { Menu } from "../components/Menu";
import { TurnoE } from '../components/TurnoE';
import { useUser } from '../context/UserContext';

function TurnosE() {
    const { user } = useUser();
    const [turnos, setTurnos] = useState([]);
    const [selectedTurno, setSelectedTurno] = useState(null);
    const [startOfWeek, setStartOfWeek] = useState(getStartOfWeek(new Date())); // Asegurar que la semana empiece en lunes

    // Función para formatear la fecha en formato dd/mm/yyyy
    const formatDate = (date) => {
        return date.toISOString().slice(0, 10);
    };

    // Función para obtener el inicio de la semana (lunes)
    function getStartOfWeek(date) {
        const day = date.getDay(); // Obtener el día de la semana (0=domingo, 1=lunes...)
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajustar al lunes
        return new Date(date.setDate(diff)); // Ajustar fecha
    }

    // Cargar turnos del especialista logueado
    const cargarTurnos = () => {
        const fechaInicio = formatDate(startOfWeek);
        const fechaFin = formatDate(new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000)); // Sumar 6 días

        fetch(`http://localhost:3003/turnos-especialista/${user.dni}?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`)
            .then(response => response.json())
            .then(data => setTurnos(data))
            .catch(error => console.error('Error al cargar los turnos:', error));
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
        setSelectedTurno(null);
    };

    // Mostrar los días de la semana
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const dias = diasSemana.map((dia, index) => {
        const fechaDia = new Date(startOfWeek);
        fechaDia.setDate(startOfWeek.getDate() + index);
        return {
            nombre: dia,
            fecha: fechaDia,
        };
    });

    return (
        <div className={`cuerpo-turnose ${selectedTurno ? 'blur-background' : ''}`}>
            <Menu />
            <div>
                {!selectedTurno ? (
                    <>
                        <div className='turo'>Turnos</div>
                        <div className='navegacion-semanal'>
                            <button onClick={() => cambiarSemana(-1)}>{"<"}</button>
                            <span>{`${formatDate(startOfWeek)} - ${formatDate(new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000))}`}</span>
                            <button onClick={() => cambiarSemana(1)}>{">"}</button>
                        </div>
                        <div className='cal'>
                            <table>
                                <thead>
                                    <tr>
                                        {dias.map(dia => (
                                            <th key={dia.nombre}>{`${dia.nombre} ${dia.fecha.getDate()}/${dia.fecha.getMonth() + 1}`}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {dias.map(dia => (
                                            <td key={dia.nombre}>
                                                {turnos
                                                    .filter(turno => new Date(turno.fecha).getDate() === dia.fecha.getDate())
                                                    .map(turno => (
                                                        <div key={turno.id} className='turno-hora' onClick={() => seleccionarTurno(turno)}>
                                                            {turno.hora.slice(0, 5)}
                                                        </div>
                                                    ))
                                                }
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <>
                        <div className='overlay'></div>
                        <TurnoE turno={selectedTurno} onVolver={volverATurnos} cargarTurnos={cargarTurnos} />
                    </>
                )}
            </div>
        </div>
    );
}

export default TurnosE;