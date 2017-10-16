const express = require('express');
const routeController = require('./controllers/RouteController');
const stopController = require('./controllers/StopController');
var router = express.Router();

router
    .route('/api/test')
    .get((req, res) => {
        res.send('hello world');
    });

/*********************Routes**************************/
router
    .route('/api/routes/find')
    .get((req, res) => {
        routeController.find(req,res)
            .then((routes) => {
                res.sendStatus(200).json(routes);
            }).catch((err) => {
                console.log(err);
                res.sendStatus(500);
            });
    });

router
    .route('/api/routes/create')
    .get((req, res) => {
        routeController.create(req, res)
            .then((route) => {
                res.sendStatus(200).json(routes);
            }).catch((err) => {
                console.log(err);
                res.sendStatus(500);
            });
    });

router
    .route('/api/routes/find-near')
    .get((req, res) => {
        routeController.findNear(req, res)
            .then((routes) => {
                res.sendStatus(200).json(routes);
            }).catch((err) => {
                console.log(err);
                res.sendStatus(500);
            });
    });

/**********************Stops**************************/
router
    .route('/api/stops/find-near')
    .get((req, res) => {
        stopController.findNear(req, res)
            .then((stops) => {
                res.sendStatus(200).json(stops);
            }).catch((err) => {
                console.log(err);
                res.sendStatus(500);
            });
    });

router
    .route('/api/stops/create')
    .get((req, res) => {
        stopController.create(req, res)
            .then((stop) => {
                res.json(stop);
            }).catch((err) => {
                console.log(err);
                res.sendStatus(500);
            });
    });

module.exports = router;
