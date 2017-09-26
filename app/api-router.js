const express = require('express');
const routeController = require('./controllers/routes');
var router = express.Router();

router
    .route('/api')
    .get((req, res) => {
        res.send('hello world');
    });

router
    .route('/api/test')
    .get((req, res) => {
        routeController.create(req,res);
    });

module.exports = router;
