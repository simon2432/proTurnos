import React, { useState, useEffect } from 'react';
import "./PerfilE.css";
import { Menu } from "../components/Menu";
import { useUser } from '../context/UserContext';

function PerfilE() {
    const { user } = useUser();
    const [formData, setFormData] = useState({
        nombre_apellido: '',
        dni: '',
        email: '',
        contrasenia: '',
        telefono: '',
        especialidad: '',
        descripcion: '',
        direccion: ''
    });
    const [image, setImage] = useState(''); // Estado para la imagen
    const [selectedFile, setSelectedFile] = useState(null); // Estado para almacenar el archivo seleccionado

    useEffect(() => {
        if (user) {
            fetch(`http://localhost:3003/user/${user.dni}`)
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        setFormData({
                            nombre_apellido: data.nombre_apellido || '',
                            dni: data.dni || '',
                            email: data.email || '',
                            contrasenia: data.contrasenia || '',
                            telefono: data.telefono || '',
                            especialidad: data.especialidad || '',
                            descripcion: data.descripcion || '',
                            direccion: data.direccion || ''
                        });
                        setImage(data.imagen); // Cargar la imagen existente
                    }
                })
                .catch(error => {
                    console.error('Error fetching user data:', error);
                });
        }
    }, [user]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file); // Guarda el archivo seleccionado
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result); // Previsualiza la imagen seleccionada
        };
        reader.readAsDataURL(file);
    };

    const handleSaveChanges = () => {
        const formDataObj = new FormData();
        formDataObj.append('nombre_apellido', formData.nombre_apellido);
        formDataObj.append('dni', formData.dni);
        formDataObj.append('email', formData.email);
        formDataObj.append('contrasenia', formData.contrasenia);
        formDataObj.append('telefono', formData.telefono);
        formDataObj.append('especialidad', formData.especialidad);
        formDataObj.append('descripcion', formData.descripcion);
        formDataObj.append('direccion', formData.direccion);
        formDataObj.append('tipo_usuario', user.tipo_usuario);

        if (selectedFile) {
            formDataObj.append('imagen', selectedFile); // Agrega la imagen si hay una seleccionada
        }

        fetch(`http://localhost:3003/user/${user.dni}`, {
            method: 'PUT',
            body: formDataObj,
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Información actualizada correctamente") {
                alert("Cambios guardados correctamente");
            } else {
                alert("Ocurrió un error al guardar los cambios");
            }
        })
        .catch(error => {
            console.error('Error updating user data:', error);
        });
    };

    return (
        <div>
            <Menu />
            <div className='cuerpo-perfile'>
                <div className="perfil-container">
                    <div className="foto-perfil">
                        <div className='info'>Informacion perfil</div>
                        <label>Foto profesional</label>
                        {image ? <img src={image} alt="Foto de perfil" /> : <div className="foto-placeholder">+</div>}
                        <input className='inpu' type="file" onChange={handleImageChange} />
                    </div>
                    <div className="info-perfil">
                        <label>
                            Nombre y apellido
                            <input 
                                type="text" 
                                placeholder="Ingrese su nombre y apellido" 
                                name="nombre_apellido" 
                                value={formData.nombre_apellido} 
                                onChange={handleInputChange} 
                            />
                        </label>
                        <label>
                            DNI
                            <input 
                                type="text" 
                                placeholder="Ingrese su DNI" 
                                name="dni" 
                                value={formData.dni} 
                                onChange={handleInputChange} 
                                disabled
                            />
                        </label>
                        <label>
                            Email
                            <input 
                                type="email" 
                                placeholder="Ingrese su correo electrónico" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleInputChange} 
                            />
                        </label>
                        <label>
                            Contraseña
                            <input 
                                type="password" 
                                placeholder="Ingrese su contraseña" 
                                name="contrasenia" 
                                value={formData.contrasenia} 
                                onChange={handleInputChange} 
                            />
                        </label>
                        <label>
                            Teléfono
                            <input 
                                type="text" 
                                placeholder="Ingrese su teléfono" 
                                name="telefono" 
                                value={formData.telefono} 
                                onChange={handleInputChange} 
                            />
                        </label>
                        <label>
                            Especialidad
                            <input 
                                type="text" 
                                placeholder="Ingrese su especialidad" 
                                name="especialidad" 
                                value={formData.especialidad} 
                                onChange={handleInputChange} 
                            />
                        </label>
                        <label>
                            Descripción
                            <input 
                                type="text" 
                                placeholder="Ingrese una breve descripcion" 
                                name="descripcion" 
                                value={formData.descripcion} 
                                onChange={handleInputChange} 
                            />
                        </label>
                        <label>
                            Dirección
                            <input 
                                type="text" 
                                placeholder="Ingrese su dirección" 
                                name="direccion" 
                                value={formData.direccion} 
                                onChange={handleInputChange} 
                            />
                        </label>
                        <button onClick={handleSaveChanges}>Guardar cambios</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PerfilE;