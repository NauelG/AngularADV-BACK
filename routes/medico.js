var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var Medico = require('../models/medico');

var app = express();

var Medico = require('../models/medico');

// ==================================
// GET - Obtener todos los médicos
// ==================================
app.get('/', (req, res, next) => {

    var desde = Number(req.query.desde) || 0;

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }

            Medico.count({}, (err, count) => {

                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: count
                });
            })
        });
});
// ==================================
// PUT - Actualizar médico
// ==================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res, next) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error buscando medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: `No existe ningún medico con el id: ${id}`,
                errors: { message: 'No existe ningun medico con el id especificado' }
            });
        }

        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.usuario = req.usuario._id;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error actualizando medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado,
                usuarioTKN: req.usuario
            });
        });
    });
});
// ==================================
// POST - Crear médico
// ==================================
app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error guardando médico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuarioTKN: req.usuario
        });
    });


});
// ==================================
// DELETE - Eliminar médico
// ==================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res, next) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            res.status(400).json({
                ok: false,
                mensaje: `No existe ningún médico con el id: ${id}`,
                errors: { mensaje: 'No existe ningún médico con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
            usuarioTKN: req.usuario
        });
    });
});
// ==================================
// EXPORTS
// ==================================
module.exports = app;