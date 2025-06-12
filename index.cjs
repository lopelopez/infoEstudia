const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para JSON
app.use(express.json());

// Permitir CORS (desde cualquier origen, para desarrollo)
app.use(cors());

// Configurar multer para subir archivos PDF a carpeta 'uploads'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Crear carpeta uploads si no existe
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configura conexión a MySQL (ajusta tus datos)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',  // pon tu contraseña de MySQL
  database: 'portal_educativo'
});

db.connect(err => {
  if (err) {
    console.error('Error conectando a MySQL:', err);
  } else {
    console.log('Conectado a MySQL');
  }
});

// Ruta prueba
app.get('/', (req, res) => {
  res.send('Backend funcionando');
});

// Listar usuarios
app.get('/api/usuarios', (req, res) => {
  db.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Subir proyecto con archivo PDF y datos
app.post('/api/proyectos', upload.single('pdf'), (req, res) => {
  const { titulo, descripcion } = req.body;
  const archivoPDF = req.file ? req.file.filename : null;

  if (!titulo || !descripcion || !archivoPDF) {
    return res.status(400).json({ error: 'Faltan datos o archivo' });
  }

  const sql = 'INSERT INTO proyectos (titulo, descripcion, archivo_pdf) VALUES (?, ?, ?)';
  db.query(sql, [titulo, descripcion, archivoPDF], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ mensaje: 'Proyecto guardado', id: result.insertId });
  });
});

// Listar proyectos
app.get('/api/proyectos', (req, res) => {
  db.query('SELECT * FROM proyectos', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Servir archivos PDF para descarga/visualización
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
