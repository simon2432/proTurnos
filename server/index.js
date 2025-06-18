const express = require('express');
const cors = require('cors'); 
const app = express();
const mysql = require("mysql");
const bodyParser = require('body-parser');
const multer = require('multer'); 
const path = require('path');

// Configuración de CORS
app.use(cors());

// Configuración de la conexión a la base de datos MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "care_planer"
});

app.use(bodyParser.json());

// Configura el almacenamiento de las imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'client', 'public', 'fotosEs'));
    },
    filename: function (req, file, cb) {
        cb(null, `${req.params.dni}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// Conectar a la base de datos
db.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos: ' + err.stack);
        return;
    }
    console.log('Conectado a la base de datos con el ID ' + db.threadId);
});

app.use(bodyParser.json());

// Ruta para registrar usuarios
app.post('/register', (req, res) => {
    const { nombre_apellido, dni, email, contrasenia, telefono, especialidad, tipo_usuario } = req.body;

    let sql = "";
    let values = [];

    if (tipo_usuario === 'cliente') {
        sql = "INSERT INTO clientes (nombre_apellido, dni, email, contrasenia, telefono) VALUES (?, ?, ?, ?, ?)";
        values = [nombre_apellido, dni, email, contrasenia, telefono];
    } else if (tipo_usuario === 'especialista') {
        sql = "INSERT INTO especialistas (nombre_apellido, dni, email, contrasenia, telefono, especialidad) VALUES (?, ?, ?, ?, ?, ?)";
        values = [nombre_apellido, dni, email, contrasenia, telefono, especialidad];
    }

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.status(200).json({ message: "Usuario registrado exitosamente" });
    });
});

// Ruta para manejar el inicio de sesión
app.post('/login', (req, res) => {
    const { email, contrasenia } = req.body;

    const sqlCliente = "SELECT * FROM clientes WHERE email = ? AND contrasenia = ?";
    const sqlEspecialista = "SELECT * FROM especialistas WHERE email = ? AND contrasenia = ?";

    db.query(sqlCliente, [email, contrasenia], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length > 0) {
            return res.status(200).json({ success: true, user: { ...results[0], tipo_usuario: 'cliente' } });
        } else {
            db.query(sqlEspecialista, [email, contrasenia], (err, results) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                if (results.length > 0) {
                    return res.status(200).json({ success: true, user: { ...results[0], tipo_usuario: 'especialista' } });
                } else {
                    return res.status(401).json({ success: false, message: "Email o contraseña incorrectos" });
                }
            });
        }
    });
});

// Ruta para obtener la información del usuario (cliente o especialista)
app.get('/user/:dni', (req, res) => {
    const { dni } = req.params;
    const sqlCliente = "SELECT * FROM clientes WHERE dni = ?";
    const sqlEspecialista = "SELECT * FROM especialistas WHERE dni = ?";

    db.query(sqlCliente, [dni], (err, resultCliente) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (resultCliente.length > 0) {
            return res.status(200).json(resultCliente[0]);
        } else {
            db.query(sqlEspecialista, [dni], (err, resultEspecialista) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                if (resultEspecialista.length > 0) {
                    return res.status(200).json(resultEspecialista[0]);
                } else {
                    return res.status(404).json({ message: "Usuario no encontrado" });
                }
            });
        }
    });
});

// Ruta para actualizar la información del usuario (cliente o especialista)
app.put('/user/:dni', upload.single('imagen'), (req, res) => {
    const { dni } = req.params;
    const {
        nombre_apellido,
        email,
        contrasenia,
        telefono,
        especialidad,
        descripcion,
        direccion,
        tipo_usuario = 'especialista',
        rango1_inicio,
        rango1_fin,
        rango2_inicio,
        rango2_fin,
        dias_atencion
    } = req.body;

    const imagen = req.file ? `/fotosEs/${req.file.filename}` : null;

    let sql = "";
    let values = [];
    let fieldsToUpdate = [];

    if (tipo_usuario === 'cliente') {
        sql = "UPDATE clientes SET ";
        
        if (nombre_apellido !== undefined) {
            fieldsToUpdate.push("nombre_apellido = ?");
            values.push(nombre_apellido);
        }
        if (email !== undefined) {
            fieldsToUpdate.push("email = ?");
            values.push(email);
        }
        if (contrasenia !== undefined) {
            fieldsToUpdate.push("contrasenia = ?");
            values.push(contrasenia);
        }
        if (telefono !== undefined) {
            fieldsToUpdate.push("telefono = ?");
            values.push(telefono);
        }

        sql += fieldsToUpdate.join(", ");
        sql += " WHERE dni = ?";
        values.push(dni);
    } else if (tipo_usuario === 'especialista') {
        sql = "UPDATE especialistas SET ";
        
        if (nombre_apellido !== undefined) {
            fieldsToUpdate.push("nombre_apellido = ?");
            values.push(nombre_apellido);
        }
        if (email !== undefined) {
            fieldsToUpdate.push("email = ?");
            values.push(email);
        }
        if (contrasenia !== undefined) {
            fieldsToUpdate.push("contrasenia = ?");
            values.push(contrasenia);
        }
        if (telefono !== undefined) {
            fieldsToUpdate.push("telefono = ?");
            values.push(telefono);
        }
        if (especialidad !== undefined) {
            fieldsToUpdate.push("especialidad = ?");
            values.push(especialidad);
        }
        if (descripcion !== undefined) {
            fieldsToUpdate.push("descripcion = ?");
            values.push(descripcion);
        }
        if (direccion !== undefined) {
            fieldsToUpdate.push("direccion = ?");
            values.push(direccion);
        }
        if (imagen !== null) {
            fieldsToUpdate.push("imagen = ?");
            values.push(imagen);
        }
        if (rango1_inicio !== undefined) {
            fieldsToUpdate.push("rango1_inicio = ?");
            values.push(rango1_inicio);
        }
        if (rango1_fin !== undefined) {
            fieldsToUpdate.push("rango1_fin = ?");
            values.push(rango1_fin);
        }
        if (rango2_inicio !== undefined) {
            fieldsToUpdate.push("rango2_inicio = ?");
            values.push(rango2_inicio);
        }
        if (rango2_fin !== undefined) {
            fieldsToUpdate.push("rango2_fin = ?");
            values.push(rango2_fin);
        }
        if (dias_atencion !== undefined) {
            fieldsToUpdate.push("dias_atencion = ?");
            values.push(dias_atencion);
        }

        sql += fieldsToUpdate.join(", ");
        sql += " WHERE dni = ?";
        values.push(dni);
    } else {
        return res.status(400).json({ message: "Tipo de usuario no válido" });
    }

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return res.status(500).json({ error: err });
        }
        res.status(200).json({ message: "Información actualizada correctamente" });
    });
});

// Ruta para obtener todos los especialistas ordenados por especialidad
app.get('/especialistas', (req, res) => {
    const sql = "SELECT * FROM especialistas ORDER BY especialidad ASC";
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return res.status(500).json({ error: err });
        }
        res.status(200).json(results);
    });
});

// Ruta para obtener los turnos de un cliente específico
app.get('/turnos/:dni_cliente', (req, res) => {
    const { dni_cliente } = req.params;
    const sql = `
        SELECT turnos.*, especialistas.nombre_apellido AS nombre_especialista, especialistas.especialidad, especialistas.direccion 
        FROM turnos 
        JOIN especialistas ON turnos.dni_especialista = especialistas.dni 
        WHERE turnos.dni_cliente = ? 
        ORDER BY fecha ASC, hora ASC`;
    
    db.query(sql, [dni_cliente], (err, results) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return res.status(500).json({ error: err });
        }
        res.status(200).json(results);
    });
});

// Ruta para eliminar un turno por ID
app.delete('/turnos/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM turnos WHERE id = ?";
    
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return res.status(500).json({ success: false, message: 'Error al cancelar el turno' });
        }
        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Turno cancelado correctamente' });
        } else {
            return res.status(404).json({ success: false, message: 'Turno no encontrado' });
        }
    });
});

// Ruta para obtener la información completa del especialista por DNI
app.get('/especialis/:dni', (req, res) => {
    const { dni } = req.params;
    const sql = "SELECT * FROM especialistas WHERE dni = ?";

    db.query(sql, [dni], (err, result) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return res.status(500).json({ error: err });
        }
        if (result.length > 0) {
            return res.status(200).json(result[0]);
        } else {
            console.log("Especialista no encontrado para el DNI:", dni);
            return res.status(404).json({ message: "Especialista no encontrado" });
        }
    });
});

// Ruta para obtener los turnos ocupados de un especialista en una fecha específica
app.get('/turnos-ocupados/:dni_especialista/:fecha', (req, res) => {
    const { dni_especialista, fecha } = req.params;
    const sql = "SELECT TIME_FORMAT(hora, '%H:%i') AS hora FROM turnos WHERE dni_especialista = ? AND fecha = ?";

    db.query(sql, [dni_especialista, fecha], (err, results) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return res.status(500).json({ error: err });
        }
        res.status(200).json(results.map(turno => turno.hora)); // Solo regresamos la lista de horas ocupadas sin segundos
    });
});

// Ruta para crear un nuevo turno
app.post('/crear-turno', (req, res) => {
    const { dni_cliente, dni_especialista, fecha, hora } = req.body;

    const sql = `INSERT INTO turnos (dni_cliente, dni_especialista, fecha, hora) VALUES (?, ?, ?, ?)`;

    db.query(sql, [dni_cliente, dni_especialista, fecha, hora], (err, result) => {
        if (err) {
            console.error('Error al crear el turno:', err);
            return res.status(500).json({ error: err });
        }
        res.status(200).json({ message: 'Turno reservado exitosamente' });
    });
});

// Obtener los turnos del especialista entre dos fechas
app.get('/turnos-especialista/:dni_especialista', (req, res) => {
    const { dni_especialista } = req.params;
    const { fecha_inicio, fecha_fin } = req.query;

    // Consulta SQL corregida para usar 'nombre_apellido'
    const sql = `
        SELECT t.id, t.fecha, t.hora, c.nombre_apellido AS nombre, c.email, c.telefono 
        FROM turnos t 
        JOIN clientes c ON t.dni_cliente = c.dni 
        WHERE t.dni_especialista = ? 
        AND t.fecha BETWEEN ? AND ? 
        ORDER BY t.fecha, t.hora
    `;

    db.query(sql, [dni_especialista, fecha_inicio, fecha_fin], (err, results) => {
        if (err) {
            console.error('Error al obtener los turnos:', err);
            return res.status(500).json({ error: 'Error al obtener los turnos' });
        }
        res.status(200).json(results);
    });
});


// Escucha en el puerto especificado
app.listen(3003, () => {
    console.log("corriendo en el puerto 3003");
});