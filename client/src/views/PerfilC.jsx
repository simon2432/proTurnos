import React, { useState, useEffect, useContext } from "react";
import "./PerfilC.css";
import { Menu } from "../components/Menu";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

function PerfilC() {
  const { user } = useContext(UserContext);
  const [formData, setFormData] = useState({
    nombre_apellido: "",
    dni: "",
    email: "",
    contrasenia: "",
    telefono: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    console.log("PerfilC useEffect - user:", user);
    if (user) {
      console.log("PerfilC - Fetching user data for DNI:", user.dni);
      fetch(`http://localhost:3003/user/${user.dni}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("PerfilC - Received user data:", data);
          if (data) {
            setFormData({
              nombre_apellido: data.nombre_apellido || "",
              dni: data.dni || "",
              email: data.email || "",
              contrasenia: "", // Campo vacío para nueva contraseña
              telefono: data.telefono || "",
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    } else {
      console.log("PerfilC - No user in context");
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveChanges = () => {
    if (!user) {
      alert("Usuario no autenticado.");
      return;
    }

    // Preparar los datos a enviar, excluyendo la contraseña si está vacía
    const updateData = {
      nombre_apellido: formData.nombre_apellido,
      email: formData.email,
      telefono: formData.telefono,
      tipo_usuario: user.tipo_usuario, // Esto es crucial para el back-end
    };

    // Solo incluir contraseña si no está vacía
    if (formData.contrasenia && formData.contrasenia.trim() !== "") {
      updateData.contrasenia = formData.contrasenia;
    }

    fetch(`http://localhost:3003/user/${user.dni}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(
              data.message || "Ocurrió un error al guardar los cambios"
            );
          });
        }
        return response.json();
      })
      .then((data) => {
        alert("Cambios guardados correctamente");
        // Limpiar el campo de contraseña después de guardar
        setFormData((prev) => ({
          ...prev,
          contrasenia: "",
        }));
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(error.message);
      });
  };

  return (
    <div>
      <Menu />
      <div className="cuerpo-perfilc">
        <div className="perfil-content">
          <h2 className="infor">Informacion perfil</h2>
          <label>
            Nombre y apellido
            <input
              type="text"
              placeholder="Nombre y apellido"
              name="nombre_apellido"
              value={formData.nombre_apellido}
              onChange={handleInputChange}
            />
          </label>
          <label>
            DNI
            <input
              type="text"
              placeholder="DNI"
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
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              placeholder="Nueva contraseña"
              name="contrasenia"
              value={formData.contrasenia}
              onChange={handleInputChange}
            />
            <small style={{ color: "#666", fontSize: "12px" }}>
              Deja este campo vacío si no quieres cambiar tu contraseña actual
            </small>
          </label>
          <label>
            Teléfono
            <input
              type="text"
              placeholder="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
            />
          </label>
          <button onClick={handleSaveChanges}>Guardar cambios</button>
        </div>
      </div>
    </div>
  );
}

export default PerfilC;
