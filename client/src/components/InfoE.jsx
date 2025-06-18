import React from "react";
import "./InfoE.css";

export function InfoE({ info, onVolver }) {
    return (
        <div className="modal-overlay">
            <div className="infoe-container">
                <div className="profile">
                    <div className="espa" style={{ backgroundImage: `url(${info.imagen})` }}></div>
                    <div className="profile-details">
                        <ul>
                            <li><p><strong>{info.nombre_apellido}</strong></p></li>
                            <li>Especialidad:<p>{info.especialidad}</p></li>
                            <li>Telefono:<p>{info.telefono}</p></li>
                            <li>Email:<p>{info.email}</p></li>
                            <li className="location">
                                <img src="../../public/fotosApp/logo-ubicacion.png" alt="Ubicación" className="ub" />
                                Direccion:<p>{info.direccion}</p>
                            </li>
                            <li>Descripcion:<p>{info.descripcion}</p></li>
                        </ul>
                    </div>
                </div>
                <button className="return-button" onClick={onVolver}>Volver</button>
            </div>
        </div>
    );
}