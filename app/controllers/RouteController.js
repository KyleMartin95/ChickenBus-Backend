const mongoose = require('mongoose');
const Route = mongoose.model('Route');
const Stop = mongoose.model('Stop');

const StopController = require('./StopController');
const GoogleMapsController = require('./GoogleMapsController');

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
            StopController.findNear({lng: lngOrig, lat: latOrig}, true)
                .then((stops) => {
                    stopsNearOrig = stops;
                    return StopController.findNear({lng: lngDest, lat: latDest}, true);
                }).then((stops) => {
                    stopsNearDest = stops;
                    var routeAndStops = findRoute(stopsNearOrig, stopsNearDest);
                    console.log(routeAndStops);
                    if(routeAndStops.routeId === false){
                        reject('No route found');
                    }else{
                        return GoogleMapsController.getDirections({
                            orig: routeAndStops.origStop.geometry.coordinates,
                            dest: routeAndStops.destStop.geometry.coordinates
                        });
                    }
                }).then((directions) => {
                    resolve(directions);
                }).catch((err) => {
                    reject(err);
                });
        });
    },

    create: (req, res) => {
        return new Promise((resolve, reject) => {
            var routeName = req.body.name;
            var routeCost = req.body.cost;
            var routeStops = req.body.stops;

            Route.create({
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [[0,0],[1,1]]
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
                    addStopsToRoute(routeId, routeStops)
                        .then(() => {
                            console.log('add stops to route then called!!!!!!!!!');
                            resolve(route);
                        }).catch((err) => {
                            reject(err);
                        });
                }
            });
        });
    }
};

module.exports = RouteController;

/************************Helper functions *************************************/

function findRoute(stopsNearOrig, stopsNearDest){
    var i,j;
    var routeAndStops;
    for(i = 0; i < stopsNearOrig.length; i++){
        for(j = 0; j < stopsNearDest.length; j++){
            if(stopsNearOrig[i].properties.routes.equals(stopsNearDest[j].properties.routes) && stopsNearOrig[i]._id != stopsNearDest[j]._id){
                routeAndStops = {
                    routeId: stopsNearOrig[i].properties.routes,
                    origStop: stopsNearOrig[i],
                    destStop: stopsNearDest[j]
                };
                console.log('ROUTE AND STOPS: ', routeAndStops);
                return routeAndStops;
            }
        }
    }
    routeAndStops = {
        routeId: false,
        origStop: '',
        destStop: ''
    };
    return routeAndStops;
}

function addStopsToRoute(routeId, routeStops){
    return new Promise((resolve, reject) => {
        var sequence = Promise.resolve();
        var completed = 0;

        routeStops.forEach((stop) => {
            var lng = Number(stop.coordinates[0], 10);
            var lat = Number(stop.coordinates[1], 10);

            sequence = sequence.then(() => {
                return StopController.findNear({lng: lng, lat: lat}, false); // check to  see if the stop is already a stop
            }).then((stopsInProximity) => {
                if(stopsInProximity.length === 0){
                    return StopController.create(routeId, stop);                    // if it is not already a stop, create it
                }else{
                    return StopController.addRoute(routeId, stopsInProximity[0]._id);  // if it is, update the routes array in the closest stop to contain the id of the route that is being created
                }
            }).then((stop) => {
                completed++;
                if(completed === routeStops.length){
                    resolve();
                }
            }).catch((err) => {
                reject(err);
            });
        });
    });
}

function chainError(err){
    return Promise.reject(err);
}
