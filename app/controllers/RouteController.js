const mongoose = require('mongoose');
const Route = mongoose.model('Route');
const Stop = mongoose.model('Stop');
const StopController = require('./StopController');
var RouteController = {

    find: (req, res) => {
        return new Promise((resolve, reject) => {
            Route.find({}, function(err, routes){
                if(err){
                    reject(err);
                }else{
                    resolve(routes);
                }
            });
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
        return new Promise((resolve, reject) => {
            var lngOrig = Number(req.query.lngOrig, 10);
            var latOrig = Number(req.query.latOrig, 10);
            var lngDest = Number(req.query.lngDest, 10);
            var latDest = Number(req.query.latDest, 10);

            var stopsNearOrig = [];
            var stopsNearDest = [];
            StopController.findNear({lng: lngOrig, lat: latOrig})
                .then((stops) => {
                    stopsNearOrig = stops;
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
                    resolve(route);
                }).catch((err) => {
                    reject(err);
                });
        });
    },

    create: (req, res) => {
        return new Promise((resolve, reject) => {
            var routeName = req.body.name;
            var routeCost = req.body.cost;

            Route.create({
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: []
                },
                properties: {
                    name: routeName,
                    cost: routeCost
                }
            }, function(err,route){
                if(err){
                    reject(err);
                }else{
                    var routeId = route._id;
                    var routeStops = req.body.stops;
                    addStopsToRoute(routeId, routeStops);
                    resolve(route);
                }
            });
        });
    }
};

module.exports = RouteController;

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

function addStopsToRoute(routeId, routeStops){
    var sequence = Promise.resolve();

    routeStops.forEach(function(stop){
        sequence = sequence.then(function(){
            return getImage(stop);
        }).then(function(createdStop){
            //do nothing
        }).catch(function(err){
            console.log(err);
        });
    });
}

function chainError(err){
    return Promise.reject(err);
}
