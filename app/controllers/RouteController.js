const mongoose = require('mongoose');
const Route = mongoose.model('Route');
const Stop = mongoose.model('Stop');
const StopController = require('./StopController');
module.exports = {

    find: (req, res) => {
        Route.find({}, function(err, routes){
            if(err){
                console.log(err);
                res.send(err);
            }else{
                res.json(routes);
            }
        });
    },

    findById: (id) => {
        return new Promise(function(resolve, reject){
            Route.find({
                _id: id
            }, function(err, route){
                if(err){
                    reject(err);
                }else{
                    resolve(route);
                }
            });
        });
    },

    findNear: (req, res) => {
        var lngOrig = Number(req.query.lngOrig, 10);
        var latOrig = Number(req.query.latOrig, 10);
        var lngDest = Number(req.query.lngDest, 10);
        var latDest = Number(req.query.latDest, 10);

        var stopsNearOrig;
        var stopsNearDest;
        StopController.findNear({lngOrig, latOrig})
            .then((stops) => {
                stopsNearOrig = stops;
                return StopController.findNear({lngDest, latDest});
            }).then((stops) => {
                stopsNearDest = stops;
            }).catch((err) => {
                console.log(err);
                res.send(err);
            });


    },

    create: (req, res) => {
        console.log();
        //for test purposes for now
        Route.create({
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [
                    [
                        -86.3,
                        12.3
                    ],
                    [
                        86.1,
                        13.1
                    ],
                    [
                        86.0,
                        13.0
                    ],
                    [
                        80.0,
                        14.02
                    ]
                ]
            }
        }, function(err,route){
            if(err){
                console.log(err);
                res.send(err);
            }else{
                res.json(route);
            }
        });
    }
};
