import { useState, useEffect } from 'react';
import "./AgendaE.css";
import { Menu } from "../components/Menu";
import { useUser } from '../context/UserContext';

function AgendaE() {
    const { user } = useUser();
    const [horario1, setHorario1] = useState({ inicio: '09:00', fin: '13:00' });
    const [horario2, setHorario2] = useState({ inicio: '14:00', fin: '18:00' });
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
        rango1: '',
        rango2: ''
    });

    // Función para formatear el tiempo a HH:MM
    const formatTime = (time) => {
        if (!time || time === 'N') return 'N';
        return time.slice(0, 5); // Eliminar los segundos
    };

    // Función para cargar los datos del usuario
    const cargarDatosUsuario = () => {
        if (user) {
            fetch(`http://localhost:3003/user/${user.dni}`)
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        setHorario1({ inicio: data.rango1_inicio || 'N', fin: data.rango1_fin || 'N' });
                        setHorario2({ inicio: data.rango2_inicio || 'N', fin: data.rango2_fin || 'N' });

                        setRangoActual({
                            rango1: `${formatTime(data.rango1_inicio)} - ${formatTime(data.rango1_fin)}`,
                            rango2: `${formatTime(data.rango2_inicio)} - ${formatTime(data.rango2_fin)}`,
                        });

                        const diasAtencionArray = data.dias_atencion ? data.dias_atencion.split(',') : [];
                        setDiasAtencion(prevState => {
                            const newState = { ...prevState };
                            diasAtencionArray.forEach(dia => {
                                newState[dia] = true;
                            });
                            return newState;
                        });
                    }
                })
                .catch(error => console.error('Error al cargar los datos del especialista:', error));
        }
    };

    useEffect(() => {
        cargarDatosUsuario(); // Cargar los datos cuando se monta el componente
    }, [user]);

    if (!user) {
        return <div>Error: El usuario no está disponible. Por favor, inicie sesión.</div>;
    }

    const horarios = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
        '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
        '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', 'N'
    ];

    const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

    const handleDiaChange = (dia) => {
        setDiasAtencion({
            ...diasAtencion,
            [dia]: !diasAtencion[dia],
        });
    };

    const handleSaveChanges = () => {
        const diasAtencionString = diasSemana.filter(dia => diasAtencion[dia]).join(',');

        const requestBody = {
            rango1_inicio: horario1.inicio !== 'N' ? horario1.inicio : null,
            rango1_fin: horario1.fin !== 'N' ? horario1.fin : null,
            rango2_inicio: horario2.inicio !== 'N' ? horario2.inicio : null,
            rango2_fin: horario2.fin !== 'N' ? horario2.fin : null,
            dias_atencion: diasAtencionString,
            tipo_usuario: user.tipo_usuario,
        };

        fetch(`http://localhost:3003/user/${user.dni}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Información actualizada correctamente") {
                alert("Cambios guardados correctamente");
                cargarDatosUsuario(); // Recargar los datos del usuario
            } else {
                alert("Ocurrió un error al guardar los cambios");
            }
        })
        .catch(error => {
            console.error('Error al guardar los cambios:', error);
        });
    };

    return (
        <div>
            <Menu />
            <div className='agenda-container'>
                <h2>Establecer turnos</h2>
                <p className='te' >Elegi el rango horario de tus turnos</p>
                <div className="horario">
                    <select value={horario1.inicio} onChange={e => setHorario1({ ...horario1, inicio: e.target.value })}>
                        {horarios.map(hora => <option key={hora} value={hora}>{hora}</option>)}
                    </select>
                    <div className='aa'>/</div>
                    <select value={horario1.fin} onChange={e => setHorario1({ ...horario1, fin: e.target.value })}>
                        {horarios.map(hora => <option key={hora} value={hora}>{hora}</option>)}
                    </select>
                </div>
                <div className="horario">
                    <select value={horario2.inicio} onChange={e => setHorario2({ ...horario2, inicio: e.target.value })}>
                        {horarios.map(hora => <option key={hora} value={hora}>{hora}</option>)}
                    </select>
                    <div className='aa'>/</div>
                    <select value={horario2.fin} onChange={e => setHorario2({ ...horario2, fin: e.target.value })}>
                        {horarios.map(hora => <option key={hora} value={hora}>{hora}</option>)}
                    </select>
                </div>
                <div>
                    <p className='te' >Rango horario actual:</p>
                    <p>Primer rango: {rangoActual.rango1}</p>
                    <p>Segundo rango: {rangoActual.rango2}</p>
                </div>
                <p className='te' >Días de atención</p>
                <div className="dias-semana">
                    {diasSemana.map(dia => (
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
                <button className="guardar-btn" onClick={handleSaveChanges}>Guardar cambios</button>
            </div>
        </div>
    );
}

export default AgendaE;