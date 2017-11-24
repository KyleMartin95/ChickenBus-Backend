const express = require('express');
const {check, validationResult} = require('express-validator/check');
const passport = require('passport');

var router = express.Router();

/********************************Authentication**********************************/

router
    .post('/register', [
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
                                username: 'This username is already taken.'
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
    .post('/login', [
        check('username')
            .exists()
            .not().isIn([''])
            .isLength({min: 4, max: 15}),
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
                    res.status(200).json({
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
