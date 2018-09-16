var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// ==================================
// GET - Obtener todos los hospitales
// ==================================
app.get('/', (req, res, next) => {

    var desde = Number(req.query.desde) || 0;

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: err
                });
            }

            Hospital.count({}, (err, count) => {

                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: count
                });

            })
        });

});

// ==================================
// PUT - Actualizar hospital
// ==================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res, next) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error buscando hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: `No existe ningun hospital con el id: ${id}`,
                errors: { message: 'No existe ningun hospital con el id especificado' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error actualizando hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado,
                usuarioTKN: req.usuario
            });
        });
    });
});

// ==================================
// POST - Crear hospital
// ==================================
app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error guardando hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuarioTKN: req.usuario
        });
    });

});

// ==================================
// DELETE - Eliminar hospital
// ==================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res, next) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `No existe ningún hospital con el id: ${id}`,
                errors: { mensaje: 'No existe ningún hospital con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado,
            usuarioTKN: req.usuario
        });
    });
});

// ==================================
// EXPORTS
// ==================================
module.exports = app;