import React, { createContext, useContext, useState, useEffect } from 'react';

export const UserContext = createContext(null); // Exporta explícitamente UserContext

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Función de login que establece el estado y lo guarda en localStorage
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData)); // Almacena el usuario en localStorage
    };

    // Función de logout que limpia el estado y el localStorage
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user'); // Elimina el usuario de localStorage
    };

    // useEffect para recuperar el usuario desde localStorage al cargar el componente
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser)); // Recupera el usuario al recargar la página
        }
    }, []);

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};