import express from 'express';
import Evento from '../models/evento.js';
import Recinto from '../models/recinto.js';

const router = express.Router();

// GET /eventos: listado de todos los eventos con su recinto y entradas
router.get('/', async (req, res) => {
    try {
        const resultado = await Evento.find().populate('recinto');
        if (resultado.length > 0) {
            res.status(200).send({ ok: true, resultado: resultado });
        } else {
            res.status(500).send({ ok: false, error: 'No se han encontrado eventos' });
        }
    } catch (error) {
        res.status(500).send({ ok: false, error: 'No se han encontrado eventos' });
    }
});

// GET /eventos/localidad/:nombre: eventos futuros de una localidad
// (rutas específicas antes que la genérica /:id)
router.get('/localidad/:nombre', async (req, res) => {
    try {
        const recintos = await Recinto.find({ localidad: req.params.nombre });
        const idsRecintos = recintos.map(recinto => recinto._id);
        const resultado = await Evento.find({
            recinto: { $in: idsRecintos },
            fecha: { $gte: new Date() }
        }).populate('recinto');
        if (resultado.length > 0) {
            res.status(200).send({ ok: true, resultado: resultado });
        } else {
            res.status(404).send({ ok: false, error: 'No se han encontrado eventos' });
        }
    } catch (error) {
        res.status(404).send({ ok: false, error: 'No se han encontrado eventos' });
    }
});

// GET /eventos/entradas/:idEvento/:tipoEntrada: precio y disponibles de un tipo de entrada
router.get('/entradas/:idEvento/:tipoEntrada', async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.idEvento);
        const entrada = evento ? evento.entradas.find(e => e.tipo === req.params.tipoEntrada) : null;
        if (entrada) {
            res.status(200).send({
                ok: true,
                resultado: { precio: entrada.precio, disponibles: entrada.disponibles }
            });
        } else {
            res.status(404).send({ ok: false, error: `Error obteniendo datos de entrada para evento ${req.params.idEvento}` });
        }
    } catch (error) {
        res.status(404).send({ ok: false, error: `Error obteniendo datos de entrada para evento ${req.params.idEvento}` });
    }
});

// PUT /eventos/entradas/:idEvento/:tipoEntrada/:cantidad: resta entradas disponibles
router.put('/entradas/:idEvento/:tipoEntrada/:cantidad', async (req, res) => {
    try {
        const cantidad = Number(req.params.cantidad);
        const evento = await Evento.findById(req.params.idEvento);
        const entrada = evento ? evento.entradas.find(e => e.tipo === req.params.tipoEntrada) : null;
        if (entrada && Number.isInteger(cantidad) && cantidad > 0 && entrada.disponibles >= cantidad) {
            entrada.disponibles -= cantidad;
            const resultado = await evento.save();
            res.status(200).send({ ok: true, resultado: resultado });
        } else {
            res.status(404).send({ ok: false, error: `Error actualizando entradas del evento ${req.params.idEvento}` });
        }
    } catch (error) {
        res.status(404).send({ ok: false, error: `Error actualizando entradas del evento ${req.params.idEvento}` });
    }
});

// GET /eventos/:id: evento por id con su recinto
router.get('/:id', async (req, res) => {
    try {
        const resultado = await Evento.findById(req.params.id).populate('recinto');
        if (resultado) {
            res.status(200).send({ ok: true, resultado: resultado });
        } else {
            res.status(404).send({ ok: false, error: `Evento ${req.params.id} no encontrado` });
        }
    } catch (error) {
        res.status(404).send({ ok: false, error: `Evento ${req.params.id} no encontrado` });
    }
});

// POST /eventos: añade un nuevo evento
router.post('/', async (req, res) => {
    try {
        const nuevoEvento = new Evento({
            nombre: req.body.nombre,
            fecha: req.body.fecha,
            entradas: req.body.entradas,
            recinto: req.body.recinto
        });
        const resultado = await nuevoEvento.save();
        res.status(201).send({ ok: true, resultado: resultado });
    } catch (error) {
        res.status(500).send({ ok: false, error: 'Error añadiendo evento' });
    }
});

// PUT /eventos/:id: actualiza un evento
router.put('/:id', async (req, res) => {
    try {
        const resultado = await Evento.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (resultado) {
            res.status(200).send({ ok: true, resultado: resultado });
        } else {
            res.status(404).send({ ok: false, error: `Error actualizando evento ${req.params.id}` });
        }
    } catch (error) {
        res.status(404).send({ ok: false, error: `Error actualizando evento ${req.params.id}` });
    }
});

// DELETE /eventos/:id: elimina un evento
router.delete('/:id', async (req, res) => {
    try {
        const resultado = await Evento.findByIdAndDelete(req.params.id);
        if (resultado) {
            res.status(200).send({ ok: true, resultado: resultado });
        } else {
            res.status(404).send({ ok: false, error: `Error eliminando evento ${req.params.id}` });
        }
    } catch (error) {
        res.status(404).send({ ok: false, error: `Error eliminando evento ${req.params.id}` });
    }
});

export default router;
