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
                    return findRoute(stopsNearOrig, stopsNearDest, origDestCoords);

                }).then((routeAndStops) => {
                    if(routeAndStops.status === 0){
                        reject('No route found');
                    }else if(routeAndStops.status === 1){
                        resolve([GoogleMapsController.getDirections({
                            orig: routeAndStops.origStop.geometry.coordinates,
                            dest: routeAndStops.destStop.geometry.coordinates
                        })]);
                    }else{
                        var firstRoute = GoogleMapsController.getDirections({
                            orig: routeAndStops.routes[0].origStop.geometry.coordinates,
                            dest: routeAndStops.routes[0].midStop.geometry.coordinates
                        });
                        var secondRoute = GoogleMapsController.getDirections({
                            orig: routeAndStops.routes[0].midStop.geometry.coordinates,
                            dest: routeAndStops.routes[0].destStop.geometry.coordinates
                        });
                        resolve([firstRoute, secondRoute]);
                    }

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

function findRoute(stopsNearOrig, stopsNearDest, origDestCoords){
    return new Promise((resolve, reject) => {
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
                    resolve(routeAndStops);
                }
            }
        }
        console.log('NO DIRECT ROUTE FOUND');
        //no direct route found
        findConnection(stopsNearOrig, stopsNearDest, origDestCoords)
            .then((routeAndStops) => {
                resolve(routeAndStops);
            }).catch((err) => {
                reject(err);
            });
    });
}

function findConnection(stopsNearOrig, stopsNearDest, origDestCoords){
    return new Promise((resolve, reject) => {

        var radius = (findDistance(origDestCoords)/2).toDeg();
        var midpoint = findMidpoint(origDestCoords.lngOrig, origDestCoords.latOrig, origDestCoords.lngDest, origDestCoords.latDest);

        StopController.findStopsInRadius(radius, midpoint)
            .then((stopsInRadius) => {

                var orig2MidRouteAndStops = [];
                var routeAndStops;
                for(let i = 0; i < stopsNearOrig.length; i++){
                    for(let j = 0; j < stopsInRadius.length; j++){
                        if(stopsNearOrig[i].properties.routes.equals(stopsInRadius[j].properties.routes) && stopsNearOrig[i]._id != stopsInRadius[j]._id){
                            orig2MidRouteAndStops.push({
                                routeId: stopsNearOrig[i].properties.routes,
                                origStop: stopsNearOrig[i],
                                midStop: stopsInRadius[j]
                            });
                        }
                    }
                }

                var mid2DestRouteAndStops = [];
                for(let i = 0; i < stopsInRadius.length; i++){
                    for(let j = 0; j < stopsNearDest.length; j++){
                        if(stopsInRadius[i].properties.routes.equals(stopsNearDest[j].properties.routes) && (stopsInRadius[i]._id !== stopsNearDest[j]._id)){
                            mid2DestRouteAndStops.push({
                                routeId: stopsInRadius[i].properties.routes,
                                midStop: stopsInRadius[i],
                                destStop: stopsNearDest[j]
                            });
                        }
                    }
                }

                var finalRoutes = [];
                for(var i = 0; i < orig2MidRouteAndStops.length; i++){
                    for(var j = 0; j < mid2DestRouteAndStops.length; j++){
                        if(orig2MidRouteAndStops[i].midStop._id.equals(mid2DestRouteAndStops[j].midStop._id)){
                            finalRoutes.push({
                                origStop: orig2MidRouteAndStops[i].origStop,
                                route1Id: orig2MidRouteAndStops[i].routeId,
                                midStop: orig2MidRouteAndStops[i].midStop,
                                route2Id: mid2DestRouteAndStops[j].routeId,
                                destStop: mid2DestRouteAndStops[j].destStop
                            });
                        }
                    }
                }
                if(finalRoutes.length === 0){
                    routeAndStops = {
                        status: 0
                    };
                }else{
                    routeAndStops = {
                        status: 2,
                        routes: finalRoutes
                    };
                }
                resolve(routeAndStops);

            }).catch((err) => {
                reject(err);
            });
    });

}

function findDistance(origDestCoords){
    var R = 6371; // Radius of the earth in km
    var dLat = (origDestCoords.latDest-origDestCoords.latOrig).toRad();
    var dLon = (origDestCoords.lngDest-origDestCoords.lngOrig).toRad();
    var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(origDestCoords.latOrig.toRad()) * Math.cos(origDestCoords.latDest.toRad()) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); //distance in rads
    return c;
}

function findMidpoint(lng1, lat1, lng2, lat2){
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

function getMidstops(orig2MidRouteAndStops){
    return new Promise((resolve, reject) => {
        var sequence = Promise.resolve();
        var completed = 0;
        var midStops = [];
        orig2MidRouteAndStops.forEach(function(routeAndStops){
            sequence = sequence.then(() => {
                return StopController.findById(routeAndStops.midStopId);
            }).then((midStop) => {
                completed++;
                midStops.push(midStop);
                if(completed == orig2MidRouteAndStops.length){
                    resolve(midstops, orig2MidRouteAndStops);
                }
            }).catch((err) => {
                reject(err);
            });
        });
    });
}

function addStopsToRoute(routeId, routeStops){
    return new Promise((resolve, reject) => {

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
