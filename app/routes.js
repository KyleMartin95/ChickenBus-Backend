const express = require('express');
var router = express.Router();

router
    .route('/api')
    .get((req, res) => {
        res.send('hello world');
    });


module.exports = router;
