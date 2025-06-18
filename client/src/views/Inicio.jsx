import { useState } from "react";
import "./Inicio.css";
import { useUser } from "../context/UserContext"; // Importa el UserContext para gestionar el estado del usuario
import { useNavigate } from "react-router-dom"; // Para redirigir al usuario después del login

function Inicio() {
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("");
  const [loginData, setLoginData] = useState({ email: "", contrasenia: "" });
  const [formData, setFormData] = useState({
    nombre_apellido: "",
    dni: "",
    email: "",
    contrasenia: "",
    telefono: "",
    especialidad: "",
  });

  const { login } = useUser(); // Obtén la función login de UserContext
  const navigate = useNavigate(); // Hook para la navegación

  const toggleRegister = () => {
    setShowForm(!showForm);
    setFormType("");
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = () => {
    fetch("http://localhost:3003/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        tipo_usuario: formType,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(
            `Se registró correctamente el ${
              formType === "cliente" ? "cliente" : "especialista"
            }`
          );
          // Limpiar formulario después del registro exitoso
          setFormData({
            nombre_apellido: "",
            dni: "",
            email: "",
            contrasenia: "",
            telefono: "",
            especialidad: "",
          });
          setShowForm(false);
        } else {
          alert(data.message || "Error en el registro");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error de conexión. Intenta nuevamente.");
      });
  };

  const handleLogin = () => {
    fetch("http://localhost:3003/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          login(data.user); // Guarda el usuario en el contexto
          const perfilRoute =
            data.user.tipo_usuario === "cliente" ? "/PerfilC" : "/PerfilE";
          navigate(perfilRoute); // Redirige al perfil del usuario
        } else {
          alert(data.message || "Email o contraseña incorrectos");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error de conexión. Intenta nuevamente.");
      });
  };

  return (
    <div className="cuerpo-inicio">
      <div className="menu">
        <img
          src="/fotosApp/logoCarePlaner.png"
          alt="Care Planner Logo"
          className="logo"
        />
        {!showForm && (
          <>
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={loginData.email}
              onChange={handleLoginChange}
            />
            <input
              type="password"
              placeholder="Contraseña"
              name="contrasenia"
              value={loginData.contrasenia}
              onChange={handleLoginChange}
            />
            <button onClick={handleLogin}>Log In</button>
          </>
        )}
        <button onClick={toggleRegister}>
          {showForm ? "Close Register" : "Register"}
        </button>
        {showForm && (
          <div className="register-form">
            <button onClick={() => setFormType("cliente")}>Cliente</button>
            <button onClick={() => setFormType("especialista")}>
              Especialista
            </button>
            <div className="form-content">
              {formType && (
                <>
                  <input
                    type="text"
                    placeholder="Nombre y Apellido"
                    name="nombre_apellido"
                    value={formData.nombre_apellido}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    placeholder="DNI"
                    name="dni"
                    value={formData.dni}
                    onChange={handleInputChange}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    name="contrasenia"
                    value={formData.contrasenia}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    placeholder="Teléfono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                  />
                  {formType === "especialista" && (
                    <input
                      type="text"
                      placeholder="Especialidad"
                      name="especialidad"
                      value={formData.especialidad}
                      onChange={handleInputChange}
                    />
                  )}
                  <button onClick={handleRegister}>Register</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inicio;
