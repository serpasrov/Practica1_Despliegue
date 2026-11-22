import mongoose from 'mongoose';

// Esquema de los recintos donde se celebran los eventos
const recintoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        minlength: 5,
        trim: true
    },
    direccion: {
        type: String,
        required: true,
        minlength: 10,
        trim: true
    },
    localidad: {
        type: String,
        required: true,
        minlength: 3,
        trim: true
    },
    aforoMaximo: {
        type: Number
    }
});

const Recinto = mongoose.model('recintos', recintoSchema);

export default Recinto;
