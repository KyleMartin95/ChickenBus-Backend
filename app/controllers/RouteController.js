const mongoose = require('mongoose');
const Route = mongoose.model('Route');
const Stop = mongoose.model('Stop');
const StopController = require('./StopController');
var RouteController = {

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

        var stopsNearOrig = [];
        var stopsNearDest = [];
        StopController.findNear({lng: lngOrig, lat: latOrig})
            .then((stops) => {
                stopsNearOrig = stops;

                // stopsNearOrig = concatArray(stops);
                return StopController.findNear({lng: lngDest, lat: latDest});
            }).then((stops) => {
                stopsNearDest = stops;
                routeId = findRoute(stopsNearOrig, stopsNearDest);
                if(routeId === false){
                    res.json({});
                }
                return RouteController.findById(routeId);
                //TODO: get stop info
            }).then((route) => {
                console.log(route);
                res.json(route);
            }).catch((err) => {
                console.log(err);
                res.sendStatus(500);
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

module.exports = RouteController;

function concatArray(arrayToConcat){
    var newArr = [];
    for(var i = 0; i < arrayToConcat.length; i++){
        newArr = newArr.concat(arrayToConcat[i]);
    }
    return newArr;
}

function findRoute(stopsNearOrig, stopsNearDest){
    var i,j;
    for(i = 0; i < stopsNearOrig.length; i++){
        for(j = 0; j < stopsNearDest.length; j++){
            if(stopsNearOrig[i].properties.routes.equals(stopsNearDest[j].properties.routes) && stopsNearOrig[i]._id != stopsNearDest[j]._id){
                return stopsNearOrig[i].properties.routes;
            }
        }
    }
    return false;
}

function chainError(err){
    return Promise.reject(err);
}
