const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');

// Authentication
const passport = require('passport');
const jwt = require('jsonwebtoken');

const app = express();

require('./app/db/database'); // connect to db

app.use(morgan('dev'));

app.use(bodyParser.json());//body-parser
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

app.use(passport.initialize());
const localRegisterStrategy = require('./app/passport/local-register');
const localLoginStrategy = require('./app/passport/local-login');
passport.use('local-register', localRegisterStrategy);
passport.use('local-login', localLoginStrategy);
const authCheckMiddleware = require('./app/middleware/auth-check');
app.use('/api/protected', authCheckMiddleware); //probably needs to be changed

const routes = require('./app/api-router');
app.use('/', routes); // configure our routes

// set port and start app on 3000
const port = process.env.PORT || 3000;
app.listen(port);

console.log('Listening to port: ' + port);
