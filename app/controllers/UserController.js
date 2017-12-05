const mongoose = require('mongoose');
const User = mongoose.model('User');

var UserController = {

    find: () => {
        return new Promise((resolve, reject) => {
            User.find({}, 'username email permissionLevel', (err, users) => {
                if(err){
                    reject(err);
                }else if(!users){
                    resolve({
                        success: false,
                        message: 'No users found'
                    });
                }else{
                    resolve({
                        success: true,
                        message: 'Found users',
                        data: users
                    });
                }
            });
        });
    },

    findById: (id) => {
        return new Promise((resolve, reject) => {
            User.find({_id: id}, 'username email permissionLevel', (err, users) => {
                if(err){
                    reject(err);
                }else if(!users){
                    resolve({
                        success: false,
                        message: 'No users found'
                    });
                }else{
                    resolve({
                        success: true,
                        message: 'Found users',
                        data: users
                    });
                }
            });
        });
    },


    findByUsername: (username) => {
        return new Promise((resolve, reject) => {
            User.find({username: username}, 'username email permissionLevel', (err, users) => {
                if(err){
                    reject(err);
                }else if(!users){
                    resolve({
                        success: false,
                        message: 'No users found'
                    });
                }else{
                    resolve({
                        success: true,
                        message: 'Found users',
                        data: users
                    });
                }
            });
        });
    },

    update: (userId, updates) => {
        return new Promise((resolve, reject) => {
            User.findOneAndUpdate({_id: routeId}, {$set: updates}, {new: true}, function(err, user){
                if(err){
                    reject(err);
                }else if(!user){
                    resolve({
                        success: false,
                        message: 'Could not find user'
                    });
                }else{
                    resolve({
                        success: true,
                        message: 'User updated successfully',
                        data: user
                    });
                }
            });
        });
    },

    remove: (userId) => {
        return new Promise((resolve, reject) => {
            User.remove({_id: userId}, function(err, user){
                if(err){
                    reject(err);
                }else if (!user){
                    resolve({
                        success: false,
                        message: 'User with that ID was not found'
                    });
                }else{
                    resolve({
                        success: true,
                        message: 'User Deleted Successfully'
                    });
                }
            });
        });
    },
};

module.exports = UserController;
