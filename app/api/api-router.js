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
    .route('/routes')
    .get((req, res) => {
        routeController.find()
            .then((result) => {
                if(!result.success){
                    res.status(404).json(result);
                }else{
                    res.status(200).json(result);
                }
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
 * call to create many routes with name, stops, and cost from csv
 */

router
    .route('/routes/csv')
    .post((req, res) => {
        routeController.bulkAdd(req, res)
            .then((output) => {
                res.status(200).json(output);
            }).catch((err) => {
                console.log(err);
                res.sendStatus(500);
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

router
    .route('/routes/:id')
    .put((req, res) => {
        let id = req.params.id;
        console.log(req.body);
        routeController.update(id, req.body)
            .then((result) => {
                if(!result.success){
                    res.status(404).json(result);
                }else{
                    res.status(200).json(result);
                }
            }).catch((err) => {
                console.log(err);
                res.status(500).send(err);
            });
    });

router
    .route('/routes/:id')
    .delete((req, res) => {
        let id = req.params.id;
        routeController.remove(id)
            .then((result) => {
                if(!result.success){
                    res.status(404).json(result);
                }else{
                    res.status(200).json(result);
                }
            }).catch((err) => {
                console.log(err);
                res.status(500).send(err);
            });
    });

/**********************Stops**************************/

/**
*
*/
router
    .route('/stops')
    .get((req, res) => {
        stopController.find()
            .then((result) => {
                if(!result.success){
                    res.status(404).json(result);
                }else{
                    res.status(200).json(result);
                }
            }).catch((err) => {
                console.log(err);
                res.sendStatus(500);
            });
    });

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

router
    .route('/stops/:id')
    .put((req, res) => {
        let id = req.params.id;
        stopController.update(id, req.body)
            .then((result) => {
                if(!result.success){
                    res.status(404).json(result);
                }else{
                    res.status(200).json(result);
                }
            }).catch((err) => {
                console.log(err);
                res.status(500).send(err);
            });
    });

router
    .route('/stops/:id')
    .delete((req, res) => {
        let id = req.params.id;
        stopController.remove(id)
            .then((result) => {
                if(!result.success){
                    res.status(404).json(result);
                }else{
                    res.status(200).json(result);
                }
            }).catch((err) => {
                console.log(err);
                res.status(500).send(err);
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

router
    .route('/users/:id')
    .put((req, res) => {
        let id = req.params.id;
        UserController.update(id, req.body)
            .then((result) => {
                if(!result.success){
                    res.status(404).json(result);
                }else{
                    res.status(200).json(result);
                }
            }).catch((err) => {
                console.log(err);
                res.status(500).send(err);
            });
    });


router
    .route('/users/:id')
    .delete((req, res) => {
        let id = req.params.id;
        UserController.remove(id)
            .then((result) => {
                if(!result.success){
                    res.status(404).json(result);
                }else{
                    res.status(200).json(result);
                }
            }).catch((err) => {
                console.log(err);
                res.status(500).send(err);
            });
    });

module.exports = router;
