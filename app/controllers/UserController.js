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
    }
};

module.exports = UserController;
