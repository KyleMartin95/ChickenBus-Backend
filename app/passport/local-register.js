const User = require('mongoose').model('User');
const PassportLocalStrategy = require('passport-local').Strategy;


/**
 * Return the Passport Local Strategy object.
 */
module.exports = new PassportLocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    session: false,
    passReqToCallback: true
}, (req, username, password, done) => {
    console.log('in passport');
    const userData = {
        username: username,
        email: req.body.email,
        password: password
    };

    const newUser = new User(userData);
    newUser.save((err) => {
        if (err) { return done(err); }

        return done(null);
    });
});
