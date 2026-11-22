// 1. Carga de librerías y enrutadores
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import recintos from './routes/recintos.js';
import eventos from './routes/eventos.js';

dotenv.config();

// 2. Conexión con la base de datos
try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
} catch (error) {
    console.log('Error conectando a MongoDB:', error.message);
    // Sin base de datos la API no puede funcionar: no arrancamos el servidor
    process.exit(1);
}

// 3. Servidor Express y middleware JSON
const app = express();
app.use(express.json());

// 4. Enrutadores
app.use('/recintos', recintos);
app.use('/eventos', eventos);

// 5. Puesta en marcha del servidor
app.listen(process.env.PORT, () => {
    console.log(`Servidor escuchando en el puerto ${process.env.PORT}`);
});
