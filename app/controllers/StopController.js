const mongoose = require('mongoose');
const Stop = mongoose.model('Stop');
const RouteController = require('./RouteController');
const GoogleMapsController = require('./GoogleMapsController');

module.exports = {

    /**
     * find stop in db
     *
     * @returns {[stops]}: array of stops
     */
    find: () => {
        return new Promise((resolve, reject) => {
            Stop.find({}, function(err, stops){
                if(err){
                    reject(err);
                }else if(!stops){
                    resolve({
                        success: false,
                        message: 'No stops found'
                    });
                }else{
                    resolve({
                        success: true,
                        message: 'Found stops',
                        data: stops
                    });
                }
            });
        });
    },

    /**
     * Find stop in db based on id
     *
     * @param {string}: id - stop ID
     * @returns {[stops]}: array of stop objects
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
     *
     * @param {object}: location - location object containing lng, location
     * @param {boolean}: unwind - whether or not the query should use unwind operator
     * @returns {[stops]} array of stops
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
                            '$match': {'properties.approved': true}
                        },
                        {
                            '$sort':{'distance': 1} //closest fist
                        },
                        {
                            '$unwind': '$properties.routes' //mongodb function to separate list in object's attribute as individual elements in an array
                        }
                    ], function(err, results){
                        if(err){
                            reject(err);
                        }else{
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
                            '$match': {'properties.approved': true}
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

    /**
    *  Creates a new stop. Coordinates field is an array [long, lat]. Route
    *  field is an array of route id's that run through this top
    *
    * @param {string}: routeId - id of route that should be added to
    *                  created stops list of associated routes
    * @param {object}: stop - object contain the to be created stops info
    *
    * @returns {object}: stop object created in db
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

    update: (stopId, updates) => {
        return new Promise((resolve, reject) => {
            Stop.findOneAndUpdate({_id: stopId}, {$set: updates}, {new: true}, function(err, stop){
                if(err){
                    reject(err);
                }else if(!stop){
                    resolve({
                        success: false,
                        message: 'Could not find stop'
                    });
                }else{
                    resolve({
                        success: true,
                        message: 'Stop Updated Successfully',
                        data: stop
                    });
                }
            });
        });
    },

    remove: (stopId) => {
        return new Promise((resolve, reject) => {
            Stop.remove({_id: stopId}, function(err, stop){
                if(err){
                    reject(err);
                }else if (!stop){
                    resolve({
                        success: false,
                        message: 'Stop with that ID was not found'
                    });
                }else{
                    resolve({
                        success: true,
                        message: 'Stop Deleted Successfully'
                    });
                }
            });
        });
    },

    /**
    *   Adds routeIds to a stop with a specified id
    *
    * @param {string}: routeId
    * @param {string}: stopId
    *
    * @returns {object}
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

    /**
    *   Finds all stops within a certain radius of a circle with a specified
    *   midpoint. Radius is in degrees. Unwinds the result on the routes to make
    *   looping through the result easier
    *
    * @param {int}: radius
    * @param {int}: midpoint
    *
    * @returns {[stops]}
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
                        reject(err);
                    }else{
                        resolve(results);
                    }
                }
            );
        });
    }
};
