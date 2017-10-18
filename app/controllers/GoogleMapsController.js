const mongoose = require('mongoose');
const Route = mongoose.model('Route');
const Stop = mongoose.model('Stop');

const StopController = require('./StopController');
const RouteController = require('./RouteController');

const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyAbiwYsHl4MCJ1-Dwkcc3uChWMmYjv5Qp4'
});

var GoogleMapsController = {

    getCoords: (address) => {
        return new Promise((resolve, reject) => {
            console.log('ADDRESS', address);
            googleMapsClient.geocode({
                address: address
            }, function(err, response) {
                if (err) {
                    reject(err);
                }else{
                    resolve(response.json.results[0].geometry.location);
                }
            });
        });
    },

    getDirections: (stops) => {
        return new Promise((resolve, reject) => {

        });
    }

};

module.exports = GoogleMapsController;

/************************Helper functions *************************************/
