//importacion de librerias
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';

//importaciones de rutas
import loginRoutes from './routes/login.js';
import encuestasRouter from './routes/encuestas.js';
import estadisticasRouter from './routes/estadisticas.js';
import usuariosRouter from './routes/usuarios.js';


dotenv.config();    
const app = express();
app.use(cors(
    {origin: "http://localhost:5500", // 👈 cambia al puerto de tu frontend
    credentials: true} 
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// configuracion de sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || "clave1234",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // ponlo en true si usas HTTPS
        sameSite: "lax", // "none" si usas frontend en otro dominio con HTTPS y lax si es el mismo dominio
        maxAge: 1000 * 60 * 60 * 7// 7 hora si se quiere una hora quitar el *7
    }
}));

// Evitar cache en todas las respuestas del backend
app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

//Rutas
app.get('/', (req, res) => {
    res.send('API de inicio de sesión');
});

app.use('/api/login', loginRoutes);
app.use("/api/encuestas", encuestasRouter);
app.use('/api/estadisticas', estadisticasRouter);
app.use('/api/usuarios', usuariosRouter);

// Middleware para rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

//servidor
const puerto = process.env.PORT;
app.listen(puerto, () => {
    console.log(`Servidor corriendo en http://localhost:${puerto}`);
});


