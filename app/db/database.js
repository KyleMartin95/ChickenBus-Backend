const mongoose = require('mongoose');

console.log(process.env.MONGODB_SERVICE_HOST+ ' ' + process.env.MONGODB_SERVICE_PORT + ' ' + process.env.MONGODB_USER + ' ' + process.env.MONGODB_PASSWORD + ' ' + process.env.MONGODB_NAME);

var connectionURI;
if(process.env.NODE_ENV == 'production'){
    connectionURI = 'mongodb://' + process.env.MONGODB_SERVICE_HOST + ':' + process.env.MONGODB_SERVICE_PORT + '/' + process.env.MONGODB_NAME;
    const connectionOptions = {
        user: process.env.MONGODB_USER,
        pass: process.env.MONGODB_PASSWORD
    };
    mongoose.connect(connectionURI, connectionOptions);
}else{
    connectionURI = 'mongodb://localhost:27017/ChickenBus';
    mongoose.connect(connectionURI);
}

mongoose.connection.on('connected', function(){
    console.log('Mongoose connected to: ' + connectionURI);
});

mongoose.connection.on('disconnected', function(){
    console.log('Mongoose disconnected from: ' +connectionURI);
});

mongoose.connection.on('error', function(err){
    console.log('Mongoose error' + err);
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
