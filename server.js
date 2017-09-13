const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');

const app = express();

app.use(morgan('dev'));

app.use(bodyParser.json());//body-parser
app.use(bodyParser.urlencoded({extended: true}));

const routes = require('./app/routes');
app.use('/', routes); // configure our routes

// set port and start app on 8080======================
const port = process.env.PORT || 3000;
app.listen(port);

console.log('Listening to port: ' + port);
