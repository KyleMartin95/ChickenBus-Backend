const jwt = require('jsonwebtoken');
const User = require('mongoose').model('User');
const PassportLocalStrategy = require('passport-local').Strategy;
const config = require('../../config');


/**
 * Return the Passport Local Strategy object.
 */
module.exports = new PassportLocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    session: false,
    passReqToCallback: true
}, (req, username, password, done) => {
    const userData = {
        username: username,
        email: req.body.email,
        password: password
    };

    // find a user by email address
    return User.findOne({username: userData.username}, (err, user) => {
        if (err) { return done(err); }

        if (!user) {
            const error = new Error('Incorrect username or password');
            error.name = 'IncorrectCredentialsError';

            return done(error);
        }

        // check if a hashed user's password is equal to a value saved in the database
        return user.comparePassword(userData.password, user.password, (err, isMatch) => {
            if (err) { return done(err); }

            if (!isMatch) {
                const error = new Error('Incorrect email or password');
                error.name = 'IncorrectCredentialsError';

                return done(error);
            }

            const payload = {
                userId: user._id,
                permissionLevel: user.permissionLevel
            };

            // create a token string
            const token = jwt.sign(payload, config.jwtSecret);
            const data = {
                name: user.username,
                permissionLevel: user.permissionLevel
            };

            return done(null, token, data);
        });
    });
});
