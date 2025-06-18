import React from 'react';
import "./TurnoE.css";

export function TurnoE({ turno, onVolver, cargarTurnos }) {

    const cancelarTurno = () => {
        fetch(`http://localhost:3003/turnos/${turno.id}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                alert("Turno cancelado correctamente");
                cargarTurnos(); // Recargar la lista de turnos
                onVolver(); // Volver a la vista de turnos
            } else {
                alert("Error al cancelar el turno");
            }
        })
        .catch(error => {
            console.error('Error al cancelar el turno:', error);
            alert("Hubo un error al intentar cancelar el turno");
        });
    };

    // Formatear la fecha y la hora
    const fecha = new Date(turno.fecha).toLocaleDateString('es-AR'); // Formato de fecha dd/mm/yyyy
    const hora = new Date(`1970-01-01T${turno.hora}`).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
    }); // Formato de hora hh:mm

    return (
        <div className='turno-container'>
            <div className="turno-detalles">
                <div className="turno-infoo">
                    <span className='tu'>Turno<br /></span>
                    <span>{fecha} <br />{hora} hs</span>
                </div>
                <div className="paciente-info">
                    <span className='tar'>Paciente</span>
                    <span>{turno.nombre}</span> {/* Aquí se accede directamente a los detalles del cliente */}
                    <span>{turno.email}</span>
                    <span>{turno.telefono}</span>
                </div>
            </div>
            <div className="acciones">
                <button onClick={onVolver}>Volver</button>
                <button onClick={cancelarTurno}>Cancelar turno</button>
            </div>
        </div>
    );
}