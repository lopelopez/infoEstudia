import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',  // si tienes password ponla aquí
  database: 'portal_educativo' // la DB que usas
};

let connection;
async function conectarDB() {
  connection = await mysql.createConnection(dbConfig);
  console.log('MySQL conectado');
}
conectarDB().catch(console.error);

app.get('/api/usuarios', async (req, res) => {
  try {
    const [rows] = await connection.execute('SELECT nombre, correo FROM usuarios');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});