const mongoose = require('mongoose');
const Stop = mongoose.model('Stop');
const RouteController = require('./RouteController');

module.exports = {

    find: (req, res) => {
        Stop.find({}, function(err, stops){
            if(err){
                console.log(err);
                res.send(err);
            }else{
                res.json(stops);
            }
        });
    },

    findNear: (location) => {
        return new Promise((resolve, reject) => {
            var lng = location.lng;
            var lat = location.lat;
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
                            'maxDistance': 100,
                            'query': '$routes'
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
                        console.log(results);
                        resolve(results);
                        // RouteController.findById(results[0].properties.routes[0])
                        //     .then(function(route){
                        //         res.json(route);
                        //     }).catch(function(err){
                        //         console.log(err);
                        //         res.sendStatus(500);
                        //         res.send(err);
                        //     });
                    }
                }
            );
        });
    },

    create: (req, res) => {
        //for test purposes for now
        Stop.create({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates:
                    [
                        -86.7,
                        12.2
                    ]
            },
            properties: {
                routes: ['59d28f6843a9de315ce20323']
            }
        }, function(err,stop){
            if(err){
                console.log(err);
                res.send(err);
            }else{
                res.json(stop);
            }
        });
    }
};
