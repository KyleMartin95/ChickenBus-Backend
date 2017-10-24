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
            var origDestCoords = {
                lngOrig: Number(req.query.lngOrig, 10),
                latOrig: Number(req.query.latOrig, 10),
                lngDest: Number(req.query.lngDest, 10),
                latDest: Number(req.query.latDest, 10)
            };

            var stopsNearOrig = [];
            var stopsNearDest = [];

            StopController.findNear({lng: origDestCoords.lngOrig, lat: origDestCoords.latOrig}, true)
                .then((stops) => {
                    stopsNearOrig = stops;
                    return StopController.findNear({lng: origDestCoords.lngDest, lat: origDestCoords.latDest}, true);
                }).then((stops) => {
                    stopsNearDest = stops;

                    var routeAndStops = findRoute(stopsNearOrig, stopsNearDest, origDestCoords);

                    if(routeAndStops.status === 0){
                        reject('No route found');
                    }else if(routeAndStops.status === 1){
                        return [GoogleMapsController.getDirections({
                            orig: routeAndStops.origStop.geometry.coordinates,
                            dest: routeAndStops.destStop.geometry.coordinates
                        })];
                    }else{
                        var firstRoute = GoogleMapsController.getDirections({
                            orig: routeAndStops.origStop.geometry.coordinates,
                            dest: routeAndStops.midStop.geometry.coordinates
                        });
                        var secondRoute = GoogleMapsController.getDirections({
                            orig: routeAndStops.midStop.geometry.coordinates,
                            dest: routeAndStops.destStop.geometry.coordinates
                        });
                        return [firstRoute, secondRoute];
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
                    coordinates: [[0,0],[1,1]] //place holder values...there has to be something there for the query to work
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

function findRoute(stopsNearOrig, stopsNearDest, origDestCoords){
    var i,j;
    var routeAndStops;
    for(i = 0; i < stopsNearOrig.length; i++){
        for(j = 0; j < stopsNearDest.length; j++){
            if(stopsNearOrig[i].properties.routes.equals(stopsNearDest[j].properties.routes) && stopsNearOrig[i]._id != stopsNearDest[j]._id){
                routeAndStops = {
                    status: 1,
                    routeId: stopsNearOrig[i].properties.routes,
                    origStop: stopsNearOrig[i],
                    destStop: stopsNearDest[j]
                };
                return routeAndStops;
            }
        }
    }
    //no direct route found
    return findConnection(stopsNearOrig, stopsNearDest, origDestCoords);
}

function findConnection(stopsNearOrig, stopsNearDest, origDestCoords){
    var radius = findDistance(origDestCoords)/2;
    var midpoint = findMidpoint(origDestCoords.lngOrig, origDestCoords.latOrig, origDestCoords.lngDest, origDestCoords.latDest);
    //array of stops within circle of origin and destination
    StopController.findStopsInRadius(radius, midpoint)
        .then((stopsInRadius) => {
            var orig2MidRouteAndStops = [];
            for(i = 0; i < stopsNearOrig.length; i++){
                for(j = 0; j < stopsInRadius.length; j++){
                    if(stopsNearOrig[i].properties.routes.equals(stopsInRadius[j].properties.routes) && stopsNearOrig[i]._id != stopsInRadius[j]._id){
                        orig2MidRouteAndStops.push({
                            routeId: stopsNearOrig[i].properties.routes,
                            origStop: stopsNearOrig[i],
                            midStop: stopsInRadius[j]
                        });
                    }
                }
            }

            // var mid2DestRouteAndStops = [];
            for(i = 0; i < orig2MidRouteAndStops.length; i++){
                for(j = 0; j < stopsNearDest.length; j++){
                    if(orig2MidRouteAndStops[i].midStop.roperties.routes.equals(stopsNearDest[j].properties.routes) && orig2MidRouteAndStops[i].midStop._id != stopsNearDest[j]._id){
                        routeAndStops = {
                            status: 2,
                            routeId1st:orig2MidRouteAndStops[i].routeId,
                            origStop: orig2MidRouteAndStops[i].origStop,
                            routeId2nd: orig2MidRouteAndStops[i].midStop.properties.routes,
                            midStop: orig2MidRouteAndStops[i].midStop,
                            destStop: stopsNearDest[j]
                        };
                        return routeAndStops;
                    }
                }
            }

            routeAndStops = {
                status: 0
            };
            return routeAndStops;
        }).catch((err) => {
            return err;
        });
}

function findDistance(origDestCoords){
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(origDestCoords.latDest-origDestCoords.latOrig);  // deg2rad below
    var dLon = deg2rad(origDestCoords.lngDest-origDestCoords.lngOrig);
    var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(origDestCoords.latOrig)) * Math.cos(deg2rad(origDestCoords.latDest)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d * 1000;
}

function findMidpoint(lng1, lat1, lng2, lat2){
    //-- Define radius function
    if (typeof (Number.prototype.toRad) === 'undefined') {
        Number.prototype.toRad = function () {
            return this * Math.PI / 180;
        };
    }

    //-- Define degrees function
    if (typeof (Number.prototype.toDeg) === 'undefined') {
        Number.prototype.toDeg = function () {
            return this * (180 / Math.PI);
        };
    }
    //-- Longitude difference
    var dLng = (lng2 - lng1).toRad();

    //-- Convert to radians
    lat1 = lat1.toRad();
    lat2 = lat2.toRad();
    lng1 = lng1.toRad();

    var bX = Math.cos(lat2) * Math.cos(dLng);
    var bY = Math.cos(lat2) * Math.sin(dLng);
    var lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + bX) * (Math.cos(lat1) + bX) + bY * bY));
    var lng3 = lng1 + Math.atan2(bY, Math.cos(lat1) + bX);

    //-- Return result
    return {lng: lng3.toDeg(), lat: lat3.toDeg()};

}

function deg2rad(deg){
    return deg * (Math.PI/180);
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
