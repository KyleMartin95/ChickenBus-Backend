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
                res.status(200).json(routes);
            }).catch((err) => {
                console.log(err);
                res.sendStatus(500);
            });
    });

router
    .route('/api/routes/create')
    .post((req, res) => {
        routeController.create(req, res)
            .then((route) => {
                res.status(200).json(route);
            }).catch((err) => {
                console.log(err);
                res.sendStatus(500);
            });
    });

router
    .route('/api/routes/find-near')
    .get((req, res) => {
        routeController.findNear(req, res)
            .then((directions) => {
                res.status(200).json(directions);
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
                res.status(200).json(stops);
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
                res.status(200).json(stop);
            }).catch((err) => {
                console.log(err);
                res.sendStatus(500);
            });
    });

router
    .route('/api/stops/coordinate')
    .get((req, res) => {
        stopController.findCord(req.query.address, res)
            .then((location) => {
                // res.send(location);
                res.json(location);
            }).catch((err) => {
                // res.send('failed');
                console.log(err);
                res.sendStatus(500);
            });
    });

module.exports = router;
