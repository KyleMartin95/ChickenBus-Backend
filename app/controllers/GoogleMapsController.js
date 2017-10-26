const mongoose = require('mongoose');
const Route = mongoose.model('Route');
const Stop = mongoose.model('Stop');

const StopController = require('./StopController');
const RouteController = require('./RouteController');

const googleMapsClient = require('@google/maps').createClient({ //Google client and key needed to access map api
    key: 'AIzaSyAbiwYsHl4MCJ1-Dwkcc3uChWMmYjv5Qp4'
});

var GoogleMapsController = {

    /**
     * Call google map api with address string, return coordinate
     */
    getCoords: (address) => {
        return new Promise((resolve, reject) => {
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

    /**
     * swap coordinate format of longitude and latitude 
     */
    getDirections: (stops) => {
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
    }

};

module.exports = GoogleMapsController;

/************************Helper functions *************************************/
