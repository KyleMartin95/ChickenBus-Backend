const mongoose = require('mongoose');
const Route = mongoose.model('Route');
const Stop = mongoose.model('Stop');

const StopController = require('./StopController');
const GoogleMapsController = require('./GoogleMapsController');

var RouteController = {

    /**
    *   Returns all routes
    *
    * @returns {[routes]}
    */
    find: () => {
        return new Promise((resolve, reject) => {
            Route.find({}, function(err, routes){
                if(err){
                    reject(err);
                }else if(!routes){
                    resolve({
                        success: false,
                        message: 'No routes found'
                    });
                }else{
                    resolve({
                        success: true,
                        message: 'Found Routes',
                        data: routes
                    });
                }
            });
        });
    },

    /**
    * @param {string}: id
    * @param {boolean}: approved
    *
    * @returns {[routes]}
    */

    findById: (id, approved) => {
        return new Promise(function(resolve, reject){
            Route.find({
                _id: id,
                'properties.approved': approved
            }, function(err, route){
                if(err){
                    reject(err);
                }else if(!route){
                    reject('No route found!');
                }else{
                    resolve(route);
                }
            });
        });
    },

    /**
    *   Gets origin and destination from query string
    *   Finds stops within a certain radius of origin and destination
    *   Calls findRoute() with that information
    *   Uses what findRoute() returns to call Google maps controller
    *
    * @param {object}: req
    * @param {object}: res
    *
    * @returns {object}
    */
    findNear: (req, res) => {
        return new Promise((resolve, reject) => {
            var origDestCoords = {
                lngOrig: Number(req.query.lngOrig, 10),
                latOrig: Number(req.query.latOrig, 10),
                lngDest: Number(req.query.lngDest, 10),
                latDest: Number(req.query.latDest, 10)
            };

            var stopsNearOrig, stopsNearDest = [];

            StopController.findNear({lng: origDestCoords.lngOrig, lat: origDestCoords.latOrig}, true)
                .then((stops) => {
                    stopsNearOrig = stops;
                    return StopController.findNear({lng: origDestCoords.lngDest, lat: origDestCoords.latDest}, true);
                }).then((stops) => {
                    stopsNearDest = stops;
                    return findRoute(stopsNearOrig, stopsNearDest, origDestCoords);
                }).then((routeAndStops) => {
                    return RouteController.compileTripInfo(routeAndStops);
                }).then(tripInfo => {
                    resolve(tripInfo);
                }).catch((err) => {
                    reject(err);
                });
        });
    },

    /**
    * @param {object}: req
    *
    * @returns {object}: created route object
    */

    create: (req) => {
        return new Promise((resolve, reject) => {
            var routeName = req.body.name;
            var routeCost = req.body.cost;
            var routeStops = req.body.stops;
            var routeTimes = req.body.times;
            var routeDuration = req.body.duration;
            var routeNotes = req.body.notes;

            console.log(routeTimes);

            Route.create({
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [[0,0],[1,1]] //place holder values...there has to be something there for the query to work
                },
                properties: {
                    name: routeName,
                    cost: routeCost,
                    duration: routeDuration,
                    departureTimes: routeTimes,
                    notes: routeNotes
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
    },

    update: (routeId, updates) => {
        return new Promise((resolve, reject) => {
            Route.findOneAndUpdate({_id: routeId}, {$set: updates}, {new: true}, function(err, route){
                console.log(route);
                if(err){
                    reject(err);
                }else if(!route){
                    resolve({
                        success: false,
                        message: 'Could not find route'
                    });
                }else{
                    resolve({
                        success: true,
                        message: 'Route Updated Successfully',
                        data: route
                    });
                }
            });
        });
    },

    remove: (routeId) => {
        return new Promise((resolve, reject) => {
            Route.remove({_id: routeId}, function(err, route){
                if(err){
                    reject(err);
                }else if(!route){
                    resolve({
                        success: false,
                        message: 'Could not find route'
                    });
                }else{
                    resolve({
                        success: true,
                        message: 'Route Deleted Successfully'
                    });
                }
            });
        });
    },

    /**
    * @param {object}: routeAndStops
    *
    * @returns {object}
    */

    compileTripInfo: (routeAndStops) => {
        return new Promise((resolve, reject) => {
            var routeInfo;

            if(routeAndStops.status === 0){
                reject('No route found');
            }else if(routeAndStops.status === 1){
                RouteController.findById(routeAndStops.routeId, true)
                    .then((route) => {
                        routeInfo = route[0];
                        return RouteController.getStops(route[0]._id);
                    }).then((stops) => {
                        stops = flipLatLng(stops);
                        var origDest = GoogleMapsController.getDirections({
                            orig: routeAndStops.origStop.geometry.coordinates,
                            dest: routeAndStops.destStop.geometry.coordinates
                        });
                        var tripInfo = {
                            connections: 0,
                            routesInfo: [routeInfo],
                            directions: [
                                {
                                    orig: origDest.origin,
                                    dest: origDest.destination,
                                    stops: stops
                                }
                            ]
                        };
                        resolve(tripInfo);
                    }).catch((err) => {
                        reject(err);
                    });
            }else{
                var route1Info, route2Info, route1Stops, route2Stops;
                RouteController.findById(routeAndStops.routes[0].route1Id, true)
                    .then((route) => {
                        route1Info = route[0];
                        return RouteController.findById(routeAndStops.routes[0].route2Id, true);
                    }).then((route) => {
                        route2Info = route[0];
                        return RouteController.getStops(route1Info._id, true);
                    }).then((stops) => {
                        route1Stops = flipLatLng(stops);
                        return RouteController.getStops(route2Info._id, true);
                    }).then((stops) => {
                        route2Stops = flipLatLng(stops);
                        var firstRouteOrigDest = GoogleMapsController.getDirections({
                            orig: routeAndStops.routes[0].origStop.geometry.coordinates,
                            dest: routeAndStops.routes[0].midStop.geometry.coordinates
                        });
                        var secondRouteOrigDest = GoogleMapsController.getDirections({
                            orig: routeAndStops.routes[0].midStop.geometry.coordinates,
                            dest: routeAndStops.routes[0].destStop.geometry.coordinates
                        });
                        var tripInfo = {
                            connections: 1,
                            routesInfo: [route1Info, route2Info],
                            directions: [
                                {
                                    orig: firstRouteOrigDest.origin,
                                    dest: firstRouteOrigDest.destination,
                                    stops: route1Stops
                                },
                                {
                                    orig: secondRouteOrigDest.origin,
                                    dest: secondRouteOrigDest.destination,
                                    stops: route2Stops
                                }
                            ]
                        };
                        resolve(tripInfo);
                    }).catch(err => {
                        reject(err);
                    });
            }
        });
    },

    /**
    * @param {string}: routeId
    *
    * @returns {[stops]}
    */

    getStops: (routeId) => {
        return new Promise((resolve, reject) => {
            Stop.find({'properties.routes': routeId, 'properties.approved': true},
                (err, stops) => {
                    if(err){
                        reject(err);
                    }else{
                        resolve(stops);
                    }
                });
        });
    },

    bulkAdd: (req, res) => {
        return new Promise((resolve, reject) => {
            req.body.forEach((route) =>{
                formatJSON(route).then((formatedJSON) =>{
                    RouteController.create(formatedJSON).then((createdRoute) =>{

                        resolve(createdRoute);

                    }).catch((err)=>{
                        reject(err);
                    });
                }).catch((err)=>{
                    reject(err);
                });
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

/**
*   Double for loop compares the routes of each origin and destination stop
*   If there is a match then we know that there is a route between them
*   If there is no match then it goes on to try to find connections
*
* @param {array}: stopsNearOrig
* @param {array}: stopsNearDest
* @param {object}: origDestCoords
*
* @returns {object}
*/
function findRoute(stopsNearOrig, stopsNearDest, origDestCoords){
    return new Promise((resolve, reject) => {
        var routeAndStops;
        for(var i = 0; i < stopsNearOrig.length; i++){
            for(var j = 0; j < stopsNearDest.length; j++){
                if(stopsNearOrig[i].properties.routes.equals(stopsNearDest[j].properties.routes) && stopsNearOrig[i]._id != stopsNearDest[j]._id){
                    routeAndStops = {
                        status: 1,
                        routeId: stopsNearOrig[i].properties.routes,
                        origStop: stopsNearOrig[i],
                        destStop: stopsNearDest[j]
                    };
                }
                resolve(routeAndStops);
            }
        }

        // no direct route so we look for connecting routes
        findConnection(stopsNearOrig, stopsNearDest, origDestCoords)
            .then((routeAndStops) => {
                resolve(routeAndStops);
            }).catch((err) => {
                reject(err);
            });
    });
}

/**
*   This function works by "drawing" a circle with a diameter of the length between
*   the origin and destination and the middle at the midpoint between those two
*   locations. It then finds all stops within this circle and looks for routes
*   that go between the origin and this stop and the destination and this stop
*
* @param {array}: stopsNearOrig
* @param {array}: stopsNearDest
* @param {object}: origDestCoords
*
* @returns {object}
*/

function findConnection(stopsNearOrig, stopsNearDest, origDestCoords){
    return new Promise((resolve, reject) => {

        var radius = (findDistance(origDestCoords)/2).toDeg();
        var midpoint = findMidpoint(origDestCoords.lngOrig, origDestCoords.latOrig, origDestCoords.lngDest, origDestCoords.latDest);

        StopController.findStopsInRadius(radius, midpoint)
            .then((stopsInRadius) => {

                var orig2MidRouteAndStops = [];
                var routeAndStops;
                //finds routes between origin and stops in the middle
                for(var i = 0; i < stopsNearOrig.length; i++){
                    for(var j = 0; j < stopsInRadius.length; j++){
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
                // finds routes between middle stops and destination
                for(var i = 0; i < stopsInRadius.length; i++){
                    for(var j = 0; j < stopsNearDest.length; j++){
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
                /*
                *   compares the results of the last two for loops looking for a
                *   common middle stop. If it finds one it returns all info
                *   about these stops and routes
                */
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

                //prepares object to send back to caller
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

/**
*   used for data entry. when a route is made the corresponding stops have to be
*   added. it loops through each stop and sees if there are any stops already at
*   that location. if it finds one it adds the route to the stop. if not, it
*   adds the new stop to the database and then adds the new route to the stop
*
* @param {string}: routeId
* @param {array}: routeStops
*
* @returns {}
*/

function addStopsToRoute(routeId, routeStops){
    return new Promise((resolve, reject) => {
        var sequence = Promise.resolve();
        var completed = 0;

        routeStops.forEach((stop) => {
            var lng = Number(stop.coordinates[0], 10);
            var lat = Number(stop.coordinates[1], 10);

            sequence = sequence.then(() => {
                return StopController.findNear({lng: lng, lat: lat}, false);         // check to  see if the stop is already a stop
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

/**
* @param {object}: stops
*
* @returns {object}
*/
function flipLatLng(stops){
    for(var i = 0; i < stops.length; i++){
        stops[i].geometry.coordinates = stops[i].geometry.coordinates.reverse();
    }
    return stops;
}

/**
* @param {object}: origDestCoords
*
* @returns {int}
*/

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

/**
* @param {int}: lng1
* @param {int}: lat1
* @param {int}: lng2
* @param {int}: lat2
*
* @returns {object}
*/

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

function formatJSON(route){
    return new Promise((resolve, reject) => {
        var routeName = nil(route.Name);
        console.log(routeName);
        var routeCost = nil(route.Cost);
        var routeDuration = nil(route.Duration);
        var routeNotes = nil(route.Notes);
        var checkedStops = nil(route.Stops);
        var stops = (checkedStops).split(',');

        var sunday = nil(route.Sunday);
        var monday = nil(route.Monday);
        var tuesday = nil(route.Tuesday);
        var wednesday = nil(route.Wednesday);
        var thursday = nil(route.Thursday);
        var friday = nil(route.Friday);
        var saturday = nil(route.Saturday);

        var routeStops = [];
        var promises = [];
        var address;
        for(var i=0; i<stops.length; i++){
            var p = GoogleMapsController.getCoords(stops[i]);
            promises[i] = p;
        }
        Promise.all(promises).then(routeStops =>{
            var formatedStops = [];
            routeStops.forEach((stop) => {
                var lat = stop.lat;
                var lng = stop.lng;
                var formatedStop = {
                    coordinates:[
                        lng,
                        lat
                    ]
                };
                formatedStops.push(formatedStop);
            });
            var data = {
                stops: formatedStops,
                name: routeName,
                cost: routeCost,
                times: {sunday, monday, tuesday, wednesday, thursday, friday, saturday},
                duration: routeDuration,
                notes: routeNotes
            };
            var obj = {
                body: data
            };
            // console.log(data.times);
            return(obj);
        }).then((formatedJSON) =>{
            if(formatedJSON){
                resolve(formatedJSON);
            }
        }).catch((err) => {
            reject(err);
        });
    });
}

function nil(value) {
    if(typeof value == 'undefined'){
        return '';
    }
    return value;
}
