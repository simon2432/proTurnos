import React, { useContext } from "react";
import "./Menu.css";
import { UserContext } from '../context/UserContext'; // Importa el UserContext

export function Menu() {
    const { user } = useContext(UserContext); // Obtiene la información del usuario

    // Verifica si user está definido antes de acceder a sus propiedades
    if (!user) {
        return null; // O muestra un mensaje de carga, redirige al login, etc.
    }

    // Determina las rutas según el tipo de usuario
    const perfilRoute = user.tipo_usuario === 'cliente' ? '/PerfilC' : '/PerfilE';
    const turnosRoute = user.tipo_usuario === 'cliente' ? '/TurnosC' : '/TurnosE';
    const agendaRoute = user.tipo_usuario === 'cliente' ? '/AgendaC' : '/AgendaE';

    return (
        <div className="menu-container">
            <a href="/Inicio" className="logo">
                <img src="../../public/fotosApp/logo.png" alt="Logo" />
            </a>
            <div className="menu-links">
                <a href={perfilRoute} className="menu-link">
                    <img src="../../public/fotosApp/perfil.png" alt="Perfil" className="menu-icon" />
                </a>
                <a href={turnosRoute} className="menu-link">
                    <img src="../../public/fotosApp/turnos.png" alt="Turnos" className="menu-icon" />
                </a>
                <a href={agendaRoute} className="menu-link">
                    <img src="../../public/fotosApp/calendario.png" alt="Agenda" className="menu-icon" />
                </a>
            </div>
        </div>
    );
}