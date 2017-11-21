const mongoose = require('mongoose');
const Route = mongoose.model('Route');
const Stop = mongoose.model('Stop');

const StopController = require('./StopController');
const GoogleMapsController = require('./GoogleMapsController');

var RouteController = {

    /*
    *   Returns all routes
    */
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

    /*
    *   Gets origin and destination from query string
    *   Finds stops within a certain radius of origin and destination
    *   Calls findRoute() with that information
    *   Uses what findRoute() returns to call Google maps controller
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

    create: (req, res) => {
        return new Promise((resolve, reject) => {
            var routeName = req.body.name;
            var routeCost = req.body.cost;
            var routeStops = req.body.stops;
            var routeTimes = req.body.times;
            var routeDuration = req.body.duration;
            var routeNotes = req.body.notes;
          
            console.log(req.body);
            console.log(req.body.stops);

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

    compileTripInfo: (routeAndStops) => {
        return new Promise((resolve, reject) => {
            var routeInfo;

            if(routeAndStops.status === 0){
                reject('No route found');
            }else if(routeAndStops.status === 1){
                RouteController.findById(routeAndStops.routeId)
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
                    });
            }else{
                var route1Info, route2Info, route1Stops, route2Stops;
                RouteController.findById(routeAndStops.routes[0].route1Id)
                    .then((route) => {
                        route1Info = route[0];
                        return RouteController.findById(routeAndStops.routes[0].route2Id);
                    }).then((route) => {
                        route2Info = route[0];
                        return RouteController.getStops(route1Info._id);
                    }).then((stops) => {
                        route1Stops = flipLatLng(stops);
                        return RouteController.getStops(route2Info._id);
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

    getStops: (routeId) => {
        return new Promise((resolve, reject) => {
            Stop.find({'properties.routes': routeId},
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
            console.log(req.body);
            req.body.forEach((route) =>{
                var formatedJSON = formatJSON(route);
                RouteController.create(formatedJSON);
            }, function(err, route){
                if(err){
                    reject(err);
                }else{
                    resolve(route);
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

/*
*   Double for loop compares the routes of each origin and destination stop
*   If there is a match then we know that there is a route between them
*   If there is no match then it goes on to try to find connections
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
                    resolve(routeAndStops);
                }
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

/*
*   This function works by "drawing" a circle with a diameter of the length between
*   the origin and destination and the middle at the midpoint between those two
*   locations. It then finds all stops within this circle and looks for routes
*   that go between the origin and this stop and the destination and this stop
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

/*
*   used for data entry. when a route is made the corresponding stops have to be
*   added. it loops through each stop and sees if there are any stops already at
*   that location. if it finds one it adds the route to the stop. if not, it
*   adds the new stop to the database and then adds the new route to the stop
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

function flipLatLng(stops){
    for(var i = 0; i < stops.length; i++){
        stops[i].geometry.coordinates = stops[i].geometry.coordinates.reverse();
    }
    return stops;
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

function formatJSON(route){
    return new Promise((resolve, reject) => {  
        // console.log(routeData);               
        var routeName = route.Name;
        var routeCost = route.Cost;
        var routeDuration = route.Duration;
        var routeNotes = route.Notes;
    
        var stops = (route.Stops).split(',');   
        // var routeTimes = route.times; 
        var obj = {};
        var key = 'body';
        obj[key] = [];
         
        var routeStops = [];
        var promises = [];
        var address;        
        for(var i=0; i<stops.length; i++){
            var p = GoogleMapsController.getCoords(stops[i]);
            promises[i] = p;
        } 
        Promise.all(promises).then(routeStops =>{
            console.log(routeStops);              
            var data = {
                stops: routeStops,
                name: routeName,
                cost: routeCost,
                times: [-1],
                duration: routeDuration,
                notes: routeNotes
            };
            console.log('data:' + data);
            obj[key].push(data);
            var formatedJSON = JSON.stringify(obj);
            return(formatedJSON);
        });      
    }).catch((err) => {
        reject(err);
    });
}


