# 🚀 Servidor proTurnos

Servidor backend para la aplicación de gestión de turnos médicos.

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- MySQL (versión 8.0 o superior)
- npm o yarn

## ⚙️ Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo y configúralo:

```bash
cp env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=care_planer
DB_PORT=3306

# Server Configuration
PORT=3003
NODE_ENV=development

# JWT Configuration (IMPORTANTE: Cambia estos valores en producción)
JWT_SECRET=tu-super-secret-jwt-key-cambia-esto-en-produccion
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=tu-super-secret-refresh-key-cambia-esto-en-produccion
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# File Upload Configuration
UPLOAD_PATH=../client/public/fotosEs
MAX_FILE_SIZE=5242880
```

### 3. Configurar Base de Datos

Asegúrate de que tu base de datos MySQL esté configurada con las tablas necesarias:

```sql
-- Tabla de clientes
CREATE TABLE clientes (
    dni VARCHAR(8) PRIMARY KEY,
    nombre_apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contrasenia VARCHAR(255) NOT NULL,
    telefono VARCHAR(20)
);

-- Tabla de especialistas
CREATE TABLE especialistas (
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
CREATE TABLE turnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dni_cliente VARCHAR(8),
    dni_especialista VARCHAR(8),
    fecha DATE,
    hora TIME,
    FOREIGN KEY (dni_cliente) REFERENCES clientes(dni),
    FOREIGN KEY (dni_especialista) REFERENCES especialistas(dni)
);
```

### 4. Migrar Contraseñas Existentes

Si tienes usuarios existentes con contraseñas sin encriptar, ejecuta:

```bash
npm run migrate-passwords
```

## 🚀 Ejecutar el Servidor

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm start
```

## 📡 Endpoints Disponibles

### Autenticación

- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión
- `POST /auth/refresh-token` - Renovar token
- `POST /auth/logout` - Cerrar sesión

### Usuarios

- `GET /user/:dni` - Obtener información de usuario
- `PUT /user/:dni` - Actualizar información de usuario

### Especialistas

- `GET /especialistas` - Obtener todos los especialistas
- `GET /especialis/:dni` - Obtener información de especialista

### Turnos

- `GET /turnos/:dni_cliente` - Obtener turnos de cliente
- `POST /crear-turno` - Crear nuevo turno
- `DELETE /turnos/:id` - Cancelar turno
- `GET /turnos-ocupados/:dni_especialista/:fecha` - Obtener turnos ocupados
- `GET /turnos-especialista/:dni_especialista` - Obtener turnos de especialista

## 🔒 Seguridad

### Características Implementadas:

- ✅ Encriptación de contraseñas con bcrypt
- ✅ Autenticación JWT
- ✅ Validación de entrada con express-validator
- ✅ Sanitización de datos
- ✅ Variables de entorno
- ✅ CORS configurado
- ✅ Límites de tamaño de archivo
- ✅ Filtrado de tipos de archivo

### Recomendaciones de Producción:

1. **Cambiar las claves JWT** en el archivo `.env`
2. **Usar HTTPS** en producción
3. **Configurar rate limiting**
4. **Implementar logging** más robusto
5. **Configurar backup** de base de datos
6. **Usar un proxy reverso** como Nginx

## 🐛 Troubleshooting

### Error de Conexión a Base de Datos

- Verifica que MySQL esté corriendo
- Confirma las credenciales en `.env`
- Asegúrate de que la base de datos existe

### Error de CORS

- Verifica que `CORS_ORIGIN` en `.env` coincida con tu frontend
- En desarrollo, puedes usar `*` para permitir todos los orígenes

### Error de Subida de Archivos

- Verifica que la carpeta de destino existe
- Confirma que tienes permisos de escritura
- Revisa el tamaño del archivo (máximo 5MB por defecto)

## 📝 Logs

El servidor registra información importante en la consola:

- ✅ Conexión exitosa a la base de datos
- 🚀 Servidor iniciado
- ❌ Errores de consulta SQL
- 🔐 Intentos de autenticación

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
