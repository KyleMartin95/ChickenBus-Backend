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
        //return new Promise((resolve, reject) => {
        var orig = [];
        orig[0] = stops.orig[1];
        orig[1] = stops.orig[0];

        var dest = [];
        dest[0] = stops.dest[1];
        dest[1] = stops.dest[0];

        var query = {
            origin: orig,
            destination: dest
        };

        return query;

        // googleMapsClient.directions(query, (err, response) =>{
        //     if (!err) {
        //         resolve(response);
        //     } else if (err === 'timeout') {
        //         reject(err);
        //     } else if (err.json) {
        //         reject(err);
        //     } else {
        //         reject(err);
        //     }
        // });
    }

};

module.exports = GoogleMapsController;

/************************Helper functions *************************************/
