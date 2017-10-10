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
        routeController.find(req,res);
    });

router
    .route('/api/routes/create')
    .get((req, res) => {
        routeController.create(req, res);
    });

router
    .route('/api/routes/find-near')
    .get((req, res) => {
        routeController.findNear(req, res);
    });

/**********************Stops**************************/
router
    .route('/api/stops/find-near')
    .get((req, res) => {
        stopController.findNear(req, res);
    });

router
    .route('/api/stops/create')
    .get((req, res) => {
        stopController.create(req, res);
    });

module.exports = router;
