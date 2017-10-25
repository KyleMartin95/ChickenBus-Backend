const mongoose = require('mongoose');
const Stop = mongoose.model('Stop');
const RouteController = require('./RouteController');
const GoogleMapsController = require('./GoogleMapsController');

module.exports = {

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

    findNear: (location, unwind) => {
        return new Promise((resolve, reject) => {
            var lng = location.lng;
            var lat = location.lat;

            if(unwind){
                Stop.aggregate(
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
                        },
                        {
                            '$unwind': '$properties.routes'
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
                Stop.aggregate(
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

    findCord: (address) =>{
        return new Promise((resolve, reject) =>{
            GoogleMapsController.getCoords(address)
                .then((coords) => {
                    resolve(coords);
                }).catch((err) => {
                    reject(err);
                });
        });
    },


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

//TODO:
//Stops need additional param for order of this stop in route
//ex. managua, 2
//move all API call to backend, specifically
//  frontend search with lat lng for dest, ori
//  comes back do Findnear with route
//      route does findnear of stop and return: route, stops' ID
//      use ID to get coordinate and send to direction
//          direction comes back with direction info
//          send direction info to frontend.
