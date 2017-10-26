const mongoose = require('mongoose');
const Stop = mongoose.model('Stop');
const RouteController = require('./RouteController');
const GoogleMapsController = require('./GoogleMapsController');

module.exports = {

    /**
     * find stop in db
     */
    find: (req, res) => {
        return new Promise((resolve, reject) => {
            Stop.find({}, function(err, stops){
                if(err){
                    console.log(err);
                    res.send(err);
                }else{
                    res.json(stops);
                }
            });
        });
    },

    /**
     * Find stop in db based on id
     */
    findById: (id) => {
        return new Promise((resolve, reject) => {
            Stop.find({
                _id: id
            }, function(err, stop){
                if(err){
                    reject(err);
                }else{
                    resolve(stop);
                }
            });
        });
    },

    /**
     * return stops near the given coordinate
     */
    findNear: (location, unwind) => {
        return new Promise((resolve, reject) => {
            var lng = location.lng;
            var lat = location.lat;

            if(unwind){
                Stop.aggregate(
                    [
                        {
                            '$geoNear': { //mongodb geospatial command, return objects in order closest to set coordinate
                                'near': {
                                    'type': 'Point',
                                    'coordinates': [lng, lat]
                                },
                                'distanceField': 'distance',
                                'spherical': true,
                                'maxDistance': 1000
                            }
                        },
                        {
                            '$sort':{'distance': 1} //closest fist
                        },
                        {
                            '$unwind': '$properties.routes' //mongodb function to separate list in object's attribute as individual elements in an array
                        }
                    ], function(err, results){
                        if(err){
                            console.log(err);
                            reject(err);
                        }else{
                            console.log(results);
                            resolve(results);
                        }
                    }
                );
            }else{
                Stop.aggregate( //do same without unwinding
                    [
                        {
                            '$geoNear': {
                                'near': {
                                    'type': 'Point',
                                    'coordinates': [lng, lat]
                                },
                                'distanceField': 'distance',
                                'spherical': true,
                                'maxDistance': 1000
                            }
                        },
                        {
                            '$sort':{'distance': 1}
                        }
                    ], function(err, results){
                        if(err){
                            reject(err);
                        }else{
                            resolve(results);
                        }
                    }
                );
            }
        });
    },

    /*
    *   Creates a new stop. Coordinates field is an array [long, lat]. Route
    *   field is an array of route id's that run through this top
    */
    create: (routeId, stop) => {
        return new Promise((resolve, reject) => {
            Stop.create({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: stop.coordinates
                },
                properties: {
                    routes: [routeId]
                }
            }, function(err,stop){
                if(err){
                    reject(err);
                }else{
                    resolve(stop);
                }
            });
        });
    },

    /*
    *   Adds routeIds to a stop with a specified id
    */

    addRoute: (routeId, stopId) => {
        return new Promise((resolve, reject) => {
            Stop.update({_id: stopId},
                {
                    $push: {'properties.routes': routeId}
                },
                function(err, stop){
                    if(err){
                        reject(err);
                    }else{
                        resolve(stop);
                    }
                });
        });
    },

    /*
    *   Finds all stops within a certain radius of a circle with a specified
    *   midpoint. Radius is in degrees. Unwinds the result on the routes to make
    *   looping through the result easier
    */

    findStopsInRadius: (radius, midpoint) => {
        return new Promise((resolve, reject) => {
            Stop.aggregate(
                [
                    {
                        '$match': {
                            'geometry.coordinates': {
                                '$geoWithin': {
                                    '$center': [[midpoint.lng, midpoint.lat], radius]
                                }
                            }
                        }
                    },
                    {
                        '$unwind': '$properties.routes'
                    }
                ], function(err, results){
                    if(err){
                        console.log(err);
                        reject(err);
                    }else{
                        resolve(results);
                    }
                }
            );
        });
    }
};
