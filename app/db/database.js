var mongoose = require('mongoose');
var dburl = 'mongodb://localhost:27017/ChickenBus';

mongoose.connect(dburl);

mongoose.connection.on('connected', function(){
    console.log('Mongoose connected to: ' + dburl);
});

mongoose.connection.on('disconnected', function(){
    console.log('Mongoose disconnected from: ' + dburl);
});

mongoose.connection.on('error', function(err){
    console.log('Mongoose error' + error);
});

process.on('SIGINT', function(){
    mongoose.connection.close(function(){
        console.log('Mongoose disconnected through app termination');
        process.exit(0);
    });
});

process.on('SIGTERM', function(){
    mongoose.connection.close(function(){
        console.log('Mongoose disconnected through app termination');
        process.exit(0);
    });
});

process.once('SIGUSR2', function(){
    mongoose.connection.close(function(){
        console.log('Mongoose disconnected through app termination');
        process.kill(process.pid, 'SIGUSR2');
    });
});

require('./models/Route.js');
