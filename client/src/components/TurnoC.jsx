import React from 'react';
import "./TurnoC.css";

export function TurnoC({ fecha, hora, nombreEspecialista, especialidad, direccion, onVerInfo, onCancelar }) {
    return (
        <div className='turnoo'>
            <div className="turno-info">
                <div className="fecha-hora">
                    <span>{new Date(fecha).toLocaleDateString()}</span>
                    <span className='ho'>{hora} hs</span>
                </div>
                <div className="detalles">
                    <span>{nombreEspecialista}</span>
                    <span> / {especialidad}</span>
                </div>
                <div className="ubicacion">
                    <img src="../../public/fotosApp/logo-ubicacion.png" alt="Ubicación" className="ubi" />
                    <span>{direccion}</span>
                </div>
            </div>
            <button onClick={onVerInfo}>Ver profesional</button>
            <button className="cancelar-turno" onClick={onCancelar}>Cancelar turno</button>
        </div>
    );
}
