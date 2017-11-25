const express = require('express');

const routeController = require('../controllers/RouteController');
const stopController = require('../controllers/StopController');
const GoogleMapsController = require('../controllers/GoogleMapsController');
const UserController = require('../controllers/UserController');

const {check, validationResult} = require('express-validator/check');

const passport = require('passport');

var router = express.Router();

router
    .route('/test')
    .get((req, res) => {
        res.send('hello world');
    });

/*********************Routes**************************/

/**
 * find and return routes, error if not found
 */

router
    .route('/routes/find')
    .get((req, res) => {
        routeController.find(req,res)
            .then((routes) => {
                res.status(200).json(routes);
            }).catch((err) => {
                console.log(err);
                res.sendStatus(500);
            });
    });

/**
 * call to create a new route with name, stops, and cost as request
 */

router
    .route('/routes/create')
    .post((req, res) => {
        routeController.create(req, res)
            .then((route) => {
                res.status(200).json(route);
            }).catch((err) => {
                console.log(err);
                res.sendStatus(400);
            });
    });

/**
 * Call with coordiantes of origin and destination to find the direction of a route near them
 */

router
    .route('/routes/find-near')
    .get((req, res) => {
        routeController.findNear(req, res)
            .then((directions) => {
                res.status(200).json(directions);
            }).catch((err) => {
                console.log(err);
                res.status(400).send(err);
            });
    });

/**********************Stops**************************/

/**
 * call to find stops near a coordinate
 */
router
    .route('/stops/find-near')
    .get((req, res) => {
        stopController.findNear(req, res)
            .then((stops) => {
                res.status(200).json(stops);
            }).catch((err) => {
                console.log(err);
                res.sendStatus(500);
            });
    });

/**
 * create stop
 */
router
    .route('/stops/create')
    .get((req, res) => {
        stopController.create(req, res)
            .then((stop) => {
                res.status(200).json(stop);
            }).catch((err) => {
                console.log(err);
                res.sendStatus(500);
            });
    });

/**
 * get the coordinate from an address using google
 */
router
    .route('/stops/coordinate')
    .get((req, res) => {
        GoogleMapsController.getCoords(req.query.address)
            .then((location) => {
                res.status(200).json(location);
            }).catch((err) => {
                console.log(err);
                res.sendStatus(500);
            });
    });

/*******************************Users******************************************/

router
    .route('/users')
    .get((req, res) => {
        UserController.find()
            .then((result) => {
                if(!result.success){
                    res.status(404).json(result);
                }else{
                    res.status(200).json(result);
                }
            }).catch((err) => {
                res.status(500).send(err);
            });
    });

router
    .route('/users/:id')
    .get((req, res) => {
        let id = req.params.id;

        UserController.findById(id)
            .then((result) => {
                if(!result.success){
                    res.status(404).json(result);
                }else{
                    res.status(200).json(result);
                }
            }).catch((err) => {
                res.status(500).send(err);
            });
    });

router
    .route('/users/username/:username')
    .get((req, res) => {
        let username= req.params.username;

        UserController.findByUsername(username)
            .then((result) => {
                if(!result.success){
                    res.status(404).json(result);
                }else{
                    res.status(200).json(result);
                }
            }).catch((err) => {
                res.status(500).send(err);
            });
    });

module.exports = router;
