const mongoose = require('mongoose');
const User = mongoose.model('User');

var bcrypt = require('bcrypt');
const saltRounds = 10;

var UserController = {
    create: (username, email, password) => {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, saltRounds)
                .then(hash => {
                    User.create({
                        username: username,
                        email: email,
                        password: hash
                    }, function(err, user){
                        if(err){
                            reject(err);
                        }else{
                            resolve(user);
                        }
                    });
                }).catch(err => {
                    reject(err);
                });
        });
    }
};

module.exports = UserController;
