var express = require('express');
var app = express();
var Hopsital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ==================================
// Busqueda general
// ==================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regEx = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(busqueda, regEx),
        buscarMedicos(busqueda, regEx),
        buscarUsuarios(busqueda, regEx)
    ]).then(
        respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });

});

// ==================================
// Busqueda por coleccion
// ==================================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regEx = new RegExp(busqueda, 'i');
    var promise;

    switch (tabla) {
        case 'usuarios':
            promise = buscarUsuarios(busqueda, regEx);
            break;
        case 'medicos':
            promise = buscarMedicos(busqueda, regEx);
            break;
        case 'hospitales':
            promise = buscarHospitales(busqueda, regEx);
            break;
        default:
            res.status(400).json({
                ok: false,
                message: 'La tabla introducida no es correcta'
            });
    }

    promise.then(
        data => {
            res.status(200).json({
                ok: true,
                [tabla]: data
            });
        });


});

function buscarMedicos(busqueda, regEx) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regEx })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err)
                } else {
                    resolve(medicos);
                }
            });


    });
};

function buscarUsuarios(busqueda, regEx) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ nombre: regEx }, { email: regEx }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });

    });
};

function buscarHospitales(busqueda, regEx) {

    return new Promise((resolve, reject) => {

        Hopsital.find({ nombre: regEx })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err)
                } else {
                    resolve(hospitales);
                }
            });


    });
};


module.exports = app;