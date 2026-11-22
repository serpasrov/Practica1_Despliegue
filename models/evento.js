import mongoose from 'mongoose';

// Esquema de las entradas (subdocumento de los eventos)
const entradaSchema = new mongoose.Schema({
    tipo: {
        type: String,
        required: true,
        minlength: 3,
        trim: true
    },
    precio: {
        type: Number,
        required: true,
        min: 0
    },
    disponibles: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: 'El número de entradas disponibles debe ser un entero'
        }
    }
});

// Esquema de los eventos
const eventoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        minlength: 5,
        trim: true
    },
    fecha: {
        type: Date,
        required: true
    },
    entradas: [entradaSchema],
    recinto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recintos',
        required: true
    }
});

const Evento = mongoose.model('eventos', eventoSchema);

export default Evento;
