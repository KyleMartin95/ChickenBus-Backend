const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');

const app = express();

require('./app/db/database'); // connect to db

app.use(morgan('dev'));

app.use(bodyParser.json());//body-parser
app.use(bodyParser.urlencoded({extended: true}));

const routes = require('./app/api-router');
app.use('/', routes); // configure our routes

// set port and start app on 8080======================
const port = process.env.PORT || 8080;
app.listen(port);

console.log('Listening to port: ' + port);
