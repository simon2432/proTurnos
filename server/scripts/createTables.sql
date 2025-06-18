-- Script para crear las tablas necesarias para proTurnos
-- Ejecutar este script en tu base de datos MySQL

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS care_planer;
USE care_planer;

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
    dni VARCHAR(8) PRIMARY KEY,
    nombre_apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contrasenia VARCHAR(255) NOT NULL,
    telefono VARCHAR(20)
);

-- Tabla de especialistas
CREATE TABLE IF NOT EXISTS especialistas (
    dni VARCHAR(8) PRIMARY KEY,
    nombre_apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contrasenia VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    especialidad VARCHAR(100),
    descripcion TEXT,
    direccion VARCHAR(200),
    imagen VARCHAR(255),
    rango1_inicio TIME,
    rango1_fin TIME,
    rango2_inicio TIME,
    rango2_fin TIME,
    dias_atencion VARCHAR(100)
);

-- Tabla de turnos
CREATE TABLE IF NOT EXISTS turnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dni_cliente VARCHAR(8),
    dni_especialista VARCHAR(8),
    fecha DATE,
    hora TIME,
    FOREIGN KEY (dni_cliente) REFERENCES clientes(dni) ON DELETE CASCADE,
    FOREIGN KEY (dni_especialista) REFERENCES especialistas(dni) ON DELETE CASCADE
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_especialistas_email ON especialistas(email);
CREATE INDEX idx_especialistas_especialidad ON especialistas(especialidad);
CREATE INDEX idx_turnos_fecha ON turnos(fecha);
CREATE INDEX idx_turnos_especialista_fecha ON turnos(dni_especialista, fecha);
CREATE INDEX idx_turnos_cliente ON turnos(dni_cliente);

-- Mostrar las tablas creadas
SHOW TABLES;

-- Mostrar la estructura de las tablas
DESCRIBE clientes;
DESCRIBE especialistas;
DESCRIBE turnos; 