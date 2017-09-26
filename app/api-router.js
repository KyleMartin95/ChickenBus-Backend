const express = require('express');
const routeController = require('./controllers/RouteController');
var router = express.Router();

router
    .route('/api')
    .get((req, res) => {
        res.send('hello world');
    });

router
    .route('/api/test')
    .get((req, res) => {
        routeController.find(req,res);
    });

module.exports = router;
