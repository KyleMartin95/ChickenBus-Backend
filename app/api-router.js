const express = require('express');

const routeController = require('./controllers/RouteController');
const stopController = require('./controllers/StopController');
const GoogleMapsController = require('./controllers/GoogleMapsController');
const UserController = require('./controllers/UserController');

const {check, validationResult} = require('express-validator/check');

const passport = require('passport');


var router = express.Router();

router
    .route('/api/test')
    .get((req, res) => {
        res.send('hello world');
    });

/*********************Routes**************************/

/**
 * find and return routes, error if not found
 */

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

/**
 * call to create a new route with name, stops, and cost as request
 */

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

/**
 * Call with coordiantes of origin and destination to find the direction of a route near them
 */

router
    .route('/api/routes/find-near')
    .get((req, res) => {
        routeController.findNear(req, res)
            .then((directions) => {
                res.status(200).json(directions);
            }).catch((err) => {
                console.log(err);
                res.status(200).send(err);
            });
    });

/**********************Stops**************************/

/**
 * call to find stops near a coordinate
 */
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

/**
 * create stop
 */
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

/**
 * get the coordinate from an address using google
 */
router
    .route('/api/stops/coordinate')
    .get((req, res) => {
        GoogleMapsController.getCoords(req.query.address)
            .then((location) => {
                res.status(200).json(location);
            }).catch((err) => {
                console.log(err);
                res.sendStatus(500);
            });
    });

/********************************Authentication**********************************/

router
    .post('/api/register', [
        check('username')
            .exists()
            .not().isIn([''])
            .isLength({min: 4, max: 15}),
        check('email')
            .exists()
            .isEmail().withMessage('Must be an email')
            .trim()
            .normalizeEmail(),
        check('password')
            .exists()
            .not().isIn('')
            .isLength({min: 8, max: 100})
    ], (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            res.status(422).json(errors.mapped());
        }else{
            var username = req.body.username;
            var email = req.body.email;
            var password = req.body.password;

            console.log('in else statement');

            return passport.authenticate('local-register', (err) => {
                if (err) {
                    if (err.name === 'MongoError' && err.code === 11000) {
                        // the 11000 Mongo code is for a duplicate key error
                        // the 409 HTTP status code is for conflict error
                        res.status(409).json({
                            success: false,
                            message: 'Check the form for errors.',
                            errors: {
                                username: 'This email is already taken.'
                            }
                        });
                    }else{
                        res.status(400).json({
                            success: false,
                            message: 'Could not process the form.'
                        });
                    }                    
                }else{
                    res.status(200).json({
                        success: true,
                        message: 'You have successfully signed up! Now you should be able to log in.'
                    });
                }
            })(req,res,next);
        }
    });

router
    .post('/api/login', [
        check('username')
            .exists()
            .not().isIn([''])
            .isLength({min: 4, max: 15}),
        check('email')
            .exists()
            .isEmail().withMessage('Must be an email')
            .trim()
            .normalizeEmail(),
        check('password')
            .exists()
            .not().isIn('')
            .isLength({min: 8, max: 100})
    ], (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            res.status(422).json(errors.mapped());
        }else{
            var username = req.body.username;
            var email = req.body.email;
            var password = req.body.password;

            return passport.authenticate('local-login', (err, token, userData) => {
                if(err){
                    console.log(err);
                    if (err.name === 'IncorrectCredentialsError') {
                        res.status(400).json({
                            success: false,
                            message: err.message
                        });
                    }else{
                        res.status(400).json({
                            success: false,
                            message: 'Could not process the form.'
                        });
                    }
                }else{
                    return res.json({
                        success: true,
                        message: 'You have successfully logged in!',
                        token,
                        user: userData
                    });
                }
            })(req,res,next);
        }
    });

module.exports = router;
